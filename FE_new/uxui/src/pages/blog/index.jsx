import { Outlet } from "react-router-dom";
import "./BlogStyle.scss";

const Blog = () => {
  return (
    <div className="blog-container">
      <div className="blog-header"></div>
      <Outlet />
    </div>
  );
};

export default Blog;
