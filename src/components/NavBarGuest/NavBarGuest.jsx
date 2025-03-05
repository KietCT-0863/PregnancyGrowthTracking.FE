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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
        setIsLoggedIn(true);
        setIsAdmin(
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] === "admin"
        );
        localStorage.setItem("userName", decoded.name);
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
      }
    }

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
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

  return (
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
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <FaTimes className="toggle-icon" /> : <FaBars className="toggle-icon" />}
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
                  <FaUserCircle className="user-icon" />
                  <span className="user-name">{userInfo?.name || "Người dùng"}</span>
                </button>
                {isDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="info-item">Ngày sinh: {userInfo?.birthDate}</div>
                      <div className="info-item">Email: {userInfo?.email}</div>
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
  );
};

export default NavBarGuest;
