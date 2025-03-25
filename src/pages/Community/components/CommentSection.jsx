import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Camera,
  User,
  Edit,
  Trash,
  Send,
  MoreVertical,
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import commentService from "../../../api/services/commentService";
import { toast } from "react-toastify";
import "../styles/CommentSection.scss";

// Comment component
const CommentSection = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments);
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

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const fetchedComments = await commentService.getCommentsByPostId(postId);
      console.log(
        `Fetched ${fetchedComments.length} comments for post ${postId}:`,
        fetchedComments
      );
      // Log cụ thể từng comment để debug
      fetchedComments.forEach((comment) => {
        console.log(`Comment ID ${comment.commentId} details:`, comment);
        console.log(
          `- Comment là ${comment.parentCommentId ? "reply" : "comment gốc"}`
        );
        if (comment.parentCommentId) {
          console.log(`- Là reply cho comment ID: ${comment.parentCommentId}`);
        }
        console.log(`- Image fields:`, {
          imageUrl: comment.imageUrl,
          image: comment.image,
          commentImageUrl: comment.commentImageUrl,
          photoUrl: comment.photoUrl,
        });
      });

      setComments(fetchedComments || []);
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
      formData.append("PostId", postId);
      formData.append("Comment", newComment.trim());

      // ParentCommentId = 0 là comment mới, số khác là reply
      const parentId = replyToComment ? replyToComment.commentId : 0;
      formData.append("ParentCommentId", parentId);

      console.log(`Đang tạo ${parentId ? "reply" : "comment mới"}`);
      if (parentId) {
        console.log(`- Reply cho comment ID: ${parentId}`);
        console.log(`- Comment gốc: "${replyToComment.comment}"`);
      }

      // Thêm hình ảnh nếu có
      if (commentImage) {
        formData.append("Image", commentImage);
        console.log("Đang gửi hình ảnh với comment:", commentImage);
      }

      console.log("Gửi comment với thông tin:", {
        PostId: postId,
        Comment: newComment.trim(),
        ParentCommentId: parentId,
        hasImage: !!commentImage,
      });

      // Log FormData để debug
      console.log("FormData gửi đi:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[0] === "Image" ? "File hình ảnh" : pair[1])
        );
      }

      const result = await commentService.createCommentWithImage(formData);
      console.log("Kết quả trả về từ API khi tạo comment:", result);

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
        console.log(`Tự động mở rộng replies cho comment ID: ${parentId}`);
        setExpandedReplies((prev) => ({
          ...prev,
          [parentId]: true,
        }));
      }

      // Cập nhật danh sách bình luận
      fetchComments();
      toast.success(
        parentId
          ? "Đã đăng phản hồi thành công"
          : "Đã đăng bình luận thành công"
      );
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
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
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

    console.log(
      `Rendering comment ID ${comment.commentId} with ${childComments.length} replies`
    );
    if (childComments.length > 0) {
      console.log(
        `- Child comments:`,
        childComments.map((c) => c.commentId)
      );
    }

    const hasReplies = childComments.length > 0;
    const isExpanded = expandedReplies[comment.commentId];

    // Lấy tên người dùng từ API hoặc dùng giá trị mặc định
    const authorName = comment.userName || comment.user?.name || "Người dùng";

    // Xử lý hình ảnh comment - kiểm tra tất cả các trường có thể chứa URL hình ảnh
    const commentImage =
      comment.imageUrl ||
      comment.image ||
      comment.commentImageUrl ||
      comment.photoUrl ||
      null;

    // Log thông tin hình ảnh để debug
    if (commentImage) {
      console.log(`Comment ID ${comment.commentId} has image:`, commentImage);
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
                    <img src={commentImage} alt="Comment attachment" />
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
                      // Xử lý hình ảnh reply - kiểm tra tất cả các trường có thể chứa URL hình ảnh
                      const replyImage =
                        reply.imageUrl ||
                        reply.image ||
                        reply.commentImageUrl ||
                        reply.photoUrl ||
                        null;

                      console.log(
                        `Rendering reply ID ${reply.commentId} cho comment ID ${comment.commentId}`
                      );
                      if (replyImage) {
                        console.log(
                          `- Reply ID ${reply.commentId} has image:`,
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

  return (
    <div className="comments-section">
      <h4>Bình luận ({comments.length})</h4>

      {isLoading && (
        <div className="comments-loading">Đang tải bình luận...</div>
      )}

      <div className="comments-list">
        {/* Hiển thị các comment gốc (parentCommentId = 0 hoặc null) */}
        {comments
          .filter((comment) => !comment.parentCommentId)
          .map((comment) => renderCommentItem(comment))}

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

export default CommentSection; 