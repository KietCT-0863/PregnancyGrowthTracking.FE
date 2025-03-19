"use client";
import { RiVipCrown2Line } from "react-icons/ri";
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
} from "react-icons/fa";
import "./NavbarGuest.scss";

const NavLink = ({ to, children, icon, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};

const NavBarGuest = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
        setIsLoggedIn(true);
        setIsAdmin(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "admin");
        
        if (userData?.profileImageUrl) {
          setProfileImage(userData.profileImageUrl);
        }
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
        setProfileImage(null);
      }
    }

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        const newUserData = JSON.parse(e.newValue);
        if (newUserData?.profileImageUrl) {
          setProfileImage(newUserData.profileImageUrl);
        }
      }
    };

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Add resize event listener
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Tự động đóng sidebar khi chuyển từ mobile sang desktop
      if (!mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    // Khởi tạo giá trị ban đầu
    handleResize();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
    setIsSidebarOpen(false);
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

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <div className="logo-section">
            <Link to="/basic-user" className="navbar-logo">
              <img
                src="/Logo bau-02.png"
                alt="Mẹ Bầu"
                className="navbar-logo-image"
              />
              <span className="navbar-logo-text">Mẹ Bầu</span>
            </Link>
            <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
              {isSidebarOpen ? <FaTimes className="toggle-icon" /> : <FaBars className="toggle-icon" />}
            </button>
          </div>

          <div className={`navbar-content ${isMobileMenuOpen ? "mobile-open" : ""}`}>
            <div className="menu-section">
              {isAdmin && (
                <div className="nav-item">
                  <NavLink to="/admin" icon={<FaUserCircle className="nav-icon" />} onClick={closeMobileMenu}>
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
                  to="/basic-user/blog"
                  icon={<FaBlog className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Blog
                </NavLink>
              </div>
              <div className="nav-item">
                <NavLink
                  to="/basic-user/community"
                  icon={<FaUsers className="nav-icon" />}
                  onClick={closeMobileMenu}
                >
                  Cộng Đồng
                </NavLink>
              </div>
            </div>

            <div className="auth-section">
              {!isLoggedIn ? (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-login" onClick={closeMobileMenu}>
                    Đăng Nhập
                  </Link>
                  <Link to="/register" className="btn btn-register" onClick={closeMobileMenu}>
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
                        src={profileImage} 
                        alt="Profile" 
                        className="user-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.svg';
                          setProfileImage(null);
                        }}
                      />
                    ) : (
                      <FaUserCircle className="user-icon" />
                    )}
                    <span className="user-name">{userInfo?.fullName || "Người dùng"}</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-profile-header">
                          {profileImage ? (
                            <img 
                              src={profileImage} 
                              alt="Profile" 
                              className="dropdown-user-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder.svg';
                                setProfileImage(null);
                              }}
                            />
                          ) : (
                            <FaUserCircle className="dropdown-user-icon" />
                          )}
                          <div className="user-details">
                            <div className="user-name">{userInfo?.fullName || "Người dùng"}</div>
                            <div className="user-email">{userInfo?.email}</div>
                          </div>
                        </div>
                        <div className="info-item">Ngày sinh: {userInfo?.birthDate}</div>
                        <Link 
                          to="/basic-user/profile/edit" 
                          className="edit-profile-button"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FaUserEdit className="edit-icon" />
                          Chỉnh sửa thông tin
                        </Link>
                        <button
                          className="btn btn-vip"
                          onClick={() => {
                            navigate("/basic-user/choose-vip");
                            closeMobileMenu();
                          }}
                        >
                          Đăng ký VIP <RiVipCrown2Line />
                        </button>
                      </div>
                      <div className="dropdown-divider"></div>
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
      <div className="navbar-spacer"></div>

      {/* Sidebar Menu */}
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
                src={profileImage}
                alt="Profile"
                className="sidebar-user-avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.svg';
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
          <Link to="/basic-user/blog" className="sidebar-menu-item">
            <div className="sidebar-icon"><FaBlog /></div>
            <span className="sidebar-text">Blog</span>
          </Link>
          <Link to="/basic-user/community" className="sidebar-menu-item">
            <div className="sidebar-icon"><FaUsers /></div>
            <span className="sidebar-text">Cộng Đồng</span>
          </Link>
        </div>
        
        {/* Thêm nút đăng xuất hoặc đăng nhập dưới cùng */}
        <div className="sidebar-footer">
          {isLoggedIn ? (
            <>
              <Link to="/basic-user/choose-vip" className="btn-vip" onClick={toggleSidebar}>
                Đăng ký VIP <RiVipCrown2Line />
              </Link>
              <button onClick={handleLogout} className="sidebar-logout-button">
                <FaSignOutAlt className="sidebar-icon" />
                <span>Đăng xuất</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="sidebar-logout-button" onClick={toggleSidebar}>
              <FaUserCircle className="sidebar-icon" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={toggleSidebar}
      ></div>
    </>
  );
};

export default NavBarGuest;
