import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Tạo một user giả với role admin
  const [user] = useState({
    id: 1,
    name: "Admin",
    role: "admin",
  });

  const login = async (credentials) => {
    console.log("Login với:", credentials);
  };

  const logout = () => {
    console.log("Logout");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
