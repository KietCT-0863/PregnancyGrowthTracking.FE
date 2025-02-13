import React from "react";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Đồng hành cùng mẹ bầu trên hành trình thiêng liêng</h1>
        <p>
          Ứng dụng thông minh giúp theo dõi thai kỳ, tư vấn dinh dưỡng và kết
          nối cộng đồng mẹ bầu
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary">Bắt đầu ngay</button>
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
      </div>
    </section>
  );
};

export default Hero;
