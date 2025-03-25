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
      // Sử dụng API endpoint mới để lấy comments cho một bài viết
      const response = await axiosInstance.get(
        `${ENDPOINTS.COMMENTS.LIST}?postId=${postId}`
      );

      // Kiểm tra và xử lý dữ liệu trả về
      const commentsData = response.data;
      console.log(
        `Nhận được ${
          commentsData.length || 0
        } comments từ API cho post ${postId}:`,
        commentsData
      );

      // Sắp xếp comments: comments gốc trước, sau đó là replies
      if (Array.isArray(commentsData)) {
        const sortedComments = [...commentsData].sort((a, b) => {
          // Nếu a là comment gốc và b là reply, a sẽ lên trước
          if (!a.parentCommentId && b.parentCommentId) return -1;
          // Nếu a là reply và b là comment gốc, b sẽ lên trước
          if (a.parentCommentId && !b.parentCommentId) return 1;
          // Nếu cả hai đều là comment gốc hoặc cả hai đều là reply, sắp xếp theo thời gian
          return new Date(b.createdDate) - new Date(a.createdDate);
        });

        return sortedComments;
      }

      return Array.isArray(commentsData) ? commentsData : [];
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  },

  // Tạo comment mới không có ảnh (legacy)
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

  // Tạo comment mới (có ảnh hoặc trả lời comment khác)
  createCommentWithImage: async (formData) => {
    try {
      if (!formData.get("postId") || !formData.get("comment")?.trim()) {
        throw new Error(
          "ID bài viết và nội dung bình luận không được để trống"
        );
      }

      console.log("Tạo comment mới với FormData:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      // Đảm bảo tên trường image đúng (nếu API yêu cầu tên khác)
      if (formData.get("image")) {
        // Nếu API yêu cầu tên trường là 'commentImage' thay vì 'image'
        const imageFile = formData.get("image");
        formData.append("commentImage", imageFile);
        console.log("Đã thêm file hình ảnh dưới tên trường 'commentImage'");
      }

      const response = await axiosInstance.post(
        ENDPOINTS.COMMENTS.CREATE_WITH_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Log chi tiết response để xem cấu trúc dữ liệu trả về
      console.log("Response từ API khi tạo comment:", response.data);

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
