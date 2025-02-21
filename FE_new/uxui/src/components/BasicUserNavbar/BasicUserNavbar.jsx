import { Link } from "react-router-dom";
import {
  FaBlog,
  FaUsers,
  FaLock,
  FaHome,
  FaInfoCircle,
  FaPhone,
} from "react-icons/fa";
import "./BasicUserNavbar.scss";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import NavDropdown from "react-bootstrap/NavDropdown";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BasicUserNavbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Token decode error:", error);
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserInfo(null);
    toast.success("Đăng xuất thành công!");
    navigate("/");
  };

  const availableMenuItems = [
    { text: "Trang chủ", icon: <FaHome />, path: "/basic-user" },
    { text: "Blog", icon: <FaBlog />, path: "/basic-user/blog" },
    { text: "Cộng đồng", icon: <FaUsers />, path: "/basic-user/community" },
    { text: "Về chúng tôi", icon: <FaInfoCircle />, path: "/basic-user/about" },
    { text: "Liên hệ", icon: <FaPhone />, path: "/basic-user/contact" },
  ];

  const lockedFeatures = [
    { text: "Theo dõi thai kỳ", icon: <FaLock /> },
    { text: "Nhật ký", icon: <FaLock /> },
    { text: "Tư vấn chuyên gia", icon: <FaLock /> },
  ];

  return (
    <nav className="basic-navbar">
      <div className="navbar-container">
        <Link to="/basic-user" className="navbar-logo">
          Mom & Baby
        </Link>

        <ul className="nav-menu">
          {availableMenuItems.map((item) => (
            <li key={item.text} className="nav-item">
              <Link to={item.path} className="nav-link">
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="user-info">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="btn btn-outline-primary me-2">
                Đăng Nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng Ký
              </Link>
            </>
          ) : (
            <NavDropdown
              title={userInfo?.name || "Người dùng"}
              id="nav-dropdown"
              className="me-2"
            >
              <NavDropdown.Item disabled>
                <small>
                  <div>Ngày sinh: {userInfo?.birthDate}</div>
                  <div>Email: {userInfo?.email}</div>
                </small>
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          )}
        </div>

        <div className="locked-features">
          {lockedFeatures.map((item) => (
            <div key={item.text} className="locked-item">
              <span className="locked-icon">{item.icon}</span>
              <div className="locked-content">
                <span className="locked-text">{item.text}</span>
                <span className="locked-label">Tính năng dành cho VIP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BasicUserNavbar;
