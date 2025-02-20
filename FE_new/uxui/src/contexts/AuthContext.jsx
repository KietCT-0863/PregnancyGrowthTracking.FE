import { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // TODO: Thêm API endpoint để lấy thông tin user
          const response = await authApi.getCurrentUser();
          setUser(response);
        } catch (error) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authApi.login(credentials);
      // Kiểm tra response trước khi xử lý
      console.log("Login response:", response); // để debug

      // Kiểm tra cấu trúc response
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        setUser(response.user); // nếu có
        return response;
      } else if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user); // nếu có
        return response.data;
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login error in AuthContext:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
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
