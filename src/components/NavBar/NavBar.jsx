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
  const [profileImage, setProfileImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // UI state
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHorizontalMenu, setShowHorizontalMenu] = useState(false);
  
  // Refs for DOM elements
  const navbarRef = useRef(null);
  const horizontalNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const notificationsRef = useRef(null);
  
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

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    setProfileImage(null);
    setIsDropdownOpen(false);
    setShowHorizontalMenu(false);
    navigate("/");
  }, [navigate]);

  // Toggle functions
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  
  // Toggle horizontal navigation menu
  const toggleHorizontalMenu = () => {
    setShowHorizontalMenu(!showHorizontalMenu);
    // Close other menus
    setShowNotifications(false);
    setIsDropdownOpen(false);
  };

  // Close menus when navigating
  useEffect(() => {
    setShowHorizontalMenu(false);
    setShowNotifications(false);
    setIsDropdownOpen(false);
    
    // Force menu closing with setTimeout
    setTimeout(() => {
      setShowHorizontalMenu(false);
    }, 10);
    
    return () => {
      setShowHorizontalMenu(false);
      setShowNotifications(false);
      setIsDropdownOpen(false);
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
        setProfileImage(userData?.profileImageUrl || null);
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
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
      setScrolled(window.scrollY > 50);
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
      // Handle dropdown menu clicks
      if (isDropdownOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          !event.target.closest('.user-menu-button')) {
        setIsDropdownOpen(false);
      }
      
      // Handle notification clicks
      if (showNotifications && 
          notificationsRef.current && 
          !notificationsRef.current.contains(event.target) &&
          notificationButtonRef.current &&
          !notificationButtonRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      // Handle horizontal menu clicks
      if (showHorizontalMenu && 
          horizontalNavRef.current && 
          !horizontalNavRef.current.contains(event.target) &&
          !event.target.closest('.navbar-toggle-button')) {
        setShowHorizontalMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, showNotifications, showHorizontalMenu]);
  
  // Close with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowHorizontalMenu(false);
        setShowNotifications(false);
        setIsDropdownOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
      >
        <div className="navbar-container" ref={navbarRef}>
          <div className="logo-section">
            <Link to="/" className="navbar-logo">
              <img
                src="/Logo bau-02.png"
                alt="Mẹ Bầu"
                className="navbar-logo-image"
              />
              <span className="navbar-logo-text">Mẹ Bầu</span>
            </Link>
          </div>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {isLoggedIn && (
              <>
                {/* Edit Profile Button */}
                <Link 
                  to="/profile/edit" 
                  className="header-action-button edit-profile-button"
                  title="Chỉnh sửa thông tin cá nhân"
                >
                  <FaUserEdit />
                  <div className="feature-tooltip edit-tooltip">Chỉnh sửa hồ sơ</div>
                </Link>
                
                <div className="action-separator"></div>
              </>
            )}
            
            {/* Notification Bell */}
            {isLoggedIn && (
              <>
                <button
                  className="header-action-button notification-button"
                  onClick={toggleNotifications}
                  ref={notificationButtonRef}
                  aria-label="Thông báo"
              >
                <FaBell />
                  {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
                  <div className="feature-tooltip notification-tooltip">Thông báo và nhắc nhở</div>
              </button>

                <div className="action-separator"></div>
              </>
            )}
            
            {/* Đăng xuất nút */}
            {isLoggedIn && (
              <>
                    <button
                  className="header-action-button logout-button"
                  onClick={handleLogout}
                  aria-label="Đăng xuất"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <FaSignOutAlt />
                  <div className="feature-tooltip logout-tooltip">Đăng xuất</div>
                    </button>
                
                <div className="action-separator"></div>
              </>
            )}
            
            {/* User Profile / Auth Buttons */}
            {isLoggedIn ? (
              <div className="user-profile-container" ref={dropdownRef}>
                <div 
                  className="user-avatar-container" 
                  title={`${userInfo?.fullName || "Người dùng"}`}
                  onClick={toggleDropdown}
                >
                  {profileImage ? (
                    <img 
                      src={profileImage} 
                      alt={userInfo?.fullName || "Người dùng"} 
                      className="user-avatar" 
                    />
                  ) : (
                    <FaUserCircle className="user-icon" />
                  )}
                  <div className="feature-tooltip avatar-tooltip">Xem tùy chọn tài khoản</div>
                  </div>

                <div className="profile-menu-separator"></div>
                
                <div className="user-profile-button" onClick={toggleDropdown} title="Bấm để xem tùy chọn tài khoản">
                  <span className="dropdown-indicator"></span>
                  <div className="profile-tooltip">Tùy chọn tài khoản</div>
                </div>
            </div>
            ) : (
                <div className="auth-buttons">
                  <Link
                    to="/login"
                  className="login-button"
                  >
                    Đăng Nhập
                  <div className="feature-tooltip login-tooltip">Đăng nhập vào tài khoản</div>
                  </Link>
                
                <div className="action-separator"></div>
                
                  <Link
                    to="/register"
                  className="register-button"
                  >
                    Đăng Ký
                  <div className="feature-tooltip register-tooltip">Đăng ký tài khoản mới</div>
                  </Link>
                </div>
            )}
            
            <div className="action-separator"></div>
            
            {/* Hamburger menu button */}
                  <button
              className="navbar-toggle-button"
              onClick={toggleHorizontalMenu}
              aria-label="Toggle Navigation Menu"
            >
              {showHorizontalMenu ? <FaTimes /> : <FaBars />}
              <div className="feature-tooltip menu-tooltip">Mở menu điều hướng</div>
                      </button>
          </div>
        </div>
      </nav>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="notification-dropdown" ref={notificationsRef}>
          <div className="notification-header">
            <h3>Thông báo</h3>
            <button className="close-button" onClick={toggleNotifications}>
                <FaTimes />
              </button>
            </div>
          <div className="notification-list">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <NotificationItem
                  key={index}
                  notification={notification}
                  formatDateTime={formatDateTime}
                />
              ))
            ) : (
              <div className="no-notifications">
                <p>Không có thông báo nào.</p>
              </div>
            )}
                </div>
          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-button"
                onClick={() => {
                  navigate('/calendar');
                  setShowNotifications(false);
                }}
              >
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}

      {/* User Profile Dropdown */}
      {isLoggedIn && isDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-avatar-large">
              {profileImage ? (
                <img src={profileImage} alt={userInfo?.fullName || "Người dùng"} />
              ) : (
                <FaUserCircle className="user-icon-large" />
              )}
            </div>
            <div className="user-details">
              <h3>{userInfo?.fullName || "Người dùng"}</h3>
              <p>{userInfo?.email || ""}</p>
            </div>
          </div>
          <div className="dropdown-menu">
            <Link to="/profile" className="dropdown-item">
              <FaUserCircle />
              Thông tin cá nhân
              <div className="dropdown-tooltip">Xem thông tin cá nhân của bạn</div>
            </Link>
            <Link to="/profile/edit" className="dropdown-item highlight">
              <FaUserEdit />
              Chỉnh sửa hồ sơ
              <div className="dropdown-tooltip">Cập nhật thông tin cá nhân và hồ sơ</div>
            </Link>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt />
              Đăng xuất
              <div className="dropdown-tooltip">Đăng xuất khỏi tài khoản</div>
                </button>
                      </div>
                    </div>
      )}

      {/* Horizontal Navigation */}
      <div className={`horizontal-nav ${showHorizontalMenu ? 'visible' : ''}`} ref={horizontalNavRef}>
        <div className="horizontal-nav-items">
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
        </div>
      </div>
    </>
  );
};

export default NavBar;
