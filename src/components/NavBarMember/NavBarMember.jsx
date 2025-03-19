"use client";

import { useState, useEffect } from "react";
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

const NavBarMember = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  
  // Thông báo lịch hẹn
  const [reminders, setReminders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarNotifications, setShowSidebarNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const navigate = useNavigate();
  
  // Thêm state cho việc quản lý đã đọc
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (token) {
      try {
        const decoded = jwtDecode(token);
        
        setUserInfo({
          ...decoded,
          fullName: userData.fullName,
          email: userData.email,
          userName: userData.userName,
          role: userData.role,
        });

        setIsLoggedIn(true);
        setIsAdmin(userData.role === "admin");

        if (userData?.profileImageUrl) {
          setProfileImage(userData.profileImageUrl);
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

    // Lắng nghe thay đổi localStorage
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        const newUserData = JSON.parse(e.newValue);
        if (newUserData?.profileImageUrl) {
          setProfileImage(newUserData.profileImageUrl);
        }
      }
    };

    // Xử lý sự kiện cuộn trang
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lấy lịch hẹn từ API
  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory();

      if (!response || !Array.isArray(response)) {
        setReminders([]);
        return;
      }

      // Chỉ cần hiển thị dữ liệu mà không cần lọc
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

  const formatReminderDateTime = (date, time) => {
    try {
      const dateStr = date.includes("T") ? date.split("T")[0] : date;
      const dateObj = new Date(`${dateStr}T${time}`);
      
      const formattedTime = time;
      const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${formattedTime}, ${formattedDate}`;
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Xử lý click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (showSidebarNotifications && 
          !event.target.closest('.sidebar-notification-dropdown') && 
          !event.target.closest('.sidebar-notification-button')) {
        setShowSidebarNotifications(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebarNotifications]);

  // Hàm đánh dấu thông báo đã đọc
  const markAsRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    
    const updatedReadList = [...readNotifications, notificationId];
    setReadNotifications(updatedReadList);
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadList));
  };

  // Hàm kiểm tra thông báo đã đọc chưa
  const isNotificationRead = (reminder) => {
    const notificationId = `reminder_${reminder.remindId || reminder.id}`;
    return readNotifications.includes(notificationId);
  };

  // Tổng số thông báo
  const totalNotifications = reminders.length;

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

  return (
    <>
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
            {isMobile && (
              <button
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
              >
                {isSidebarOpen ? (
                  <FaTimes className="toggle-icon" />
                ) : (
                  <FaBars className="toggle-icon" />
                )}
              </button>
            )}
          </div>

          <div
            className={`navbar-content ${
              isMobileMenuOpen ? "mobile-open" : ""
            }`}
          >
            <div className="menu-section">
              {isAdmin && (
                <div className="nav-item">
                  <NavLink
                    to="/admin"
                    icon={<FaUserCircle className="nav-icon" />}
                    onClick={closeMobileMenu}
                  >
                    Quản trị
                  </NavLink>
                </div>
              )}
              <div className="nav-item">
                <NavLink
                  to="/member/basic-tracking"
                  icon={<FaBabyCarriage className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Theo Dõi Thai Kỳ
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink
                  to="/member/calendar"
                  icon={<FaCalendarAlt className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Lịch Trình Thăm Khám
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink
                  to="/member/doctor-notes"
                  icon={<FaNotesMedical className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Ghi Chú Bác Sĩ
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink
                  to="/member/blog"
                  icon={<FaBlog className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Blog
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink
                  to="/member/community"
                  icon={<FaUsers className="nav-icon" />}
                  onClick={closeMobileMenu}
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
                    onClick={closeMobileMenu}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-register"
                    onClick={closeMobileMenu}
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
        </div>
      </nav>
      <div className="navbar-spacer" style={{ margin: 0, padding: 0 }}></div>

      {isMobile && (
        <>
          <div className={`sidebar-menu ${isSidebarOpen ? 'open' : ''}`}>
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
              <Link to="/member/basic-tracking" className="sidebar-menu-item">
                <div className="sidebar-icon"><FaBabyCarriage /></div>
                <span className="sidebar-text">Theo Dõi Thai Kỳ</span>
              </Link>
              <Link to="/member/calendar" className="sidebar-menu-item">
                <div className="sidebar-icon"><FaCalendarAlt /></div>
                <span className="sidebar-text">Lịch Trình Thăm Khám</span>
              </Link>
              <Link to="/member/doctor-notes" className="sidebar-menu-item">
                <div className="sidebar-icon"><FaNotesMedical /></div>
                <span className="sidebar-text">Ghi Chú Bác Sĩ</span>
              </Link>
              <Link to="/member/blog" className="sidebar-menu-item">
                <div className="sidebar-icon"><FaBlog /></div>
                <span className="sidebar-text">Blog</span>
              </Link>
              <Link to="/member/community" className="sidebar-menu-item">
                <div className="sidebar-icon"><FaUsers /></div>
                <span className="sidebar-text">Cộng Đồng</span>
              </Link>
              
              <button 
                className="sidebar-menu-item sidebar-notification-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSidebarNotifications(!showSidebarNotifications);
                }}
              >
                <div className="sidebar-icon">
                  <FaBell />
                  {totalNotifications > 0 && (
                    <span className="sidebar-notification-badge">{totalNotifications}</span>
                  )}
                </div>
                <span className="sidebar-text">Lịch hẹn</span>
              </button>
            </div>
            
            <div className="sidebar-footer">
              <button onClick={handleLogout} className="sidebar-logout-button">
                <FaSignOutAlt className="sidebar-icon" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
          
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
            onClick={toggleSidebar}
          ></div>

          {showSidebarNotifications && (
            <div className="sidebar-notification-dropdown">
              <div className="sidebar-notification-header">
                <h3>Lịch hẹn của bạn</h3>
                <button className="close-button" onClick={() => setShowSidebarNotifications(false)}>
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
                      className="sidebar-notification-item reminder"
                      onClick={() => {
                        markAsRead(reminder);
                        navigate('/member/calendar');
                        setShowSidebarNotifications(false);
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
                    navigate('/member/calendar');
                  }}
                >
                  Xem tất cả lịch hẹn
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default NavBarMember;