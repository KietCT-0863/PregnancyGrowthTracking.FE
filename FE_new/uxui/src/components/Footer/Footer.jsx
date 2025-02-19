import { FaFacebookF, FaInstagram, FaYoutube, FaHeart } from "react-icons/fa";
import "./Footer.scss";
import { CiMedicalCase } from "react-icons/ci";
import { FaCalendarAlt } from "react-icons/fa";
import { FaBlog } from "react-icons/fa6";

import { FaNotesMedical } from "react-icons/fa";
import { TiSocialInstagram } from "react-icons/ti";
const footerSections = [
  {
    title: "Liên kết",
    links: [
      { name: "Về chúng tôi", url: "/about" },
      { name: "Blog", url: "/blog" },
      { name: "Liên hệ", url: "/contact" },
      { name: "FAQ", url: "/faq" },
    ],
  },
  {
    title: "Dịch vụ",
    links: [
      {
        name: (
          <>
            <CiMedicalCase /> Theo dõi Thai Kỳ
          </>
        ),
        url: "/dashboard",
      },
      {
        name: (
          <>
            <FaCalendarAlt /> Lịch trình Thăm Khám
          </>
        ),
        url: "/calendar",
      },
      {
        name: (
          <>
            <FaNotesMedical /> Ghi Chú Bác Sỹ
          </>
        ),
        url: "/notes",
      },
      {
        name: (
          <>
            <FaBlog /> Blog
          </>
        ),
        url: "/blog",
      },
      {
        name: (
          <>
            <TiSocialInstagram /> Cộng Đồng
          </>
        ),
        url: "/forum",
      },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="brand-name">Mẹ Bầu</h3>
            <p className="brand-description">
              Đồng hành cùng mẹ trên hành trình thiêng liêng nhất cuộc đời
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaFacebookF />
              </a>
              <a href="#" className="social-link">
                <FaInstagram />
              </a>
              <a href="#" className="social-link">
                <FaYoutube />
              </a>
            </div>
          </div>
          {footerSections.map((section, index) => (
            <div key={index} className="footer-section">
              <h3 className="section-title">{section.title}</h3>
              <ul className="section-links">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="link-item">
                    <a href={link.url} className="footer-link">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="footer-section">
            <h3 className="section-title">Liên hệ</h3>
            <ul className="contact-info">
              <li>Email: contact@mebau.vn</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Địa chỉ: Hà Nội, Việt Nam</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Mẹ Bầu. Tất cả quyền được bảo lưu.</p>
        <p>
          Made with <FaHeart className="heart-icon" /> in Vietnam
        </p>
      </div>
    </footer>
  );
};

export default Footer;
