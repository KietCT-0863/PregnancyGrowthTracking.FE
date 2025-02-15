import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { CiMedicalCase } from "react-icons/ci";
import { GiFruitBowl } from "react-icons/gi";
import { MdSportsGymnastics } from "react-icons/md";
import { FaBlog } from "react-icons/fa6";
import { MdAccountBox } from "react-icons/md";
import { FaPlusSquare } from "react-icons/fa";
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
          <Link to="/dashboard"> <CiMedicalCase />    Bảng điều khiển </Link>
          <Link to="/nutrition"> <GiFruitBowl /> Dinh dưỡng</Link>
          <Link to="/exercise"> <MdSportsGymnastics /> Bài tập</Link>
          <Link to="/blog"> <FaBlog /> Blog</Link>
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
