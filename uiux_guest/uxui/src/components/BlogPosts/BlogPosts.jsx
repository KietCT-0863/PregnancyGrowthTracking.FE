import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./BlogPosts.scss";

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("https://dummyjson.com/c/14a3-2e21-422d-aaac") 
      .then((response) => response.json())
      .then((data) => {
        setPosts(data);
        console.log(data);
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 5,
  };

  return (
    <section className="blog-posts">
      <h2>Bài viết mới nhất</h2>
      <Slider {...settings}>
        {posts.map(({image,title,excerpt,daycreate,author,id}) => (
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
      </Slider>
    </section>
  );
};

export default BlogPosts;
