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

      // Trường hợp đặc biệt: nếu đang ở trạng thái tải lại trang, luôn trả về true để duy trì phiên đăng nhập
      if (window.performance) {
        const navEntries = performance.getEntriesByType("navigation");
        if (navEntries.length > 0 && navEntries[0].type === "reload") {
          console.log("Đang tải lại trang, duy trì phiên đăng nhập");
          return true;
        }
      }

      // Vì có thể backend chưa triển khai endpoint này, chúng ta sẽ xử lý 2 trường hợp

      // Phương pháp 1: Gọi API kiểm tra token
      try {
        const response = await axiosInstance.get(ENDPOINTS.AUTH.CHECK_TOKEN, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Nếu API trả về thành công, kiểm tra isValid
        if (response?.data?.isValid === true) {
          return true;
        }

        // Nếu API trả về định dạng khác, xem như phương pháp này không hoạt động
        // chứ không đánh giá token là không hợp lệ
        console.log(
          "API CheckToken trả về định dạng không mong đợi:",
          response?.data
        );
      } catch (apiError) {
        // Nếu API không tồn tại hoặc lỗi server, chuyển sang phương pháp 2
        console.warn(
          "Không thể gọi API ValidateToken, sử dụng phương pháp thay thế:",
          apiError.message
        );
        // Không đánh giá token là không hợp lệ, chỉ chuyển sang phương pháp khác
      }

      // Phương pháp 2: Sử dụng API GetCurrentUser để kiểm tra token
      try {
        const userResponse = await axiosInstance.get(
          ENDPOINTS.USER.GET_CURRENT,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Nếu lấy được thông tin user, token vẫn còn hiệu lực
        if (userResponse.status === 200 && userResponse.data) {
          return true;
        }

        console.log("API GetCurrentUser không trả về dữ liệu người dùng");
        // Nếu API trả về lỗi nhưng không phải 401, có thể là lỗi server, không đánh giá token
        if (userResponse.status !== 401) {
          console.log(
            "API trả về lỗi không phải 401, xem như token có thể vẫn hợp lệ"
          );
          return true;
        }

        return false;
      } catch (userError) {
        // Nếu lỗi là 403 hoặc 500, có thể là do server hoặc quyền truy cập
        // không nhất thiết token đã hết hạn
        if (
          userError.response &&
          (userError.response.status === 403 ||
            userError.response.status === 500)
        ) {
          console.error("Lỗi server hoặc quyền truy cập:", userError.message);
          // Không đăng xuất người dùng khi gặp lỗi 403/500
          return true;
        }

        // Chỉ khi lỗi là 401 Unauthorized mới xác định token không hợp lệ
        if (userError.response && userError.response.status === 401) {
          console.error("Token không hợp lệ (401 Unauthorized)");
          return false;
        }

        // Các lỗi khác xem như không thể xác định, ưu tiên duy trì phiên làm việc
        console.error("Không thể xác thực token:", userError.message);
        return true;
      }
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      // Không đánh dấu token không hợp lệ khi có lỗi xảy ra
      return true;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("sessionActive");
    sessionStorage.clear();
  },
};

export default authService;
