import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Kiểm tra localStorage khi khởi tạo
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email, password) => {
    // Mô phỏng logic đăng nhập
    let userRole;
    if (email === 'admin@example.com') {
      userRole = 'admin';
    } else if (email === 'vip@example.com') {
      userRole = 'vip';
    } else {
      userRole = 'non-vip';
    }

    const userData = {
      id: Math.random().toString(),
      email: email,
      role: userRole
    };

    // Lưu vào localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
