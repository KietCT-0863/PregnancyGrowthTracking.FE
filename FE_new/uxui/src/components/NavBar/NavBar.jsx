"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  FaBabyCarriage,
  FaCalendarAlt,
  FaNotesMedical,
  FaBlog,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import styles from './NavBar.module.scss';
import userService from "../../api/services/userService";

const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      {icon}
      <span>{children}</span>
    </Link>
  );
};

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await userService.getCurrentUser();
        setUserInfo(userData);
        setIsLoggedIn(true);
        setIsAdmin(userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "admin");
      } catch (err) {
        setError(err.message);
        console.error("Error fetching user info:", err);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserInfo(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchUserInfo();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
    setIsAdmin(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-section logo-section">
          <Link to="/" className="navbar-logo">
            <img
              src="/Logo bau-02.png"
              alt="Mẹ Bầu"
              className="navbar-logo-image"
            />
            <span className="navbar-logo-text">Mẹ Bầu</span>
          </Link>
        </div>

        <div className="nav-section menu-section">
          {isAdmin && (
            <div className="nav-item">
              <NavLink to="/admin" icon={<FaUserCircle className="nav-icon" />}>
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
            <NavLink to="/member/blog" icon={<FaBlog className="nav-icon" />}>
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

        <div className="nav-section auth-section">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-login">
                Đăng Nhập
              </Link>
              <Link to="/register" className="btn btn-register">
                Đăng Ký
              </Link>
            </>
          ) : (
            <div className="user-menu">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="user-menu-button"
              >
                <FaUserCircle className="user-icon" />
                <span>{userInfo?.name || "Người dùng"}</span>
              </button>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div>Error: {error}</div>
                  ) : userInfo ? (
                    <div>
                      <div className="user-info">
                        <p>Email: {userInfo.email}</p>
                        <p>Role: {userInfo.role}</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt className="logout-icon" />
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <div>Please login</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
