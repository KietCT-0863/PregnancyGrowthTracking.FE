import axios from "axios";
import { BASE_URL } from "../apiEndpoints";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Xử lý FormData
    if (config.data instanceof FormData) {
      // KHÔNG thiết lập Content-Type cho FormData, để Axios và browser tự xử lý
      delete config.headers["Content-Type"];
      
      // Không transform data khi là FormData
      config.transformRequest = [(data) => data];
      
      // Thêm log để debug
      console.log('Sending FormData request:', {
        url: config.url,
        method: config.method,
        hasFile: Array.from(config.data.entries()).some(entry => 
          entry[1] instanceof File || entry[1] instanceof Blob
        )
      });
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Thêm xử lý lỗi server
    if (error.response?.status === 500) {
      return Promise.reject({
        message: "Lỗi server, vui lòng thử lại sau",
        ...error,
      });
    }

    // Thêm xử lý timeout
    if (error.code === "ECONNABORTED") {
      return Promise.reject({
        message: "Yêu cầu đã hết thời gian, vui lòng thử lại",
        ...error,
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
