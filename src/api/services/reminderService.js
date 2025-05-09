import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const validateUserAuth = () => {
  const userData = JSON.parse(localStorage.getItem("userData"));
  if (!userData?.userId) {
    throw new Error("Vui lòng đăng nhập để thực hiện chức năng này");
  }
  return userData;
};

const handleApiError = (error, defaultMessage) => {
  throw {
    message: error.response?.data?.message || error.message || defaultMessage,
    status: error.response?.status || 500,
    details: error.response?.data
  };
};

const createRequestPayload = (userData, reminderData) => ({
  userId: parseInt(userData.userId),
  title: reminderData.title.trim(),
  date: reminderData.date,
  time: reminderData.time,
  notification: reminderData.notification || "",
  reminderType: reminderData.reminderType,
  isCompleted: false,
  isDeleted: false
});

const updateRequestPayload = (reminderData) => ({
  date: reminderData.date,
  time: reminderData.time,
  title: reminderData.title,
  notification: reminderData.notification || "",
  reminderType: reminderData.reminderType
});

const reminderService = {
  // Tạo lịch nhắc nhở mới
  createReminder: async (reminderData) => {
    try {
      const userData = validateUserAuth();
      const payload = createRequestPayload(userData, reminderData);
      
      const response = await axiosInstance.post(
        ENDPOINTS.REMINDER.CREATE,
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tạo lịch nhắc nhở");
    }
  },

  // Lấy danh sách lịch nhắc nhở
  getReminderHistory: async () => {
    try {
      console.log('DEBUG: Bắt đầu gọi API getReminderHistory');
      console.log('DEBUG: URL endpoint:', ENDPOINTS.REMINDER.LIST);
      
      const response = await axiosInstance.get(ENDPOINTS.REMINDER.LIST);
      
      console.log('DEBUG: API Status:', response.status);
      console.log('DEBUG: API Response data ban đầu:', response.data);
      
      // Chuyển đổi dữ liệu sang định dạng mong muốn
      const formattedData = Array.isArray(response.data) 
        ? response.data.map(item => ({
            remindId: item.remindId || item.id,
            date: item.date || "",
            time: item.time || "",
            title: item.title || "",
            notification: item.notification || "",
            reminderType: item.reminderType || "",
            location: item.location || "",
            isCompleted: item.isCompleted || false
          })) 
        : [];
      
      console.log('DEBUG: Dữ liệu sau khi format:', formattedData);
      
      return formattedData;
    } catch (error) {
      console.error('DEBUG: Lỗi khi gọi API getReminderHistory:', error);
      console.error('DEBUG: Response lỗi:', error.response?.data);
      console.error('DEBUG: Status lỗi:', error.response?.status);
      
      handleApiError(error, "Không thể lấy danh sách lịch nhắc nhở");
    }
  },

  // Xóa lịch nhắc nhở
  deleteReminder: async (remindId) => {
    try {
      if (!remindId) {
        throw new Error('ID lịch nhắc nhở không hợp lệ');
      }

      const response = await axiosInstance.delete(
        ENDPOINTS.REMINDER.DELETE(remindId)
      );

      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể xóa lịch nhắc nhở");
    }
  },

  // Cập nhật lịch nhắc nhở
  updateReminder: async (remindId, reminderData) => {
    try {
      if (!remindId) {
        throw new Error('ID lịch nhắc nhở không hợp lệ');
      }

      const payload = updateRequestPayload(reminderData);
      
      const response = await axiosInstance.put(
        ENDPOINTS.REMINDER.UPDATE(remindId),
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể cập nhật lịch nhắc nhở");
    }
  },
};

export default reminderService;
