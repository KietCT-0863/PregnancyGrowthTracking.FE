import { useState, useEffect } from "react";
import { Search, Heart, MessageCircle, Share2, Image, Send } from "lucide-react";
import "./Community.scss";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ content: "", images: [] });
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for initial posts
  const mockPosts = [
    {
      id: 1,
      user: {
        name: "Nguyễn Thị A",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      content: "Hôm nay là tuần 20 của thai kỳ, bé đạp nhiều quá 🥰",
      images: ["https://picsum.photos/seed/post1/600/400"],
      likes: 15,
      comments: [
        {
          id: 1,
          user: "Trần Thị B",
          content: "Chúc mừng bạn nhé! ❤️",
        },
      ],
      shares: 3,
      createdAt: "2024-03-20T10:00:00Z",
    },
    // Add more mock posts as needed
  ];

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.content.trim() && newPost.images.length === 0) return;

    const post = {
      id: posts.length + 1,
      user: {
        name: "Người dùng hiện tại",
        avatar: "https://i.pravatar.cc/150?img=8",
      },
      content: newPost.content,
      images: newPost.images,
      likes: 0,
      comments: [],
      shares: 0,
      createdAt: new Date().toISOString(),
    };

    setPosts([post, ...posts]);
    setNewPost({ content: "", images: [] });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setNewPost(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  const handleComment = (postId, comment) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? {
            ...post,
            comments: [
              ...post.comments,
              { id: post.comments.length + 1, user: "Người dùng hiện tại", content: comment },
            ],
          }
        : post
    ));
  };

  const handleShare = (postId) => {
    setPosts(posts.map(post =>
      post.id === postId ? { ...post, shares: post.shares + 1 } : post
    ));
  };

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Cộng đồng Mẹ Bầu</h1>
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="create-post">
        <form onSubmit={handlePostSubmit}>
          <div className="post-input">
            <img src="https://i.pravatar.cc/150?img=8" alt="User avatar" className="user-avatar" />
            <textarea
              placeholder="Chia sẻ cảm nghĩ của bạn..."
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
          </div>
          
          {newPost.images.length > 0 && (
            <div className="image-preview">
              {newPost.images.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index + 1}`} />
              ))}
            </div>
          )}

          <div className="post-actions">
            <label className="upload-image">
              <Image className="icon" />
              <span>Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </label>
            <button type="submit" className="submit-post">
              <Send className="icon" />
              <span>Đăng bài</span>
            </button>
          </div>
        </form>
      </div>

      <div className="posts-container">
        {filteredPosts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-header">
              <img src={post.user.avatar} alt={post.user.name} className="user-avatar" />
              <div className="post-info">
                <h3>{post.user.name}</h3>
                <span className="post-time">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="post-content">
              <p>{post.content}</p>
              {post.images?.length > 0 && (
                <div className="post-images">
                  {post.images.map((image, index) => (
                    <img key={index} src={image} alt={`Post image ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>

            <div className="post-stats">
              <span>{post.likes} lượt thích</span>
              <span>{post.comments.length} bình luận</span>
              <span>{post.shares} chia sẻ</span>
            </div>

            <div className="post-actions">
              <button onClick={() => handleLike(post.id)}>
                <Heart className="icon" />
                Thích
              </button>
              <button onClick={() => handleComment(post.id, prompt("Nhập bình luận của bạn:"))}>
                <MessageCircle className="icon" />
                Bình luận
              </button>
              <button onClick={() => handleShare(post.id)}>
                <Share2 className="icon" />
                Chia sẻ
              </button>
            </div>

            {post.comments.length > 0 && (
              <div className="comments-section">
                {post.comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.user}:</strong> {comment.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community; 