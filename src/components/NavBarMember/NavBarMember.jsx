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
import growthStatsService from "../../api/services/growthStatsService";

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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSidebarNotifications, setShowSidebarNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [alertHistory, setAlertHistory] = useState([]);
  const [combinedNotifications, setCombinedNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("userData"));

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.group("NavBarMember - User Information");
        console.log("UserData from localStorage:", userData);

        // Lấy trực tiếp từ userData vì đã được lưu từ authService
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
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
        setProfileImage(null);
      }
    }

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        const newUserData = JSON.parse(e.newValue);
        if (newUserData?.profileImageUrl) {
          setProfileImage(newUserData.profileImageUrl);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

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

    // Khởi tạo giá trị ban đầu
    handleResize();

    // Thêm event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory();

      // Ensure response is an array with data
      if (!response || !Array.isArray(response)) {
        setNotifications([]);
        return;
      }

      const now = new Date();
      const upcomingReminders = response
        .filter((reminder) => {
          if (!reminder?.date || !reminder?.time) return false;

          // Process date string to ensure correct format
          const dateStr = reminder.date.includes("T")
            ? reminder.date.split("T")[0]
            : reminder.date;

          const reminderDate = new Date(`${dateStr}T${reminder.time}`);
          return reminderDate > now;
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date.split("T")[0]}T${a.time}`);
          const dateB = new Date(`${b.date.split("T")[0]}T${b.time}`);
          return dateA - dateB;
        });

      console.log("Fetched reminders:", upcomingReminders);
      setNotifications(upcomingReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      setNotifications([]);
    }
  };

  const fetchAlertHistory = async () => {
    try {
      console.group("Alert History Fetch");
      console.log("Fetching alert history...");
      
      // Lấy dữ liệu foetus từ nguồn tin cậy hơn
      let foetusListData = [];
      try {
        // Lấy danh sách thai nhi từ API hoặc localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        
        // Giả sử bạn có API endpoint để lấy danh sách thai nhi
        const foetusListResponse = await fetch('/api/foetus/list');
        if (foetusListResponse.ok) {
          foetusListData = await foetusListResponse.json();
        } else {
          // Fallback: Nếu không thể gọi API, thử lấy từ localStorage
          if (userData.foetusId) {
            foetusListData = [{ foetusId: userData.foetusId, name: "Thai nhi" }];
          }
        }
      } catch (error) {
        console.error("Error fetching foetus list:", error);
        // Fallback to localStorage
        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (userData.foetusId) {
          foetusListData = [{ foetusId: userData.foetusId, name: "Thai nhi" }];
        }
      }
      
      // Nếu không có thai nhi nào, trả về mảng rỗng
      if (!foetusListData || foetusListData.length === 0) {
        console.log("Không có thai nhi nào");
        setAlertHistory([]);
        return;
      }
      
      // Lấy cảnh báo cho từng thai nhi sử dụng API getAlertHistory
      const allAlerts = [];
      
      for (const foetus of foetusListData) {
        if (!foetus.foetusId) {
          console.log("Thai nhi không có foetusId, bỏ qua");
          continue;
        }
        
        try {
          console.log("Fetching alerts for foetus:", foetus.foetusId);
          
          // SỬ DỤNG API getAlertHistory trực tiếp
          const alertHistoryData = await growthStatsService.getAlertHistory(foetus.foetusId);
          console.log("Alert history data:", alertHistoryData);
          
          if (Array.isArray(alertHistoryData) && alertHistoryData.length > 0) {
            // Chuyển đổi dữ liệu từ format API sang format hiển thị
            const processedAlerts = alertHistoryData.flatMap(item => {
              // Xử lý từng nhóm cảnh báo
              return item.alerts.map(alert => ({
                type: 'warning',
                measure: alert.measure,
                value: alert.value,
                range: `${alert.minRange}-${alert.maxRange}`,
                date: new Date(alert.date),
                age: alert.age,
                message: `${alert.measure === 'EFW' ? 'Cân nặng' : alert.measure} ${alert.value} ${alert.measure === 'EFW' ? 'g' : 'mm'} nằm ngoài khoảng an toàn (${alert.minRange}-${alert.maxRange} ${alert.measure === 'EFW' ? 'g' : 'mm'})`,
                foetusId: foetus.foetusId,
                foetusName: foetus.name,
                isAlert: true
              }));
            });
            
            allAlerts.push(...processedAlerts);
          }
        } catch (error) {
          console.error(`Error fetching alert history for foetus ${foetus.foetusId}:`, error);
          // Tiếp tục với thai nhi tiếp theo nếu có lỗi
        }
      }
      
      // Sắp xếp theo thời gian mới nhất
      allAlerts.sort((a, b) => b.date - a.date);
      
      console.log("Final processed alerts:", allAlerts);
      setAlertHistory(allAlerts);
      console.groupEnd();
    } catch (error) {
      console.group("Alert History Error");
      console.error('Error fetching alert history:', error);
      console.groupEnd();
      setAlertHistory([]); // Đặt mảng rỗng trong trường hợp lỗi
    }
  };

  useEffect(() => {
    // Tạo các đối tượng cho lịch nhắc
    const reminderNotifications = notifications.map(n => {
      // Đảm bảo hệ thống lấy đầy đủ dữ liệu từ n
      console.log("Processing reminder:", n);
      
      return {
        ...n, // Giữ lại tất cả dữ liệu gốc
        isReminder: true,
        isAlert: false,
        date: new Date(`${n.date.split('T')[0]}T${n.time}`),
        // Đảm bảo các trường thông tin quan trọng
        remindId: n.remindId || n.id,
        notification: n.notification || '', // Đảm bảo lấy đúng thông tin thuốc
        reminderType: n.reminderType || 'Lịch hẹn',
        title: n.title || 'Lịch hẹn'
      };
    });
    
    // Đảm bảo alertHistory luôn là mảng
    const alertArray = Array.isArray(alertHistory) ? alertHistory : [];
    
    // Kết hợp và sắp xếp theo thời gian mới nhất
    const combined = [
      ...reminderNotifications,
      ...alertArray
    ].sort((a, b) => b.date - a.date);
    
    setCombinedNotifications(combined);
    
    // Log đầy đủ để debug
    console.log("Reminder notifications:", reminderNotifications);
    console.log("Combined notifications:", combined);
  }, [notifications, alertHistory]);

  // Thêm useEffect debug
  useEffect(() => {
    // Debug thông tin
    console.group("Notifications Debug");
    console.log("Raw notifications:", notifications);
    console.log("Combined notifications:", combinedNotifications);
    if (combinedNotifications.length > 0) {
      console.log("First notification sample:", combinedNotifications[0]);
    }
    console.groupEnd();
  }, [combinedNotifications]);

  useEffect(() => {
    fetchReminders();
    fetchAlertHistory();
    const interval = setInterval(() => {
      fetchReminders();
      fetchAlertHistory();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatDateTime = (date, time) => {
    try {
      const dateStr = date.includes("T") ? date.split("T")[0] : date;
      const dateObj = new Date(`${dateStr}T${time}`);
      
      // Định dạng ngày giờ theo tiếng Việt
      const formattedTime = time;
      const formattedDate = dateObj.toLocaleDateString("vi-VN", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `${formattedTime}, ${formattedDate}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
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

  // Thêm useEffect để handle click outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Đóng dropdown thông báo trong sidebar khi click bên ngoài
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

  const totalNotifications = combinedNotifications.length;

  // Trong component NavBarMember, thêm constant để tính tổng số cảnh báo
  const totalAlerts = alertHistory.length;
  const totalReminders = notifications.length;

  // Thêm state cho việc quản lý đã đọc
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Hàm đánh dấu thông báo đã đọc
  const markAsRead = (notificationId) => {
    const updatedReadList = [...readNotifications, notificationId];
    setReadNotifications(updatedReadList);
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadList));
  };

  // Hàm kiểm tra thông báo đã đọc chưa
  const isNotificationRead = (notification) => {
    // Tạo ID duy nhất cho thông báo
    const notificationId = notification.isAlert 
      ? `alert_${notification.measure}_${notification.date.getTime()}_${notification.age}` 
      : `reminder_${notification.remindId || notification.title}_${notification.date.getTime()}`;
    
    return readNotifications.includes(notificationId);
  };

  // Hàm tính số thông báo chưa đọc
  const getUnreadCount = () => {
    return combinedNotifications.filter(n => !isNotificationRead(n)).length;
  };

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
            {/* Chỉ hiển thị nút toggle sidebar trên mobile */}
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
                {(totalAlerts + totalReminders) > 0 && (
                  <div className="notification-badge-container">
                    <span className="notification-badge">
                      {totalAlerts + totalReminders}
                    </span>
                    {totalAlerts > 0 && (
                      <span className="alert-badge">
                        {totalAlerts}
                      </span>
                    )}
                  </div>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Thông báo</h3>
                    <button
                      className="close-button"
                      onClick={() => setShowNotifications(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="notification-tabs">
                    <button 
                      className={`tab-button ${activeTab === 'all' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('all')}
                    >
                      Tất cả
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'reminders' ? 'active' : ''}`} 
                      onClick={() => setActiveTab('reminders')}
                    >
                      Lịch hẹn
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`} 
                      onClick={() => {
                        console.group("Alert Tab Click");
                        console.log("Current alert history:", alertHistory);
                        console.log("Switching to alerts tab");
                        setActiveTab('alerts');
                        // Optionally refresh alerts when tab is clicked
                        fetchAlertHistory();
                        console.groupEnd();
                      }}
                    >
                      Cảnh báo
                    </button>
                  </div>

                  <div className="notification-list">
                    {combinedNotifications.length === 0 ? (
                      <div className="no-notifications">
                        <i className="fas fa-bell-slash"></i>
                        <p>Không có thông báo nào</p>
                      </div>
                    ) : (
                      combinedNotifications
                        .filter(notification => {
                          if (activeTab === 'reminders') return notification.isReminder === true;
                          if (activeTab === 'alerts') {
                            console.log("Filtering notification:", notification);
                            return notification.isAlert === true;
                          }
                          return true;
                        })
                        .map((notification, index) => (
                          <div 
                            key={index} 
                            className={`notification-item ${notification.isAlert ? 'alert' : 'reminder'} ${isNotificationRead(notification) ? 'read' : 'unread'}`}
                            onClick={() => {
                              // Tạo ID duy nhất cho thông báo
                              const notificationId = notification.isAlert 
                                ? `alert_${notification.measure}_${notification.date.getTime()}_${notification.age}` 
                                : `reminder_${notification.remindId || notification.title}_${notification.date.getTime()}`;
                              
                              markAsRead(notificationId);
                              
                              // Logic xử lý khi click vào thông báo
                              if (notification.isAlert) {
                                console.log("Alert notification clicked:", notification);
                                navigate('/member/basic-tracking');
                              } else {
                                navigate('/member/calendar');
                              }
                            }}
                          >
                            {notification.isReminder ? (
                              <div className="notification-content">
                                <div className="notification-type">
                                  {notification.reminderType || "Lịch hẹn"}
                                </div>
                                <h4>{notification.title}</h4>
                                {notification.notification && (
                                  <p className="notification-medicine">
                                    <strong>Thuốc:</strong> {notification.notification}
                                  </p>
                                )}
                                <p className="notification-time">
                                  <strong>Thời gian:</strong> {notification.time}, {new Date(notification.date).toLocaleDateString('vi-VN')}
                                </p>
                              </div>
                            ) : (
                              <div className="notification-content">
                                <div className="notification-type warning">
                                  {notification.foetusName ? `${notification.foetusName} - ` : ''}
                                  Cảnh báo {notification.measure}
                                </div>
                                <p className="notification-message">
                                  {notification.message}
                                </p>
                                <p className="notification-details">
                                  Tuần thai: {notification.age}
                                </p>
                                <p className="notification-time">
                                  {notification.date.toLocaleString('vi-VN')}
                                </p>
                                <button 
                                  className="view-chart-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/member/basic-tracking');
                                  }}
                                >
                                  Xem biểu đồ
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                    )}
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

      {/* Chỉ render sidebar và overlay khi ở chế độ mobile */}
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
            
            {/* Thêm thông tin người dùng vào sidebar */}
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
              
              {/* Thêm nút thông báo vào sidebar */}
              <button 
                className="sidebar-menu-item sidebar-notification-button"
                onClick={(e) => {
                  e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
                  setShowSidebarNotifications(!showSidebarNotifications);
                }}
              >
                <div className="sidebar-icon">
                  <FaBell />
                  {notifications.length > 0 && (
                    <span className="sidebar-notification-badge">{notifications.length}</span>
                  )}
                </div>
                <span className="sidebar-text">Thông báo</span>
              </button>
            </div>
            
            {/* Thêm nút đăng xuất dưới cùng */}
            <div className="sidebar-footer">
              <button onClick={handleLogout} className="sidebar-logout-button">
                <FaSignOutAlt className="sidebar-icon" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
          
          {/* Overlay */}
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
            onClick={toggleSidebar}
          ></div>

          {/* Thêm dropdown thông báo cho sidebar */}
          {showSidebarNotifications && (
            <div className="sidebar-notification-dropdown">
              <div className="sidebar-notification-header">
                <h3>Thông báo</h3>
                <button className="close-button" onClick={() => setShowSidebarNotifications(false)}>
                  ×
                </button>
              </div>
              
              <div className="sidebar-notification-list">
                {combinedNotifications.length === 0 ? (
                  <div className="no-notifications">
                    <i className="fas fa-bell-slash"></i>
                    <p>Không có thông báo nào</p>
                  </div>
                ) : (
                  combinedNotifications.map((notification, index) => (
                    <div 
                      key={index} 
                      className={`sidebar-notification-item ${notification.isAlert ? 'alert' : ''}`}
                      onClick={() => {
                        // Logic xử lý khi click vào thông báo
                        const notificationId = notification.isAlert 
                          ? `alert_${notification.measure}_${notification.date.getTime()}_${notification.age}` 
                          : `reminder_${notification.remindId || notification.title}_${notification.date.getTime()}`;
                        
                        markAsRead(notificationId);
                        
                        if (notification.isAlert) {
                          navigate('/member/basic-tracking');
                        } else {
                          navigate('/member/calendar');
                        }
                        
                        setShowSidebarNotifications(false);
                      }}
                    >
                      {notification.isReminder ? (
                        <>
                          <div className="notification-type">
                            {notification.reminderType || "Lịch hẹn"}
                          </div>
                          <div className="notification-content">
                            <h4>{notification.title}</h4>
                            {notification.notification && (
                              <p className="notification-medicine">
                                {notification.notification}
                              </p>
                            )}
                            <p className="notification-time">
                              {notification.time}, {new Date(notification.date).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        </>
                                      ) : (
                                        // Hiển thị cảnh báo
                                        <>
                                          <div className="notification-type warning">
                                            {notification.foetusName ? `${notification.foetusName} - ` : ''}
                                            Cảnh báo {notification.measure}
                                          </div>
                                          <div className="notification-content">
                                            <p className="notification-message">
                                              {notification.message}
                                            </p>
                                            <p className="notification-details">
                                              Tuần thai: {notification.age}
                                            </p>
                                            <p className="notification-time">
                                              {notification.date.toLocaleString('vi-VN')}
                                            </p>
                                          </div>
                                        </>
                                      )}
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
                                <button 
                                  className="view-alerts-button"
                                  onClick={() => {
                                    setShowSidebarNotifications(false);
                                    navigate('/member/basic-tracking');
                                  }}
                                >
                                  Xem tất cả cảnh báo
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