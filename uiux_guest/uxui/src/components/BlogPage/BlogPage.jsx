import { useEffect, useState } from "react";
import "./BlogPage.scss";

const BlogPage = () => {
  const [blogPage, setBlogPgae] = useState([]);


  useEffect(() => {
    fetch("https://dummyjson.com/c/dc2a-9539-4d0d-ba9c") 
      .then((response) => response.json())
      .then((data) => {
        setBlogPgae(data);
        console.log( data);
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  }, []);

  return (
    <section className="blog-posts">
      <h2>Bài viết mới nhất</h2>
      <div className="posts-grid">
        {blogPage.map(({id, image, title, excerpt}) => (
          <div key={id} className="post-card">
            <div className="post-icon">
              <img src={image} alt={title} />
            </div>
            <div className="post-content">
              <h3>{title}</h3>
              <p>{excerpt}</p>
              <button className="read-more">Đọc tiếp</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default  BlogPage;
