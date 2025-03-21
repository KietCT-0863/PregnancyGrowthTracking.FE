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
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import "./Community.scss";
import communityService from "../../api/services/communityService";
import commentService from "../../api/services/commentService";
import { toast } from "react-toastify";

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

    // Thêm các tags nếu có - chỉ sử dụng một phương thức nhất quán
    if (tags.length > 0) {
      // Gửi mảng các tag theo đúng định dạng backend yêu cầu: [{ "tagName": "string" }]
      const tagsArray = tags.map((tag) => ({ tagName: tag.trim() }));

      // Chuyển thành JSON string và thêm vào formData
      formData.append("postTags", JSON.stringify(tagsArray));

      // In ra console để kiểm tra
      console.log("Tags JSON được gửi:", JSON.stringify(tagsArray));
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
      setComments(fetchedComments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsLoading(true);
      const commentData = {
        postId: postId,
        comment: newComment.trim(),
      };

      await commentService.createComment(commentData);
      setNewComment("");
      fetchComments(); // Làm mới danh sách bình luận
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

  return (
    <div className="comments-section">
      <h4>Bình luận ({comments.length})</h4>

      {isLoading && (
        <div className="comments-loading">Đang tải bình luận...</div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.commentId} className="comment-item">
            <div className="comment-avatar">
              <User size={24} />
            </div>
            <div className="comment-content">
              <div className="comment-header">
                <div className="comment-author">
                  {comment.userName || "Người dùng"}
                </div>
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
                    <button onClick={() => setEditingCommentId(null)}>
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-text">{comment.comment}</div>
              )}
            </div>

            <div className="comment-actions">
              <button
                className="comment-menu-button"
                onClick={() =>
                  setShowDropdown(
                    showDropdown === comment.commentId
                      ? null
                      : comment.commentId
                  )
                }
              >
                <MoreVertical size={16} />
              </button>

              {showDropdown === comment.commentId && (
                <div className="comment-dropdown">
                  <button onClick={() => handleEditComment(comment)}>
                    <Edit size={14} /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.commentId)}
                  >
                    <Trash size={14} /> Xóa
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {comments.length === 0 && !isLoading && (
          <div className="no-comments">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        )}
      </div>

      <div className="add-comment">
        <form onSubmit={handleSubmitComment}>
          <div className="comment-input-wrapper">
            <div className="comment-avatar">
              <User size={24} />
            </div>
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
          </div>
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
    try {
      setIsLoading(true);
      console.log("FormData được gửi từ modal:", formData);

      // Kiểm tra xem formData có các trường cần thiết không
      if (formData instanceof FormData) {
        const title = formData.get("title");
        const body = formData.get("body");
        const postTags = formData.get("postTags");

        if (!title || !body) {
          throw new Error("Tiêu đề và nội dung không được để trống");
        }

        console.log("Tags từ form:", postTags);
      }

      if (postId) {
        // Xử lý cập nhật bài viết
        try {
          const post = posts.find((p) => p.id === postId);
          if (!post) {
            throw new Error("Không tìm thấy bài viết cần cập nhật");
          }

          // Tạo đối tượng dữ liệu cập nhật có chứa ID
          const updateData = {
            id: postId, // Đảm bảo ID luôn có
            title: formData.get("title"),
            body: formData.get("body"),
          };

          // Xử lý tags nếu có
          const tagsStr = formData.get("postTags");
          if (tagsStr) {
            try {
              updateData.postTags = JSON.parse(tagsStr);
            } catch (err) {
              console.error("Lỗi parse tags:", err);
            }
          }

          console.log("Dữ liệu cập nhật bài viết:", updateData);
          await communityService.updatePost(updateData);
          toast.success("Bài viết đã được cập nhật thành công");
        } catch (updateError) {
          console.error("Lỗi khi cập nhật bài viết:", updateError);
          toast.error("Không thể cập nhật bài viết: " + updateError.message);
          throw updateError;
        }
      } else {
        // Tạo bài viết mới với FormData đã có đầy đủ thông tin
        await communityService.createPost(formData);
        toast.success("Bài viết đã được tạo thành công");
      }

      fetchPosts();
      setModalOpen(false);
      setCurrentPost({});
    } catch (error) {
      console.error("Error creating/updating post:", error);
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
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
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="community-container">
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
                    ...
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
              <div className="post-content">
                <h2>{post.title}</h2>
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
  );
};

export default Community;
