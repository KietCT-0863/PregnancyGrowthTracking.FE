import { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Search,
  Plus,
  X,
  Camera,
  User,
  Edit,
  Trash,
  Send,
  MoreVertical,
  Music,
  Users,
  PhoneCall,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import "./Community.scss";
import communityService from "../../api/services/communityService";
import commentService from "../../api/services/commentService";
import { toast } from "react-toastify";
import { playNotificationSound, playDeleteSound } from "../../utils/soundUtils";
import SidebarTunes from "./components/SidebarTunes";
import SidebarContacts from "./components/SidebarContacts";

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
  const [likedComments, setLikedComments] = useState({});
  const [commentLikesCount, setCommentLikesCount] = useState({});
  const userId = 4; // Giống như trong Community component

  useEffect(() => {
    fetchComments();
  }, [postId]);

  useEffect(() => {
    if (comments.length > 0) {
      comments.forEach((comment) => {
        checkCommentLikeStatus(comment.commentId);
        fetchCommentLikesCount(comment.commentId);
      });
    }
  }, [comments]);

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
      playNotificationSound();
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
      playNotificationSound();
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
        playDeleteSound();
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

  // Thêm hàm để kiểm tra và lấy số lượt thích cho bình luận
  const checkCommentLikeStatus = async (commentId) => {
    try {
      const isLiked = await commentService.checkCommentLikeStatus(
        commentId,
        userId
      );
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: isLiked,
      }));
    } catch (error) {
      console.error(
        `Lỗi khi kiểm tra trạng thái thích cho bình luận ${commentId}:`,
        error
      );
    }
  };

  const fetchCommentLikesCount = async (commentId) => {
    try {
      const count = await commentService.getCommentLikesCount(commentId);
      setCommentLikesCount((prev) => ({
        ...prev,
        [commentId]: count,
      }));
    } catch (error) {
      console.error(
        `Lỗi khi lấy số lượt thích cho bình luận ${commentId}:`,
        error
      );
    }
  };

  // Thêm hàm xử lý việc thích/bỏ thích bình luận
  const handleCommentLikeToggle = async (commentId) => {
    try {
      // Cập nhật UI trước để tạo cảm giác phản hồi nhanh
      const currentLikeStatus = likedComments[commentId] || false;

      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !currentLikeStatus,
      }));

      setCommentLikesCount((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (currentLikeStatus ? -1 : 1),
      }));

      // Gọi API để thay đổi trạng thái thích
      const result = await commentService.toggleCommentLike(commentId, userId);
      console.log(
        `${currentLikeStatus ? "Bỏ thích" : "Thích"} bình luận ${commentId} ${
          result.success ? "thành công" : "thất bại"
        }`,
        result
      );

      // Thêm thông báo trực quan
      if (result.success) {
        const action = currentLikeStatus ? "Đã bỏ thích" : "Đã thích";
        // Nếu có toast, sử dụng; nếu không, dùng console.log
        if (typeof toast !== "undefined") {
          toast.success(`${action} bình luận!`, {
            position: "bottom-right",
            autoClose: 2000,
          });
        }
      }

      // Cập nhật lại dữ liệu từ server sau 1 giây
      setTimeout(() => {
        checkCommentLikeStatus(commentId);
        fetchCommentLikesCount(commentId);
      }, 1000);
    } catch (error) {
      console.error(`Lỗi khi thích/bỏ thích bình luận ${commentId}:`, error);
      // Khôi phục trạng thái trước đó nếu có lỗi
      const currentStatus = likedComments[commentId] || false;
      setLikedComments((prev) => ({
        ...prev,
        [commentId]: !currentStatus, // Đảo ngược lại trạng thái hiện tại
      }));

      setCommentLikesCount((prev) => ({
        ...prev,
        [commentId]: (prev[commentId] || 0) + (currentStatus ? 1 : -1), // Đảo ngược lại sự thay đổi
      }));

      if (typeof toast !== "undefined") {
        toast.error(
          "Không thể thay đổi trạng thái thích. Vui lòng thử lại sau!",
          {
            position: "bottom-right",
            autoClose: 3000,
          }
        );
      }
    }
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

    const isLiked = likedComments[comment.commentId] || false;
    const likeCount = commentLikesCount[comment.commentId] || 0;

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
              <button
                className={`action-button ${isLiked ? "liked" : ""}`}
                onClick={() => handleCommentLikeToggle(comment.commentId)}
              >
                Thích {likeCount > 0 && `(${likeCount})`}
              </button>
              <button
                className="action-button"
                onClick={() => handleReplyComment(comment)}
              >
                Phản hồi
              </button>

              {/* Thêm nút sửa và xóa nếu comment của người dùng hiện tại */}
              {comment.userId === userId && (
                <>
                  <button
                    className="action-button"
                    onClick={() => handleEditComment(comment)}
                  >
                    Sửa
                  </button>
                  <button
                    className="action-button"
                    onClick={() => handleDeleteComment(comment.commentId)}
                  >
                    Xóa
                  </button>
                </>
              )}
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

                      const isReplyLiked =
                        likedComments[reply.commentId] || false;
                      const replyLikeCount =
                        commentLikesCount[reply.commentId] || 0;

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
                              <button
                                className={`action-button ${
                                  isReplyLiked ? "liked" : ""
                                }`}
                                onClick={() =>
                                  handleCommentLikeToggle(reply.commentId)
                                }
                              >
                                Thích{" "}
                                {replyLikeCount > 0 && `(${replyLikeCount})`}
                              </button>
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

// New component for Forums sidebar
const SidebarSettings = () => {
  return (
    <div className="sidebar-section settings">
      <h2>Settings</h2>
      <div className="settings-list">
        <div className="setting-item">
          <div className="setting-icon">
            <Settings size={18} />
          </div>
          <span>Tùy chỉnh thông báo</span>
        </div>
        <div className="setting-item">
          <div className="setting-icon">
            <Users size={18} />
          </div>
          <span>Riêng tư</span>
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});
  const [likedPosts, setLikedPosts] = useState({}); // { postId: true/false }
  const [likesCount, setLikesCount] = useState({}); // { postId: count }
  const userId = 4; // Tạm thời hardcode userId, sau này lấy từ context hoặc localStorage

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
      console.log("API response:", response); // Ghi log để debug

      // Kiểm tra response
      if (!response) {
        console.error("Không có phản hồi từ API");
        setPosts([]);
        toast.error("Không thể kết nối tới server");
        return;
      }

      // Xác định dữ liệu từ response
      let postsData = null;

      if (Array.isArray(response)) {
        // Trường hợp API trả về trực tiếp mảng posts
        postsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Trường hợp API trả về { data: [...] }
        postsData = response.data;
      } else if (
        response.data &&
        response.data.posts &&
        Array.isArray(response.data.posts)
      ) {
        // Trường hợp API trả về { data: { posts: [...] } }
        postsData = response.data.posts;
      } else if (response.posts && Array.isArray(response.posts)) {
        // Trường hợp API trả về { posts: [...] }
        postsData = response.posts;
      }

      if (postsData) {
        // Kiểm tra và log chi tiết về cấu trúc của mỗi bài viết và tags
        postsData.forEach((post) => {
          console.log(`Bài đăng ID ${post.id} chi tiết:`, post);
          console.log(`- Tags của bài đăng ID ${post.id}:`, post.postTags);
        });

        // Xử lý tạo ID nếu không có
        const processedPosts = postsData.map((post, index) => {
          // Chuẩn hóa postTags để luôn là một mảng với cấu trúc đúng
          let normalizedTags = [];

          if (post.postTags) {
            console.log(
              `Phân tích postTags của bài đăng ID ${post.id}:`,
              typeof post.postTags,
              Array.isArray(post.postTags) ? "array" : "not array",
              post.postTags
            );

            if (Array.isArray(post.postTags)) {
              normalizedTags = post.postTags.map((tag, tagIndex) => {
                if (typeof tag === "string") {
                  // Nếu tag là string, chuyển về đúng format {id, name}
                  return { id: `tag_${index}_${tagIndex}`, name: tag };
                } else if (typeof tag === "object") {
                  // Nếu tag đã là object, đảm bảo nó có id và name
                  return {
                    id: tag.id || tag.tagId || `tag_${index}_${tagIndex}`,
                    name: tag.name || tag.tagName || "Unknown",
                  };
                }
                return { id: `tag_${index}_${tagIndex}`, name: "Unknown" };
              });
            } else if (typeof post.postTags === "object") {
              // Nếu postTags là một object, cố gắng chuyển đổi thành mảng
              const tagEntries = Object.entries(post.postTags);
              normalizedTags = tagEntries.map(([key, value], tagIndex) => {
                return {
                  id: `tag_${index}_${tagIndex}`,
                  name: typeof value === "string" ? value : key,
                };
              });
            }
          }

          console.log(
            `Tags đã chuẩn hóa cho bài đăng ID ${post.id}:`,
            normalizedTags
          );

          return {
            ...post,
            id: post.id || `post_${index}`,
            postTags: normalizedTags,
          };
        });

        setPosts(processedPosts);
      } else {
        console.error("Dữ liệu API không đúng định dạng:", response);
        setPosts([]);
        toast.error("Dữ liệu API không đúng định dạng");
      }
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

  // Thêm hàm để fetch số lượt like
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

  // Thêm hàm để kiểm tra trạng thái like
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

  // Cập nhật useEffect để fetch thêm dữ liệu like
  useEffect(() => {
    fetchPosts();
  }, []);

  // Thêm useEffect để fetch dữ liệu like sau khi có posts
  useEffect(() => {
    if (posts.length > 0) {
      posts.forEach((post) => {
        fetchLikesCount(post.id);
        checkLikeStatus(post.id);
      });
    }
  }, [posts]);

  // Thêm hàm xử lý like/unlike
  const handleLikeToggle = async (postId) => {
    try {
      // Ngăn chặn việc like bài viết không tồn tại
      if (!posts.some((post) => post.id === postId)) {
        console.warn(
          `Không thể like/unlike bài viết ID ${postId} vì không tồn tại trong danh sách hiện tại`
        );
        toast.warning("Bài viết không tồn tại hoặc đã bị xóa");
        return;
      }

      const currentLikeStatus = likedPosts[postId] || false;

      // Cập nhật UI trước để tạo cảm giác phản hồi nhanh
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !currentLikeStatus,
      }));

      setLikesCount((prev) => ({
        ...prev,
        [postId]: (prev[postId] || 0) + (currentLikeStatus ? -1 : 1),
      }));

      // Thêm timeout để tạo cảm giác mượt mà hơn
      setTimeout(async () => {
        try {
          let result;
          // Gọi API
          if (currentLikeStatus) {
            result = await communityService.unlikePost(postId, userId);
          } else {
            result = await communityService.likePost(postId, userId);
          }

          // Kiểm tra xem kết quả có phải là giả lập và có thông báo không
          if (result && result.simulated && result.message) {
            console.log(`Thông báo từ API: ${result.message}`);
            // Nếu muốn hiển thị cho người dùng (tùy chọn)
            // toast.info(result.message);
          } else {
            // Sau khi API thành công, cập nhật lại số lượng like chính xác
            fetchLikesCount(postId);
          }
        } catch (error) {
          console.error(
            `Error calling like/unlike API for post ${postId}:`,
            error
          );
          // Để trạng thái UI như đã cập nhật, không rollback vì API đang lỗi
          console.log("API gặp lỗi nhưng vẫn giữ trạng thái UI đã cập nhật");
        }
      }, 300);
    } catch (error) {
      console.error(`Error toggling like for post ${postId}:`, error);

      // Nếu có lỗi tổng thể, khôi phục trạng thái cũ
      try {
        checkLikeStatus(postId);
        fetchLikesCount(postId);
      } catch (err) {
        console.error("Lỗi khi khôi phục trạng thái:", err);
      }

      toast.error("Có lỗi xảy ra khi thực hiện thao tác yêu thích bài viết");
    }
  };

  const handleCreatePost = async (formData, postId) => {
    setIsLoading(true);

    try {
      if (postId) {
        // Update existing post
        await communityService.updatePost(postId, formData);
        const updatedPosts = posts.map((p) => {
          if (p.id === postId) {
            const updatedPost = { ...p };

            // Update properties from formData
            for (let [key, value] of formData.entries()) {
              if (key === "postTags") {
                // Parse JSON string back to array
                try {
                  const tagsArray = JSON.parse(value);
                  updatedPost.postTags = tagsArray.map((tag) => ({
                    name: tag,
                    postId: postId,
                  }));
                } catch (e) {
                  console.error("Error parsing tags:", e);
                }
              } else if (key === "title") {
                updatedPost.title = value;
              } else if (key === "body") {
                updatedPost.body = value;
              }
              // Note: Image handling is more complex and will be done on reload
            }

            return updatedPost;
          }
          return p;
        });

        setPosts(updatedPosts);
        setCurrentPost({});
        toast.success("Đã cập nhật bài viết thành công!");
        playNotificationSound();
      } else {
        // Create new post
        const result = await communityService.createPost(formData);
        console.log("New post created:", result);

        // Gọi lại fetchPosts để có dữ liệu đầy đủ và cập nhật
        await fetchPosts();
        toast.success("Đã tạo bài viết mới thành công!");
        playNotificationSound();
      }

      setModalOpen(false);
    } catch (error) {
      console.error("Error creating/updating post:", error);
      toast.error(
        "Đã xảy ra lỗi khi " +
          (postId ? "cập nhật" : "tạo") +
          " bài viết. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      await communityService.deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      toast.success("Đã xóa bài viết thành công!");
      playDeleteSound();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Đã xảy ra lỗi khi xóa bài viết. Vui lòng thử lại sau.");
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
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="community-container">
      <div className="community-layout">
        <div className="community-sidebar">
          <SidebarTunes />
          <SidebarContacts />
          <SidebarSettings />
        </div>
        <div className="community-main">
          <div className="community-header">
            <h1>Cộng đồng</h1>
            <div className="header-actions">
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

          <div className="posts-container">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="user-info">
                      <div className="avatar">
                        <User size={20} />
                      </div>
                      <div className="post-meta">
                        <h3>
                          {post.createdBy ||
                            post.userName ||
                            post.author ||
                            post.user?.name ||
                            "Người dùng"}
                        </h3>
                        <div className="post-time">
                          {formatDate(post.createdDate)}
                        </div>
                      </div>
                    </div>
                    <div className="post-actions">
                      <button
                        className="menu-button"
                        onClick={() =>
                          setShowDropdown(showDropdown === post.id ? null : post.id)
                        }
                      >
                        <MoreVertical size={18} />
                      </button>
                      {showDropdown === post.id && (
                        <div className="dropdown-content">
                          <button
                            onClick={() => openEditModal(post)}
                            className="edit-button"
                          >
                            <Edit size={16} />
                            Chỉnh sửa
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
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
                        className={`reaction-button ${
                          likedPosts[post.id] ? "liked" : ""
                        }`}
                        onClick={() => handleLikeToggle(post.id)}
                      >
                        <Heart
                          size={18}
                          className={likedPosts[post.id] ? "heart-filled" : ""}
                        />
                        Thích {likesCount[post.id] > 0 && `(${likesCount[post.id]})`}
                      </button>
                      <button
                        className="reaction-button"
                        onClick={() => toggleComments(post.id)}
                      >
                        <MessageCircle size={18} />
                        Bình luận
                      </button>
                    </div>

                    {/* Hiển thị phần bình luận nếu đã mở rộng */}
                    {expandedComments[post.id] && <CommentSection postId={post.id} />}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts">
                {searchQuery
                  ? "Không tìm thấy bài viết nào phù hợp"
                  : "Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!"}
              </div>
            )}
          </div>

          <PostModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            post={currentPost}
            onSubmit={handleCreatePost}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Community;
