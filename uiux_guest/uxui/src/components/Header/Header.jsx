import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Mẹ Bầu</Link>
        </div>
        <nav className="nav-links">
          <Link to="/dashboard">Bảng điều khiển</Link>
          <Link to="/nutrition">Dinh dưỡng</Link>
          <Link to="/exercise">Bài tập</Link>
          <Link to="/blog">Blog</Link>
        </nav>
        <div className="auth-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
