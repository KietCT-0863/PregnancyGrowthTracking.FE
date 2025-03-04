import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const growthStatsService = {
  // Lấy dữ liệu tăng trưởng của thai nhi
  getGrowthData: async (foetusId) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.GROWTHDATA.GET_BY_FOETUS(foetusId));
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu tăng trưởng:', error);
      throw error;
    }
  },

  // Cập nhật chỉ số tăng trưởng
  updateGrowthStats: async (foetusId, statsData) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error('Vui lòng đăng nhập để thực hiện chức năng này');
      }

      // Đơn giản hóa, chỉ gửi POST request để tạo mới
      const requestData = {
        foetusId: foetusId,
        userId: userData.userId,
        age: Number(statsData.age),
        hc: Number(statsData.hc),
        ac: Number(statsData.ac),
        fl: Number(statsData.fl),
        efw: Number(statsData.efw)
      };

      console.log('Sending request with data:', requestData);

      // Luôn dùng CREATE endpoint
      const response = await axiosInstance.post(
        ENDPOINTS.GROWTHDATA.CREATE,
        requestData
      );

      console.log('Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateGrowthStats:', error);
      throw error;
    }
  }
};

export default growthStatsService; 