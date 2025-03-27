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
import "./NavbarMember.scss";
import reminderService from "../../api/services/reminderService";
import { playUISound } from "../../utils/soundUtils";
import { useSoundEffects } from "../SoundEffectsProvider";

const CustomNavLink = ({ to, children, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = (e) => {
    // Sound will be handled by global buttonSounds.js
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? "active" : ""}`}
      onClick={handleClick}
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

const NavBarMember = () => {
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
  
  // Sound effect context
  const { enabled: soundEnabled } = useSoundEffects();
  
  // Thêm state cho việc quản lý đã đọc
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Refs for DOM elements
  const sidebarRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  const navbarRef = useRef(null);
  const horizontalNavRef = useRef(null);
  const dropdownRef = useRef(null);
  const notificationButtonRef = useRef(null);
  const notificationsRef = useRef(null);
  const sidebarNotificationButtonRef = useRef(null);
  const mobileSidebarToggleRef = useRef(null);
  const navbarToggleButtonRef = useRef(null);
  const mobileSidebarRef = useRef(null);
  
  // Better responsiveness handling - check screen size more precisely
  const checkScreenSize = () => {
    const width = window.innerWidth;
    setIsMobile(width <= 768);
    
    // Close menu on resize if screen gets larger
    if (width > 768) {
      setIsSidebarOpen(false);
      setShowHorizontalMenu(false);
      document.body.classList.remove('sidebar-open');
    }
  };

  // Close sidebar/menus when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowSidebarNotifications(false);
    setShowHorizontalMenu(false); 
    setIsDropdownOpen(false);
    setShowNotifications(false);
    document.body.classList.remove('sidebar-open');
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [location.pathname]);

  // User authentication check
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

    // Scroll event handler
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Responsive design handler
  useEffect(() => {
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle clicks outside of menus to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle dropdown clicks
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          isDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
      
      // Handle notification clicks
      if (notificationsRef.current && !notificationsRef.current.contains(event.target) && 
          !notificationButtonRef.current?.contains(event.target) && showNotifications) {
        setShowNotifications(false);
      }
      
      // Handle horizontal menu clicks on mobile
      if (horizontalNavRef.current && !horizontalNavRef.current.contains(event.target) && 
          !navbarToggleButtonRef.current?.contains(event.target) && 
          showHorizontalMenu && isMobile) {
        setShowHorizontalMenu(false);
      }
      
      // Handle mobile sidebar clicks
      if (mobileSidebarRef.current && !mobileSidebarRef.current.querySelector('.sidebar-content')?.contains(event.target) &&
          !mobileSidebarToggleRef.current?.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };
    
    // Handle escape key to close menus
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setShowNotifications(false);
        setShowHorizontalMenu(false);
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, showNotifications, showHorizontalMenu, isSidebarOpen, isMobile]);

  // Fetch reminders data
  useEffect(() => {
    if (isLoggedIn) {
      fetchReminders();
    }
  }, [isLoggedIn]);

  // Save read notifications to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory();

      if (response && Array.isArray(response)) {
        setReminders(response);
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setReminders([]);
    }
  };

  // Handle logout
  const handleLogout = () => {
    playUISound('logoutSound');
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("readNotifications");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    setIsDropdownOpen(false);
    navigate("/login");
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    
    // Close other menus
    setShowNotifications(false);
    setShowHorizontalMenu(false);
  };

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    
    // Toggle body class for preventing background scroll
    if (newState) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    // Close other menus
    setShowNotifications(false);
    setIsDropdownOpen(false);
    setShowHorizontalMenu(false);
  };

  // Toggle horizontal menu
  const toggleHorizontalMenu = () => {
    const newState = !showHorizontalMenu;
    setShowHorizontalMenu(newState);
    
    // Close other menus
    setShowNotifications(false);
    setIsDropdownOpen(false);
    
    // On mobile, treat this like a sidebar
    if (isMobile && newState) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Close other menus
    setIsDropdownOpen(false);
    setShowHorizontalMenu(false);
  };

  // Mark notification as read
  const markAsRead = (reminder) => {
    const newReadNotifications = [...readNotifications];
    if (!isNotificationRead(reminder)) {
      newReadNotifications.push(reminder.id);
      setReadNotifications(newReadNotifications);
    }
  };

  // Check if notification is read
  const isNotificationRead = (reminder) => {
    return readNotifications.includes(reminder.id);
  };

  // Calculate unread count
  const unreadCount = reminders.filter(reminder => !isNotificationRead(reminder)).length;

  // Render a reminder item
  const renderReminderItem = (reminder, index) => (
    <div 
      key={reminder.id || index} 
      className={`notification-item ${!isNotificationRead(reminder) ? 'unread' : ''}`}
      onClick={() => markAsRead(reminder)}
    >
      <div className="notification-title">
        <FaCalendarAlt />
        {reminder.title || "Lịch hẹn mới"}
      </div>
      <div className="notification-content">
        {reminder.description || "Bạn có một lịch hẹn mới."}
      </div>
      <div className="notification-actions">
        {!isNotificationRead(reminder) && (
          <button 
            className="mark-read"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(reminder);
            }}
          >
            Đánh dấu đã đọc
          </button>
        )}
        <span className="notification-time">
          {new Date(reminder.reminderTime || reminder.date || Date.now()).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          })}
        </span>
      </div>
    </div>
  );

  // Handle nav link click
  const handleNavLinkClick = () => {
    if (isMobile) {
      setShowHorizontalMenu(false);
      document.body.classList.remove('sidebar-open');
    }
    
    if (soundEnabled) {
      playUISound('buttonClick');
    }
  };

  // Handle click with sound
  const handleClickWithSound = (callback) => {
    return () => {
      if (soundEnabled) {
        playUISound('buttonClick');
      }
      
      if (callback) callback();
    };
  };

  // Toggle dropdown with sound
  const toggleDropdownWithSound = () => {
    handleClickWithSound(toggleDropdown)();
  };

  // Toggle notifications with sound
  const toggleNotificationsWithSound = () => {
    handleClickWithSound(toggleNotifications)();
  };

  // Toggle sidebar with sound
  const toggleSidebarWithSound = () => {
    handleClickWithSound(toggleSidebar)();
  };

  // Navigation with sound
  const navigationWithSound = (path) => {
    handleClickWithSound(() => navigate(path))();
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`} ref={navbarRef}>
        <div className="navbar-container">
          <div className="logo-section">
            <Link to="/member" className="navbar-logo">
              <img src="/public/Logo bau-02.png" alt="Logo Mẹ Bầu" className="navbar-logo-image" />
              <span className="navbar-logo-text">Mẹ Bầu</span>
            </Link>
          </div>

          {/* Header Action Buttons */}
          <div className="header-actions">
            {/* Notification Bell */}
            <button
              className="header-action-button notification-button"
              onClick={toggleNotificationsWithSound}
              ref={notificationButtonRef}
              aria-label="Thông báo"
            >
              <FaBell />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              <div className="feature-tooltip notification-tooltip">Thông báo và nhắc nhở</div>
            </button>
            
            <div className="action-separator"></div>
            
            {/* Menu Toggle Button */}
            <button
              className="navbar-toggle-button"
              onClick={toggleHorizontalMenu}
              ref={navbarToggleButtonRef}
              aria-label="Toggle Navigation Menu"
            >
              {showHorizontalMenu ? <FaTimes /> : <FaBars />}
              <div className="feature-tooltip menu-tooltip">Mở menu điều hướng</div>
            </button>
            
            <div className="action-separator"></div>
            
            {/* Nút đăng xuất */}
            {isLoggedIn && (
              <>
                <button
                  className="header-action-button logout-button"
                  onClick={handleLogout}
                  aria-label="Đăng xuất"
                >
                  <FaSignOutAlt />
                  <div className="feature-tooltip">Đăng xuất khỏi tài khoản</div>
                </button>
                <div className="action-separator"></div>
              </>
            )}
            
            {/* User Profile or Login Button */}
            {isLoggedIn ? (
              <div className="user-profile-container" ref={dropdownRef}>
                <div 
                  className="user-avatar-container" 
                  title={`${userInfo?.fullName || "Người dùng"}`}
                  onClick={toggleDropdownWithSound}
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
              </div>
            ) : (
              <Link to="/login" className="login-button">
                Đăng nhập
                <div className="feature-tooltip login-tooltip">Đăng nhập vào tài khoản</div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="notification-dropdown" ref={notificationsRef}>
          <div className="notification-header">
            <h3>Thông báo</h3>
            <button className="close-button no-sound" onClick={() => setShowNotifications(false)}>
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
                  navigate('/member/calendar');
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
            <Link to={`/member/profile/view/${userInfo?.userId}`} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <FaUserCircle />
              Thông tin cá nhân
            </Link>
            <Link to="/member/profile/edit" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <FaUserEdit />
              Chỉnh sửa hồ sơ
            </Link>
            <Link to="/member/profile/change-password" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
              <FaKey />
              Đổi mật khẩu
            </Link>
            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
          
      {/* Horizontal Navigation Menu */}
      {showHorizontalMenu && (
        <div className={`horizontal-nav visible ${isMobile ? 'mobile' : ''}`} ref={horizontalNavRef}>
          <div className="horizontal-nav-items">
            {isMobile && (
              <div className="mobile-menu-header">
                <h3>Menu</h3>
                <button className="close-button" onClick={() => setShowHorizontalMenu(false)}>
                  <FaTimes />
                </button>
              </div>
            )}
            
            <Link 
              to="/member" 
              className={`nav-item ${location.pathname === '/member' ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 0}}
            >
              <FaHome className="nav-icon" /> <span className="nav-text">Trang chủ</span>
              <div className="nav-tooltip">Quay về trang chính</div>
            </Link>
            
            <Link 
              to="/member/basic-tracking" 
              className={`nav-item ${location.pathname.includes('/member/basic-tracking') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 1}}
            >
              <FaBaby className="nav-icon" /> <span className="nav-text">Theo dõi thai kỳ</span>
              <div className="nav-tooltip">Theo dõi quá trình phát triển của thai nhi</div>
            </Link>
            
            <Link 
              to="/member/calendar" 
              className={`nav-item ${location.pathname.includes('/member/calendar') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 2}}
            >
              <FaCalendarAlt className="nav-icon" /> <span className="nav-text">Lịch khám</span>
              <div className="nav-tooltip">Đặt và quản lý lịch khám thai</div>
            </Link>
            
            <Link 
              to="/member/doctor-notes" 
              className={`nav-item ${location.pathname.includes('/member/doctor-notes') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 3}}
            >
              <FaNotesMedical className="nav-icon" /> <span className="nav-text">Ghi chú bác sĩ</span>
              <div className="nav-tooltip">Thông tin về ghi chú bác sĩ cho bà bầu</div>
            </Link>
            
            <Link 
              to="/member/blog" 
              className={`nav-item ${location.pathname.includes('/member/blog') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 4}}
            >
              <FaBlog className="nav-icon" /> <span className="nav-text">Blog</span>
              <div className="nav-tooltip">Những bài viết hữu ích về thai kỳ</div>
            </Link>
            
            <Link 
              to="/member/community" 
              className={`nav-item ${location.pathname.includes('/member/community') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 5}}
            >
              <FaUsers className="nav-icon" /> <span className="nav-text">Cộng đồng</span>
              <div className="nav-tooltip">Kết nối với cộng đồng mẹ bầu</div>
            </Link>
            
            <Link 
              to="/member/profile" 
              className={`nav-item ${location.pathname.includes('/member/profile') ? 'active' : ''}`} 
              onClick={handleNavLinkClick}
              style={{"--item-index": 6}}
            >
              <FaUser className="nav-icon" /> <span className="nav-text">Hồ sơ</span>
              <div className="nav-tooltip">Xem và quản lý hồ sơ cá nhân</div>
            </Link>
            
            {isLoggedIn && isMobile && (
              <button 
                className="nav-item logout-button"
                onClick={handleLogout}
                style={{"--item-index": 7}}
              >
                <FaSignOutAlt className="nav-icon" /> <span className="nav-text">Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay for mobile menu */}
      {isMobile && showHorizontalMenu && (
        <div 
          className="menu-overlay" 
          onClick={() => {
            setShowHorizontalMenu(false);
            document.body.classList.remove('sidebar-open');
          }}
        ></div>
      )}
    </>
  );
};

export default NavBarMember;