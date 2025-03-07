import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const data = response.data;

      // Lưu token và user data vào localStorage
      localStorage.setItem("token", data.token);
      const userData = {
        userName: data.userName,
        email: data.email,
        role: data.role,
        userId: data.userId,
        profileImageUrl: data.profileImageUrl,
      };
      localStorage.setItem("userData", JSON.stringify(userData));

      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
  },
};

export default authService;
