import axiosInstance from "../config/axiosConfig";

const userService = {
  getUserInfo: async () => {
    const response = await axiosInstance.get("/User/me");
    return response.data;
  },

  updateUserInfo: async (userData) => {
    const response = await axiosInstance.put("/User/me", userData);
    return response.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER.GET_CURRENT);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER.PROFILE);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.USER.UPDATE, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
