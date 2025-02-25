import { Outlet } from "react-router-dom";


const Blog = () => {
  return (
    <div className="blog-container">
      <h1 className="title">Blog</h1>
     <p className="description">Welcome to our blog! Here you can find articles and updates about our latest projects, industry news, and more.</p>
     <Outlet/>
    </div>
  );
};

export default Blog;
