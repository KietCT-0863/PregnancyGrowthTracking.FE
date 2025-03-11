import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const validateUserAuth = () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData?.userId) {
    throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
  }
  return userData;
};

const handleApiError = (error, defaultMessage) => {
  throw {
    message: error.response?.data?.message || defaultMessage,
    status: error.response?.status || 500
  };
};

const foetusService = {
  // Lấy danh sách thai nhi
  getFoetusList: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FOETUS.LIST);
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách thai nhi");
    }
  },

  // Lấy chi tiết một thai nhi
  getFoetusById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.FOETUS.DETAIL(id));
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tải thông tin thai nhi");
    }
  },

  // Tạo mới thai nhi
  createFoetus: async (foetusData) => {
    try {
      const userData = validateUserAuth();
      
      const payload = {
        name: foetusData.name,
        gender: foetusData.gender,
        userId: userData.userId
      };

      const response = await axiosInstance.post(ENDPOINTS.FOETUS.LIST, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tạo thai nhi mới");
    }
  },

  // Xóa thai nhi
  deleteFoetus: async (foetusId) => {
    try {
      if (!foetusId) {
        throw new Error('ID thai nhi không hợp lệ');
      }

      validateUserAuth();
      const response = await axiosInstance.delete(ENDPOINTS.FOETUS.DELETE(foetusId));
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể xóa thai nhi");
    }
  }
};

export default foetusService;