import axiosInstance from "../axiosConfig";
import { ENDPOINTS } from "../apiEndpoints";

const handleApiError = (error, defaultMessage) => {
  console.error("API Error:", error);
  throw {
    message: error.response?.data?.message || error.message || defaultMessage,
    status: error.response?.status || 500,
    originalError: error,
  };
};

const commentService = {
  // Lấy tất cả comments
  getComments: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.COMMENTS.LIST);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  // Lấy comments cho một bài viết cụ thể
  getCommentsByPostId: async (postId) => {
    try {
      // Tự filter dữ liệu trên client vì API không có endpoint riêng để lấy theo postId
      const response = await axiosInstance.get(ENDPOINTS.COMMENTS.LIST);
      const allComments = response.data;

      // Filter comments theo postId
      return Array.isArray(allComments)
        ? allComments.filter((comment) => comment.postId === postId)
        : [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  },

  // Tạo comment mới
  createComment: async (commentData) => {
    try {
      if (!commentData.postId || !commentData.comment?.trim()) {
        throw new Error(
          "ID bài viết và nội dung bình luận không được để trống"
        );
      }

      const payload = {
        postId: commentData.postId,
        comment: commentData.comment.trim(),
      };

      console.log("Tạo comment mới:", payload);
      const response = await axiosInstance.post(
        ENDPOINTS.COMMENTS.CREATE,
        payload
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo bình luận");
    }
  },

  // Cập nhật comment
  updateComment: async (commentId, commentText) => {
    try {
      if (!commentId) {
        throw new Error("ID bình luận không được để trống");
      }

      if (!commentText?.trim()) {
        throw new Error("Nội dung bình luận không được để trống");
      }

      const payload = {
        comment: commentText.trim(),
      };

      console.log(`Cập nhật comment ID ${commentId}:`, payload);
      const response = await axiosInstance.put(
        ENDPOINTS.COMMENTS.UPDATE(commentId),
        payload
      );
      return response.data;
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật bình luận");
    }
  },

  // Xóa comment
  deleteComment: async (commentId) => {
    try {
      if (!commentId) {
        throw new Error("ID bình luận không được để trống");
      }

      await axiosInstance.delete(ENDPOINTS.COMMENTS.DELETE(commentId));
      return { success: true, message: "Xóa bình luận thành công" };
    } catch (error) {
      handleApiError(error, "Lỗi khi xóa bình luận");
    }
  },
};

export default commentService;
