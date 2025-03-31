import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";
import authService from "../api/services/authService";

const AuthContext = createContext(null);

// Hàm helper để kiểm tra xem trang có phải vừa được tải lại hay không
const isPageRefreshed = () => {
  // Kiểm tra navigation type từ performance API
  if (window.performance) {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      return true;
    }
  }
  return false;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Khởi tạo flag khi component được mount
  useEffect(() => {
    // Kiểm tra ngay khi vừa load trang
    const sessionToken = sessionStorage.getItem("sessionActive");
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    // Nếu có userData hoặc token, thiết lập sessionActive để duy trì phiên đăng nhập
    if (userData || token) {
      console.log("Có dữ liệu đăng nhập, thiết lập phiên làm việc");
      sessionStorage.setItem("sessionActive", "true");
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const sessionToken = sessionStorage.getItem("sessionActive");
        const userData = localStorage.getItem("userData");
        const token = localStorage.getItem("token");
        const accessToken = localStorage.getItem("accessToken");

        // Sử dụng accessToken nếu có, nếu không thì sử dụng token thông thường
        const validToken = accessToken || token;

        // Chỉ kiểm tra token khi có token
        if (validToken) {
          try {
            // Cố gắng xác thực token
            try {
              // Gọi backend để xác thực token
              const isValid = await authService.checkToken(validToken);

              if (isValid) {
                console.log("Token hợp lệ, phiên đăng nhập được duy trì");
                // Nếu có userData, sử dụng nó, nếu không thì có thể cần lấy từ backend
                if (userData) {
                  const parsedUser = JSON.parse(userData);
                  setCurrentUser(parsedUser);
                }
                sessionStorage.setItem("sessionActive", "true");
              } else {
                console.log("Token không hợp lệ, đăng xuất người dùng");
                authService.logout(); // Dùng hàm logout để xóa tất cả dữ liệu
                setCurrentUser(null);
              }
            } catch (error) {
              console.error("Không thể xác thực token:", error);
              // Nếu không kết nối được backend, không tự động đăng xuất để tránh mất dữ liệu
              if (userData) {
                const parsedUser = JSON.parse(userData);
                setCurrentUser(parsedUser);
                console.log(
                  "Sử dụng dữ liệu đăng nhập cục bộ khi không kết nối được server"
                );
              }
            }
          } catch (tokenErr) {
            console.error("Lỗi xử lý token:", tokenErr);
          }
        } else {
          console.log("Không tìm thấy token");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái xác thực:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Xử lý khi người dùng mở lại tab sau khi đóng hoặc tạm dừng tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
          // Nếu có token, thiết lập lại session
          sessionStorage.setItem("sessionActive", "true");
          console.log("Tab được kích hoạt lại, đặt lại sessionActive");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success) {
        localStorage.setItem("userData", JSON.stringify(response.data));
        sessionStorage.setItem("sessionActive", "true");
        setCurrentUser(response.data);
        return { success: true };
      } else {
        throw new Error(response.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      sessionStorage.removeItem("sessionActive");
      sessionStorage.clear();

      setCurrentUser(null);

      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isVIP: currentUser?.role === "VIP" || currentUser?.isPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
