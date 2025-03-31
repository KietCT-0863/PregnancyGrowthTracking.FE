"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';
import {
  FaBabyCarriage,
  FaCalendarAlt,
  FaNotesMedical,
  FaBlog,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserEdit,
  FaBell,
  FaHome,
} from "react-icons/fa";
import { AiOutlineMenu } from 'react-icons/ai';
import "./Navbar.scss";

// Notification item component
const NotificationItem = ({ notification, formatDateTime }) => (
  <div className="notification-item">
    <div className="notification-content">
      <div className="notification-type">
        {notification.reminderType || "Khám thai"}
      </div>
      <h4>{notification.title}</h4>
      <p className="notification-time">
        {formatDateTime(notification.date, notification.time)}
      </p>
    </div>
  </div>
);

// Add prop types for NotificationItem component
NotificationItem.propTypes = {
  notification: PropTypes.shape({
    reminderType: PropTypes.string,
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  }).isRequired,
  formatDateTime: PropTypes.func.isRequired
};

// NavBar component
const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // UI state
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Refs for DOM elements
  const navbarRef = useRef(null);
  const horizontalNavRef = useRef(null);
  
  // Format date and time
  const formatDateTime = useCallback((date, time) => {
    try {
      const dateStr = date.includes("T") ? date.split("T")[0] : date;
      const dateObj = new Date(`${dateStr}T${time}`);
      return `${time} ${dateObj.toLocaleDateString("vi-VN")}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  // Handle logout function
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    navigate("/");
  }, [navigate]);

  // Toggle horizontal navigation menu
  const toggleHorizontalMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menus when navigating
  useEffect(() => {
    setMenuOpen(false);
    
    // Force menu closing with setTimeout
    setTimeout(() => {
      setMenuOpen(false);
    }, 10);
    
    return () => {
      setMenuOpen(false);
    };
  }, [location.pathname]);

  // Handle initial auth and notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData") || "null");

    if (token) {
      try {
        const decoded = jwtDecode(token);

        setIsLoggedIn(true);
        setUserInfo({
          ...decoded,
          fullName: userData?.fullName,
          email: userData?.email,
          userName: userData?.userName,
          role: userData?.role,
        });
        setIsAdmin(userData?.role === "admin");
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    } else {
      // Đảm bảo trạng thái đăng nhập là false khi không có token
      setIsLoggedIn(false);
      setUserInfo(null);
      setIsAdmin(false);
    }

    // Set sample notifications
    setNotifications([
      {
        reminderType: "Thông báo",
        title: "Chào mừng đến với Mẹ Bầu",
        date: new Date().toISOString(),
        time: "10:00",
      },
      {
        reminderType: "Tin tức",
        title: "Bài viết mới về dinh dưỡng thai kỳ",
        date: new Date(Date.now() + 86400000).toISOString(),
        time: "14:30",
      },
    ]);

    // Xử lý sự kiện cuộn trang
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      // Xử lý việc điều chỉnh kích thước viewport
      if (window.innerWidth <= 768) {
        // Điều chỉnh giao diện cho thiết bị di động
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    // Gọi handleResize ban đầu để thiết lập đúng trạng thái
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      document.body.classList.remove('mobile-view');
    };
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle horizontal menu clicks
      if (menuOpen && 
          horizontalNavRef.current && 
          !horizontalNavRef.current.contains(event.target) &&
          !event.target.closest('.navbar-toggle-button')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);
  
  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hàm kiểm tra người dùng đã đăng nhập hay chưa
  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    return !!token; // Trả về true nếu có token, false nếu không có
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-container">
        <Link to="/" className="navbar-logo">
          <img
            src="/Logo bau-02.png"
            alt="Mẹ Bầu"
            className="navbar-logo-image"
          />
          <span className="navbar-logo-text">Mẹ Bầu</span>
        </Link>
      </div>

      {/* Header Actions với nút đăng nhập/đăng ký */}
      <div className="header-actions">
        {isLoggedIn ? (
          <button 
            className="header-action-button logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <div className="feature-tooltip">Đăng xuất</div>
          </button>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-button">
              Đăng nhập
              <div className="feature-tooltip">Đăng nhập vào tài khoản</div>
            </Link>
            <div className="action-separator"></div>
            <Link to="/register" className="register-button">
              Đăng ký
              <div className="feature-tooltip">Tạo tài khoản mới</div>
            </Link>
          </div>
        )}
        
        <div className="action-separator"></div>
        <button 
          className="navbar-toggle-button"
          onClick={toggleHorizontalMenu}
        >
          <AiOutlineMenu />
          <div className="feature-tooltip">Menu</div>
        </button>
      </div>
      
      {/* Mobile Nav Links */}
      <div className={`mobile-nav-links ${menuOpen ? 'open' : ''}`} ref={horizontalNavRef}>
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <FaHome /> Trang chủ
          <div className="nav-tooltip">Quay về trang chính</div>
        </Link>
        <Link to="member/basic-tracking" className={`nav-item ${location.pathname.includes('/pregnancy-tracking') ? 'active' : ''}`}>
          <FaBabyCarriage /> Theo dõi thai kỳ
          <div className="nav-tooltip">Theo dõi quá trình phát triển của thai nhi</div>
        </Link>
        <Link to="member/calendar" className={`nav-item ${location.pathname.includes('/appointment') ? 'active' : ''}`}>
          <FaCalendarAlt /> Lịch khám
          <div className="nav-tooltip">Đặt và quản lý lịch khám thai</div>
        </Link>
        <Link to="member/doctor-notes" className={`nav-item ${location.pathname.includes('/doctor-notes') ? 'active' : ''}`}>
          <FaNotesMedical /> Ghi chú bác sĩ
          <div className="nav-tooltip">Ghi chú và lời khuyên từ bác sĩ</div>
        </Link>
        <Link to="/blog" className={`nav-item ${location.pathname.includes('/blog') ? 'active' : ''}`}>
          <FaBlog /> Blog
          <div className="nav-tooltip">Đọc các bài viết về thai kỳ</div>
        </Link>
        <Link to="/community" className={`nav-item ${location.pathname.includes('/community') ? 'active' : ''}`}>
          <FaUsers /> Cộng đồng
          <div className="nav-tooltip">Kết nối với cộng đồng mẹ bầu</div>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={`nav-item ${location.pathname.includes('/admin') ? 'active' : ''}`}>
            <FaUserCircle /> Quản trị
            <div className="nav-tooltip">Quản lý hệ thống</div>
          </Link>
        )}
        
        {!isLoggedIn && (
          <div className="auth-mobile-buttons">
            <Link to="/login" className="auth-mobile-button login-button">
              <FaUserCircle /> Đăng nhập
            </Link>
            <Link to="/register" className="auth-mobile-button register-button">
              Đăng ký
            </Link>
          </div>
        )}
        
        {isLoggedIn && (
          <button 
            className="auth-mobile-button logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
