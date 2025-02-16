import React from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  // Tạm thời bỏ qua kiểm tra quyền
  return children;
};

export default ProtectedRoute;
