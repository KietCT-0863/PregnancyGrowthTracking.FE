import axiosInstance from "./axiosConfig";

const authApi = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post("/Auth/Login", credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/Auth/Register", userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post("/Auth/ForgotPassword", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm các phương thức auth khác ở đây...
};

export default authApi;
