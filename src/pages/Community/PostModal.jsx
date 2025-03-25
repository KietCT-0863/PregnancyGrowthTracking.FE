import React, { useState, useEffect, useRef } from "react";
import { X, Camera, User } from "react-feather";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "./Community.scss";

const PostModal = ({ post = {}, onClose, onSubmit, isEditing = false }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (Object.keys(post).length > 0) {
      setTitle(post.title || "");
      setBody(post.body || "");
      setTags(
        Array.isArray(post.postTags)
          ? post.postTags.map((tag) => (typeof tag === "string" ? tag : tag.name || tag))
          : []
      );
      setImagePreview(post.postImageUrl || "");
    } else {
      // Reset form for new post
      setTitle("");
      setBody("");
      setTags([]);
      setImage(null);
      setImagePreview("");
    }
  }, [post]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Kiểm tra xem title và body có trống không
    if (!title.trim() || !body.trim()) {
      toast.error("Tiêu đề và nội dung không được để trống");
      setIsLoading(false);
      return;
    }

    // Tạo đối tượng FormData
    const formData = new FormData();

    // Thêm các trường vào FormData
    formData.append("title", title.trim());
    formData.append("body", body.trim());

    // Thêm ID nếu đang chỉnh sửa
    if (isEditing && post.id) {
      formData.append("id", post.id);
    }

    // Thêm file ảnh nếu có
    if (image) {
      formData.append("postImage", image);
    } else if (imagePreview && isEditing) {
      // Nếu đang chỉnh sửa và có ảnh cũ nhưng không thay đổi
      formData.append("postImageUrl", post.postImageUrl);
    }

    // Thêm các tags
    if (tags.length > 0) {
      // Gửi mảng các tag theo đúng định dạng backend yêu cầu
      const tagsArray = tags.map((tag) => ({ tagName: tag.trim() }));
      formData.append("postTags", JSON.stringify(tagsArray));
    }

    // Gửi formData lên component cha
    onSubmit(formData, isEditing);
    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="user-info">
              <div className="avatar">
                <User size={24} />
              </div>
              <span>Người dùng</span>
            </div>

            <input
              type="text"
              className="post-title"
              placeholder="Tiêu đề bài viết"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Chia sẻ điều gì đó với cộng đồng..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />

            <div className="image-upload-area">
              <input
                type="file"
                id="post-image"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: "none" }}
              />

              {!imagePreview ? (
                <label htmlFor="post-image" className="image-upload-label">
                  <div className="upload-placeholder">
                    <Camera size={24} />
                    <span>Thêm hình ảnh</span>
                    <small>Hỗ trợ: JPG, PNG, GIF (Tối đa 5MB)</small>
                  </div>
                </label>
              ) : (
                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="tags-input">
              <div className="tag-form">
                <input
                  type="text"
                  placeholder="Thêm thẻ (gõ và nhấn Enter)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button type="button" className="tag-button" onClick={addTag}>
                  Thêm
                </button>
              </div>

              {tags.length > 0 && (
                <div className="tags-list">
                  {tags.map((tag, index) => (
                    <div key={index} className="tag">
                      {tag}
                      <span
                        className="remove-tag"
                        onClick={() => removeTag(tag)}
                      >
                        <X size={14} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="submit-post"
              disabled={isLoading || !title.trim() || !body.trim()}
            >
              {isLoading
                ? "Đang xử lý..."
                : isEditing
                ? "Cập nhật"
                : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PostModal.propTypes = {
  post: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
};

export default PostModal; 