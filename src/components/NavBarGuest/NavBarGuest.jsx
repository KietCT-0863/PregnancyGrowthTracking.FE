"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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
  FaBaby,
  FaAppleAlt,
  FaUser,
  FaKey,
} from "react-icons/fa";
import "./NavBarGuest.scss";
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
  onClick: PropTypes.func
};

const NavBarGuest = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Thông báo lịch hẹn
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarNotifications, setShowSidebarNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showHorizontalMenu, setShowHorizontalMenu] = useState(false);
  const navigate = useNavigate();
  
  // Thêm state cho việc quản lý đã đọc
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Thêm ref để xử lý click-outside
  const sidebarRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  
  // Refs for DOM elements
  const navbarRef = useRef(null);
  const horizontalNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const notificationsRef = useRef(null);
  const sidebarNotificationButtonRef = useRef(null);
  const mobileSidebarToggleRef = useRef(null);
  const navbarToggleButtonRef = useRef(null);
  
  // Close sidebar when navigating between pages
  useEffect(() => {
    // Immediately hide menus when navigation occurs
    setIsSidebarOpen(false);
    setShowSidebarNotifications(false);
    setShowHorizontalMenu(false); 
    document.body.classList.remove('sidebar-open');
    
    // Force menu closing with setTimeout to ensure UI updates
    setTimeout(() => {
      setShowHorizontalMenu(false);
    }, 10);
    
    return () => {
      setIsSidebarOpen(false);
      setShowSidebarNotifications(false);
      setShowHorizontalMenu(false);
      document.body.classList.remove('sidebar-open');
    };
  }, [location.pathname]); // Add pathname as dependency to ensure it runs on route changes

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
        setIsAdmin(parsedUserData.role === "admin");

        if (parsedUserData?.profileImageUrl) {
          setProfileImage(parsedUserData.profileImageUrl);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
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
      
      // Close sidebar if screen size becomes larger than mobile breakpoint
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
        setShowSidebarNotifications(false);
        document.body.classList.remove('sidebar-open');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

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
    setIsAdmin(false);
    setIsDropdownOpen(false);
    setIsSidebarOpen(false);
    setShowSidebarNotifications(false);
    setShowHorizontalMenu(false);
    document.body.classList.remove('sidebar-open');
    navigate("/");
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    // Close notifications dropdown when opening sidebar
    if (!isSidebarOpen) {
      setShowSidebarNotifications(false);
      setShowHorizontalMenu(false); // Close horizontal menu when opening sidebar
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Toggle horizontal navigation menu
  const toggleHorizontalMenu = () => {
    setShowHorizontalMenu(!showHorizontalMenu);
    setShowSidebarNotifications(false); // Close notifications when toggling horizontal menu
    setIsSidebarOpen(false); // Close sidebar when toggling horizontal menu
    if (isSidebarOpen) {
      document.body.classList.remove('sidebar-open');
    }
  };

  // Close sidebar with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowSidebarNotifications(false);
        setShowHorizontalMenu(false); // Also close horizontal menu with ESC
        document.body.classList.remove('sidebar-open');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  // Unified click outside handler for all menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle horizontal menu clicks
      if (showHorizontalMenu && 
          horizontalNavRef.current && 
          !horizontalNavRef.current.contains(event.target) &&
          navbarToggleButtonRef.current &&
          !navbarToggleButtonRef.current.contains(event.target)) {
        setShowHorizontalMenu(false);
      }
      
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
      
      // Handle sidebar notification clicks
      if (showSidebarNotifications && 
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target) && 
          !sidebarNotificationButtonRef.current.contains(event.target)) {
        setShowSidebarNotifications(false);
      }
      
      // Handle sidebar clicks
      if (isSidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !(mobileSidebarToggleRef.current && mobileSidebarToggleRef.current.contains(event.target)) &&
          !event.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHorizontalMenu, isDropdownOpen, showNotifications, showSidebarNotifications, isSidebarOpen]);

  // Hàm đánh dấu thông báo đã đọc
  const markAsRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    
    if (!readNotifications.includes(notificationId)) {
      const updatedReadList = [...readNotifications, notificationId];
      setReadNotifications(updatedReadList);
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadList));
    }
  };

  // Hàm kiểm tra thông báo đã đọc chưa
  const isNotificationRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    return readNotifications.includes(notificationId);
  };

  // Tổng số thông báo
  const totalNotifications = reminders.length;
  // Số thông báo chưa đọc
  const unreadCount = reminders.filter(reminder => !isNotificationRead(reminder)).length;

  // Cập nhật display của reminder item để hiển thị rõ hơn
  const renderReminderItem = (reminder, index) => (
    <div 
      key={index} 
      className={`notification-item reminder ${isNotificationRead(reminder) ? 'read' : 'unread'}`}
      onClick={() => {
        markAsRead(reminder);
        navigate('/member/calendar');
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
          <strong>Thời gian:</strong> {reminder.time}, {new Date(reminder.date).toLocaleDateString('vi-VN')}
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
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        style={{ margin: 0, padding: 0, backgroundColor: 'transparent', background: 'transparent' }}
      >
        <div className="navbar-container" ref={navbarRef} style={{ backgroundColor: 'transparent', background: 'transparent' }}>
          <div className="logo-section" style={{ backgroundColor: 'transparent', background: 'transparent' }}>
            <Link to="/basic-user" className="navbar-logo" style={{ backgroundColor: 'transparent', background: 'transparent' }}>
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
            {/* Edit Profile Button */}
            <Link 
              to="/basic-user/profile/edit" 
              className="header-action-button edit-profile-button"
              title="Chỉnh sửa thông tin cá nhân"
            >
              <FaUserEdit />
              <div className="feature-tooltip edit-tooltip">Chỉnh sửa hồ sơ</div>
            </Link>
            
            <div className="action-separator"></div>
            
            {/* Notification Bell */}
            <button
              className="header-action-button notification-button"
              onClick={() => setShowNotifications(!showNotifications)}
              ref={notificationButtonRef}
              aria-label="Thông báo"
            >
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              <div className="feature-tooltip notification-tooltip">Thông báo và nhắc nhở</div>
            </button>
            
            <div className="action-separator"></div>
            
            {/* Thêm nút đăng xuất */}
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
            
            {/* User Profile */}
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
              <Link to="/login" className="login-button">
                Đăng nhập
                <div className="feature-tooltip login-tooltip">Đăng nhập vào tài khoản</div>
              </Link>
            )}
            
            <div className="action-separator"></div>
            
            {/* Hamburger menu button */}
            <button
              className="navbar-toggle-button"
              onClick={toggleHorizontalMenu}
              ref={navbarToggleButtonRef}
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
            <button className="close-button" onClick={() => setShowNotifications(false)}>
              <FaTimes />
            </button>
          </div>
          <div className="notification-list">
            {reminders.length > 0 ? (
              reminders.map((reminder, index) => renderReminderItem(reminder, index))
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
                  navigate('/basic-user/calendar');
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
            <Link to={`/basic-user/profile/view/${userInfo?.userId}`} className="dropdown-item">
              <FaUserCircle />
              Thông tin cá nhân
              <div className="dropdown-tooltip">Xem thông tin cá nhân của bạn</div>
            </Link>
            <Link to="/basic-user/profile/edit" className="dropdown-item highlight">
              <FaUserEdit />
              Chỉnh sửa hồ sơ
              <div className="dropdown-tooltip">Cập nhật thông tin cá nhân và hồ sơ</div>
            </Link>
            <Link to="/basic-user/change-password" className="dropdown-item">
              <FaKey />
              Đổi mật khẩu
              <div className="dropdown-tooltip">Thay đổi mật khẩu đăng nhập</div>
            </Link>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt />
              Đăng xuất
              <div className="dropdown-tooltip">Đăng xuất khỏi tài khoản</div>
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Navigation with conditional rendering instead of just CSS classes */}
      {showHorizontalMenu && (
        <>
          <div className={`horizontal-nav ${showHorizontalMenu ? 'visible' : ''}`}>
            <div className="horizontal-nav-items">
              <Link to="/basic-user" className={`nav-item ${location.pathname === '/basic-user/home' ? 'active' : ''}`}>
                <FaHome /> Trang chủ
                <div className="nav-tooltip">Quay về trang chính</div>
              </Link>
              <Link to="/member/basic-tracking" className={`nav-item ${location.pathname.includes('/member/pregnancy-tracking') ? 'active' : ''}`}>
                <FaBaby /> Theo dõi thai kỳ
                <div className="nav-tooltip">Theo dõi quá trình phát triển của thai nhi</div>
              </Link>
              <Link to="/member/calendar" className={`nav-item ${location.pathname.includes('/member/appointment') ? 'active' : ''}`}>
                <FaCalendarAlt /> Lịch khám
                <div className="nav-tooltip">Đặt và quản lý lịch khám thai</div>
              </Link>
              <Link to="/member/doctor-notes" className={`nav-item ${location.pathname.includes('/member/nutrition') ? 'active' : ''}`}>
                <FaAppleAlt /> Ghi chú bác sĩ
                <div className="nav-tooltip">Thông tin về chế độ dinh dưỡng cho bà bầu</div>
              </Link>
              <Link to="/basic-user/blog" className={`nav-item ${location.pathname.includes('/basic-user/blog') ? 'active' : ''}`}>
                <FaBlog /> Blog
                <div className="nav-tooltip">Thông tin về chế độ dinh dưỡng cho bà bầu</div>
              </Link>
              <Link to="/basic-user/community" className={`nav-item ${location.pathname.includes('/basic-user/community') ? 'active' : ''}`}>
                <FaUsers /> Cộng đồng
                <div className="nav-tooltip">Kết nối với cộng đồng mẹ bầu</div>
              </Link>
              <Link to="/basic-user/profile" className={`nav-item ${location.pathname.includes('/basic-user/profile') ? 'active' : ''}`}>
                <FaUser /> Hồ sơ
                <div className="nav-tooltip">Xem và quản lý hồ sơ cá nhân</div>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};

  export default NavBarGuest;