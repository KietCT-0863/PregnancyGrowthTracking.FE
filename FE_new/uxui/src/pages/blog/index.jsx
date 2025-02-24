import { Outlet } from "react-router-dom";
import "./BlogStyle.scss";

const Blog = () => {
  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>
          Welcome to our blog! Here you can find articles and updates about our
          latest projects, industry news, and more.
        </p>
      </div>
      <Outlet />
    </div>
  );
};

export default Blog;
