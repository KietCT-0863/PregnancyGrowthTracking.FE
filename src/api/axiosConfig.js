import axios from "axios";

const BASE_URL =
  "https://pregnancy-growth-tracking-web-api-a6hxfqhsenaagthw.australiasoutheast-01.azurewebsites.net/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý token hết hạn (status 401)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Thêm logic refresh token ở đây nếu cần
      console.warn("Token hết hạn hoặc không hợp lệ");
      
      // Không tự động chuyển hướng đến login, chỉ xóa token nếu hết hạn
      localStorage.removeItem("token");
      
      // Thêm flag để component biết đây là lỗi xác thực
      error.isAuthError = true;
    }

    // Trả về lỗi để component có thể xử lý (hiển thị thông báo hoặc chuyển hướng)
    return Promise.reject(error);
  }
);

export default axiosInstance;
