import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { CiMedicalCase } from "react-icons/ci";
import { FaCalendarAlt } from "react-icons/fa";
import { FaBlog } from "react-icons/fa6";
import { MdAccountBox } from "react-icons/md";
import { FaPlusSquare } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa";
import { TiSocialInstagram } from "react-icons/ti";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowUserMenu(false);
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user-menu")) {
      setShowUserMenu(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <div className="logo-circle">
              <img
                src="./public/logo_images/1.jpg"
                alt="Mẹ Bầu Logo"
                className="logo-img"
              />
            </div>
            <span className="logo-text">Mẹ Bầu</span>
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/dashboard">
            {" "}
            <CiMedicalCase /> Theo dõi Thai Kỳ{" "}
          </Link>
          <Link to="/calendar">
            {" "}
            <FaCalendarAlt /> Lịch trình Thăm Khám
          </Link>
          <Link to="/notes">
            {" "}
            <FaNotesMedical /> Ghi Chú Bác Sỹ
          </Link>
          <Link to="/blog">
            {" "}
            <FaBlog /> Blog
          </Link>
          <Link to="/forum">
            {" "}
            <TiSocialInstagram /> Cộng Đồng
          </Link>
        </nav>

        <div className="auth-buttons">
          {user ? (
            <div className="user-menu">
              <div
                className="user-info"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="user-avatar"
                  />
                ) : (
                  <div className="user-avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name">{user.username}</span>
                <Menu size={16} className="menu-icon" />
              </div>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <span>Xin chào!</span>
                    <strong>{user.username}</strong>
                  </div>

                  <div className="dropdown-divider"></div>

                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>Thông tin cá nhân</span>
                  </Link>

                  {user.role === "admin" && (
                    <Link to="/admin" className="dropdown-item">
                      <Settings size={16} />
                      <span>Quản trị</span>
                    </Link>
                  )}

                  <button onClick={handleLogout} className="dropdown-item">
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-register">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
