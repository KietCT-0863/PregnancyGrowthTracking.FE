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
      // Thêm xử lý ảnh cho mỗi blog
      const blogs = response.data.posts;
      if (blogs && Array.isArray(blogs)) {
        for (let blog of blogs) {
          try {
            const photoUrl = await blogService.getBlogPhoto(blog.id);
            blog.imageUrl = photoUrl;
          } catch (error) {
            console.error(`Error loading photo for blog ${blog.id}:`, error);
            blog.imageUrl = null;
          }
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw error;
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
  },

  // Thêm ảnh cho blog
  uploadBlogPhoto: async (blogId, file) => {
    try {
      if (!blogId) {
        throw new Error('ID blog không hợp lệ');
      }

      if (!file) {
        throw new Error('Vui lòng chọn ảnh để tải lên');
      }

      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước ảnh không được vượt quá 5MB');
      }

      // Kiểm tra định dạng file
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading photo for blogId:', blogId);

      const response = await axiosInstance.post(
        ENDPOINTS.BLOG.UPLOAD_PHOTO(blogId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          transformRequest: (data) => data // Không transform FormData
        }
      );

      console.log('Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading blog photo:', error);
      throw {
        message: error.response?.data?.message || error.message || "Không thể tải ảnh lên",
        status: error.response?.status || 500
      };
    }
  },

  // Cập nhật/thay thế ảnh cho blog
  replaceBlogPhoto: async (blogId, file) => {
    try {
      if (!blogId) {
        throw new Error('ID blog không hợp lệ');
      }

      if (!file) {
        throw new Error('Vui lòng chọn ảnh để tải lên');
      }

      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Kích thước ảnh không được vượt quá 5MB');
      }

      // Kiểm tra định dạng file
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Replacing photo for blogId:', blogId);

      const response = await axiosInstance.put(
        ENDPOINTS.BLOG.REPLACE_PHOTO(blogId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          transformRequest: (data) => data // Không transform FormData
        }
      );

      console.log('Replace response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error replacing blog photo:', error);
      throw {
        message: error.response?.data?.message || error.message || "Không thể cập nhật ảnh",
        status: error.response?.status || 500
      };
    }
  },

  getBlogPhoto: async (blogId) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.BLOG.GET_PHOTO(blogId), {
        responseType: 'blob'
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching blog photo:', error);
      return null;
    }
  },
};

export default blogService; 