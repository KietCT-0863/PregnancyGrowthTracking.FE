import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, X, Tag, ArrowRight } from 'lucide-react';
import './BlogSuggestion.scss';

const BlogSuggestion = ({ isOpen, onClose, suggestions }) => {
  if (!isOpen || !suggestions) return null;

  return (
    <motion.div 
      className="blog-suggestion-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="blog-suggestion-modal"
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="blog-suggestion-header">
          <div className="title">
            <BookOpen size={20} />
            <h2>Gợi ý bài đọc cho bạn</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="blog-suggestion-content">
          {suggestions.description && (
            <div className="status-description">
              <p>{suggestions.description}</p>
            </div>
          )}

          <div className="tags-container">
            <h3>Các chủ đề phù hợp:</h3>
            <div className="tags-list">
              {suggestions.tags && suggestions.tags.map((tag, index) => (
                <span key={index} className="tag">
                  <Tag size={14} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="suggested-blogs">
            <h3>Bài viết gợi ý:</h3>
            {suggestions.blogs && suggestions.blogs.map((blog, index) => (
              <motion.div 
                key={index} 
                className="blog-item"
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 133, 162, 0.08)' }}
              >
                <img src={blog.image} alt={blog.title} />
                <div className="blog-info">
                  <h4>{blog.title}</h4>
                  <p>{blog.excerpt}</p>
                  <div className="blog-meta">
                    <span className="date">{blog.date}</span>
                    <span className="read-time">{blog.readTime} phút đọc</span>
                  </div>
                </div>
                <motion.button 
                  className="read-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Đọc ngay <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="blog-suggestion-footer">
          <button className="view-all-button">
            Xem tất cả bài viết liên quan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BlogSuggestion; 