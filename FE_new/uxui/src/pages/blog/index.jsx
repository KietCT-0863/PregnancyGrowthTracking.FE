import { Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Blog.scss";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchTerm) return;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://dummyjson.com/posts/search?q=${searchTerm}`
        );
        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setShowDropdown(true);
    }
  };

  return (
    <div className="blog-container">
      <h1 className="title">Blog</h1>
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm theo tiêu đề..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showDropdown && (
        <div className="dropdown show-dropdown">
          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <Link to={`/blog/${post.id}`}>{post.title}</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <Outlet />
    </div>
  );
};

export default Blog;
