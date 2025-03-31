import { createContext, useContext, useState, useEffect } from "react";
import userService from "../api/services/userService";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Kiểm tra nhiều loại token khác nhau
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");

        if (token) {
          try {
            const userData = await userService.getCurrentUser();
            setUser(userData);
            // Đảm bảo sessionActive được thiết lập
            sessionStorage.setItem("sessionActive", "true");
          } catch (apiError) {
            console.error("API error loading user:", apiError);
            // Nếu API gặp lỗi, cố gắng sử dụng dữ liệu đã lưu
            const savedUserData = localStorage.getItem("userData");
            if (savedUserData) {
              try {
                setUser(JSON.parse(savedUserData));
                console.log("Using cached user data");
              } catch (parseError) {
                console.error("Error parsing saved user data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Xử lý khi visibility thay đổi (tab được kích hoạt lại)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (token) {
          // Tab được kích hoạt lại và có token, đảm bảo sessionActive được thiết lập
          sessionStorage.setItem("sessionActive", "true");
          // Nếu muốn, có thể gọi lại loadUser để làm mới dữ liệu
          loadUser();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
