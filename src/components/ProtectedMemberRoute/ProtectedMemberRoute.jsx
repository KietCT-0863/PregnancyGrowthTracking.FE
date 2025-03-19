import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const ProtectedMemberRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
  const [shouldShowToast, setShouldShowToast] = useState({ show: false, message: "", type: "" });

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

        // Chỉ cho phép role "vip" truy cập
        if (userRole === "vip") {
          setRedirectPath(null);
          setIsLoading(false);
          return;
        }

        // Chuyển hướng các role khác về trang phù hợp
        if (userRole === "member") {
          setShouldShowToast({
            show: true,
            message: "Bạn cần nâng cấp tài khoản để truy cập tính năng này!",
            type: "error"
          });
          setRedirectPath("/basic-user");
          setIsLoading(false);
          return;
        } else if (userRole === "admin") {
          setRedirectPath("/admin");
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
  }, []);

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
