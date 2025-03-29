import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const ProtectedMemberRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
  const [shouldShowToast, setShouldShowToast] = useState({ show: false, message: "", type: "" });
  const location = useLocation();

  useEffect(() => {
    if (shouldShowToast.show) {
      if (shouldShowToast.type === "error") {
        toast.error(shouldShowToast.message);
      }
      setShouldShowToast({ show: false, message: "", type: "" });
    }
  }, [shouldShowToast]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setShouldShowToast({
          show: true,
          message: "Vui lòng đăng nhập để truy cập!",
          type: "error"
        });
        setRedirectPath("/login");
        setIsLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const userRole =
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
        // Kiểm tra đường dẫn hiện tại
        const currentPath = location.pathname;
        const isMemberPath = currentPath.startsWith("/member");

        // Cho phép role "vip" và "admin" truy cập tất cả các trang
        if (userRole === "vip" || userRole === "admin") {
          setRedirectPath(null);
          setIsLoading(false);
          return;
        }

        // Cho phép "member" truy cập vào trang /member
        if (userRole === "member" && isMemberPath) {
          setRedirectPath(null);
          setIsLoading(false);
          return;
        }

        // Chuyển hướng các role không đủ quyền
        if (userRole === "member" && !isMemberPath) {
          setShouldShowToast({
            show: true,
            message: "Bạn cần nâng cấp tài khoản để truy cập tính năng này!",
            type: "error"
          });
          setRedirectPath("/member");
          setIsLoading(false);
          return;
        }

        setShouldShowToast({
          show: true,
          message: "Bạn không có quyền truy cập trang này!",
          type: "error"
        });
        setRedirectPath("/");
        setIsLoading(false);
      } catch (err) {
        console.error("Token decode error:", err);
        setShouldShowToast({
          show: true,
          message: "Phiên đăng nhập không hợp lệ!",
          type: "error"
        });
        localStorage.removeItem("token");
        setRedirectPath("/login");
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return children;
};

ProtectedMemberRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedMemberRoute;
