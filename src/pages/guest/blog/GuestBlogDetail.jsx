"use client";

import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import {
  Loader,
  Calendar,
  User,
  ArrowLeft,
  Baby,
  Weight,
  Activity,
} from "lucide-react";
import "./GuestBlogDetail.scss";

const GuestBlogDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Blog`
        );
        if (!response.ok) {
          throw new Error("Không thể tải bài viết");
        }
        const data = await response.json();
        const selectedPost = data.posts.find((posts) => posts.id === parseInt(id));
        if (!selectedPost) {
          throw new Error("Không tìm thấy bài viết");
        }
        setPost(selectedPost);
        console.log(selectedPost);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

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

  if (!post) return null;

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <NavLink to="/basic-user/blog" className="back-button">
          <ArrowLeft />
        </NavLink>
        <div className="blog-detail-image">
          <img
            src={`https://picsum.photos/seed/${post.id}/1200/600`}
            alt={post.title}
          />
        </div>
        <h1>{post.title}</h1>
        <div className="blog-detail-meta">
          <span className="blog-date">
            <Calendar size={16} />
            {new Date().toLocaleDateString("vi-VN")}
          </span>
          <span className="blog-author">
            <User size={16} />
            {`Tác giả ${post.userId}`}
          </span>
        </div>
      </div>

      <div className="blog-detail-content">
        <div className="blog-detail-tags">
          {post.categories.map((category, index) => (
            <span key={index} className="tag">
             # {category}
            </span>
          ))}
        </div>
        <p>{post.body}</p>
      </div>
    </div>
  );
};

export default GuestBlogDetail;
