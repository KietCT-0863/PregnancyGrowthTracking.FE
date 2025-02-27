"use client"
import { RiVipCrown2Line } from "react-icons/ri";
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode"
import {
  FaBabyCarriage,
  FaCalendarAlt,
  FaNotesMedical,
  FaBlog,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa"
import "./NavBarGuest.scss"

const NavLink = ({ to, children, icon }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      {icon}
      <span>{children}</span>
    </Link>
  )
}

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUserInfo(decoded)
        setIsLoggedIn(true)
        setIsAdmin(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "admin")
        localStorage.setItem('userName', decoded.name);
      } catch (error) {
        console.error("Token decode error:", error)
        localStorage.removeItem("token")
        setIsLoggedIn(false)
        setUserInfo(null)
        setIsAdmin(false)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setUserInfo(null)
    setIsAdmin(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="nav-section logo-section">
          <Link to="/basic-user" className="navbar-logo">
            <img src="/Logo bau-02.png" alt="Mẹ Bầu" className="navbar-logo-image" />
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
            <NavLink to="/member/basic-tracking" icon={<FaBabyCarriage className="nav-icon" />}>
              Theo Dõi Thai Kỳ
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink to="/member/calendar" icon={<FaCalendarAlt className="nav-icon" />}>
              Lịch Trình Thăm Khám
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink to="/member/doctor-notes" icon={<FaNotesMedical className="nav-icon" />}>
              Ghi Chú Bác Sĩ
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink to="/basic-user/blog" icon={<FaBlog className="nav-icon" />}>
              Blog
            </NavLink>
          </div>
          <div className="nav-item">
            <NavLink to="/basic-user/community" icon={<FaUsers className="nav-icon" />}>
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
              <div className="user-actions" style={{ display: 'flex', alignItems: 'center' }}>
      
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="user-menu-button">
                  <FaUserCircle className="user-icon" />
                  <span>{userInfo?.name || "Người dùng"}</span>
                  <div className="user-menu">
                  <button className="btn btn-vip" onClick={() => navigate('/basic-user/choose-vip')}>
                    Đăng ký VIP <RiVipCrown2Line />
                  </button>
                </div>
                </button>
              </div>
              {isDropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <div>Ngày sinh: {userInfo?.birthDate}</div>
                    <div>Email: {userInfo?.email}</div>
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
    </nav>
  )
}

export default Navbar

