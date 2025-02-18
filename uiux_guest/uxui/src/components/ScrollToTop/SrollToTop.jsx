import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa"; // Sử dụng icon mũi tên lên
import "./ScrollToTop.scss";
const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Theo dõi vị trí cuộn trang
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      className={`scroll-to-top ${isVisible ? "show" : ""}`}
      onClick={scrollToTop}
    >
      <FaArrowUp />
    </button>
  );
};

export default ScrollToTop;
