import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader, Calendar } from "lucide-react";
import "./GuestBlogAll.scss";
import blogService from "../../../api/services/blogService";

const BLOGS_PER_PAGE = 6;
const BLOG_API_URL = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog";

const GuestBlogAll = () => {
  const [{ blogs, filteredBlogs, availableCategories, loading, error }, setBlogState] = useState({
    blogs: [], filteredBlogs: [], availableCategories: [], loading: true, error: null
  });

  const [{ currentPage, searchTerm, selectedCategories, sortOption }, setFilterState] = useState({
    currentPage: 1, searchTerm: "", selectedCategories: [], sortOption: "newest"
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await blogService.getBlogs();
        if (!data || !data.posts) throw new Error("Không thể tải danh sách bài viết");
        
        const categories = [...new Set(data.posts.flatMap(post => 
          post.categories?.filter(cat => typeof cat === 'string') || []
        ))];

        setBlogState(prev => ({
          ...prev, 
          blogs: data.posts, 
          availableCategories: categories, 
          loading: false
        }));
      } catch (err) {
        setBlogState(prev => ({ 
          ...prev, 
          error: err.message, 
          loading: false 
        }));
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = [...blogs];
    if (searchTerm) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategories.length) {
      filtered = filtered.filter(blog =>
        blog.categories?.some(cat => selectedCategories.includes(cat))
      );
    }

    const sortStrategies = {
      "a-z": (a, b) => a.title.localeCompare(b.title),
      "z-a": (a, b) => b.title.localeCompare(a.title),
      "newest": (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      "popular": (a, b) => b.views - a.views
    };

    filtered.sort(sortStrategies[sortOption] || sortStrategies.newest);
    setBlogState(prev => ({ ...prev, filteredBlogs: filtered }));
  }, [blogs, searchTerm, selectedCategories, sortOption]);

  if (loading) return <div className="loading-container"><Loader className="spinner" /><p>Đang tải bài viết...</p></div>;
  if (error) return <div className="error-container"><p>Có lỗi xảy ra: {error}</p></div>;

  const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
  const currentBlogs = filteredBlogs.slice((currentPage - 1) * BLOGS_PER_PAGE, currentPage * BLOGS_PER_PAGE);

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Chia sẻ kiến thức và kinh nghiệm về thai kỳ</p>
      </div>

      <div className="search-filter-container">
        <div className="search-and-sort">
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={e => setFilterState(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
          <select
            value={sortOption}
            onChange={e => setFilterState(prev => ({ ...prev, sortOption: e.target.value }))}
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
              onClick={() => setFilterState(prev => ({
                ...prev,
                currentPage: 1,
                selectedCategories: prev.selectedCategories.includes(category)
                  ? prev.selectedCategories.filter(c => c !== category)
                  : [...prev.selectedCategories, category]
              }))}
              className={`tag-button ${selectedCategories.includes(category) ? "active" : ""}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-grid">
        {currentBlogs.map(({ id, title, body, blogImageUrl }) => (
          <div key={id} className="blog-card">
            <div className="blog-image">
              <img 
                src={blogImageUrl} 
                alt={title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://picsum.photos/seed/${id}/400/300`;
                }}
              />
            </div>
            <div className="blog-content">
              <h2>{title}</h2>
              <p className="blog-excerpt">{body.substring(0, 150)}...</p>
              <div className="blog-meta">
                <span className="blog-date">
                  <Calendar size={16} />
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
              <Link to={`/basic-user/blog/${id}`} className="read-more">Đọc thêm</Link>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={() => setFilterState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <span>Trang {currentPage} / {totalPages}</span>
        <button 
          onClick={() => setFilterState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default GuestBlogAll;
