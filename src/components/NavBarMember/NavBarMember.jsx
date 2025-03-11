"use client"

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
  FaBars,
  FaTimes,
  FaUserEdit,
  FaBell,
} from "react-icons/fa"
import "./NavbarMember.scss"
import reminderService from "../../api/services/reminderService"

const NavLink = ({ to, children, icon, onClick }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{children}</span>
    </Link>
  )
}

const NavBarMember = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = JSON.parse(localStorage.getItem("userData"))

    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUserInfo(decoded)
        setIsLoggedIn(true)
        setIsAdmin(decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "admin")
        // Set profile image from userData
        if (userData?.profileImageUrl) {
          setProfileImage(userData.profileImageUrl)
        }
      } catch (error) {
        console.error("Token decode error:", error)
        localStorage.removeItem("token")
        setIsLoggedIn(false)
        setUserInfo(null)
        setIsAdmin(false)
        setProfileImage(null)
      }
    }

    // Listen for localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === "userData") {
        const newUserData = JSON.parse(e.newValue)
        if (newUserData?.profileImageUrl) {
          setProfileImage(newUserData.profileImageUrl)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory()

      // Ensure response is an array with data
      if (!response || !Array.isArray(response)) {
        setNotifications([])
        return
      }

      const now = new Date()
      const upcomingReminders = response
        .filter((reminder) => {
          if (!reminder?.date || !reminder?.time) return false

          // Process date string to ensure correct format
          const dateStr = reminder.date.includes("T") ? reminder.date.split("T")[0] : reminder.date

          const reminderDate = new Date(`${dateStr}T${reminder.time}`)
          return reminderDate > now
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.date.split("T")[0]}T${a.time}`)
          const dateB = new Date(`${b.date.split("T")[0]}T${b.time}`)
          return dateA - dateB
        })

      setNotifications(upcomingReminders)
    } catch (error) {
      console.error("Error fetching reminders:", error)
      setNotifications([])
    }
  }

  useEffect(() => {
    fetchReminders()
    const interval = setInterval(fetchReminders, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatDateTime = (date, time) => {
    try {
      const dateStr = date.includes("T") ? date.split("T")[0] : date
      const dateObj = new Date(`${dateStr}T${time}`)

      return `${time} ${dateObj.toLocaleDateString("vi-VN")}`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    setUserInfo(null)
    setIsAdmin(false)
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
    navigate("/")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="logo-section">
          <Link to="/member" className="navbar-logo">
            <img src="/Logo bau-02.png" alt="Mẹ Bầu" className="navbar-logo-image" />
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
              <NavLink to="/member/calendar" icon={<FaCalendarAlt className="nav-icon" />} onClick={closeMobileMenu}>
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
              <NavLink to="/member/blog" icon={<FaBlog className="nav-icon" />} onClick={closeMobileMenu}>
                Blog
              </NavLink>
            </div>
            <div className="nav-item">
              <NavLink to="/member/community" icon={<FaUsers className="nav-icon" />} onClick={closeMobileMenu}>
                Cộng Đồng
              </NavLink>
            </div>
          </div>

          <div className="notification-container">
            <button className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
              <FaBell />
              {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <h3>
                  Lịch nhắc sắp tới
                  <button className="close-button" onClick={() => setShowNotifications(false)}>
                    ×
                  </button>
                </h3>

                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <i className="fas fa-bell-slash"></i>
                      <p>Không có lịch nhắc nào sắp tới</p>
                    </div>
                  ) : (
                    notifications.map((reminder, index) => (
                      <div key={index} className="notification-item">
                        <div className="notification-type">{reminder.reminderType || "Khám thai"}</div>
                        <div className="notification-content">
                          <h4>{reminder.title}</h4>
                          <p className="notification-time">{formatDateTime(reminder.date, reminder.time)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Link to="/member/calendar" className="view-all-link" onClick={() => setShowNotifications(false)}>
                  Xem tất cả lịch
                </Link>
              </div>
            )}
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
                      src={profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="user-avatar"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg"
                        setProfileImage(null)
                      }}
                    />
                  ) : (
                    <FaUserCircle className="user-icon" />
                  )}
                  <span className="user-name">{userInfo?.name || "Người dùng"}</span>
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
                            e.target.onerror = null
                            e.target.src = "/placeholder.svg"
                            setProfileImage(null)
                          }}
                        />
                      ) : (
                        <FaUserCircle className="dropdown-user-icon" />
                      )}
                      <div className="user-details">
                        <div className="user-name">{userInfo?.name || "Người dùng"}</div>
                        <div className="user-email">{userInfo?.email}</div>
                      </div>
                    </div>
                    <div className="user-info">
                      <div className="info-item">Ngày sinh: {userInfo?.birthDate}</div>
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
  )
}

export default NavBarMember

