import "./HeaderContent.scss";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../UserMenu/UserMenu";

const HeaderContent = () => {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Đồng hành cùng mẹ bầu trên hành trình thiêng liêng</h1>
        <p>
          Ứng dụng thông minh giúp theo dõi thai kỳ, tư vấn dinh dưỡng và kết
          nối cộng đồng mẹ bầu
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">
            Bắt đầu ngay để theo dõi hành trình mang thai đầy kì diệu của mẹ{" "}
          </button>
          <button className="btn btn-outline">Tìm hiểu thêm</button>
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
              <Link to="/login" className="btn-login">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn-register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeaderContent;
