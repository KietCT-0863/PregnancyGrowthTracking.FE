import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const paymentService = {
  createPayment: async (paymentData) => {
    try {
      const requestBody = {
        orderType: "vip", // Giá trị cố định
        orderDescription: "Thanh Toán hoá đơn", // Giá trị cố định
        name: paymentData.name,
        userId: paymentData.userId,
        membershipId: 2, // Giá trị cố định
      };

      const response = await axiosInstance.post(
        ENDPOINTS.PAYMENT.CREATE,
        requestBody
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTotalRevenue: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.PAYMENT.GET_TOTAL_REVENUE
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkPaymentResult: async (transactionNo) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.PAYMENT.CHECK_RESULT(transactionNo)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRevenueByMonth: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.PAYMENT.GET_REVENUE_BY_MONTH
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRevenueStats: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.PAYMENT.GET_REVENUE_STATS
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMonthlyRevenue: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.PAYMENT.GET_MONTHLY_REVENUE
      );

      const formattedData = response.data.map((item) => {
        return {
          month: `${item.month}/${item.year}`,
          revenue: item.monthlyRevenue,
          // Thêm phần trăm tăng trưởng nếu có tháng trước
          growthRate: 0, // Sẽ được tính toán sau
        };
      });

      // Tính toán phần trăm tăng trưởng
      formattedData.forEach((item, index) => {
        if (index > 0) {
          const prevRevenue = formattedData[index - 1].revenue;
          const currentRevenue = item.revenue;
          item.growthRate =
            ((currentRevenue - prevRevenue) / prevRevenue) * 100;
        }
      });

      console.log("Dữ liệu sau khi format:", formattedData);
      return formattedData;
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu theo tháng:", error);
      throw error;
    }
  },
};

export default paymentService;
