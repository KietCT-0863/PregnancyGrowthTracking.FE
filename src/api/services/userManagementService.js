import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const userManagementService = {
  // Lấy danh sách users
  getUsers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER_MANAGEMENT.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw {
        message: error.response?.data?.message || "Không thể tải danh sách người dùng",
        status: error.response?.status || 500
      };
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      if (!userData.userName || !userData.email || !userData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }
      const response = await axiosInstance.post(ENDPOINTS.USER_MANAGEMENT.CREATE, userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw {
        message: error.response?.data?.message || "Không thể tạo người dùng mới",
        status: error.response?.status || 500
      };
    }
  },

  // Cập nhật user
  updateUser: async (id, userData) => {
    try {
      if (!id) throw new Error("ID người dùng không hợp lệ");
      const response = await axiosInstance.put(ENDPOINTS.USER_MANAGEMENT.UPDATE(id), userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw {
        message: error.response?.data?.message || "Không thể cập nhật thông tin người dùng",
        status: error.response?.status || 500
      };
    }
  },

  // Xóa user
  deleteUser: async (id) => {
    try {
      if (!id) throw new Error("ID người dùng không hợp lệ");
      const response = await axiosInstance.delete(ENDPOINTS.USER_MANAGEMENT.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw {
        message: error.response?.data?.message || "Không thể xóa người dùng",
        status: error.response?.status || 500
      };
    }
  },

  getTotalUsers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER_MANAGEMENT.GET_TOTAL_USERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching total users:', error);
      throw {
        message: error.response?.data?.message || "Không thể lấy tổng số người dùng",
        status: error.response?.status || 500
      };
    }
  },
};

export default userManagementService; 