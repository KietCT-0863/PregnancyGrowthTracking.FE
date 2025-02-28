import { Outlet } from "react-router-dom";

const BlogGuest = () => {
  return (
    <div className="blog-container">
      <Outlet />
    </div>
  );
};

export default BlogGuest;
