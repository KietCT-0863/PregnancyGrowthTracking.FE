import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const reminderService = {
  // Tạo lịch nhắc nhở mới
  createReminder: async (reminderData) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      console.group("Reminder Creation - Initial Data");
      console.log("User Data:", userData);
      console.log("Input Reminder Data:", reminderData);
      console.groupEnd();

      if (!userData?.userId) {
        throw new Error("Vui lòng đăng nhập để thực hiện chức năng này");
      }

      // Tạo payload JSON
      const payload = {
        userId: userData.userId,
        date: reminderData.date,
        time: reminderData.time,
        title: reminderData.title,
        notification: reminderData.notification,
        reminderType: reminderData.reminderType,
      };

      console.group("Reminder Creation - Request Details");
      console.log("Request URL:", ENDPOINTS.REMINDER.CREATE);
      console.log("Request Payload:", JSON.stringify(payload, null, 2));
      console.log("Request Headers:", {
        "Content-Type": "application/json",
      });
      console.groupEnd();

      const response = await axiosInstance.post(
        ENDPOINTS.REMINDER.CREATE,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.group("Reminder Creation - Response");
      console.log("Response Status:", response.status);
      console.log("Response Data:", response.data);
      console.groupEnd();

      return response.data;
    } catch (error) {
      console.group("Reminder Creation - Error Details");
      console.error("Error Object:", error);
      console.error("Error Name:", error.name);
      console.error("Error Message:", error.message);
      console.error("Error Status:", error.response?.status);
      console.error("Error Response Data:", error.response?.data);
      console.error("Error Request Config:", {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
      });
      console.error("Stack Trace:", error.stack);
      console.groupEnd();

      throw {
        message: error.response?.data?.message || "Không thể tạo lịch nhắc nhở",
        status: error.response?.status || 500,
        details: error.response?.data || error.message,
      };
    }
  },

  // Lấy danh sách lịch nhắc nhở
  getReminderHistory: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.REMINDER.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching reminders:", error);
      throw {
        message:
          error.response?.data?.message ||
          "Không thể lấy danh sách lịch nhắc nhở",
        status: error.response?.status || 500,
      };
    }
  },

  // Xóa lịch nhắc nhở
  deleteReminder: async (remindId) => {
    try {
      const response = await axiosInstance.delete(
        ENDPOINTS.REMINDER.DELETE(remindId)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting reminder:", error);
      throw {
        message: error.response?.data?.message || "Không thể xóa lịch nhắc nhở",
        status: error.response?.status || 500,
      };
    }
  },

  // Cập nhật lịch nhắc nhở
  updateReminder: async (remindId, reminderData) => {
    try {
      // Tạo payload JSON thay vì FormData
      const payload = {
        date: reminderData.date,
        time: reminderData.time,
        title: reminderData.title,
        notification: reminderData.notification,
        reminderType: reminderData.reminderType,
      };

      const response = await axiosInstance.put(
        ENDPOINTS.REMINDER.UPDATE(remindId),
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating reminder:", error);
      throw {
        message:
          error.response?.data?.message || "Không thể cập nhật lịch nhắc nhở",
        status: error.response?.status || 500,
      };
    }
  },
};

export default reminderService;
