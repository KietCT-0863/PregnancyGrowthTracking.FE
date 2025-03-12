import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const userManagementService = {
  // Lấy danh sách users
  getUsers: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.USER_MANAGEMENT.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw {
        message:
          error.response?.data?.message || "Không thể tải danh sách người dùng",
        status: error.response?.status || 500,
      };
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      if (!userData.userName || !userData.email || !userData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc");
      }
      const response = await axiosInstance.post(
        ENDPOINTS.USER_MANAGEMENT.CREATE,
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw {
        message:
          error.response?.data?.message || "Không thể tạo người dùng mới",
        status: error.response?.status || 500,
      };
    }
  },

  // Cập nhật user
  updateUser: async (id, userData) => {
    try {
      if (!id) throw new Error("ID người dùng không hợp lệ");

      // Log để debug chi tiết
      console.group("Update User Details");
      console.log("User ID:", id);
      console.log("Update Data:", JSON.stringify(userData, null, 2));
      console.groupEnd();

      const response = await axiosInstance.put(
        ENDPOINTS.USER_MANAGEMENT.UPDATE(id),
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      // Log chi tiết lỗi
      console.group("Update User Error");
      console.error("Error Details:", {
        id,
        userData,
        errorResponse: error.response?.data,
        errorMessage: error.message
      });
      console.groupEnd();
      
      // Ném lỗi với message cụ thể
      if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Dữ liệu không hợp lệ");
      }
      
      throw new Error("Không thể cập nhật thông tin người dùng");
    }
  },

  // Xóa user
  deleteUser: async (id) => {
    try {
      if (!id) throw new Error("ID người dùng không hợp lệ");
      const response = await axiosInstance.delete(
        ENDPOINTS.USER_MANAGEMENT.DELETE(id)
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw {
        message: error.response?.data?.message || "Không thể xóa người dùng",
        status: error.response?.status || 500,
      };
    }
  },

  getTotalUsers: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.USER_MANAGEMENT.GET_TOTAL_USERS
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching total users:", error);
      throw {
        message:
          error.response?.data?.message || "Không thể lấy tổng số người dùng",
        status: error.response?.status || 500,
      };
    }
  },

  getMonthlyUserCount: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.USER_MANAGEMENT.GET_MONTHLY_USERS
      );
      console.log("Raw response:", response.data);

      // Format dữ liệu cho biểu đồ theo cấu trúc mới
      const formattedData = response.data.map((item) => ({
        month: `${item.month}/${item.year}`, // Format tháng/năm
        users: parseInt(item.monthlyUsers || 0), // Lấy monthlyUsers thay vì users
        growthRate: 0,
      }));

      // Tính tỷ lệ tăng trưởng
      formattedData.forEach((item, index) => {
        if (index > 0) {
          const prevUsers = formattedData[index - 1].users;
          const currentUsers = item.users;
          if (prevUsers > 0) {
            item.growthRate = ((currentUsers - prevUsers) / prevUsers) * 100;
          }
        }
      });

      console.log("Formatted data:", formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching monthly user count:", error);
      throw {
        message:
          error.response?.data?.message ||
          "Không thể lấy số liệu người dùng theo tháng",
        status: error.response?.status || 500,
      };
    }
  },
};

export default userManagementService;
