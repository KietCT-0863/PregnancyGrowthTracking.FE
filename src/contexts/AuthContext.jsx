import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";
import authService from "../api/services/authService";

const AuthContext = createContext(null);

// Hàm helper để kiểm tra xem trang có phải vừa được tải lại hay không
const isPageRefreshed = () => {
  // Kiểm tra navigation type từ performance API
  if (window.performance) {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === 'reload') {
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
    
    if (!sessionToken && userData) {
      console.log("Phát hiện trang được mở lại sau khi đóng - Đăng xuất người dùng");
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      setCurrentUser(null);
    } else {
      // Thiết lập sessionActive nếu có userData và đang trong phiên làm việc
      if (userData) {
        sessionStorage.setItem("sessionActive", "true");
      }
    }
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const sessionToken = sessionStorage.getItem("sessionActive");
        const userData = localStorage.getItem("userData");
        const token = localStorage.getItem("token");
        
        // Kiểm tra xem có userData nhưng không có sessionToken không
        if (!sessionToken && userData) {
          console.log("Phiên đăng nhập đã hết hạn, đăng xuất người dùng");
          localStorage.removeItem("userData");
          localStorage.removeItem("token");
          setCurrentUser(null);
          setLoading(false);
          return;
        }
        
        // Chỉ kiểm tra token khi có cả userData và token
        if (userData && token) {
          const parsedUser = JSON.parse(userData);
          
          try {
            // Cố gắng xác thực token
            try {
              // Gọi backend để xác thực token
              const isValid = await authService.checkToken(token);
              
              if (isValid) {
                console.log("Token hợp lệ, phiên đăng nhập được duy trì");
                setCurrentUser(parsedUser);
                sessionStorage.setItem("sessionActive", "true");
              } else {
                console.log("Token không hợp lệ, đăng xuất người dùng");
                authService.logout(); // Dùng hàm logout để xóa tất cả dữ liệu
                setCurrentUser(null);
              }
            } catch (error) {
              console.error("Không thể xác thực token:", error);
              // Nếu không kết nối được backend, mặc định xóa dữ liệu
              authService.logout();
              setCurrentUser(null);
            }
          } catch (tokenErr) {
            console.error("Lỗi xử lý token:", tokenErr);
            authService.logout();
            setCurrentUser(null);
          }
        } else {
          console.log("Không tìm thấy dữ liệu đăng nhập");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra trạng thái xác thực:", err);
        setError(err.message);
        authService.logout();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
    
    // Thêm event listener để xử lý khi người dùng đóng tab hoặc trình duyệt
    const handleBeforeUnload = () => {
      console.log("Đang đóng tab/trình duyệt, xóa session");
      sessionStorage.removeItem("sessionActive");
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Xử lý khi người dùng mở lại tab sau khi đóng hoặc tạm dừng tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const sessionToken = sessionStorage.getItem("sessionActive");
        const userData = localStorage.getItem("userData");
        
        if (!sessionToken && userData) {
          console.log("Tab được kích hoạt lại, phiên đã hết hạn");
          authService.logout();
          setCurrentUser(null);
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
