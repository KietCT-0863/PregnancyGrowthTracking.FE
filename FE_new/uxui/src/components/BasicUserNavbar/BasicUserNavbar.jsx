import { Link } from 'react-router-dom';
import { FaBlog, FaUsers, FaLock, FaHome, FaInfoCircle, FaPhone } from 'react-icons/fa';
import './BasicUserNavbar.scss';

const BasicUserNavbar = () => {
  const availableMenuItems = [
    { text: 'Trang chủ', icon: <FaHome />, path: '/basic-user' },
    { text: 'Blog', icon: <FaBlog />, path: '/basic-user/blog' },
    { text: 'Cộng đồng', icon: <FaUsers />, path: '/basic-user/community' },
    { text: 'Về chúng tôi', icon: <FaInfoCircle />, path: '/basic-user/about' },
    { text: 'Liên hệ', icon: <FaPhone />, path: '/basic-user/contact' },
  ];

  const lockedFeatures = [
    { text: 'Theo dõi thai kỳ', icon: <FaLock /> },
    { text: 'Nhật ký', icon: <FaLock /> },
    { text: 'Tư vấn chuyên gia', icon: <FaLock /> },
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