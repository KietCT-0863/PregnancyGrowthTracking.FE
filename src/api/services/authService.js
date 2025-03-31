import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const data = response.data;

      // Lưu token và user data vào localStorage
      localStorage.setItem("token", data.token);
      const userData = {
        userName: data.userName,
        email: data.email,
        role: data.role,
        userId: data.userId,
        profileImageUrl: data.profileImageUrl,
        fullName: data.fullName,
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      
      // Đánh dấu phiên làm việc hiện tại
      sessionStorage.setItem("sessionActive", "true");

      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra token có còn hiệu lực không
  checkToken: async (token) => {
    try {
      if (!token) return false;
      
      // Vì có thể backend chưa triển khai endpoint này, chúng ta sẽ xử lý 2 trường hợp
      
      // Phương pháp 1: Gọi API kiểm tra token
      try {
        const response = await axiosInstance.get(
          ENDPOINTS.AUTH.CHECK_TOKEN,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Nếu API trả về thành công, kiểm tra isValid
        if (response?.data?.isValid === true) {
          return true;
        }
        
        return false;
      } catch (apiError) {
        // Nếu API không tồn tại hoặc lỗi server, chuyển sang phương pháp 2
        console.warn("Không thể gọi API ValidateToken, sử dụng phương pháp thay thế:", apiError.message);
      }
      
      // Phương pháp 2: Sử dụng API GetCurrentUser để kiểm tra token
      try {
        const userResponse = await axiosInstance.get(
          ENDPOINTS.USER.GET_CURRENT,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Nếu lấy được thông tin user, token vẫn còn hiệu lực
        if (userResponse.status === 200 && userResponse.data) {
          return true;
        }
        
        return false;
      } catch (userError) {
        // Nếu cả 2 phương pháp đều không hoạt động, token không còn hiệu lực
        console.error("Không thể xác thực token:", userError.message);
        return false;
      }
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("sessionActive");
    sessionStorage.clear();
  },
};

export default authService;
