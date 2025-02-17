import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import "./Blog.scss";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(
          "https://dummyjson.com/c/dc2a-9539-4d0d-ba9c"
        );
        if (!response.ok) {
          throw new Error("Không thể tải danh sách bài viết");
        }
        const data = await response.json();
        console.log("Blog data:", data);
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
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card">
            <div className="blog-image">
              <img
                src={blog.imageUrl || "/images/default-blog.jpg"}
                alt={blog.title}
              />
            </div>
            <div className="blog-content">
              <h2>{blog.title}</h2>
              <p className="blog-excerpt">{blog.description}</p>
              <div className="blog-meta">
                <span className="blog-date">
                  {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                </span>
                <span className="blog-author">{blog.author}</span>
              </div>
              <Link to={`/blog/${blog.id}`} className="read-more">
                Đọc thêm
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blog;
