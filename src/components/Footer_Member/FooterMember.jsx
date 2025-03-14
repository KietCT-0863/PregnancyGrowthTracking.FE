"use client";

import { FaFacebookF, FaInstagram, FaYoutube, FaHeart } from "react-icons/fa";

import { motion } from "framer-motion";
import "./FooterMember.scss";

const footerSections = [];

const FooterMember = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="brand-name">Mẹ Bầu</h3>
            <p className="brand-description">
              Đồng hành cùng mẹ trên hành trình thiêng liêng nhất cuộc đời
            </p>
            <div className="social-links">
              <motion.a
                href="#"
                className="social-link"
                whileHover={{ scale: 1.1 }}
              >
                <FaFacebookF />
              </motion.a>
              <motion.a
                href="#"
                className="social-link"
                whileHover={{ scale: 1.1 }}
              >
                <FaInstagram />
              </motion.a>
              <motion.a
                href="#"
                className="social-link"
                whileHover={{ scale: 1.1 }}
              >
                <FaYoutube />
              </motion.a>
            </div>
          </motion.div>
          {footerSections.map((section, index) => (
            <motion.div
              key={index}
              className="footer-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-links">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={linkIndex}
                    className="link-item"
                    whileHover={{ x: 5 }}
                  >
                    <a href={link.url} className="footer-link">
                      {link.icon && (
                        <span className="link-icon">{link.icon}</span>
                      )}
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p>&copy; 2025 Mẹ Bầu. Tất cả quyền được bảo lưu.</p>
        <p>
          Made with <FaHeart className="heart-icon" /> in Vietnam
        </p>
      </motion.div>
    </footer>
  );
};

export default FooterMember;
