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
        membershipId: 2 // Giá trị cố định
      };

      const response = await axiosInstance.post(ENDPOINTS.PAYMENT.CREATE, requestBody);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTotalRevenue: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PAYMENT.GET_TOTAL_REVENUE);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkPaymentResult: async (transactionNo) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PAYMENT.CHECK_RESULT(transactionNo));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRevenueByMonth: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PAYMENT.GET_REVENUE_BY_MONTH);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getRevenueStats: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PAYMENT.GET_REVENUE_STATS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default paymentService; 