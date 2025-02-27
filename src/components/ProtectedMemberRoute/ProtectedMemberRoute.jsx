import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const ProtectedMemberRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Vui lòng đăng nhập để truy cập!");
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Chỉ cho phép role member truy cập
    if (userRole === "vip") {
      return children;
    }

    // Chuyển hướng các role khác về trang phù hợp
    if (userRole === "member") {
      toast.error("Bạn cần nâng cấp tài khoản để truy cập tính năng này!");
      return <Navigate to="/basic-user" />;
    } else if (userRole === "admin") {
      return <Navigate to="/admin" />;
    }

    toast.error("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" />;
  } catch (err) {
    console.error("Token decode error:", err);
    toast.error("Phiên đăng nhập không hợp lệ!");
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
};

ProtectedMemberRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedMemberRoute;
