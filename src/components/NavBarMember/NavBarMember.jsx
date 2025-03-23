"use client";

import { useState, useEffect, useRef } from "react";
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
} from "react-icons/fa";
import "./NavbarMember.scss";
import reminderService from "../../api/services/reminderService";

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

// Add prop types for NavLink component
NavLink.propTypes = {
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
  const navigate = useNavigate();
  
  // Thêm state cho việc quản lý đã đọc
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Thêm ref để xử lý click-outside
  const sidebarRef = useRef(null);
  const notificationDropdownRef = useRef(null);
  
  // Thêm state để kiểm soát việc hiển thị navbar
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  
  // Thêm ref cho timeout để dễ dàng clear (đặt ở đây thay vì trong useEffect)
  const timeoutRef = useRef(null);

  // Close sidebar when navigating between pages
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowSidebarNotifications(false);
    document.body.classList.remove('sidebar-open');
    
    return () => {
      setIsSidebarOpen(false);
      setShowSidebarNotifications(false);
      document.body.classList.remove('sidebar-open');
    };
  }, [location]);

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
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar with ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
        setShowSidebarNotifications(false);
        document.body.classList.remove('sidebar-open');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('sidebar-open');
    };
  }, []);

  // Xử lý click bên ngoài của sidebar
  useEffect(() => {
    function handleClickOutside(event) {
      // Xử lý click outside cho notifications
      if (showSidebarNotifications && 
          notificationDropdownRef.current && 
          !notificationDropdownRef.current.contains(event.target) && 
          !event.target.closest('.sidebar-notification-button')) {
        setShowSidebarNotifications(false);
      }
      
      // Xử lý click outside cho sidebar
      if (isSidebarOpen && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !event.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
        document.body.classList.remove('sidebar-open');
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebarNotifications, isSidebarOpen]);

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

  // Sửa lại useEffect cho tương tác hiển thị navbar
  useEffect(() => {
    // Hàm để hiển thị navbar khi có tương tác
    const handleInteraction = () => {
      setIsNavbarVisible(true);
      
      // Tự động ẩn navbar sau 3 giây không tương tác
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsNavbarVisible(false);
      }, 3000);
    };

    // Thêm các event listener để bắt tương tác
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('scroll', handleInteraction);

    // Đảm bảo navbar hiển thị ban đầu
    setIsNavbarVisible(true);

    // Cleanup khi component unmount
    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div className={`navbar-container ${isNavbarVisible ? 'visible' : 'hidden'}`}>
        <nav
          className={`navbar ${scrolled ? "scrolled" : ""}`}
          style={{ margin: 0, padding: 0 }}
        >
          <div className="navbar-container">
            <div className="logo-section">
              <Link to="/member" className="navbar-logo">
                <img
                  src="/Logo bau-02.png"
                  alt="Mẹ Bầu"
                  className="navbar-logo-image"
                />
                <span className="navbar-logo-text">Mẹ Bầu</span>
              </Link>
              {/* Chỉ hiển thị nút toggle trên mobile */}
              {isMobile && (
                <button
                  className="sidebar-toggle"
                  onClick={toggleSidebar}
                  aria-label="Mở menu điều hướng"
                >
                  {isSidebarOpen ? (
                    <FaTimes className="toggle-icon" />
                  ) : (
                    <FaBars className="toggle-icon" />
                  )}
                </button>
              )}
            </div>

            {/* Menu chính chỉ hiển thị trên desktop */}
            {!isMobile && (
              <div className="navbar-content">
                <div className="menu-section">
                  {isAdmin && (
                    <div className="nav-item">
                      <NavLink
                        to="/admin"
                        icon={<FaUserCircle className="nav-icon" />}
                      >
                        Quản trị
                      </NavLink>
                    </div>
                  )}
                  <div className="nav-item">
                    <NavLink
                      to="/member/basic-tracking"
                      icon={<FaBabyCarriage className="nav-icon" />}
                    >
                      Theo Dõi Thai Kỳ
                    </NavLink>
                  </div>
                  <div className="nav-item">
                    <NavLink
                      to="/member/calendar"
                      icon={<FaCalendarAlt className="nav-icon" />}
                    >
                      Lịch Trình Thăm Khám
                    </NavLink>
                  </div>
                  <div className="nav-item">
                    <NavLink
                      to="/member/doctor-notes"
                      icon={<FaNotesMedical className="nav-icon" />}
                    >
                      Ghi Chú Bác Sĩ
                    </NavLink>
                  </div>
                  <div className="nav-item">
                    <NavLink
                      to="/member/blog"
                      icon={<FaBlog className="nav-icon" />}
                    >
                      Blog
                    </NavLink>
                  </div>
                  <div className="nav-item">
                    <NavLink
                      to="/member/community"
                      icon={<FaUsers className="nav-icon" />}
                    >
                      Cộng Đồng
                    </NavLink>
                  </div>
                </div>

                <div className="notification-container">
                  <button
                    className="notification-button"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <FaBell />
                    {totalNotifications > 0 && (
                      <span className="notification-badge">
                        {totalNotifications}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h3>Lịch hẹn của bạn</h3>
                        <button
                          className="close-button"
                          onClick={() => setShowNotifications(false)}
                        >
                          ×
                        </button>
                      </div>

                      <div className="notification-list">
                        {reminders.length === 0 ? (
                          <div className="no-notifications">
                            <i className="fas fa-bell-slash"></i>
                            <p>Không có lịch hẹn nào</p>
                          </div>
                        ) : (
                          reminders.map((reminder, index) => renderReminderItem(reminder, index))
                        )}
                      </div>
                      
                      <div className="notification-footer">
                        <button
                          className="view-all-button"
                          onClick={() => {
                            navigate('/member/calendar');
                            setShowNotifications(false);
                          }}
                        >
                          Xem tất cả lịch hẹn
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="auth-section">
                  {!isLoggedIn ? (
                    <div className="auth-buttons">
                      <Link
                        to="/login"
                        className="btn btn-login"
                      >
                        Đăng Nhập
                      </Link>
                      <Link
                        to="/register"
                        className="btn btn-register"
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
                              setProfileImage(null);
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
                                  setProfileImage(null);
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
                            to="/member/profile/edit"
                            className="edit-profile-button"
                            onClick={() => setIsDropdownOpen(false)}
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
            )}
          </div>
        </nav>
        <div className="navbar-spacer" style={{ margin: 0, padding: 0 }}></div>

        {/* Mobile Sidebar - Hiển thị khi bấm toggle */}
        <>
          {/* Overlay background when sidebar is open */}
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
          
          {/* Sidebar menu container */}
          <div 
            className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`} 
            ref={sidebarRef}
            role="navigation"
            aria-label="Menu điều hướng di động"
          >
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <img
                  src="/Logo bau-02.png"
                  alt="Mẹ Bầu"
                  className="sidebar-logo-image"
                />
                <h2 className="sidebar-title">Mẹ Bầu</h2>
              </div>
              <button 
                className="close-sidebar" 
                onClick={toggleSidebar}
                aria-label="Đóng menu"
              >
                <FaTimes />
              </button>
            </div>
            
            {isLoggedIn && (
              <div className="sidebar-user-profile">
                {profileImage ? (
                  <img
                    src={profileImage || "/placeholder.svg"}
                    alt="Ảnh hồ sơ"
                    className="sidebar-user-avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.svg";
                      setProfileImage(null);
                    }}
                  />
                ) : (
                  <FaUserCircle className="sidebar-user-icon" />
                )}
                <div className="sidebar-user-info">
                  <h3 className="sidebar-user-name">{userInfo?.fullName || "Người dùng"}</h3>
                  <p className="sidebar-user-email">{userInfo?.email}</p>
                </div>
              </div>
            )}
            
            <div className="sidebar-items">
              <Link 
                to="/member/basic-tracking" 
                className="sidebar-menu-item"
                onClick={closeSidebar}
              >
                <div className="sidebar-icon"><FaBabyCarriage /></div>
                <span className="sidebar-text">Theo Dõi Thai Kỳ</span>
              </Link>
              <Link 
                to="/member/calendar" 
                className="sidebar-menu-item"
                onClick={closeSidebar}
              >
                <div className="sidebar-icon"><FaCalendarAlt /></div>
                <span className="sidebar-text">Lịch Trình Thăm Khám</span>
              </Link>
              <Link 
                to="/member/doctor-notes" 
                className="sidebar-menu-item"
                onClick={closeSidebar}
              >
                <div className="sidebar-icon"><FaNotesMedical /></div>
                <span className="sidebar-text">Ghi Chú Bác Sĩ</span>
              </Link>
              <Link 
                to="/member/blog" 
                className="sidebar-menu-item"
                onClick={closeSidebar}
              >
                <div className="sidebar-icon"><FaBlog /></div>
                <span className="sidebar-text">Blog</span>
              </Link>
              <Link 
                to="/member/community" 
                className="sidebar-menu-item"
                onClick={closeSidebar}
              >
                <div className="sidebar-icon"><FaUsers /></div>
                <span className="sidebar-text">Cộng Đồng</span>
              </Link>
              
              <button 
                className="sidebar-menu-item sidebar-notification-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSidebarNotifications(!showSidebarNotifications);
                }}
                aria-label="Xem thông báo lịch hẹn"
              >
                <div className="sidebar-icon">
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="sidebar-notification-badge">{unreadCount}</span>
                  )}
                </div>
                <span className="sidebar-text">Lịch hẹn</span>
                {totalNotifications > 0 && (
                  <span className="notification-count">{totalNotifications}</span>
                )}
              </button>
            </div>
            
            <div className="sidebar-footer">
              <button 
                onClick={() => {
                  handleLogout();
                }} 
                className="sidebar-logout-button"
                aria-label="Đăng xuất"
              >
                <FaSignOutAlt className="sidebar-icon" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* Notification dropdown */}
          {showSidebarNotifications && (
            <div 
              className="sidebar-notification-dropdown" 
              ref={notificationDropdownRef}
              role="dialog"
              aria-label="Thông báo lịch hẹn"
            >
              <div className="sidebar-notification-header">
                <h3>Lịch hẹn của bạn</h3>
                <button 
                  className="close-button" 
                  onClick={() => setShowSidebarNotifications(false)}
                  aria-label="Đóng thông báo"
                >
                  ×
                </button>
              </div>
              
              <div className="sidebar-notification-list">
                {reminders.length === 0 ? (
                  <div className="no-notifications">
                    <i className="fas fa-bell-slash"></i>
                    <p>Không có lịch hẹn nào</p>
                  </div>
                ) : (
                  reminders.map((reminder, index) => (
                    <div 
                      key={index} 
                      className={`sidebar-notification-item reminder ${isNotificationRead(reminder) ? 'read' : 'unread'}`}
                      onClick={() => {
                        markAsRead(reminder);
                        navigate('/member/calendar');
                        setShowSidebarNotifications(false);
                        setIsSidebarOpen(false);
                      }}
                    >
                      <div className="notification-type">
                        {reminder.reminderType || 'Lịch hẹn'}
                      </div>
                      <div className="notification-content">
                        <h4>{reminder.title}</h4>
                        {reminder.notification && (
                          <p className="notification-medicine">
                            {reminder.notification}
                          </p>
                        )}
                        <p className="notification-time">
                          {reminder.time}, {new Date(reminder.date).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="notification-id">
                          <small>ID: {reminder.remindId}</small>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="sidebar-notification-footer">
                <button 
                  className="view-all-button"
                  onClick={() => {
                    setShowSidebarNotifications(false);
                    setIsSidebarOpen(false);
                    navigate('/member/calendar');
                  }}
                >
                  Xem tất cả lịch hẹn
                </button>
              </div>
            </div>
          )}
        </>

        {/* Thêm một nút nhỏ ở góc trên cùng bên phải để luôn hiển thị navbar */}
        <div 
          className="navbar-toggle-button"
          onClick={() => setIsNavbarVisible(prev => !prev)}
        >
          <span className="toggle-icon">≡</span>
        </div>
      </div>
    </>
  );
};

export default NavBarMember;