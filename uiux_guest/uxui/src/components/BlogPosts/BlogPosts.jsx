import { useEffect, useState } from "react";
import "./BlogPosts.scss";

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);


  useEffect(() => {
    fetch("https://dummyjson.com/c/dc2a-9539-4d0d-ba9c") 
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        console.log( data);
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  }, []);

  return (
    <section className="blog-posts">
      <h2>Bài viết mới nhất</h2>
      <div className="posts-grid">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-icon">
              <img src={post.image} alt={post.title} />
            </div>
            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <button className="read-more">Đọc tiếp</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BlogPosts;
