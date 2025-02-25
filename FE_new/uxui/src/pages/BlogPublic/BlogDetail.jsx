"use client";

import { useEffect, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Loader, Calendar, User, ArrowLeft, Baby, Weight, Activity } from "lucide-react";
import "./BlogDetail.scss";

const BlogDetailPublic = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Mock data cho lịch sử đứa trẻ (sau này sẽ được thay thế bằng API call)
  const [childHistory] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      gender: "male",
      createdAt: "2024-03-15T08:00:00.000Z",
      stats: {
        weight: "3.5kg",
        height: "50cm"
      }
    },
    {
      id: 2,
      name: "Trần Thị B",
      gender: "female",
      createdAt: "2024-03-14T09:30:00.000Z",
      stats: {
        weight: "3.2kg",
        height: "48cm"
      }
    }
  ]);

  const getChildFeatures = (child) => [
    {
      icon: Baby,
      title: child.name,
      description: child.gender === 'male' ? 'Nam' : 'Nữ',
    },
    {
      icon: Calendar,
      title: "Ngày tạo",
      description: new Date(child.createdAt).toLocaleDateString('vi-VN'),
    },
    {
      icon: Weight,
      title: "Chỉ số",
      description: `${child.stats.weight} - ${child.stats.height}`,
    },
    {
      icon: Activity,
      title: "Hoạt động",
      description: "Xem chi tiết",
    },
  ];

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`https://dummyjson.com/posts/${id}`);
        if (!response.ok) {
          throw new Error("Không thể tải bài viết");
        }
        const data = await response.json();
        setPost(data);
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
        <NavLink to="/blog" className="back-button">
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
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
        <p>{post.body}</p>
      </div>

      {/* Phần hiển thị lịch sử đứa trẻ */}
      <div className="children-history-section">
        <h2>Lịch sử theo dõi trẻ</h2>
        <div className="children-profiles">
          {childHistory.length === 0 ? (
            <div className="no-profiles">
              <Baby size={48} />
              <p>Chưa có hồ sơ trẻ nào được tạo</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {childHistory.map((child) => (
                <div key={child.id} className="profile-card">
                  <div className="profile-features">
                    {getChildFeatures(child).map((feature, index) => (
                      <div key={index} className="feature-item">
                        <feature.icon className="feature-icon" />
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPublic;
