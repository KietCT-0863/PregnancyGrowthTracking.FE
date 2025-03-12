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
      console.log("Fetching foetus list...");
      const response = await axiosInstance.get(ENDPOINTS.FOETUS.LIST);
      console.log("Foetus list response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching foetus list:", {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
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
      console.group("Creating Foetus");
      // Kiểm tra user
      const userData = validateUserAuth();
      console.log("User data:", userData);
      
      // Format payload
      const payload = {
        name: foetusData.name,
        gender: foetusData.gender,
        userId: userData.userId
      };

      console.log("Request payload:", payload);
      console.log("API endpoint:", ENDPOINTS.FOETUS.LIST);
      console.log("Headers:", {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      });

      const response = await axiosInstance.post(ENDPOINTS.FOETUS.LIST, payload);
      console.log("API Response:", response.data);
      console.groupEnd();
      return response.data;
    } catch (error) {
      console.group("Create Foetus Error");
      console.error("API Error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      console.log("Original request data:", foetusData);
      console.groupEnd();

      // Ném lỗi với thông tin chi tiết hơn
      throw {
        message: error.response?.data?.message || "Không thể tạo thai nhi mới",
        status: error.response?.status || 500,
        details: error.response?.data
      };
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