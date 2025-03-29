"use client";

import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import {
  Loader,
  Calendar,
  User,
  ArrowLeft,
} from "lucide-react";
import "./BlogDetail.scss";
import blogService from "../../api/services/blogService";

const BlogDetail = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log('Fetching blog detail for id:', id);
        const data = await blogService.getBlogs();
        console.log('Blog data:', data);
        
        if (!data || !data.posts) {
          throw new Error("Không thể tải bài viết");
        }

        const selectedPost = data.posts.find(post => post.id === parseInt(id));
        if (!selectedPost) {
          throw new Error("Không tìm thấy bài viết");
        }
        
        setPost(selectedPost);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
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

  // Phân chia nội dung thành các đoạn văn dựa trên nội dung
  const formatContent = (content) => {
    if (!content) return [];
    
    // Xử lý các cách phân đoạn dựa trên số và dấu chấm
    // Tìm các phần bắt đầu với số + dấu chấm (ví dụ: "1. ", "2. ")
    const numberingPattern = /(\d+\.\s+)([A-Z])/g;
    let processedContent = content.replace(numberingPattern, '\n$1$2');
    
    // Thêm ngắt dòng trước các tiêu đề có dấu - 
    processedContent = processedContent.replace(/( - )([A-Z])/g, '\n$1$2');
    
    // Tách thành các đoạn dựa trên dấu xuống dòng
    let paragraphs = processedContent.split(/\n+/);
    
    // Lọc đoạn trống và định dạng lại
    return paragraphs
      .filter(para => para.trim().length > 0)
      .map(para => {
        para = para.trim();
        // Đảm bảo kết thúc bằng dấu chấm hoặc dấu chấm hỏi hoặc dấu chấm than
        if (!para.endsWith('.') && !para.endsWith('?') && !para.endsWith('!')) {
          para += '.';
        }
        return para;
      });
  };

  const paragraphs = formatContent(post.body);

  return (
    <div className="blog-detail">
      <div className="blog-detail-header">
        <NavLink to="/member/blog" className="back-button">
          <ArrowLeft />
        </NavLink>
        <div className="blog-detail-image">
          <img
            src={post.blogImageUrl}
            alt={post.title}
            onError={(e) => {
              console.log('Image load error, using fallback');
              e.target.onerror = null;
              e.target.src = `https://picsum.photos/seed/${post.id}/1200/600`;
            }}
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
        
        <div className="blog-content-text">
          {paragraphs.map((paragraph, index) => {
            // Phát hiện nếu đoạn bắt đầu bằng số và dấu chấm (ví dụ: "1. ", "2. ")
            const isNumberHeading = /^\d+\.\s+/.test(paragraph);
            // Phát hiện nếu đoạn bắt đầu bằng dấu gạch ngang
            const isDashItem = /^-\s+/.test(paragraph) || /^ - /.test(paragraph);
            // Phát hiện nếu đoạn có nội dung ngắn (dưới 100 ký tự)
            const isShortParagraph = paragraph.length < 100;
            
            let paragraphClass = 'blog-paragraph';
            if (isNumberHeading) {
              paragraphClass += ` number-heading-${paragraph.charAt(0)}`;
            }
            if (isDashItem) {
              paragraphClass += ' dash-item';
            }
            if (isShortParagraph) {
              paragraphClass += ' short-paragraph';
            }
            if (index === 0) {
              paragraphClass += ' first-paragraph';
            }
            
            return (
              <p key={index} className={paragraphClass}>
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
