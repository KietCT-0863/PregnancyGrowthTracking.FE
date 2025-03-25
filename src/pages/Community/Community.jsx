import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  MessageCircle,
  Heart,
  User,
  Grid,
  List,
  Send,
  Clock,
  ArrowRight,
  Bookmark,
  Share2,
  TrendingUp,
  Eye
} from "react-feather";
import PropTypes from "prop-types";
import communityService from "../../api/services/communityService";
import commentService from "../../api/services/commentService";
import PostModal from "./PostModal";
import "./Community.scss";

<<<<<<< HEAD
// Modal component for creating/editing post
const PostModal = ({ isOpen, onClose, post = {}, onSubmit, isLoading }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (post.id) {
      setTitle(post.title || "");
      setBody(post.body || "");
      setTags(post.postTags?.map((tag) => tag.name || tag) || []);
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
    // Kiểm tra số lượng tag, giới hạn tối đa 2 tags
    if (tags.length >= 2) {
      toast.warning("Chỉ được phép thêm tối đa 2 thẻ");
      return;
    }

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

    // Kiểm tra xem title và body có trống không
    if (!title.trim() || !body.trim()) {
      toast.error("Tiêu đề và nội dung không được để trống");
      return;
    }

    // Tạo đối tượng FormData
    const formData = new FormData();

    // Thêm các trường vào FormData
    formData.append("title", title.trim());
    formData.append("body", body.trim());

    // Thêm file ảnh nếu có
    if (image) {
      formData.append("postImage", image);
    }

    // Thêm các tags nếu có - cách mới phù hợp với cấu trúc API
    if (tags.length > 0) {
      // Gửi mảng tags trực tiếp (không cần các object phức tạp)
      formData.append(
        "postTags",
        JSON.stringify(tags.map((tag) => tag.trim()))
      );

      console.log(
        "Tags được gửi:",
        JSON.stringify(tags.map((tag) => tag.trim()))
      );
    }

    // Log FormData để kiểm tra
    console.log("FormData được tạo trong modal:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Gửi FormData và ID bài viết (nếu đang chỉnh sửa) lên component cha
    onSubmit(formData, post.id);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{post.id ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h3>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content">
            <div className="user-info">
              <div className="avatar">
                <User size={20} />
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
                  placeholder="Thêm thẻ (tối đa 2 thẻ)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={tags.length >= 2}
                />
                <button
                  type="button"
                  className="tag-button"
                  onClick={addTag}
                  disabled={tags.length >= 2}
                >
                  Thêm
                </button>
              </div>

              {tags.length >= 2 && (
                <div className="tag-limit-warning">
                  Đã đạt giới hạn tối đa 2 thẻ
                </div>
              )}

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
              disabled={isLoading || !title || !body}
            >
              {isLoading ? "Đang xử lý..." : post.id ? "Cập nhật" : "Đăng bài"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PostModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  post: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};

// Comment component
=======
// Component hiển thị phần comment cho mỗi bài viết
>>>>>>> df1e69c327104f7fa1b7846994c0f85242b6e93f
const CommentSection = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);
  const [replyToComment, setReplyToComment] = useState(null);
  const [commentImage, setCommentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const commentImageRef = useRef(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [displayCommentCount, setDisplayCommentCount] = useState(3);
  const COMMENT_INCREMENT = 5;
  // Thêm state để quản lý cách sắp xếp bình luận
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest", "relevant"

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await commentService.getCommentsByPostId(postId);
      console.log(
        `Fetched ${fetchedComments.length} comments for post ${postId}:`,
        fetchedComments
      );

      // Log chi tiết dữ liệu của comment đầu tiên để kiểm tra cấu trúc
      if (fetchedComments && fetchedComments.length > 0) {
        console.log(
          "Cấu trúc chi tiết của comment đầu tiên:",
          JSON.stringify(fetchedComments[0], null, 2)
        );
        console.log("Thuộc tính hình ảnh:", {
          imageUrl: fetchedComments[0].imageUrl,
          image: fetchedComments[0].image,
          commentImageUrl: fetchedComments[0].commentImageUrl,
          imagePath: fetchedComments[0].imagePath,
        });
      }

      setComments(fetchedComments || []);

      // Nếu người dùng đã xem hết bình luận hoặc số bình luận đã thay đổi đáng kể, reset lại số lượng hiển thị
      const rootCommentsCount = fetchedComments.filter(
        (c) => !c.parentCommentId
      ).length;
      if (rootCommentsCount <= 3 || displayCommentCount > rootCommentsCount) {
        setDisplayCommentCount(Math.min(3, rootCommentsCount));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCommentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCommentImage = () => {
    setCommentImage(null);
    setImagePreview("");
    if (commentImageRef.current) {
      commentImageRef.current.value = "";
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);

      // Sử dụng FormData để gửi comment với hình ảnh hoặc reply
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("comment", newComment.trim());

      // ParentCommentId = 0 là comment mới, số khác là reply
      const parentId = replyToComment ? replyToComment.commentId : 0;
      formData.append("parentCommentId", parentId);

      // Thêm hình ảnh nếu có
      if (commentImage) {
        formData.append("image", commentImage);
      }

      console.log("Gửi comment với thông tin:", {
        postId,
        comment: newComment.trim(),
        parentId,
        hasImage: !!commentImage,
      });

      await commentService.createCommentWithImage(formData);

      // Reset form
      setNewComment("");
      setCommentImage(null);
      setImagePreview("");
      setReplyToComment(null);
      if (commentImageRef.current) {
        commentImageRef.current.value = "";
      }

      // Nếu đang trả lời một comment, tự động mở rộng phần phản hồi
      if (parentId) {
        setExpandedReplies((prev) => ({
          ...prev,
          [parentId]: true,
        }));
      }

      // Cập nhật danh sách bình luận
      fetchComments();
      toast.success("Đã đăng bình luận thành công");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error(
        "Không thể đăng bình luận: " + (error.message || "Lỗi không xác định")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyComment = (comment) => {
    setReplyToComment(comment);
    setShowDropdown(null);
    // Tự động focus vào ô nhập comment
    setTimeout(() => {
      document.querySelector(".comment-input")?.focus();
    }, 100);
  };

  const cancelReply = () => {
    setReplyToComment(null);
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.commentId);
    setEditText(comment.comment);
    setShowDropdown(null);
  };

  const submitEditComment = async () => {
    if (!editText.trim() || !editingCommentId) return;

    try {
      setIsLoading(true);
      await commentService.updateComment(editingCommentId, editText);
      setEditingCommentId(null);
      setEditText("");
      fetchComments(); // Làm mới danh sách bình luận
      toast.success("Bình luận đã được cập nhật");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error(
        "Không thể cập nhật bình luận: " +
          (error.message || "Lỗi không xác định")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        setIsLoading(true);
        await commentService.deleteComment(commentId);
        setComments(comments.filter((c) => c.commentId !== commentId));
        toast.success("Bình luận đã được xóa");
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error(
          "Không thể xóa bình luận: " + (error.message || "Lỗi không xác định")
        );
      } finally {
        setIsLoading(false);
      }
    }
    setShowDropdown(null);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // Hiển thị comment theo cấu trúc cha/con
  const renderCommentItem = (comment) => {
    // Lấy tất cả các reply cho comment này
    const childComments = comments.filter(
      (c) => c.parentCommentId === comment.commentId
    );

    const hasReplies = childComments.length > 0;
    const isExpanded = expandedReplies[comment.commentId];

    // Lấy tên người dùng từ API hoặc dùng giá trị mặc định
    const authorName = comment.userName || comment.user?.name || "Người dùng";

    // Xử lý hình ảnh comment nếu có - thêm các trường có thể có
    const commentImage =
      comment.imageUrl ||
      comment.image ||
      comment.commentImageUrl ||
      comment.imagePath ||
      null;

    // Log thông tin hình ảnh để debug
    if (commentImage) {
      console.log(
        `Hình ảnh cho comment ID ${comment.commentId}:`,
        commentImage
      );
    }

    return (
      <div key={comment.commentId} className="comment-item">
        <div className="comment-avatar">
          <User size={24} />
        </div>
        <div className="comment-content-wrapper">
          <div className="comment-content">
            <div className="comment-header">
              <div className="comment-author">{authorName}</div>
              <div className="comment-datetime">
                {formatDate(comment.createdDate)}
              </div>
            </div>

            {editingCommentId === comment.commentId ? (
              <div className="edit-comment-form">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Chỉnh sửa bình luận..."
                />
                <div className="edit-actions">
                  <button
                    onClick={submitEditComment}
                    disabled={isLoading || !editText.trim()}
                  >
                    Lưu
                  </button>
                  <button onClick={() => setEditingCommentId(null)}>Hủy</button>
                </div>
              </div>
            ) : (
              <>
                <div className="comment-text">{comment.comment}</div>
                {commentImage && (
                  <div className="comment-image">
                    <img
                      src={commentImage}
                      alt="Comment attachment"
                      onError={(e) => {
                        console.error("Lỗi tải hình ảnh:", commentImage);
                        e.target.style.display = "none"; // Ẩn hình ảnh nếu không tải được
                      }}
                    />
                  </div>
                )}
              </>
            )}

            {/* Nút like và reply theo kiểu Facebook */}
            <div className="facebook-style-actions">
              <button className="action-button">Thích</button>
              <button
                className="action-button"
                onClick={() => handleReplyComment(comment)}
              >
                Phản hồi
              </button>
            </div>
          </div>

          <div className="comment-actions">
            <button
              className="comment-menu-button"
              onClick={() =>
                setShowDropdown(
                  showDropdown === comment.commentId ? null : comment.commentId
                )
              }
            >
              <MoreVertical size={16} />
            </button>

            {showDropdown === comment.commentId && (
              <div className="comment-dropdown">
                <button onClick={() => handleReplyComment(comment)}>
                  <MessageCircle size={14} /> Trả lời
                </button>
                <button onClick={() => handleEditComment(comment)}>
                  <Edit size={14} /> Chỉnh sửa
                </button>
                <button onClick={() => handleDeleteComment(comment.commentId)}>
                  <Trash size={14} /> Xóa
                </button>
              </div>
            )}
          </div>

          {/* Hiển thị phần replies kiểu Facebook */}
          {hasReplies && (
            <div className="facebook-style-replies">
              {!isExpanded ? (
                <button
                  className="view-replies-button"
                  onClick={() => toggleReplies(comment.commentId)}
                >
                  {childComments.length === 1
                    ? "Xem 1 phản hồi"
                    : `Xem ${childComments.length} phản hồi`}
                </button>
              ) : (
                <>
                  <div className="replies-container">
                    {childComments.map((reply) => {
                      // Lấy thông tin reply
                      const replyAuthorName =
                        reply.userName || reply.user?.name || "Người dùng";
                      // Xử lý hình ảnh reply với nhiều trường có thể có
                      const replyImage =
                        reply.imageUrl ||
                        reply.image ||
                        reply.commentImageUrl ||
                        reply.imagePath ||
                        null;

                      // Log để debug
                      if (replyImage) {
                        console.log(
                          `Hình ảnh cho reply ID ${reply.commentId}:`,
                          replyImage
                        );
                      }

                      return (
                        <div key={reply.commentId} className="reply-item">
                          <div className="comment-avatar">
                            <User size={20} />
                          </div>
                          <div className="reply-content">
                            <div className="comment-header">
                              <div className="comment-author">
                                {replyAuthorName}
                              </div>
                              <div className="comment-datetime">
                                {formatDate(reply.createdDate)}
                              </div>
                            </div>
                            {editingCommentId === reply.commentId ? (
                              <div className="edit-comment-form">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  placeholder="Chỉnh sửa bình luận..."
                                />
                                <div className="edit-actions">
                                  <button
                                    onClick={submitEditComment}
                                    disabled={isLoading || !editText.trim()}
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="comment-text">
                                  {reply.comment}
                                </div>
                                {replyImage && (
                                  <div className="comment-image reply-image">
                                    <img
                                      src={replyImage}
                                      alt="Reply attachment"
                                      onError={(e) => {
                                        console.error(
                                          "Lỗi tải hình ảnh reply:",
                                          replyImage
                                        );
                                        e.target.style.display = "none"; // Ẩn hình ảnh nếu không tải được
                                      }}
                                    />
                                  </div>
                                )}
                              </>
                            )}

                            {/* Nút like và reply cho replies */}
                            <div className="facebook-style-actions">
                              <button className="action-button">Thích</button>
                              <button
                                className="action-button"
                                onClick={() => handleReplyComment(comment)} // Trả lời comment cha
                              >
                                Phản hồi
                              </button>
                            </div>

                            {/* Menu dropdown cho replies */}
                            <div className="reply-actions">
                              <button
                                className="comment-menu-button"
                                onClick={() =>
                                  setShowDropdown(
                                    showDropdown === reply.commentId
                                      ? null
                                      : reply.commentId
                                  )
                                }
                              >
                                <MoreVertical size={14} />
                              </button>

                              {showDropdown === reply.commentId && (
                                <div className="comment-dropdown">
                                  <button
                                    onClick={() => handleReplyComment(comment)}
                                  >
                                    <MessageCircle size={14} /> Trả lời
                                  </button>
                                  <button
                                    onClick={() => handleEditComment(reply)}
                                  >
                                    <Edit size={14} /> Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(reply.commentId)
                                    }
                                  >
                                    <Trash size={14} /> Xóa
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className="hide-replies-button"
                    onClick={() => toggleReplies(comment.commentId)}
                  >
                    Ẩn phản hồi
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const loadMoreComments = () => {
    setDisplayCommentCount((prevCount) => prevCount + COMMENT_INCREMENT);
  };

  const collapseComments = () => {
    setDisplayCommentCount(3);
    // Cuộn lên đầu phần bình luận
    document
      .querySelector(".comments-section h4")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Thêm hàm để sắp xếp bình luận
  const getSortedComments = () => {
    // Lọc lấy các comment gốc
    const rootComments = comments.filter((comment) => !comment.parentCommentId);

    // Sắp xếp theo tiêu chí được chọn
    switch (sortOrder) {
      case "oldest":
        return rootComments.sort(
          (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
        );
      case "relevant":
        // Giả lập sắp xếp theo "relevant" (có thể dựa trên số lượng phản hồi hoặc like)
        return rootComments.sort((a, b) => {
          // Đếm số phản hồi cho mỗi comment
          const aReplies = comments.filter(
            (c) => c.parentCommentId === a.commentId
          ).length;
          const bReplies = comments.filter(
            (c) => c.parentCommentId === b.commentId
          ).length;
          return bReplies - aReplies; // Comment có nhiều phản hồi hơn sẽ lên đầu
        });
      case "newest":
      default:
        return rootComments.sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
    }
  };

  // Thêm hàm để thay đổi cách sắp xếp
  const changeSortOrder = (order) => {
    setSortOrder(order);
    // Reset lại số lượng bình luận hiển thị
    setDisplayCommentCount(3);
  };

  return (
    <div className="comments-section">
      <div className="comments-header">
        <h4>Bình luận ({comments.length})</h4>

        {/* Thêm dropdown để chọn cách sắp xếp bình luận */}
        {comments.filter((c) => !c.parentCommentId).length > 1 && (
          <div className="comment-sort-dropdown">
            <select
              value={sortOrder}
              onChange={(e) => changeSortOrder(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="relevant">Phù hợp nhất</option>
            </select>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="comments-loading">Đang tải bình luận...</div>
      )}

      <div className="comments-list">
        {/* Hiển thị các comment gốc đã được sắp xếp với số lượng giới hạn */}
        {getSortedComments()
          .slice(0, displayCommentCount)
          .map((comment) => renderCommentItem(comment))}

        {/* Nút xem thêm bình luận nếu còn bình luận chưa hiển thị */}
        {comments.filter((comment) => !comment.parentCommentId).length >
          displayCommentCount && (
          <div className="load-more-comments">
            <button className="load-more-button" onClick={loadMoreComments}>
              Xem thêm bình luận
            </button>
          </div>
        )}

        {/* Nút thu gọn bình luận nếu đang hiển thị nhiều hơn số lượng mặc định */}
        {displayCommentCount > 3 &&
          comments.filter((comment) => !comment.parentCommentId).length <=
            displayCommentCount &&
          comments.filter((comment) => !comment.parentCommentId).length > 3 && (
            <div className="collapse-comments">
              <button className="collapse-button" onClick={collapseComments}>
                Thu gọn bình luận
              </button>
            </div>
          )}

        {comments.length === 0 && !isLoading && (
          <div className="no-comments">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        )}
      </div>

      <div className="add-comment">
        {replyToComment && (
          <div className="reply-info">
            <span>
              Đang trả lời {replyToComment.userName || "Người dùng"}: &quot;
              {replyToComment.comment.substring(0, 50)}
              {replyToComment.comment.length > 50 ? "..." : ""}&quot;
            </span>
            <button className="cancel-reply" onClick={cancelReply}>
              <X size={16} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
<<<<<<< HEAD
            <div className="comment-avatar">
              <User size={24} />
            </div>
            <div className="comment-text-container">
              <input
                type="text"
                className="comment-input"
                placeholder={
                  replyToComment ? "Viết phản hồi..." : "Viết bình luận..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
              />

              <div className="comment-actions-row">
                <div className="comment-image-upload">
                  <input
                    type="file"
                    id="comment-image"
                    ref={commentImageRef}
                    onChange={handleCommentImageChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                  <label htmlFor="comment-image" className="add-image-btn">
                    <Camera size={18} />
                  </label>
                </div>

                <button
                  type="submit"
                  className="send-comment-btn"
                  disabled={isLoading || !newComment.trim()}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
=======
            <input
              type="text"
              placeholder="Viết bình luận..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="send-comment-btn"
              disabled={isLoading || !newComment.trim()}
            >
              <Send size={18} />
            </button>
>>>>>>> df1e69c327104f7fa1b7846994c0f85242b6e93f
          </div>

          {imagePreview && (
            <div className="comment-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button className="remove-image-btn" onClick={removeCommentImage}>
                <X size={16} />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

CommentSection.propTypes = {
  postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialComments: PropTypes.array,
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const userId = 4; // Tạm thời hardcode userId, sau này lấy từ context hoặc localStorage
  const [viewMode, setViewMode] = useState("grid");
  const [mainTopic, setMainTopic] = useState("all"); // "all", "trending", "featured", "latest"
  const [activeCategory, setActiveCategory] = useState("world"); // world, business, lifestyle
  
  const navigate = useNavigate();

  // Hàm để toggle phần bình luận
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await communityService.getPosts();
      console.log("API response:", response);

      // Kiểm tra response
      if (!response) {
        console.error("Không có phản hồi từ API");
        setPosts([]);
        toast.error("Không thể kết nối tới server");
        return;
      }

      // Xác định dữ liệu từ response
      let postsData = null;

      // Nếu response là mảng, sử dụng ngay
      if (Array.isArray(response)) {
        postsData = response;
      }
      // Nếu response là object và có thuộc tính posts, sử dụng thuộc tính đó
      else if (
        response &&
        typeof response === "object" &&
        Array.isArray(response.posts)
      ) {
        postsData = response.posts;
      }
      // Nếu response là object và có thuộc tính data, truy cập vào thuộc tính đó
      else if (
        response &&
        typeof response === "object" &&
        response.data &&
        Array.isArray(response.data)
      ) {
        postsData = response.data;
      }
      // Nếu response là object và có thuộc tính data.posts, truy cập vào thuộc tính đó
      else if (
        response &&
        typeof response === "object" &&
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.posts)
      ) {
        postsData = response.data.posts;
      }

      // Nếu postsData không phải mảng, đảm bảo trả về mảng rỗng
      if (!Array.isArray(postsData)) {
        console.error(
          "Không thể xác định dữ liệu bài viết từ response API:",
          response
        );
        postsData = [];
      }

      // Thêm trường readTime cho mỗi bài viết (số từ / 200 từ mỗi phút)
      postsData = postsData.map(post => {
        const wordCount = post.body ? post.body.split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        return {
          ...post,
          readTime,
          views: Math.floor(Math.random() * 100) + 10, // Tạm thời tạo số lượt xem ngẫu nhiên
        };
      });

      // Lưu trữ các bài viết nhận được
      setPosts(postsData);

      // Tải số lượt like và trạng thái like cho mỗi bài viết
      postsData.forEach((post) => {
        fetchLikesCount(post.id);
        checkLikeStatus(post.id, userId);
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error(
        "Không thể tải bài viết: " + (error.message || "Lỗi không xác định")
      );
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm để fetch số lượt like
  const fetchLikesCount = async (postId) => {
    try {
      let count = 0;
      try {
        const result = await communityService.getPostLikesCount(postId);
        if (typeof result === "object" && result.likeCount !== undefined) {
          count = result.likeCount;
        } else if (typeof result === "number") {
          count = result;
        }
      } catch (error) {
        console.warn(
          `Không thể lấy số lượt like từ API cho post ${postId}:`,
          error
        );
        // Nếu có lỗi, giữ nguyên số lượt like đã có trong state
        count = likesCount[postId] || 0;
      }

      setLikesCount((prev) => ({
        ...prev,
        [postId]: count,
      }));
    } catch (error) {
      console.error(`Error handling likes count for post ${postId}:`, error);
    }
  };

  // Hàm để kiểm tra trạng thái like
  const checkLikeStatus = async (postId) => {
    try {
      let isLiked = false;
      try {
        isLiked = await communityService.checkLikeStatus(postId, userId);
      } catch (error) {
        console.warn(
          `Không thể kiểm tra trạng thái like từ API cho post ${postId}:`,
          error
        );
        // Nếu có lỗi, giữ nguyên trạng thái đã có trong state
        isLiked = likedPosts[postId] || false;
      }

      setLikedPosts((prev) => ({
        ...prev,
        [postId]: isLiked,
      }));
    } catch (error) {
      console.error(`Error handling like status for post ${postId}:`, error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Hàm xử lý like bài viết
  const handleLikePost = async (postId) => {
    try {
      setIsLoading(true);
      const currentLiked = likedPosts[postId] || false;
      const currentCount = likesCount[postId] || 0;

      // Cập nhật UI ngay lập tức cho UX tốt hơn
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !currentLiked,
      }));
      setLikesCount((prev) => ({
        ...prev,
        [postId]: currentLiked ? currentCount - 1 : currentCount + 1,
      }));

      // Sau đó cập nhật lên server
      if (currentLiked) {
        await communityService.unlikePost(postId, userId);
      } else {
        await communityService.likePost(postId, userId);
      }

      // Cập nhật lại số lượt like từ server để đảm bảo đồng bộ
      fetchLikesCount(postId);
    } catch (error) {
      console.error(`Error toggling like for post ${postId}:`, error);
      toast.error("Không thể thực hiện thao tác like");

      // Rollback nếu có lỗi
      checkLikeStatus(postId);
      fetchLikesCount(postId);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostSubmit = async (formData, isEditing = false) => {
    try {
      setIsLoading(true);
      console.log("Submitting form data:", formData);

<<<<<<< HEAD
      // Kiểm tra xem formData có các trường cần thiết không
      if (formData instanceof FormData) {
        const title = formData.get("title");
        const body = formData.get("body");

        if (!title || !body) {
          throw new Error("Tiêu đề và nội dung không được để trống");
        }

        // Kiểm tra số lượng tag
        const postTagsStr = formData.get("postTags");
        if (postTagsStr) {
          try {
            const tagsArray = JSON.parse(postTagsStr);
            if (tagsArray.length > 2) {
              throw new Error("Chỉ được phép thêm tối đa 2 thẻ");
            }
            console.log("Tags từ form:", tagsArray);
          } catch (err) {
            console.error("Lỗi parse tags JSON:", err);
          }
        }
      }

      if (postId) {
        // Xử lý cập nhật bài viết
        try {
          const post = posts.find((p) => p.id === postId);
          if (!post) {
            throw new Error("Không tìm thấy bài viết cần cập nhật");
          }

          // Tạo FormData mới cho cập nhật bài viết
          const updateFormData = new FormData();
          updateFormData.append("id", postId);
          updateFormData.append("title", formData.get("title"));
          updateFormData.append("body", formData.get("body"));

          // Xử lý tags - sử dụng cùng định dạng với create post
          const postTagsStr = formData.get("postTags");
          if (postTagsStr) {
            updateFormData.append("postTags", postTagsStr);
          }

          // Thêm hình ảnh nếu có
          if (formData.get("postImage")) {
            updateFormData.append("postImage", formData.get("postImage"));
          }

          console.log("Dữ liệu cập nhật bài viết:");
          for (let pair of updateFormData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
          }

          await communityService.updatePost(updateFormData);
          toast.success("Bài viết đã được cập nhật thành công");
        } catch (updateError) {
          console.error("Lỗi khi cập nhật bài viết:", updateError);
          toast.error("Không thể cập nhật bài viết: " + updateError.message);
          throw updateError;
        }
=======
      let response;
      if (isEditing) {
        response = await communityService.updatePost(formData);
        toast.success("Bài viết đã được cập nhật thành công");
>>>>>>> df1e69c327104f7fa1b7846994c0f85242b6e93f
      } else {
        response = await communityService.createPost(formData);
        toast.success("Bài viết đã được đăng thành công");
      }

      console.log("API response:", response);
      setModalOpen(false);

      // Lấy lại danh sách bài viết mới nhất
      fetchPosts();
    } catch (error) {
      console.error("Error submitting post:", error);
      const errorMessage = error.message || "Lỗi không xác định";
      toast.error(`Không thể ${isEditing ? "cập nhật" : "đăng"} bài viết: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        setIsLoading(true);
        await communityService.deletePost(postId);
        setPosts(posts.filter((post) => post.id !== postId));
        toast.success("Bài viết đã được xóa thành công");
      } catch (error) {
        toast.error("Không thể xóa bài viết, vui lòng thử lại sau");
        console.error("Error deleting post:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (post) => {
    setCurrentPost(post);
    setModalOpen(true);
    setShowDropdown(null);
  };

  const openNewPostModal = () => {
    setCurrentPost({});
    setModalOpen(true);
  };

  const filteredPosts = posts.filter(
    (post) =>
      (post.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (post.body?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (post.postTags &&
        Array.isArray(post.postTags) &&
        post.postTags.some((tag) =>
          (tag && tag.name ? tag.name.toLowerCase() : "").includes(
            searchQuery.toLowerCase()
          )
        ))
  );

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };
  
  const viewPost = (postId) => {
    // Điều hướng đến trang chi tiết bài viết
    navigate(`/community/post/${postId}`);
  };

  // Lấy bài viết nổi bật để hiển thị ở phần hero (2 bài đầu tiên)
  const featuredPosts = posts.length > 0 ? posts.slice(0, 2) : [];
  
  // Lấy bài viết chính (bài thứ 3)
  const mainPost = posts.length > 2 ? posts[2] : null;
  
  // Lọc bài viết còn lại (từ bài thứ 4 trở đi) theo chủ đề được chọn
  const getFilteredPosts = () => {
    if (mainTopic === "all") return filteredPosts.slice(3);
    if (mainTopic === "trending") {
      return [...filteredPosts].slice(3).sort((a, b) => (likesCount[b.id] || 0) - (likesCount[a.id] || 0));
    }
    if (mainTopic === "latest") {
      return [...filteredPosts].slice(3).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }
    return filteredPosts.slice(3);
  };

  const displayPosts = getFilteredPosts();

  // Tạo dữ liệu thống kê giả định cho biểu đồ
  const statsData = [
    { label: "GRST/USD", value: "5.2%", trend: "0.9715" },
    { label: "UMA/USD", value: "3.8%", trend: "1.0937" },
    { label: "BRCK/USD", value: "7.1%", trend: "0.0772" },
    { label: "LCX/USD", value: "4.4%", trend: "0.1570" }
  ];

  return (
    <div className="community-container">
      {/* Header kiểu The View Island */}
      <div className="community-header">
        <div className="header-left">
          <h1>THEVIEW<span>ISLAND</span></h1>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button onClick={() => setActiveCategory("world")} className={`category-btn ${activeCategory === 'world' ? 'active' : ''}`}>
              World
            </button>
            <button onClick={() => setActiveCategory("business")} className={`category-btn ${activeCategory === 'business' ? 'active' : ''}`}>
              Business
            </button>
            <button onClick={() => setActiveCategory("lifestyle")} className={`category-btn ${activeCategory === 'lifestyle' ? 'active' : ''}`}>
              Lifestyle
            </button>
          </div>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="create-post-button" onClick={openNewPostModal}>
            <Plus size={18} />
            Tạo bài viết
          </button>
        </div>
      </div>

      {isLoading && !modalOpen && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Featured posts section - 2 columns */}
      <div className="featured-posts-row">
        {featuredPosts.map((post, index) => (
          <div key={post.id} className="featured-column" onClick={() => viewPost(post.id)}>
            <div className="author-date">
              <span className="author">{post.createdBy || "Người dùng"}</span>
              <span className="date">{formatDate(post.createdDate)}</span>
            </div>
            
            <div className="featured-image">
              {post.postImageUrl ? (
                <img
                  src={post.postImageUrl}
                  alt={post.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/800x400?text=No+Image";
                  }}
                />
              ) : index === 0 ? (
                <img src="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=3087&auto=format&fit=crop" alt="London Eye" />
              ) : (
                <img src="https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=3029&auto=format&fit=crop" alt="Tree in Winter" />
              )}
            </div>
            
            <h2 className="featured-title">
              {post.title || (index === 0 ? "Turn Your Devices From Distractions Into Time Savers" : "Draw Inspiration From Vibrancy")}
            </h2>
            
            <div className="post-meta">
              <div className="read-info">
                {post.views && <span className="views-count"><Eye size={14} /> {post.views}</span>}
                <span className="read-time"><Clock size={14} /> {post.readTime} min read</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main article */}
      {mainPost && (
        <div className="main-article" onClick={() => viewPost(mainPost.id)}>
          <div className="main-article-content">
            <div className="author-info">
              <div className="author-avatar">
                <User size={20} />
              </div>
              <span className="author-name">{mainPost.createdBy || "Alexa Ruyk"}</span>
              {mainPost.trending && <span className="trending-indicator"><TrendingUp size={16} /></span>}
            </div>
            
            <h1 className="main-title">
              {mainPost.title || "Congress Averts Shutdown as Conservatives Steam"}
            </h1>
            
            <p className="main-excerpt">
              {mainPost.body?.substring(0, 150) || "Hours after the Senate passed the measure, the House followed suit. The bill will now go to President Biden."}
              {mainPost.body?.length > 150 ? '...' : ''}
            </p>
            
            <div className="main-footer">
              <div className="read-info">
                {mainPost.views && <span className="views-count"><Eye size={14} /> {mainPost.views}</span>}
                <span className="read-time"><Clock size={14} /> {mainPost.readTime} min read</span>
              </div>
              
              <div className="social-icons">
                <button className="social-icon"><MessageCircle size={16} /></button>
                <button className="social-icon"><Heart size={16} /></button>
                <button className="social-icon"><Share2 size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="stats-section">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend">{stat.trend}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Topics navigation */}
      <div className="topics-navigation">
        <button
          className={`topic-btn ${mainTopic === 'all' ? 'active' : ''}`}
          onClick={() => setMainTopic('all')}
        >
          Tất cả
        </button>
        <button
          className={`topic-btn ${mainTopic === 'trending' ? 'active' : ''}`}
          onClick={() => setMainTopic('trending')}
        >
          <TrendingUp size={16} /> Xu hướng
        </button>
        <button
          className={`topic-btn ${mainTopic === 'latest' ? 'active' : ''}`}
          onClick={() => setMainTopic('latest')}
        >
          Mới nhất
        </button>
        <div className="view-mode-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      {/* Articles Grid/List */}
      <div className={`posts-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>
        {displayPosts.length === 0 && !isLoading ? (
          <div className="no-posts">
            <p>Không có bài viết nào. Hãy tạo bài viết đầu tiên!</p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <div className="post-card" key={post.id}>
              <div className="post-content">
                <div className="post-meta">
                  <span className="post-author">{post.createdBy || "Người dùng"}</span>
                  <span className="post-date">{formatDate(post.createdDate)}</span>
                </div>
                <h3 className="post-title" onClick={() => viewPost(post.id)}>{post.title}</h3>
                
                {post.postImageUrl && (
                  <div className="post-image">
                    <img 
                      src={post.postImageUrl} 
                      alt={post.title} 
                      onClick={() => viewPost(post.id)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x250?text=No+Image";
                      }}
                    />
                  </div>
                )}
                
                <p className="post-excerpt" onClick={() => viewPost(post.id)}>
                  {post.body && post.body.length > 150
                    ? `${post.body.substring(0, 150)}...`
                    : post.body}
                </p>
                
                <div className="post-footer">
                  <div className="post-stats">
                    <div className="read-info">
                      {post.views && <span className="views-count"><Eye size={14} /> {post.views}</span>}
                      <span className="read-time"><Clock size={14} /> {post.readTime} min read</span>
                    </div>
                    <div className="post-actions">
                      <button
                        className={`action-btn like-btn ${likedPosts[post.id] ? 'active' : ''}`}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <Heart size={16} fill={likedPosts[post.id] ? "currentColor" : "none"} /> 
                        <span>{likesCount[post.id] || 0}</span>
                      </button>
                      <button
                        className="action-btn comment-btn"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageCircle size={16} /> <span>{post.commentCount || 0}</span>
                      </button>
                      <button className="action-btn bookmark-btn">
                        <Bookmark size={16} />
                      </button>
                      <button className="action-btn share-btn">
                        <Share2 size={16} />
                      </button>
                      <button
                        className="action-btn menu-btn"
                        onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                      >
                        <MoreVertical size={16} />
                        {showDropdown === post.id && (
                          <div className="dropdown-menu">
                            <button onClick={() => openEditModal(post)}>
                              <Edit size={14} /> Chỉnh sửa
                            </button>
                            <button onClick={() => handleDeletePost(post.id)}>
                              <Trash size={14} /> Xóa
                            </button>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="post-tags">
                    {Array.isArray(post.postTags) &&
                      post.postTags.slice(0, 3).map((tag, index) => (
                        <span key={tag.id || index} className="post-tag">
                          #{tag.name || tag}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
              
              {expandedComments[post.id] && (
                <CommentSection
                  postId={post.id}
                  initialComments={post.comments || []}
                />
              )}
            </div>
          ))
        )}
      </div>
      
      <div className="view-more-container">
        <button className="view-more-btn">
          Xem thêm bài viết <ArrowRight size={18} />
        </button>
      </div>

      {/* Subscribe section */}
      <div className="subscribe-section">
        <h3>Đăng ký nhận thông báo</h3>
        <p>Nhận thông báo về các bài viết mới và nội dung độc quyền</p>
        <div className="subscribe-form">
          <input type="email" placeholder="Email của bạn" />
          <button type="submit">Đăng ký</button>
        </div>
      </div>

      {modalOpen && (
        <PostModal
          post={currentPost}
          onClose={() => setModalOpen(false)}
          onSubmit={handlePostSubmit}
          isEditing={Object.keys(currentPost).length > 0}
        />
      )}
    </div>
  );
};

export default Community;