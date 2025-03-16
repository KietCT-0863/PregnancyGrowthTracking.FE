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

  // Thêm method để lấy lịch sử cảnh báo
  getAlertHistory: async (foetusId) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.GROWTHDATA.GET_BY_FOETUS(foetusId)
      );
      
      // Xử lý dữ liệu để lọc ra các cảnh báo
      const data = response.data;
      if (!Array.isArray(data)) return [];
      
      const alertHistory = data
        .map(record => {
          const alerts = [];
          
          // Kiểm tra HC
          if (record.hc && record.hc.isAlert === true) {
            alerts.push({
              measure: 'HC',
              value: record.hc.value,
              minRange: record.hc.minRange,
              maxRange: record.hc.maxRange,
              date: record.date || record.measurementDate,
              age: record.age
            });
          }
          
          // Kiểm tra AC
          if (record.ac && record.ac.isAlert === true) {
            alerts.push({
              measure: 'AC',
              value: record.ac.value,
              minRange: record.ac.minRange,
              maxRange: record.ac.maxRange,
              date: record.date || record.measurementDate,
              age: record.age
            });
          }
          
          // Kiểm tra FL
          if (record.fl && record.fl.isAlert === true) {
            alerts.push({
              measure: 'FL',
              value: record.fl.value,
              minRange: record.fl.minRange,
              maxRange: record.fl.maxRange,
              date: record.date || record.measurementDate,
              age: record.age
            });
          }
          
          // Kiểm tra EFW
          if (record.efw && record.efw.isAlert === true) {
            alerts.push({
              measure: 'EFW',
              value: record.efw.value,
              minRange: record.efw.minRange,
              maxRange: record.efw.maxRange,
              date: record.date || record.measurementDate,
              age: record.age
            });
          }
          
          if (alerts.length > 0) {
            return {
              date: record.date || record.measurementDate,
              age: record.age,
              alerts: alerts
            };
          }
          
          return null;
        })
        .filter(Boolean) // Lọc bỏ các giá trị null
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo thời gian mới nhất
      
      return alertHistory;
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử cảnh báo:", error);
      throw error;
    }
  },
};

export default growthStatsService;
