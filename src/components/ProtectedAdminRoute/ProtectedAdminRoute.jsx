import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    toast.error("Vui lòng đăng nhập để tiếp tục!");
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (role !== "admin") {
      toast.error("Bạn không có quyền truy cập trang này!");
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token decode error:", error);
    localStorage.removeItem("token");
    toast.error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedAdminRoute;
