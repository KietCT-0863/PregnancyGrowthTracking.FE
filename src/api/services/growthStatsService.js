import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const growthStatsService = {
  // Lấy dữ liệu tăng trưởng của thai nhi
  getGrowthData: async (foetusId) => {
    try {
      // Kiểm tra tham số
      if (!foetusId) {
        throw new Error("foetusId is required");
      }
      
      // Gọi API
      const response = await axiosInstance.get(
        ENDPOINTS.GROWTHDATA.GET_BY_FOETUS(foetusId)
      );
      
      return response.data;
    } catch (error) {
      // Xử lý lỗi và trả về mảng rỗng
      return [];
    }
  },

  // Tạo mới/Cập nhật chỉ số tăng trưởng
  updateGrowthStats: async (foetusId, statsData) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData?.userId) {
        throw new Error("Vui lòng đăng nhập để thực hiện chức năng này");
      }

      // Sử dụng measurementDate từ tham số nếu có, nếu không mới dùng thời gian hiện tại
      const measurementDate = statsData.measurementDate || new Date().toISOString();

      const requestData = {
        foetusId: foetusId,
        userId: userData.userId,
        age: Number(statsData.age),
        hc: Number(statsData.hc) || 0,
        ac: Number(statsData.ac) || 0,
        fl: Number(statsData.fl) || 0,
        efw: Number(statsData.efw) || 0,
        measurementDate: measurementDate,
      };

      const response = await axiosInstance.post(
        ENDPOINTS.GROWTHDATA.CREATE(foetusId),
        requestData
      );

      return {
        success: true,
        data: response.data,
        message: "Cập nhật chỉ số thành công",
      };
    } catch (error) {
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
      // Thử gọi API với URL được định nghĩa
      const response = await axiosInstance.get(
        ENDPOINTS.GROWTHDATA.GET_RANGES(age)
      );
      
      return response.data;
    } catch (error) {
      // Trả về dữ liệu có cấu trúc giống với API thật
      return {
        hc: { minRange: 100, maxRange: 300 },
        ac: { minRange: 100, maxRange: 300 },
        fl: { minRange: 10, maxRange: 60 },
        efw: { minRange: 100, maxRange: 3000 }
      };
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
      throw {
        message: error.response?.data?.message || "Không thể lấy dữ liệu",
        status: error.response?.status || 500
      };
    }
  },
};

export default growthStatsService;
