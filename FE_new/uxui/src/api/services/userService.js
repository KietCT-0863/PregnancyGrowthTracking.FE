import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const userService = {
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
  }
};

export default userService; 