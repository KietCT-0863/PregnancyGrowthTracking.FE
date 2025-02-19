import "./HeaderContent.scss";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../UserMenu/UserMenu";

const HeaderContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSwitchLayout = () => {
    if (user && !user.isVip) {
      navigate('/basic-user/blog');
    } else if (user && user.isVip) {
      navigate('/admin');
    }
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Đồng hành cùng mẹ bầu trên hành trình thiêng liêng</h1>
        <p>
          Ứng dụng thông minh giúp theo dõi thai kỳ, tư vấn dinh dưỡng và kết
          nối cộng đồng mẹ bầu
        </p>
        <div className="layout-switcher">
          <button 
            className="btn btn-switch-layout"
            onClick={() => navigate('/admin')}
          >
            Xem Admin Layout
          </button>
          <button 
            className="btn btn-switch-layout basic"
            onClick={() => navigate('/basic-user/blog')}
          >
            Xem Basic User Layout
          </button>
        </div>
        <div className="hero-buttons">
          <button className="btn btn-primary">
            Bắt đầu ngay để theo dõi hành trình mang thai đầy kì diệu của mẹ{" "}
          </button>
          <button className="btn btn-outline">Tìm hiểu thêm</button>
          {user && (
            <button 
              className="btn btn-switch-layout"
              onClick={handleSwitchLayout}
            >
              {user.isVip ? 'Chuyển đến Admin' : 'Xem Blog & Cộng đồng'}
            </button>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">10K+</span>
            <span className="stat-label">Mẹ bầu tin dùng</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Bài viết hữu ích</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">50+</span>
            <span className="stat-label">Chuyên gia tư vấn</span>
          </div>
        </div>
        <div className="auth-buttons">
          {user ? (
            <UserMenu />
          ) : (
            <>
      
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeaderContent;
