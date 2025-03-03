import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const VALID_CATEGORIES = [
  "french", "fiction", "english", "history", "magical",
  "american", "mystery", "crime", "love", "classic"
];

const blogService = {
  // Lấy danh sách blog
  getBlogs: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw {
        message: error.response?.data?.message || "Không thể tải danh sách bài viết",
        status: error.response?.status || 500
      };
    }
  },

  // Lấy chi tiết một blog
  getBlogById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching blog:', error);
      throw {
        message: error.response?.data?.message || "Không thể tải thông tin bài viết",
        status: error.response?.status || 500
      };
    }
  },

  // Tạo blog mới
  createBlog: async (blogData) => {
    try {
      // Validate dữ liệu
      if (!blogData.title?.trim() || !blogData.body?.trim()) {
        throw new Error("Tiêu đề và nội dung không được để trống");
      }

      // Format categories
      const formattedCategories = (blogData.categories || [])
        .filter(cat => VALID_CATEGORIES.includes(cat))
        .map(cat => ({ categoryName: cat }));

      const response = await axiosInstance.post(ENDPOINTS.BLOG.LIST, {
        title: blogData.title.trim(),
        body: blogData.body.trim(),
        categories: formattedCategories
      });

      return response.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw {
        message: error.response?.data?.message || error.message || "Lỗi khi tạo bài viết",
        status: error.response?.status || 500
      };
    }
  },

  // Cập nhật blog
  updateBlog: async (id, blogData) => {
    try {
      // Validate dữ liệu
      if (!id) throw new Error("ID bài viết không hợp lệ");

      // Format categories
      const formattedCategories = (blogData.categories || [])
        .filter(cat => VALID_CATEGORIES.includes(cat))
        .map(cat => ({ categoryName: cat }));

      // Gửi request PUT đến endpoint gốc với đầy đủ data
      const response = await axiosInstance.put(ENDPOINTS.BLOG.LIST, {
        id: parseInt(id),
        title: blogData.title,
        body: blogData.body,
        categories: formattedCategories
      });

      return response.data;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw {
        message: error.response?.data?.message || "Lỗi khi cập nhật bài viết",
        status: error.response?.status || 500
      };
    }
  },

  // Xóa blog
  deleteBlog: async (id) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.BLOG.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw {
        message: error.response?.data?.message || "Lỗi khi xóa bài viết",
        status: error.response?.status || 500
      };
    }
  }
};

export default blogService; 