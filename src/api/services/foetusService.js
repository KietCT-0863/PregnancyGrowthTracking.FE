import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const foetusService = {
  // Lấy danh sách thai nhi
  getFoetusList: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FOETUS.LIST);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thai nhi:', error);
      throw {
        message: error.response?.data?.message || "Không thể tải danh sách thai nhi",
        status: error.response?.status || 500
      };
    }
  },

  // Lấy chi tiết một thai nhi
  getFoetusById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FOETUS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin thai nhi:', error);
      throw {
        message: error.response?.data?.message || "Không thể tải thông tin thai nhi",
        status: error.response?.status || 500
      };
    }
  },

  // Tạo mới thai nhi
  createFoetus: async (foetusData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.userId) {
        throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
      }

      const requestData = {
        name: foetusData.name,
        gender: foetusData.gender,
        userId: userData.userId
      };

      const response = await axiosInstance.post(ENDPOINTS.FOETUS.LIST, requestData);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo thai nhi:', error);
      throw {
        message: error.response?.data?.message || "Không thể tạo thai nhi mới",
        status: error.response?.status || 500
      };
    }
  },

  // Xóa thai nhi
  deleteFoetus: async (foetusId) => {
    try {
      if (!foetusId) {
        throw new Error('ID thai nhi không hợp lệ');
      }

      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.userId) {
        throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
      }

      const response = await axiosInstance.delete(ENDPOINTS.FOETUS.DELETE(foetusId));
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xóa thai nhi:', error);
      throw {
        message: error.response?.data?.message || "Không thể xóa thai nhi",
        status: error.response?.status || 500
      };
    }
  }
};

export default foetusService;