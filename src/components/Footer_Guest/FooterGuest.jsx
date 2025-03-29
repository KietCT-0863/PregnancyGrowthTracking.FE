"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaHeart,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone
} from "react-icons/fa";
import { CiMedicalCase } from "react-icons/ci";
import { FaBlog } from "react-icons/fa6";
import { motion } from "framer-motion";
import "./FooterGuest.scss";

const FooterGuest = () => {
  const [hovered, setHovered] = useState("");

  return (
    <footer className="footer-guest">
      <div className="footer-gradient-border"></div>
      
      <div className="footer-container">
        <div className="footer-main">
          {/* Column 1: Brand and Social */}
          <div className="footer-col brand-col">
            <Link to="/" className="brand-name">Mẹ Bầu</Link>
            <p className="brand-slogan">
              Đồng hành cùng mẹ trên hành trình thiêng liêng nhất cuộc đời
            </p>
            <div className="social-links">
              <motion.a 
                href="https://facebook.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                onHoverStart={() => setHovered("facebook")}
                onHoverEnd={() => setHovered("")}
                className={hovered === "facebook" ? "hovered" : ""}
              >
                <FaFacebookF />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                onHoverStart={() => setHovered("instagram")}
                onHoverEnd={() => setHovered("")}
                className={hovered === "instagram" ? "hovered" : ""}
              >
                <FaInstagram />
              </motion.a>
              <motion.a 
                href="https://youtube.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -5, scale: 1.1 }}
                onHoverStart={() => setHovered("youtube")}
                onHoverEnd={() => setHovered("")}
                className={hovered === "youtube" ? "hovered" : ""}
              >
                <FaYoutube />
              </motion.a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div className="footer-col links-col">
            <h3>Liên kết nhanh</h3>
            <ul>
              <li><Link to="/about">Về chúng tôi</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Services */}
          <div className="footer-col services-col">
            <h3>Dịch vụ</h3>
            <ul>
              <li>
                <Link to="/basic-user/tracking">
                  <CiMedicalCase className="icon" />
                  <span>Theo dõi thai kỳ</span>
                </Link>
              </li>
              <li>
                <Link to="/basic-user/calendar">
                  <FaCalendarAlt className="icon" />
                  <span>Lịch khám</span>
                </Link>
              </li>
              <li>
                <Link to="/basic-user/blog">
                  <FaBlog className="icon" />
                  <span>Bài viết</span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div className="footer-col contact-col">
            <h3>Liên hệ</h3>
            <ul>
              <li>
                <FaEnvelope className="icon" />
                <a href="mailto:KhangDGSE184442@fpt.edu.vn">KhangDGSE184442@fpt.edu.vn</a>
              </li>
              <li>
                <FaPhone className="icon" />
                <a href="tel:0383989481">0383989481</a>
              </li>
              <li>
                <FaMapMarkerAlt className="icon" />
                <span>874/44/21 Đoàn Văn Bơ, Phường 16, Quận 4, Hồ Chí Minh</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2025 Mẹ Bầu. Tất cả quyền được bảo lưu.</p>
        <p className="made-with">Made with <FaHeart className="heart-icon" /> in Vietnam</p>
      </div>
    </footer>
  );
};

export default FooterGuest;
