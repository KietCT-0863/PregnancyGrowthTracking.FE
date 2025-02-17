import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { CiMedicalCase } from "react-icons/ci";
import { FaCalendarAlt } from "react-icons/fa";
import { FaBlog } from "react-icons/fa6";
import { MdAccountBox } from "react-icons/md";
import { FaPlusSquare } from "react-icons/fa";
import { FaNotesMedical } from "react-icons/fa";
import { TiSocialInstagram } from "react-icons/ti";
const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">

   
        <div className="logo">
          <Link to="/">
            <div className="logo-circle">
              <img src='./public/logo_images/1.jpg' alt="Mẹ Bầu Logo" className="logo-img" />
            </div>
            <span className="logo-text">Mẹ Bầu</span>
          </Link>
        </div>


        <nav className="nav-links">
          <Link to="/dashboard"> <CiMedicalCase />    Theo dõi Thai Kỳ </Link>
          <Link to="/calendar"> <FaCalendarAlt /> Lịch trình Thăm Khám</Link>
          <Link to="/notes"> <FaNotesMedical /> Ghi Chú Bác Sỹ</Link>
          <Link to="/blog"> <FaBlog /> Blog</Link>
          <Link to="/forum"> <TiSocialInstagram /> Cộng Đồng</Link>

        </nav>

        <div className="auth-buttons">
          <Link to="/login" className="btn btn-primary">
            Login <MdAccountBox />
          </Link>
          <Link to="/register" className="btn btn-primary">
            Register <FaPlusSquare />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
