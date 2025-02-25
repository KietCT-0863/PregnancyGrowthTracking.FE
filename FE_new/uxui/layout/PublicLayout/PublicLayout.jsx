
import { useEffect } from "react";
import "./PublicLayout.scss"
import { toast } from "react-toastify";
import { Outlet, useNavigate } from "react-router-dom";
import HomePublic from "../../src/pages/HomePublic/HomePublic";


const PublicLayout = () => {
  const navigate = useNavigate();
  const isLoggedIn = false;

  useEffect(() => {
    const handleNavigation = (event) => {
      event.preventDefault();
      if (!isLoggedIn) {
        toast.info("Bạn phải đăng nhập để sử dụng tính năng này!");
        navigate("/login");
      }
    };

    const buttons = document.querySelectorAll(".nav-link");
    buttons.forEach((button) =>
      button.addEventListener("click", handleNavigation)
    );

    return () => {
      buttons.forEach((button) =>
        button.removeEventListener("click", handleNavigation)
      );
    };
  }, [navigate, isLoggedIn]);

  return (
    <>
    <HomePublic />
    </>
  );
};

export default PublicLayout;
