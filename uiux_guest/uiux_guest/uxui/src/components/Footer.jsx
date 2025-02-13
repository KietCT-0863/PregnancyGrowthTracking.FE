import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-section">
          <h3>MẹBầu</h3>
          <p>Đồng hành cùng mẹ trên hành trình thiêng liêng nhất cuộc đời</p>
          <div className="social-links">
            <a href="#">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h3>Liên kết</h3>
          <ul>
            <li>
              <a href="/about">Về chúng tôi</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
            <li>
              <a href="/contact">Liên hệ</a>
            </li>
            <li>
              <a href="/faq">FAQ</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Dịch vụ</h3>
          <ul>
            <li>
              <a href="/tracking">Theo dõi thai kỳ</a>
            </li>
            <li>
              <a href="/nutrition">Tư vấn dinh dưỡng</a>
            </li>
            <li>
              <a href="/community">Cộng đồng</a>
            </li>
            <li>
              <a href="/experts">Chuyên gia</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Liên hệ</h3>
          <ul>
            <li>Email: contact@mebau.vn</li>
            <li>Hotline: 1900 xxxx</li>
            <li>Địa chỉ: Hà Nội, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 MẹBầu. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;
