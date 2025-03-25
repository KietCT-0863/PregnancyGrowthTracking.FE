import { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  User, 
  Edit, 
  Trash, 
  MoreVertical 
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import CommentSection from "./CommentSection";
import "../styles/PostCard.scss";

const PostCard = ({ 
  post, 
  isExpanded, 
  onToggleComments,
  onLike,
  onEdit,
  onDelete,
  likesCount,
  isLiked,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleLike = () => {
    onLike(post.id);
  };

  const handleEdit = () => {
    setShowDropdown(false);
    onEdit(post);
  };

  const handleDelete = () => {
    setShowDropdown(false);
    onDelete(post.id);
  };

  const authorName = post.createdBy || post.userName || post.author || post.user?.name || "Người dùng";
  
  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <div className="avatar">
            <User size={20} />
          </div>
          <div className="post-meta">
            <h3>{authorName}</h3>
            <div className="post-time">{formatDate(post.createdDate)}</div>
          </div>
        </div>
        <div className="post-actions">
          <button
            className="menu-button"
            onClick={handleToggleDropdown}
          >
            <MoreVertical size={18} />
          </button>
          {showDropdown && (
            <div className="dropdown-content">
              <button
                onClick={handleEdit}
                className="edit-button"
              >
                <Edit size={16} />
                Chỉnh sửa
              </button>
              <button
                onClick={handleDelete}
                className="delete-button"
              >
                <Trash size={16} />
                Xóa bài viết
              </button>
            </div>
          )}
        </div>
      </div>
      
      <h2 className="post-title">{post.title}</h2>
      <div className="post-content">
        <p>{post.body}</p>
        {post.postImageUrl && (
          <div className="post-images">
            <img src={post.postImageUrl} alt={post.title} />
          </div>
        )}
        {post.postTags && post.postTags.length > 0 && (
          <div className="post-tags">
            {post.postTags.map((tag, index) => (
              <span key={tag.id || `tag_${index}`} className="tag">
                #{typeof tag === "string" ? tag : tag.name || "tag"}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="post-footer">
        <div className="reaction-section">
          <button
            className={`reaction-button ${isLiked ? "liked" : ""}`}
            onClick={handleLike}
          >
            <Heart
              size={18}
              className={isLiked ? "heart-filled" : ""}
            />
            Thích {likesCount > 0 && `(${likesCount})`}
          </button>
          <button
            className="reaction-button"
            onClick={() => onToggleComments(post.id)}
          >
            <MessageCircle size={18} />
            Bình luận
          </button>
        </div>

        {isExpanded && <CommentSection postId={post.id} />}
      </div>
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  isExpanded: PropTypes.bool,
  onToggleComments: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  likesCount: PropTypes.number,
  isLiked: PropTypes.bool,
};

PostCard.defaultProps = {
  isExpanded: false,
  likesCount: 0,
  isLiked: false,
};

export default PostCard; 