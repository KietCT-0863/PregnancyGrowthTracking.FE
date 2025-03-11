import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const VALID_CATEGORIES = [
  "french", "fiction", "english", "history", "magical",
  "american", "mystery", "crime", "love", "classic"
];

const FILE_CONSTRAINTS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  validTypes: ['image/jpeg', 'image/png', 'image/jpg']
};

const handleApiError = (error, defaultMessage) => {
  throw {
    message: error.response?.data?.message || error.message || defaultMessage,
    status: error.response?.status || 500
  };
};

const validateFileUpload = (file) => {
  if (!file) throw new Error('Vui lòng chọn ảnh để tải lên');
  if (file.size > FILE_CONSTRAINTS.maxSize) {
    throw new Error('Kích thước ảnh không được vượt quá 5MB');
  }
  if (!FILE_CONSTRAINTS.validTypes.includes(file.type)) {
    throw new Error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
  }
};

const formatCategories = (categories) => {
  return (categories || [])
    .filter(cat => VALID_CATEGORIES.includes(cat))
    .map(cat => ({ categoryName: cat }));
};

const blogService = {
  // Lấy danh sách blog
  getBlogs: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.LIST);
      const blogs = response.data.posts;
      
      if (blogs && Array.isArray(blogs)) {
        await Promise.all(blogs.map(async (blog) => {
          try {
            blog.imageUrl = await blogService.getBlogPhoto(blog.id);
          } catch {
            blog.imageUrl = null;
          }
        }));
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tải danh sách bài viết");
    }
  },

  // Lấy chi tiết một blog
  getBlogById: async (id) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.DETAIL(id));
      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tải thông tin bài viết");
    }
  },

  // Tạo blog mới
  createBlog: async (blogData) => {
    try {
      if (!blogData.title?.trim() || !blogData.body?.trim()) {
        throw new Error("Tiêu đề và nội dung không được để trống");
      }

      const payload = {
        title: blogData.title.trim(),
        body: blogData.body.trim(),
        categories: formatCategories(blogData.categories)
      };

      const response = await axiosInstance.post(ENDPOINTS.BLOG.LIST, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo bài viết");
    }
  },

  // Cập nhật blog
  updateBlog: async (id, blogData) => {
    try {
      if (!id) throw new Error("ID bài viết không hợp lệ");

      const payload = {
        id: parseInt(id),
        title: blogData.title,
        body: blogData.body,
        categories: formatCategories(blogData.categories)
      };

      const response = await axiosInstance.put(ENDPOINTS.BLOG.LIST, payload);
      return response.data;
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật bài viết");
    }
  },

  // Xóa blog
  deleteBlog: async (id) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.BLOG.DELETE(id));
      return response.data;
    } catch (error) {
      handleApiError(error, "Lỗi khi xóa bài viết");
    }
  },

  // Thêm ảnh cho blog
  uploadBlogPhoto: async (blogId, file) => {
    try {
      if (!blogId) throw new Error('ID blog không hợp lệ');
      validateFileUpload(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        ENDPOINTS.BLOG.UPLOAD_PHOTO(blogId),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: (data) => data
        }
      );

      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể tải ảnh lên");
    }
  },

  // Cập nhật/thay thế ảnh cho blog
  replaceBlogPhoto: async (blogId, file) => {
    try {
      if (!blogId) throw new Error('ID blog không hợp lệ');
      validateFileUpload(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.put(
        ENDPOINTS.BLOG.REPLACE_PHOTO(blogId),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          transformRequest: (data) => data
        }
      );

      return response.data;
    } catch (error) {
      handleApiError(error, "Không thể cập nhật ảnh");
    }
  },

  getBlogPhoto: async (blogId) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.GET_PHOTO(blogId), {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch {
      return null;
    }
  },

  getTotalPosts: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.LIST);
      return response.data.posts?.length || 0;
    } catch (error) {
      handleApiError(error, "Không thể lấy tổng số bài viết");
    }
  },
};

export default blogService; 