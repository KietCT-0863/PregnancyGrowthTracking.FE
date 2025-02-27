import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const ProtectedBasicUserRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Vui lòng đăng nhập để truy cập!");
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Nếu là guest, tự động chuyển hướng đến /basic-user
    if (userRole === "member" && window.location.pathname === "/") {
      return <Navigate to="/basic-user" />;
    }

    // Nếu là guest và đang ở /basic-user hoặc các route con của nó, cho phép truy cập
    if (
      userRole === "member" &&
      window.location.pathname.startsWith("/basic-user")
    ) {
      return children;
    }

    // Nếu không phải guest, cho phép truy cập các route khác
    if (userRole !== "member") {
      return children;
    }

    // Trường hợp còn lại (guest cố truy cập route không được phép)
    toast.error("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/basic-user" />;
  } catch (err) {
    console.error("Token decode error:", err);
    toast.error("Phiên đăng nhập không hợp lệ!");
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

ProtectedBasicUserRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedBasicUserRoute;
