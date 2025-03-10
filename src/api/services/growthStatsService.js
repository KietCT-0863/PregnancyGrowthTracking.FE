import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const growthStatsService = {
  // Lấy dữ liệu tăng trưởng của thai nhi
  getGrowthData: async (foetusId) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.GROWTHDATA.GET_BY_FOETUS(foetusId)
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tăng trưởng:", error);
      throw error;
    }
  },

  // Tạo mới/Cập nhật chỉ số tăng trưởng
  updateGrowthStats: async (foetusId, statsData) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.userId) {
        throw new Error("Vui lòng đăng nhập để thực hiện chức năng này");
      }

      // Log chi tiết dữ liệu đầu vào
      console.group("Growth Stats Update - Input Data");
      console.log("Stats Data:", {
        foetusId,
        userId: userData.userId,
        ...statsData,
      });
      console.groupEnd();

      const requestData = {
        foetusId: foetusId,
        userId: userData.userId,
        age: Number(statsData.age),
        hc: Number(statsData.hc) || 0,
        ac: Number(statsData.ac) || 0,
        fl: Number(statsData.fl) || 0,
        efw: Number(statsData.efw) || 0,
        measurementDate: new Date().toISOString(),
      };

      // Log request details
      console.group("Growth Stats Update - Request");
      console.log("URL:", ENDPOINTS.GROWTHDATA.CREATE(foetusId));
      console.log("Request Data:", requestData);
      console.groupEnd();

      const response = await axiosInstance.post(
        ENDPOINTS.GROWTHDATA.CREATE(foetusId),
        requestData
      );

      // Log response details
      console.group("Growth Stats Update - Response");
      console.log("Status:", response.status);
      console.log("Status Text:", response.statusText);
      console.log("Response Data:", response.data);
      console.groupEnd();

      return {
        success: true,
        data: response.data,
        message: "Cập nhật chỉ số thành công",
      };
    } catch (error) {
      // Log error details
      console.group("Growth Stats Update - Error");
      console.error("Error Type:", error.name);
      console.error("Error Message:", error.message);
      console.error("Response Status:", error.response?.status);
      console.error("Response Data:", error.response?.data);
      console.groupEnd();

      throw {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status,
      };
    }
  },

  // Thêm method để lấy ranges từ BE
  getGrowthRanges: async (age) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.GROWTHDATA.GET_RANGES(age)
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy khoảng chuẩn:", error);
      throw error;
    }
  },
};

export default growthStatsService;
