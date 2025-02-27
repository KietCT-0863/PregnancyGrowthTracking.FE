import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./UserMenu.scss";

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="user-menu">
      <div className="user-info" onClick={() => setIsOpen(!isOpen)}>
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="Avatar"
          className="user-avatar"
        />
        <span className="user-name">{user.username}</span>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <Link to="/profile" className="menu-item">
            Thông tin cá nhân
          </Link>
          <Link to="/settings" className="menu-item">
            Cài đặt
          </Link>
          <button onClick={handleLogout} className="menu-item logout-button">
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
