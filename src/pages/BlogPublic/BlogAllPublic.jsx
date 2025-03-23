import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader, ArrowUpRight, Search, Menu, Heart, Share2, Bookmark, ChevronLeft, ChevronRight, Home, Calendar, Clock, Tag, MessageCircle, User, Award, Bookmark as BookmarkIcon, LogIn, Info, Rss } from "lucide-react";
import "./BlogAllPublic.scss";
import blogService from "../../api/services/blogService";

const BlogAllPublic = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [showShareTooltip, setShowShareTooltip] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);

  // Danh sách bài viết nổi bật tạm thời
  const popularPosts = [
    { id: 1, title: "Chăm sóc sức khỏe mẹ bầu trong 3 tháng đầu", views: 2450 },
    { id: 2, title: "Những thực phẩm giàu dinh dưỡng cho bà bầu", views: 1890 },
    { id: 3, title: "Các bài tập nhẹ nhàng dành cho mẹ bầu", views: 1674 },
    { id: 4, title: "10 điều cần biết khi mang thai lần đầu", views: 1432 }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogService.getBlogs();
        
        if (!data || !data.posts) {
          throw new Error("Không thể tải danh sách bài viết");
        }

        // Sử dụng toàn bộ dữ liệu trả về từ API, không hard code số lượng
        setBlogs(data.posts);
        
        // Lấy tất cả danh mục từ dữ liệu, không giới hạn số lượng
        const allCategories = data.posts.reduce((acc, post) => {
          if (post.categories && Array.isArray(post.categories)) {
            post.categories.forEach(category => {
              const categoryName = typeof category === 'string' ? category : category.categoryName;
              if (categoryName) acc.add(categoryName);
            });
          }
          return acc;
        }, new Set());
        
        setAvailableCategories([...allCategories]);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
    
    // Thêm hiệu ứng scroll
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const header = document.querySelector('.blog-header');
      
      if (header) {
        if (scrollTop > 100) {
          header.classList.add('sticky');
        } else {
          header.classList.remove('sticky');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const filterBlogs = () => {
      let results = [...blogs];

      // Lọc theo search term
      if (searchTerm) {
        results = results.filter((blog) =>
          blog.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sửa lại logic lọc theo categories
      if (selectedCategories.length > 0) {
        results = results.filter((blog) =>
          blog.categories?.some(category => 
            selectedCategories.includes(category)
          )
        );
      }

      setFilteredBlogs(sortBlogs(results));
    };

    filterBlogs();
  }, [searchTerm, blogs, sortOption, selectedCategories]);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      // Cuộn lên đầu phần nội dung khi chuyển trang
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid) {
        blogGrid.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Cuộn lên đầu phần nội dung khi chuyển trang
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid) {
        blogGrid.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const sortBlogs = (blogsToSort) => {
    const sorted = [...blogsToSort];
    switch (sortOption) {
      case "a-z":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "popular":
        return sorted.sort((a, b) => b.views - a.views);
      default:
        return sorted;
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
    setCurrentPage(1);
  };

  // Get category for UI purposes
  const getCategory = (blog, index) => {
    if (blog.categories && blog.categories.length > 0) {
      const categoryName = blog.categories[0];
      return { name: categoryName };
    }
    
    // Fallback categories based on index
    const fallbackCategories = [
      { name: "Lifestyle" },
      { name: "Photo" },
      { name: "House & decor" },
      { name: "Music" },
      { name: "Food" },
      { name: "Travel" }
    ];
    
    return fallbackCategories[index % fallbackCategories.length];
  };

  // Get CSS class for category label
  const getCategoryClass = (categoryName) => {
    if (!categoryName) return "";
    
    const lowerCaseName = categoryName.toLowerCase();
    if (lowerCaseName.includes("music")) return "music-label";
    if (lowerCaseName.includes("photo")) return "photo-label";
    if (lowerCaseName.includes("decor") || lowerCaseName.includes("house")) return "decor-label";
    return "default-label";
  };
  
  // Handle likes
  const handleLike = (blogId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setLikedPosts(prev => ({ 
      ...prev, 
      [blogId]: !prev[blogId] 
    }));
    
    // Thêm hiệu ứng khi nhấn like
    const target = event.currentTarget;
    target.classList.add('pulse-animation');
    setTimeout(() => {
      target.classList.remove('pulse-animation');
    }, 500);
  };
  
  // Handle bookmark/save
  const handleSave = (blogId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setSavedPosts(prev => ({ 
      ...prev, 
      [blogId]: !prev[blogId] 
    }));
  };
  
  // Handle share tooltip
  const handleShareClick = (blogId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setShowShareTooltip(showShareTooltip === blogId ? null : blogId);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Dec 24, 2022"; // Fallback date
    
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Handle search focus
  const handleSearchFocus = (focused) => {
    setIsSearchFocused(focused);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle right sidebar
  const toggleRightSidebar = () => {
    setRightSidebarOpen(!rightSidebarOpen);
  };

  if (loading) {
    return (
      <div className="blog-loading-container">
        <Loader className="spinner" />
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-error-container">
        <p>Có lỗi xảy ra: {error}</p>
      </div>
    );
  }

  return (
    <div className="blog-main-container">
      {/* Sidebar left */}
      <aside className={`blog-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle left sidebar">
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </div>
        
        <div className="sidebar-header">
          <h3>Blog Navigation</h3>
        </div>
        
        <div className="sidebar-content">
          <ul className="sidebar-menu">
            <li className="active">
              <Home size={18} />
              <span>Trang chủ</span>
            </li>
            <li>
              <Calendar size={18} />
              <span>Mới nhất</span>
            </li>
            <li>
              <Clock size={18} />
              <span>Phổ biến</span>
            </li>
            <li>
              <Tag size={18} />
              <span>Danh mục</span>
            </li>
            <li>
              <MessageCircle size={18} />
              <span>Thảo luận</span>
            </li>
            <li>
              <User size={18} />
              <span>Tác giả</span>
            </li>
          </ul>

          <div className="sidebar-divider"></div>
          
          <div className="sidebar-section">
            <h4 className="sidebar-title">Lịch sử đọc</h4>
            <ul className="read-history">
              {blogs.slice(0, 3).map((blog, index) => (
                <li key={index}>
                  <Link to={`/member/blog/${blog.id}`}>
                    <span className="history-title">{blog.title}</span>
                    <span className="history-date">{formatDate(blog.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-section">
            <h4 className="sidebar-title">Chủ đề nổi bật</h4>
            <div className="topic-tags">
              <span className="topic-tag">Mang thai</span>
              <span className="topic-tag">Sức khỏe</span>
              <span className="topic-tag">Dinh dưỡng</span>
              <span className="topic-tag">Tinh thần</span>
              <span className="topic-tag">Làm mẹ</span>
            </div>
          </div>
        </div>
        

      </aside>
      
      {/* Main content */}
      <main className="blog-spot-container">
        {/* Header - Cấu trúc lại để tránh chồng chéo */}
        <header className="blog-header">
          <div className="blog-header-container">
            <div className="blog-logo">
              <Link to="/blog">Blog Spot.</Link>
            </div>
            
            <div className="blog-header-actions">
              <button className="search-button">
                <Search size={20} />
              </button>
              <button className="menu-button" onClick={() => setShowMobileMenu(!showMobileMenu)}>
                <Menu size={20} />
                <span>Menu</span>
              </button>
            </div>
          </div>
          
          <nav className={`blog-nav ${showMobileMenu ? 'show' : ''}`}>
            <ul>
              <li><Link to="/blog">Articles <span>{blogs.length}</span></Link></li>
              <li><Link to="/blog">Radio <span>18</span></Link></li>
              <li><Link to="/blog">Podcast <span>49</span></Link></li>
              <li><Link to="/blog">Be a writer</Link></li>
              <li><Link to="/blog">Talk to us</Link></li>
            </ul>
          </nav>
        </header>

        {/* Main Content */}
        <div className="blog-main">
          <div className="blog-section-header">
            <h1 className="blog-title">New Posts</h1>
            <div className="blog-actions">
              <Link to="/blog" className="view-all-link">
                See all posts →
              </Link>
              <Link to="/blog" className="view-more-link">
                view more
              </Link>
            </div>
          </div>
          
          {/* Filter controls */}
          <div className="blog-filter-controls">
            <div className={`search-box ${isSearchFocused ? 'focused' : ''}`}>
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => handleSearchFocus(true)}
                onBlur={() => handleSearchFocus(false)}
              />
              <Search size={16} />
            </div>

            <div className="blog-categories">
              {availableCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className={`category-btn ${selectedCategories.includes(category) ? "active" : ""}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="sort-box">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="a-z">A to Z</option>
                <option value="z-a">Z to A</option>
              </select>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="blog-grid">
            {currentBlogs.map((blog, index) => {
              const category = getCategory(blog, index);
              const categoryClass = getCategoryClass(category.name);
              
              return (
                <div key={blog.id} className="blog-card">
                  <div className="blog-card-image">
                    <img
                      src={blog.blogImageUrl}
                      alt={blog.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://picsum.photos/seed/${blog.id}/600/400`;
                      }}
                    />
                    <span className="date-label">{formatDate(blog.createdAt)}</span>
                    <Link to={`/blog/${blog.id}`} className="blog-card-link">
                      <ArrowUpRight size={20} />
                    </Link>
                  </div>
                  
                  {/* Action buttons - Di chuyển để tránh overlap */}
                  <div className="blog-card-actions">
                    <button 
                      className={`action-btn like-btn ${likedPosts[blog.id] ? 'active' : ''}`}
                      onClick={(e) => handleLike(blog.id, e)}
                      aria-label="Like post"
                    >
                      <Heart size={18} />
                    </button>
                    
                    <button 
                      className="action-btn share-btn"
                      onClick={(e) => handleShareClick(blog.id, e)}
                      aria-label="Share post"
                    >
                      <Share2 size={18} />
                      {showShareTooltip === blog.id && (
                        <div className="share-tooltip">
                          <button>Facebook</button>
                          <button>Twitter</button>
                          <button>Copy Link</button>
                        </div>
                      )}
                    </button>
                    
                    <button 
                      className={`action-btn save-btn ${savedPosts[blog.id] ? 'active' : ''}`}
                      onClick={(e) => handleSave(blog.id, e)}
                      aria-label="Save post"
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>
                  
                  <div className="blog-card-content">
                    <span className={categoryClass}>{category.name}</span>
                    <h3 className="blog-card-title">{blog.title}</h3>
                    <p className="blog-card-excerpt">
                      {blog.body ? (blog.body.length > 100 ? blog.body.substring(0, 100) + "..." : blog.body) : ""}
                    </p>
                    
                    <Link to={`/blog/${blog.id}`} className="read-more-link">
                      Read more
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="blog-pagination">
            <button 
              className="pagination-btn prev" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <div className="pagination-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic để hiển thị các số trang
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button 
                    key={i} 
                    className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="pagination-dots">...</span>
                  <button 
                    className="page-number"
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button 
              className="pagination-btn next" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>
      
      {/* Sidebar right */}
      <aside className={`blog-sidebar-right ${rightSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-toggle" onClick={toggleRightSidebar} aria-label="Toggle right sidebar">
          {rightSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-section author-profile">
            <div className="author-avatar">
              <img src="https://picsum.photos/seed/author/100" alt="Author avatar" />
            </div>
            <h3 className="author-name">ThS. Nguyễn Thị A</h3>
            <p className="author-bio">Chuyên gia dinh dưỡng thai kỳ với hơn 10 năm kinh nghiệm tư vấn sức khỏe mẹ và bé.</p>
            <div className="author-links">
              <button className="follow-btn">Theo dõi</button>
              <button className="message-btn">Nhắn tin</button>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <Award size={16} />
              <span>Bài viết nổi bật</span>
            </h4>
            <ul className="popular-posts">
              {popularPosts.map((post, index) => (
                <li key={index}>
                  <Link to={`/blog/${post.id}`}>
                    <span className="post-number">{index + 1}</span>
                    <div>
                      <h5>{post.title}</h5>
                      <span className="post-views">{post.views.toLocaleString()} lượt xem</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="sidebar-divider"></div>
          
          <div className="sidebar-section newsletter">
            <h4 className="sidebar-title">
              <Rss size={16} />
              <span>Đăng ký nhận tin</span>
            </h4>
            <p>Nhận thông báo về các bài viết mới nhất và lời khuyên hữu ích.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email của bạn" />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
          
          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <Info size={16} />
              <span>Thông tin</span>
            </h4>
            <div className="sidebar-info">
              <p><strong>Bài viết:</strong> {blogs.length}</p>
              <p><strong>Danh mục:</strong> {availableCategories.length}</p>
              <p><strong>Cập nhật:</strong> {formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile when sidebar is open */}
      {(sidebarOpen || rightSidebarOpen) && <div className="mobile-overlay" onClick={() => {
        setSidebarOpen(false);
        setRightSidebarOpen(false);
      }} />}
    </div>
  );
};

export default BlogAllPublic;
