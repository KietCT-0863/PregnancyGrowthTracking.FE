import { Outlet } from "react-router-dom";
import "./BlogStyle.scss";

const BlogPublic = () => {
  return (
    <div className="blog-container">
      <Outlet />
    </div>
  );
};

export default BlogPublic;
