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

      // Log dữ liệu đầu vào
      console.log("Input statsData:", statsData);
      console.log("FoetusId:", foetusId);
      console.log("UserData:", userData);

      // Validate tuần thai
      if (!statsData.age || statsData.age < 0 || statsData.age > 42) {
        throw new Error("Tuần tuổi thai nhi không hợp lệ (0-42 tuần)");
      }

      // Validate các chỉ số
      const measurements = ["hc", "ac", "fl", "efw"];
      measurements.forEach((measure) => {
        if (statsData[measure] && statsData[measure] < 0) {
          throw new Error(`Chỉ số ${measure.toUpperCase()} phải là số dương`);
        }
      });

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

      console.log("Sending request:", {
        url: ENDPOINTS.GROWTHDATA.CREATE(foetusId),
        data: requestData,
      });

      // Đổi từ PUT sang POST
      const response = await axiosInstance.post(
        ENDPOINTS.GROWTHDATA.CREATE(foetusId),
        requestData
      );

      return response.data;
    } catch (error) {
      // Log chi tiết lỗi
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
      });
      throw error;
    }
  },
};

export default growthStatsService;
