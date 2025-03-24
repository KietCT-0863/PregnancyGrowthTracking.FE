"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./Navbar.scss";

// Navigation items defined as a constant
const NAVIGATION_ITEMS = [
  {
    path: "/member/basic-tracking",
    name: "Theo Dõi Thai Kỳ",
    icon: <FaBabyCarriage className="nav-icon" />,
  },
  {
    path: "/member/calendar",
    name: "Lịch Trình Thăm Khám",
    icon: <FaCalendarAlt className="nav-icon" />,
  },
  {
    path: "/member/doctor-notes",
    name: "Ghi Chú Bác Sĩ",
    icon: <FaNotesMedical className="nav-icon" />,
  },
  {
    path: "/blog",
    name: "Blog",
    icon: <FaBlog className="nav-icon" />,
  },
  {
    path: "/community",
    name: "Cộng Đồng",
    icon: <FaUsers className="nav-icon" />,
  },
];

// NavLink component
const NavLink = ({ to, children, icon, onClick }) => {
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

// Notification item component
const NotificationItem = ({ notification, formatDateTime }) => (
  <div className="notification-item">
    <div className="notification-type">
      {notification.reminderType || "Khám thai"}
    </div>
    <div className="notification-content">
      <h4>{notification.title}</h4>
      <p className="notification-time">
        {formatDateTime(notification.date, notification.time)}
      </p>
    </div>
  </div>
);

// NavBar component
const NavBar = () => {
  const navigate = useNavigate();
  
  // Consolidated state
  const [state, setState] = useState({
    isLoggedIn: false,
    userInfo: null,
    isAdmin: false,
    profileImage: null,
    notifications: [],
    isMobile: window.innerWidth <= 768,
  });
  
  // UI state
  const [uiState, setUiState] = useState({
    scrolled: false,
    isDropdownOpen: false,
    isMobileMenuOpen: false,
    showNotifications: false,
    isSidebarOpen: false,
    showSidebarNotifications: false,
    showHorizontalMenu: false,
  });

  // Helper function to update state partially
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  // Helper function to update UI state partially
  const updateUiState = (newState) => {
    setUiState(prevState => ({ ...prevState, ...newState }));
  };

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
    updateState({
      isLoggedIn: false,
      userInfo: null,
      isAdmin: false,
      profileImage: null
    });
    updateUiState({
      isDropdownOpen: false,
      isMobileMenuOpen: false,
    });
    navigate("/");
  }, [navigate]);

  // Toggle functions
  const toggleDropdown = () => updateUiState({ isDropdownOpen: !uiState.isDropdownOpen });
  const toggleMobileMenu = () => updateUiState({ isMobileMenuOpen: !uiState.isMobileMenuOpen });
  
  // Toggle horizontal navigation menu
  const toggleHorizontalMenu = () => {
    updateUiState({ 
      showHorizontalMenu: !uiState.showHorizontalMenu,
      // Close other menus when toggling horizontal menu
      isDropdownOpen: false,
      showNotifications: false,
      isMobileMenuOpen: false
    });
  };

  const toggleSidebar = () => {
    // Keep this for legacy support, but we'll primarily use toggleHorizontalMenu
    updateUiState({ 
      isSidebarOpen: !uiState.isSidebarOpen
    });
  };

  const toggleNotifications = () => updateUiState({ showNotifications: !uiState.showNotifications });
  const toggleSidebarNotifications = (e) => {
    e?.stopPropagation?.();
    updateUiState({ showSidebarNotifications: !uiState.showSidebarNotifications });
  };

  // Handle initial auth and notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData") || "null");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        updateState({
          isLoggedIn: true,
          userInfo: {
            ...decoded,
            fullName: userData?.fullName,
            email: userData?.email,
            userName: userData?.userName,
            role: userData?.role,
          },
          isAdmin: userData?.role === "admin",
          profileImage: userData?.profileImageUrl || null,
        });
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    }

    // Set sample notifications
    updateState({
      notifications: [
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
      ]
    });

    // Event listeners
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        const newUserData = JSON.parse(e.newValue || "null");
        if (newUserData?.profileImageUrl) {
          updateState({ profileImage: newUserData.profileImageUrl });
        }
      }
    };

    const handleScroll = () => {
      updateUiState({ scrolled: window.scrollY > 50 });
    };

    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      updateState({ isMobile: mobile });
      
      if (!mobile && uiState.isSidebarOpen) {
        updateUiState({ isSidebarOpen: false });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        uiState.showSidebarNotifications &&
        !event.target.closest(".sidebar-notification-dropdown") &&
        !event.target.closest(".sidebar-notification-button")
      ) {
        updateUiState({ showSidebarNotifications: false });
      }
      
      // Close horizontal menu when clicking outside
      if (
        uiState.showHorizontalMenu &&
        !event.target.closest(".horizontal-nav") &&
        !event.target.closest(".navbar-toggle-button") // Update the class name
      ) {
        updateUiState({ showHorizontalMenu: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [uiState.showSidebarNotifications, uiState.showHorizontalMenu]);

  // Render navigation items
  const renderNavItems = useCallback((isSidebar = false) => {
    return NAVIGATION_ITEMS.map((item, index) => (
      <div key={index} className={isSidebar ? "" : "nav-item"}>
        {isSidebar ? (
          <Link to={item.path} className="sidebar-menu-item">
            <div className="sidebar-icon">{item.icon}</div>
            <span className="sidebar-text">{item.name}</span>
          </Link>
        ) : (
          <NavLink
            to={item.path}
            icon={item.icon}
            onClick={() => updateUiState({ isMobileMenuOpen: false })}
          >
            {item.name}
          </NavLink>
        )}
      </div>
    ));
  }, []);

  // Destructure state for easier access
  const { isLoggedIn, userInfo, isAdmin, profileImage, notifications, isMobile } = state;
  const { 
    scrolled, 
    isDropdownOpen, 
    isMobileMenuOpen, 
    showNotifications, 
    isSidebarOpen, 
    showSidebarNotifications,
    showHorizontalMenu
  } = uiState;

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""}`}
        style={{ margin: 0, padding: 0 }}
      >
        <div className="navbar-container">
          <div className="logo-section">
            <Link to="/" className="navbar-logo">
              <img
                src="/Logo bau-02.png"
                alt="Mẹ Bầu"
                className="navbar-logo-image"
              />
              <span className="navbar-logo-text">Mẹ Bầu</span>
            </Link>
            {/* Toggle navigation button for all screen sizes */}
            <button
              className={`navbar-toggle-button ${showHorizontalMenu ? "active" : ""}`}
              onClick={toggleHorizontalMenu}
              aria-label="Toggle navigation"
            >
              {showHorizontalMenu ? (
                <FaTimes className="toggle-icon" />
              ) : (
                <FaBars className="toggle-icon" />
              )}
            </button>
          </div>

          <div className={`navbar-content ${isMobileMenuOpen ? "mobile-open" : ""}`}>
            {/* Hide menu section on desktop as we'll use horizontal nav */}
            {isMobile && (
              <div className="menu-section">
                {isAdmin && (
                  <div className="nav-item">
                    <NavLink
                      to="/admin"
                      icon={<FaUserCircle className="nav-icon" />}
                      onClick={() => updateUiState({ isMobileMenuOpen: false })}
                    >
                      Quản trị
                    </NavLink>
                  </div>
                )}
                {renderNavItems()}
              </div>
            )}

            {/* Notifications */}
            <div className="notification-container">
              <button className="notification-button" onClick={toggleNotifications}>
                <FaBell />
                {notifications.length > 0 && (
                  <span className="notification-badge">{notifications.length}</span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <h3>
                    Lịch nhắc sắp tới
                    <button className="close-button" onClick={toggleNotifications}>×</button>
                  </h3>

                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="no-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <p>Không có lịch nhắc nào sắp tới</p>
                      </div>
                    ) : (
                      notifications.map((reminder, index) => (
                        <NotificationItem 
                          key={index} 
                          notification={reminder} 
                          formatDateTime={formatDateTime} 
                        />
                      ))
                    )}
                  </div>

                  <Link
                    to="/calendar"
                    className="view-all-link"
                    onClick={toggleNotifications}
                  >
                    Xem tất cả lịch
                  </Link>
                </div>
              )}
            </div>

            {/* Auth Section */}
            <div className="auth-section">
              {!isLoggedIn ? (
                <div className="auth-buttons">
                  <Link
                    to="/login"
                    className="btn btn-login"
                    onClick={() => updateUiState({ isMobileMenuOpen: false })}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-register"
                    onClick={() => updateUiState({ isMobileMenuOpen: false })}
                  >
                    Đăng Ký
                  </Link>
                </div>
              ) : (
                <div className="user-menu">
                  <button
                    onClick={toggleDropdown}
                    className="user-menu-button"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="user-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.svg";
                          updateState({ profileImage: null });
                        }}
                      />
                    ) : (
                      <FaUserCircle className="user-icon" />
                    )}
                    <span className="user-name">
                      {userInfo?.fullName || "Người dùng"}
                    </span>
                  </button>
                  {isDropdownOpen && (
                    <div className="user-dropdown">
                      <div className="user-profile-header">
                        {profileImage ? (
                          <img
                            src={profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="dropdown-user-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/placeholder.svg";
                              updateState({ profileImage: null });
                            }}
                          />
                        ) : (
                          <FaUserCircle className="dropdown-user-icon" />
                        )}
                        <div className="user-details">
                          <div className="user-name">
                            {userInfo?.fullName || "Người dùng"}
                          </div>
                          <div className="user-email">{userInfo?.email}</div>
                        </div>
                      </div>
                      <div className="user-info">
                        <div className="info-item">
                          Ngày sinh: {userInfo?.birthDate}
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link
                        to="/profile/edit"
                        className="edit-profile-button"
                        onClick={() => updateUiState({ isDropdownOpen: false })}
                      >
                        <FaUserEdit className="edit-icon" />
                        Chỉnh sửa thông tin
                      </Link>
                      <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt className="logout-icon" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="navbar-spacer" style={{ margin: 0, padding: 0 }}></div>

      {/* Horizontal Navigation - show when toggle button is clicked */}
      {showHorizontalMenu && (
        <div className="horizontal-nav">
          <div className="horizontal-nav-container">
            <div className="horizontal-nav-items">
              {isAdmin && (
                <div className="nav-item">
                  <NavLink
                    to="/admin"
                    icon={<FaUserCircle className="nav-icon" />}
                    onClick={() => updateUiState({ showHorizontalMenu: false })}
                  >
                    Quản trị
                  </NavLink>
                </div>
              )}
              {NAVIGATION_ITEMS.map((item, index) => (
                <div key={index} className="nav-item">
                  <NavLink
                    to={item.path}
                    icon={item.icon}
                    onClick={() => updateUiState({ showHorizontalMenu: false })}
                  >
                    {item.name}
                  </NavLink>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic content spacer that adjusts when horizontal menu is shown */}
      <div 
        className="content-spacer" 
        style={{ 
          height: showHorizontalMenu ? (isMobile ? "300px" : "120px") : "25px",
          transition: "height 0.3s ease"
        }}
      ></div>

      {/* Mobile Sidebar - keep for legacy support but hide by default */}
      {isMobile && isSidebarOpen && (
        <>
          <div className={`sidebar-menu ${isSidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <img
                  src="/Logo bau-02.png"
                  alt="Mẹ Bầu"
                  className="sidebar-logo-image"
                />
                <h2 className="sidebar-title">Mẹ Bầu</h2>
              </div>
              <button className="close-sidebar" onClick={toggleSidebar}>
                <FaTimes />
              </button>
            </div>

            {/* User profile in sidebar */}
            {isLoggedIn && (
              <div className="sidebar-user-profile">
                {profileImage ? (
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="sidebar-user-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.svg";
                      updateState({ profileImage: null });
                    }}
                  />
                ) : (
                  <FaUserCircle className="sidebar-user-icon" />
                )}
                <div className="sidebar-user-info">
                  <h3 className="sidebar-user-name">
                    {userInfo?.fullName || "Người dùng"}
                  </h3>
                  <p className="sidebar-user-email">{userInfo?.email}</p>
                </div>
              </div>
            )}

            {/* Sidebar navigation items */}
            <div className="sidebar-items">
              {renderNavItems(true)}

              {/* Notification button in sidebar */}
              <button
                className="sidebar-menu-item sidebar-notification-button"
                onClick={toggleSidebarNotifications}
              >
                <div className="sidebar-icon">
                  <FaBell />
                  {notifications.length > 0 && (
                    <span className="sidebar-notification-badge">
                      {notifications.length}
                    </span>
                  )}
                </div>
                <span className="sidebar-text">Thông báo</span>
              </button>
            </div>

            {/* Sidebar footer */}
            <div className="sidebar-footer">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="sidebar-logout-button">
                  <FaSignOutAlt className="sidebar-icon" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="sidebar-logout-button"
                  onClick={toggleSidebar}
                >
                  <FaUserCircle className="sidebar-icon" />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>

          {/* Overlay */}
          <div
            className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
            onClick={toggleSidebar}
          ></div>

          {/* Sidebar notifications dropdown */}
          {showSidebarNotifications && (
            <div className="sidebar-notification-dropdown">
              <div className="sidebar-notification-header">
                <h3>Lịch nhắc sắp tới</h3>
                <button
                  className="close-button"
                  onClick={toggleSidebarNotifications}
                >
                  ×
                </button>
              </div>

              <div className="sidebar-notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <i className="fas fa-bell-slash"></i>
                    <p>Không có lịch nhắc nào sắp tới</p>
                  </div>
                ) : (
                  notifications.map((reminder, index) => (
                    <div key={index} className="sidebar-notification-item">
                      <div className="notification-type">
                        {reminder.reminderType || "Khám thai"}
                      </div>
                      <div className="notification-content">
                        <h4>{reminder.title}</h4>
                        <p className="notification-time">
                          {formatDateTime(reminder.date, reminder.time)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link
                to="/calendar"
                className="view-all-link"
                onClick={toggleSidebarNotifications}
              >
                Xem tất cả lịch
              </Link>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default NavBar;
