/* eslint-disable react/no-unknown-property */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import {
  FaCalendarAlt,
  FaBlog,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserEdit,
  FaBell,
  FaHome,
  FaBaby,
  FaAppleAlt,
  FaUser,
  FaKey,
} from "react-icons/fa";
import "./NavbarMember.scss";
import reminderService from "../../api/services/reminderService";

const CustomNavLink = ({ to, children, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

// Add prop types for CustomNavLink component
CustomNavLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node,
  onClick: PropTypes.func,
};

const NavBarMember = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showHorizontalMenu, setShowHorizontalMenu] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem("readNotifications");
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  // Refs
  const horizontalNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        const decoded = jwtDecode(token);

        setUserInfo({
          ...decoded,
          fullName: parsedUserData.fullName,
          email: parsedUserData.email,
          userName: parsedUserData.userName,
          role: parsedUserData.role,
        });

        setIsLoggedIn(true);

        if (parsedUserData?.profileImageUrl) {
          setProfileImage(parsedUserData.profileImageUrl);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        setUserInfo(null);
        setProfileImage(null);
      }
    }

    // Xử lý sự kiện cuộn trang
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lấy lịch hẹn từ API
  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory();

      if (!response || !Array.isArray(response)) {
        setReminders([]);
        return;
      }

      setReminders(response);
    } catch (error) {
      setReminders([]);
    }
  };

  // Tải lịch hẹn
  useEffect(() => {
    fetchReminders();

    const interval = setInterval(() => {
      fetchReminders();
    }, 60000); // Cập nhật mỗi phút

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsDropdownOpen(false);
    setShowHorizontalMenu(false);
    document.body.classList.remove("sidebar-open");
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    document.body.classList.toggle("sidebar-open");
  };

  // Toggle horizontal navigation menu
  const toggleHorizontalMenu = () => {
    setShowHorizontalMenu(!showHorizontalMenu);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showHorizontalMenu &&
        horizontalNavRef.current &&
        !horizontalNavRef.current.contains(event.target) &&
        !event.target.closest(".navbar-toggle-button")
      ) {
        setShowHorizontalMenu(false);
      }

      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest(".user-menu-button")
      ) {
        setIsDropdownOpen(false);
      }

      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target) &&
        notificationButtonRef.current &&
        !notificationButtonRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHorizontalMenu, isDropdownOpen, showNotifications]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowHorizontalMenu(false);
        document.body.classList.remove("sidebar-open");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mark notification as read
  const markAsRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    if (!readNotifications.includes(notificationId)) {
      const updatedReadList = [...readNotifications, notificationId];
      setReadNotifications(updatedReadList);
      localStorage.setItem(
        "readNotifications",
        JSON.stringify(updatedReadList)
      );
    }
  };

  // Check if notification is read
  const isNotificationRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    return readNotifications.includes(notificationId);
  };

  // Calculate unread count
  const unreadCount = reminders.filter(
    (reminder) => !isNotificationRead(reminder)
  ).length;

  // Cập nhật display của reminder item để hiển thị rõ hơn
  const renderReminderItem = (reminder, index) => (
    <div
      key={index}
      className={`notification-item reminder ${
        isNotificationRead(reminder) ? "read" : "unread"
      }`}
      onClick={() => {
        markAsRead(reminder);
        navigate("/member/calendar");
        setShowNotifications(false);
      }}
    >
      <div className="notification-content">
        <div className="notification-type">
          {reminder.reminderType || "Lịch hẹn"}
        </div>
        <h4>{reminder.title}</h4>
        {reminder.notification && (
          <p className="notification-medicine">
            <strong>Thuốc:</strong> {reminder.notification}
          </p>
        )}
        <p className="notification-time">
          <strong>Thời gian:</strong> {reminder.time},{" "}
          {new Date(reminder.date).toLocaleDateString("vi-VN")}
        </p>
        {reminder.isEmailSent && (
          <p className="notification-email-status">
            <small>Email đã được gửi</small>
          </p>
        )}
      </div>
    </div>
  );

  // Add this function before the return statement
  const handleNavLinkClick = () => {
    setShowHorizontalMenu(false);
    // Force an update to ensure UI state is consistent
    setTimeout(() => {
      setShowHorizontalMenu(false);
    }, 50);
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="logo-container">
          <Link to="/member" className="navbar-logo">
            <img
              src="/Logo bau-02.png"
              alt="Logo"
              className="navbar-logo-image"
            />
            <h1 className="navbar-logo-text">Mẹ Bầu</h1>
          </Link>
        </div>

        <div className="header-actions">
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
              <div className="feature-tooltip avatar-tooltip">
                Xem tùy chọn tài khoản
              </div>
            </div>
          </div>
          <button
            className="header-action-button notification-button"
            onClick={() => setShowNotifications(!showNotifications)}
            ref={notificationButtonRef}
            aria-label="Thông báo"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
            <div className="feature-tooltip notification-tooltip">
              Thông báo và nhắc nhở
            </div>
          </button>

          <div className="action-separator"></div>

          {isLoggedIn ? (
            <>
              <div className="action-separator"></div>
            </>
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
            aria-label="Toggle Navigation Menu"
          >
            {showHorizontalMenu ? <FaTimes /> : <FaBars />}
            <div className="feature-tooltip menu-tooltip">
              Mở menu điều hướng
            </div>
          </button>
        </div>
      </nav>

      {showNotifications && (
        <div className="notification-dropdown" ref={notificationsRef}>
          <div className="notification-header">
            <h3>Thông báo</h3>
            <button
              className="close-button"
              onClick={() => setShowNotifications(false)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="notification-list">
            {reminders.length > 0 ? (
              reminders.map((reminder, index) =>
                renderReminderItem(reminder, index)
              )
            ) : (
              <div className="no-notifications">
                <p>Không có thông báo nào.</p>
              </div>
            )}
          </div>
          {reminders.length > 0 && (
            <div className="notification-footer">
              <button
                className="view-all-button"
                onClick={() => {
                  navigate("/member/calendar");
                  setShowNotifications(false);
                }}
              >
                Xem tất cả
              </button>
            </div>
          )}
        </div>
      )}

      {isLoggedIn && isDropdownOpen && (
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-avatar-large">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={userInfo?.fullName || "Người dùng"}
                />
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
            <Link
              to={`/member/profile/view/${userInfo?.userId}`}
              className="dropdown-item"
            >
              <FaUserCircle />
              Thông tin cá nhân
              <div className="dropdown-tooltip">
                Xem thông tin cá nhân của bạn
              </div>
            </Link>
            <Link
              to="/member/profile/edit"
              className="dropdown-item highlight"
            >
              <FaUserEdit />
              Chỉnh sửa hồ sơ
              <div className="dropdown-tooltip">
                Cập nhật thông tin cá nhân và hồ sơ
              </div>
            </Link>
            <Link to="/member/change-password" className="dropdown-item">
              <FaKey />
              Đổi mật khẩu
              <div className="dropdown-tooltip">
                Thay đổi mật khẩu đăng nhập
              </div>
            </Link>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt />
              Đăng xuất
              <div className="dropdown-tooltip">Đăng xuất khỏi tài khoản</div>
            </button>
          </div>
        </div>
      )}

      {showHorizontalMenu && (
        <div className="horizontal-nav visible" ref={horizontalNavRef}>
          <div className="horizontal-nav-items">
            {isMobile && (
              <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button
                  className="close-button"
                  onClick={() => setShowHorizontalMenu(false)}
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <Link
              to="/member"
              className={`nav-item ${
                location.pathname === "/member" ? "active" : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaHome /> <span className="nav-text">Trang chủ</span>
              <div className="nav-tooltip">Quay về trang chính</div>
            </Link>
            <Link
              to="/member/basic-tracking"
              className={`nav-item ${
                location.pathname.includes("/member/pregnancy-tracking")
                  ? "active"
                  : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaBaby /> <span className="nav-text">Theo dõi thai kỳ</span>
              <div className="nav-tooltip">
                Theo dõi quá trình phát triển của thai nhi
              </div>
            </Link>
            <Link
              to="/member/calendar"
              className={`nav-item ${
                location.pathname.includes("/member/appointment")
                  ? "active"
                  : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaCalendarAlt /> <span className="nav-text">Lịch khám</span>
              <div className="nav-tooltip">Đặt và quản lý lịch khám thai</div>
            </Link>
            <Link
              to="/member/doctor-notes"
              className={`nav-item ${
                location.pathname.includes("/member/nutrition") ? "active" : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaAppleAlt /> <span className="nav-text">Ghi chú bác sĩ</span>
              <div className="nav-tooltip">
                Thông tin về chế độ dinh dưỡng cho bà bầu
              </div>
            </Link>
            <Link
              to="/member/blog"
              className={`nav-item ${
                location.pathname.includes("/member/blog") ? "active" : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaBlog /> <span className="nav-text">Blog</span>
              <div className="nav-tooltip">
                Thông tin về chế độ dinh dưỡng cho bà bầu
              </div>
            </Link>
            <Link
              to="/member/community"
              className={`nav-item ${
                location.pathname.includes("/member/community")
                  ? "active"
                  : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaUsers /> <span className="nav-text">Cộng đồng</span>
              <div className="nav-tooltip">Kết nối với cộng đồng mẹ bầu</div>
            </Link>
            <Link
              to="/member/profile"
              className={`nav-item ${
                location.pathname.includes("/member/profile")
                  ? "active"
                  : ""
              }`}
              onClick={() => setShowHorizontalMenu(false)}
            >
              <FaUser /> <span className="nav-text">Hồ sơ</span>
              <div className="nav-tooltip">Xem và quản lý hồ sơ cá nhân</div>
            </Link>

            <button
              className="header-action-button logout-button"
              onClick={handleLogout}
              aria-label="Đăng xuất"
              title="Đăng xuất khỏi tài khoản"
            >
              <FaSignOutAlt />
         
            </button>

            {isLoggedIn && isMobile && (
              <button className="nav-item logout-button" onClick={handleLogout}>
                <FaSignOutAlt className="nav-icon" />{" "}
                <span className="nav-text">Đăng xuất</span>
              </button>
            )}

            {!isLoggedIn && isMobile && (
              <div className="auth-mobile-buttons">
                <Link to="/login" className="auth-mobile-button login-button">
                  <FaUserCircle /> Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="auth-mobile-button register-button"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {isMobile && showHorizontalMenu && (
        <div
          className="menu-overlay"
          onClick={() => {
            setShowHorizontalMenu(false);
            document.body.classList.remove("sidebar-open");
          }}
        ></div>
      )}
    </>
  );
};

export default NavBarMember;
