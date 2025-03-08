"use client";

import { useEffect, useState } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import {
  Loader,
  Calendar,
  User,
  ArrowLeft,
  Baby,
  Weight,
  Activity,
} from "lucide-react";
import "./BlogAllPublic.scss";
import blogService from "../../api/services/blogService";
import { API_BASE_URL } from "../../api/constants/apiEndpoints";

const BlogDetailPublic = () => {
  const [state, setState] = useState({
    post: null,
    loading: true,
    error: null
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchBlogDetail();
    }
  }, [id]);

  const fetchBlogDetail = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (isNaN(id)) {
        throw new Error("ID bài viết không hợp lệ");
      }

      const data = await blogService.getBlogs();
      if (!data || !data.posts) {
        throw new Error("Không thể tải dữ liệu bài viết");
      }

      const post = data.posts.find(post => post.id === parseInt(id));
      if (!post) {
        throw new Error("Không tìm thấy bài viết");
      }

      setState(prev => ({ ...prev, post }));
    } catch (err) {
      console.error("Error fetching blog:", err);
      setState(prev => ({ 
        ...prev, 
        error: err.message || "Có lỗi xảy ra khi tải bài viết"
      }));
      setTimeout(() => navigate('/blog'), 3000);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const renderLoading = () => (
    <div className="loading-container">
      <Loader className="spinner" />
      <p>Đang tải bài viết...</p>
    </div>
  );

  const renderError = () => (
    <div className="error-container">
      <p>Có lỗi xảy ra: {state.error}</p>
      <p>Bạn sẽ được chuyển về trang blog sau 3 giây...</p>
      <NavLink to="/blog" className="back-button">
        <ArrowLeft />
        Quay lại trang blog
      </NavLink>
    </div>
  );

  const renderCategories = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    return (
      <div className="blog-detail-tags">
        {categories.map((category, index) => (
          <span key={index} className="tag">
            # {typeof category === 'string' ? category : category.categoryName}
          </span>
        ))}
      </div>
    );
  };

  const renderBlogMeta = (post) => (
    <div className="blog-detail-meta">
      <span className="blog-date">
        <Calendar size={16} />
        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
      </span>
      <span className="blog-author">
        <User size={16} />
        {post.authorName || `Tác giả ${post.userId}`}
      </span>
    </div>
  );

  if (state.loading) return renderLoading();
  if (state.error) return renderError();
  if (!state.post) return null;

  const { post } = state;

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <NavLink to="/blog" className="back-button">
          <ArrowLeft />
        </NavLink>
        
        <div className="blog-detail-image">
          {post.blogImageUrl && (
            <img
              src={post.blogImageUrl}
              alt={post.title}
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
        </div>

        <h1>{post.title}</h1>
        {renderBlogMeta(post)}
      </div>

      <div className="blog-detail-content">
        {renderCategories(post.categories)}
        <div 
          className="blog-body"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </div>
    </div>
  );
};

export default BlogDetailPublic;
