import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader, Calendar } from "lucide-react";
import "./BlogAllPublic.scss";
import blogService from "../../api/services/blogService";

const BlogAllPublic = () => {
  // Gom nhóm các state liên quan
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const blogsPerPage = 6;

  // Tách logic fetch data
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getBlogs();
      
      if (data?.posts) {
        setBlogs(data.posts);
        extractCategories(data.posts);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Tách logic xử lý categories
  const extractCategories = (posts) => {
    const categories = new Set();
    posts.forEach(post => {
      if (post.categories?.length) {
        post.categories.forEach(category => {
          const categoryName = typeof category === 'string' ? category : category.categoryName;
          categories.add(categoryName);
        });
      }
    });
    setAvailableCategories([...categories]);
  };

  // Tách logic filter và sort
  useEffect(() => {
    const filtered = filterBlogs(blogs);
    const sorted = sortBlogs(filtered);
    setFilteredBlogs(sorted);
  }, [blogs, searchTerm, selectedCategories, sortOption]);

  const filterBlogs = (blogsToFilter) => {
    return blogsToFilter.filter(blog => {
      const matchesSearch = !searchTerm || 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategories = !selectedCategories.length || 
        blog.categories?.some(category => {
          const categoryName = typeof category === 'string' ? category : category.categoryName;
          return selectedCategories.includes(categoryName);
        });

      return matchesSearch && matchesCategories;
    });
  };

  const sortBlogs = (blogsToSort) => {
    const sorted = [...blogsToSort];
    switch (sortOption) {
      case "a-z":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "z-a":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "popular":
        return sorted.sort((a, b) => b.views - a.views);
      default:
        return sorted;
    }
  };

  // Tách logic phân trang
  const getCurrentPageBlogs = () => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    return filteredBlogs.slice(startIndex, startIndex + blogsPerPage);
  };

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Tách logic xử lý events
  const handleCategoryClick = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" />
        <p>Đang tải bài viết...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Có lỗi xảy ra: {error}</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      {/* Header Section */}
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Chia sẻ kiến thức và kinh nghiệm về thai kỳ</p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-and-sort">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="a-z">A đến Z</option>
            <option value="z-a">Z đến A</option>
            <option value="popular">Phổ biến nhất</option>
          </select>
        </div>

        <div className="tags-container">
          {availableCategories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className={`tag-button ${selectedCategories.includes(category) ? "active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid Section */}
      <div className="blog-grid">
        {getCurrentPageBlogs().map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className="blog-image">
              {blog.blogImageUrl && (
                <img
                  src={blog.blogImageUrl}
                  alt={blog.title}
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
            </div>
            <div className="blog-content">
              <h2>{blog.title}</h2>
              <p className="blog-excerpt">{blog.body.substring(0, 150)}...</p>
              <div className="blog-meta">
                <span className="blog-date">
                  <Calendar size={16} />
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <Link to={`/blog/${blog.id}`} className="read-more">
                Đọc thêm
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Section */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default BlogAllPublic;
