import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader, Calendar, User } from 'lucide-react';
import './Blog.scss';

const blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 4;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(
          "https://dummyjson.com/c/14a3-2e21-422d-aaac"
        );
        if (!response.ok) {
          throw new Error("Không thể tải danh sách bài viết");
        }
        const data = await response.json();
        setBlogs(data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Chia sẻ kiến thức và kinh nghiệm về thai kỳ</p>
      </div>

      <div className="blog-grid">
        {currentBlogs.map(({image,title,excerpt,daycreate,author,id}) => (
          <div key={id} className="blog-card">
            <div className="blog-image">
              <img
                src={image || "/images/default-blog.jpg"}
                alt={title}
              />
            </div>
            <div className="blog-content">
              <h2>{title}</h2>
              <p className="blog-excerpt">{excerpt}</p>
              <div className="blog-meta">
                <span className="blog-date">
                  <Calendar size={16} />
                  {new Date(daycreate).toLocaleDateString("vi-VN")}
                </span>
                <span className="blog-author">
                  <User size={16} />
                  {author}
                </span>
              </div>
              <Link to={`/blog/${id}`} className="read-more">
                Đọc thêm
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Trước
        </button>
        <span>Trang {currentPage} / {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Sau
        </button>
      </div>
    </div>
  );
};

export default blog;
