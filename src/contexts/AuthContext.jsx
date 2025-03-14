import React, { createContext, useState, useContext, useEffect } from "react";
import authApi from "../api/authApi";
import authService from "../api/services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem("userData");
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          
          const isValid = await authService.validateToken(parsedUser.token);
          
          if (isValid) {
            setCurrentUser(parsedUser);
            console.log("User authenticated:", parsedUser);
          } else {
            console.log("Token invalid, logging out");
            localStorage.removeItem("userData");
            setCurrentUser(null);
          }
        } else {
          console.log("No user data found");
          setCurrentUser(null);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError(err.message);
        localStorage.removeItem("userData");
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        localStorage.setItem("userData", JSON.stringify(response.data));
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
