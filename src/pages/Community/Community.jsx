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

// Component hiển thị phần comment cho mỗi bài viết
const CommentSection = ({ postId, initialComments = [] }) => {
  const [comments, setComments] = useState(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showDropdown, setShowDropdown] = useState(null);

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
      return format(new Date(dateString), "MMMM dd, yyyy");
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

      let response;
      if (isEditing) {
        response = await communityService.updatePost(formData);
        toast.success("Bài viết đã được cập nhật thành công");
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