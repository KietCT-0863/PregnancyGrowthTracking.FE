"use client"

import { FaFacebookF, FaInstagram, FaYoutube, FaHeart, FaCalendarAlt, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { CiMedicalCase } from "react-icons/ci";
import { FaBlog } from "react-icons/fa6";
import { FaNotesMedical } from "react-icons/fa";
import { TiSocialInstagram } from "react-icons/ti";
import { Link } from "react-router-dom";
import "./FooterGuest.scss";

const FooterGuest = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        {/* Cột 1: Logo và thông tin */}
        <div className="footer-column brand-column">
          <h2 className="footer-logo">Mẹ Bầu</h2>
          <p className="footer-slogan">
            Đồng hành cùng mẹ trên hành trình thiêng liêng nhất cuộc đời
          </p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Youtube"><FaYoutube /></a>
          </div>
        </div>

        {/* Cột 2: Liên kết */}
        <div className="footer-column">
          <h3 className="footer-heading">Liên kết</h3>
          <ul className="footer-links">
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Liên hệ</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Cột 3: Dịch vụ */}
        <div className="footer-column">
          <h3 className="footer-heading">Dịch vụ</h3>
          <ul className="footer-links">
            <li>
              <Link to="/member/basic-tracking">
                <CiMedicalCase className="icon" />
                <span>Theo dõi Thai Kỳ</span>
              </Link>
            </li>
            <li>
              <Link to="/member/calendar">
                <FaCalendarAlt className="icon" />
                <span>Lịch trình Thăm Khám</span>
              </Link>
            </li>
            <li>
              <Link to="/member/doctor-notes">
                <FaNotesMedical className="icon" />
                <span>Ghi Chú Bác Sỹ</span>
              </Link>
            </li>
            <li>
              <Link to="basic-user/blog">
                <FaBlog className="icon" />
                <span>Blog</span>
              </Link>
            </li>
            <li>
              <Link to="basic-user/community">
                <TiSocialInstagram className="icon" />
                <span>Cộng Đồng</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 4: Liên hệ */}
        <div className="footer-column contact-column">
          <h3 className="footer-heading">Liên hệ</h3>
          <ul className="contact-info">
            <li>
              <FaEnvelope className="icon" />
              <a href="mailto:KhangDGSE184442@fpt.edu.vn">Email: KhangDGSE184442@fpt.edu.vn</a>
            </li>
            <li>
              <FaPhone className="icon" />
              <a href="tel:0383989481">Hotline: 0383989481</a>
            </li>
            <li>
              <FaMapMarkerAlt className="icon" />
              <p>Địa chỉ: 874/44/21 Đoàn Văn Bơ, Phường 16, Quận 4, Hồ Chí Minh, Vietnam</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">&copy; 2025 Mẹ Bầu. Tất cả quyền được bảo lưu.</p>
        <p className="made-with">Made with <FaHeart className="heart" /> in Vietnam</p>
      </div>
    </footer>
  );
};

export default FooterGuest;

