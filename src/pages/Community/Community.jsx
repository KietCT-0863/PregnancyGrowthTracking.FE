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
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import "./Community.scss";
import communityService from "../../api/services/communityService";
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

    // Xử lý tags
    if (tags.length > 0) {
      // Lấy tag đầu tiên để tạo đối tượng tag đơn
      const firstTag = tags[0].trim();

      // Tạo object theo định dạng {"tagName": "dog"}
      const tagObj = { tagName: firstTag };

      // Chuyển đổi thành chuỗi JSON và thêm vào formData
      formData.append("postTags", JSON.stringify(tagObj));

      console.log("Tag được gửi đi:", JSON.stringify(tagObj));

      // Nếu có nhiều tag, hiển thị cảnh báo (hoặc bạn có thể điều chỉnh logic tùy thuộc vào yêu cầu)
      if (tags.length > 1) {
        console.warn(
          "Backend chỉ hỗ trợ một tag duy nhất. Chỉ tag đầu tiên được gửi đi."
        );
      }
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
                  placeholder="Nhập tag và nhấn Enter (chỉ tag đầu tiên được áp dụng)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button type="button" className="tag-button" onClick={addTag}>
                  Thêm
                </button>
              </div>

              {tags.length === 0 && (
                <div className="tag-hint">
                  <small>
                    * Bài đăng có thể có một tag duy nhất theo định dạng của hệ
                    thống
                  </small>
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
                  {tags.length > 1 && (
                    <div className="tag-warning">
                      <small>
                        * Lưu ý: Hệ thống hiện chỉ hỗ trợ một tag. Chỉ tag đầu
                        tiên sẽ được lưu.
                      </small>
                    </div>
                  )}
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

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState({});
  const [showDropdown, setShowDropdown] = useState(null);

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

            // Cố gắng xử lý tất cả các trường hợp có thể
            if (Array.isArray(post.postTags)) {
              // Nếu postTags là mảng
              normalizedTags = post.postTags.map((tag, tagIndex) => {
                if (typeof tag === "string") {
                  return { id: `tag_${index}_${tagIndex}`, name: tag };
                } else if (typeof tag === "object") {
                  return {
                    id: tag.id || tag.tagId || `tag_${index}_${tagIndex}`,
                    name: tag.name || tag.tagName || "Unknown",
                  };
                }
                return { id: `tag_${index}_${tagIndex}`, name: "Unknown" };
              });
            } else if (typeof post.postTags === "object") {
              // Nếu postTags là object dạng {"tagName": "dog"}
              const tagName = post.postTags.tagName;
              if (tagName) {
                normalizedTags = [
                  {
                    id: `tag_${index}_0`,
                    name: tagName,
                  },
                ];
              } else {
                // Trường hợp object nhưng không có tagName
                const tagEntries = Object.entries(post.postTags);
                normalizedTags = tagEntries.map(([key, value], tagIndex) => {
                  return {
                    id: `tag_${index}_${tagIndex}`,
                    name: typeof value === "string" ? value : key,
                  };
                });
              }
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

  useEffect(() => {
    fetchPosts();
  }, []);

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
        if (formData instanceof FormData) {
          // Thêm ID vào formData nếu đang cập nhật
          formData.append("id", postId);
          await communityService.updatePost(formData);
        } else {
          // Tạo đối tượng dữ liệu cập nhật nếu formData không phải FormData
          const updateData = {
            id: postId,
            title: formData.get ? formData.get("title") : formData.title,
            body: formData.get ? formData.get("body") : formData.body,
          };

          // Xử lý tags nếu có
          const tagsStr = formData.get && formData.get("postTags");
          if (tagsStr) {
            try {
              updateData.postTags = JSON.parse(tagsStr);
            } catch (err) {
              console.error("Lỗi parse tags:", err);
            }
          }

          await communityService.updatePost(updateData);
        }

        toast.success("Bài viết đã được cập nhật thành công");
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
                    <h3>{post.createdBy}</h3>
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
                <button className="reaction-button">
                  <Heart size={18} />
                  Thích
                </button>
                <button className="reaction-button">
                  <MessageCircle size={18} />
                  Bình luận
                </button>
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
  );
};

export default Community;
