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
      console.log(`Đang lấy comments cho bài viết ID: ${postId}`);

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

      // Phân tích cấu trúc cha-con
      let rootComments = 0;
      let replyComments = 0;

      if (Array.isArray(commentsData)) {
        commentsData.forEach((comment) => {
          if (comment.parentCommentId) {
            replyComments++;
            console.log(
              `Comment ID ${comment.commentId} là reply cho comment ID ${comment.parentCommentId}`
            );
          } else {
            rootComments++;
            console.log(`Comment ID ${comment.commentId} là comment gốc`);
          }
        });

        console.log(
          `Tổng số: ${rootComments} comment gốc, ${replyComments} replies`
        );
      }

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
      // Kiểm tra dữ liệu với tên tham số viết hoa chữ cái đầu
      if (!formData.get("PostId") || !formData.get("Comment")?.trim()) {
        throw new Error(
          "ID bài viết và nội dung bình luận không được để trống"
        );
      }

      console.log("Tạo comment mới với FormData:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0] + ": " + (pair[0] === "Image" ? "File hình ảnh" : pair[1])
        );
      }

      // Log riêng thông tin về ParentCommentId để debug
      const parentId = formData.get("ParentCommentId");
      const isReply = parentId && parentId !== "0";
      console.log(
        `ParentCommentId: ${parentId || 0} (${
          isReply ? "Đây là reply" : "Đây là comment gốc"
        })`
      );

      // Log URL cụ thể đang gọi để debug
      const apiUrl = ENDPOINTS.COMMENTS.CREATE_WITH_IMAGE;
      console.log("API URL để tạo comment:", apiUrl);
      console.log("Method: POST, Content-Type: multipart/form-data");

      try {
        const response = await axiosInstance.post(apiUrl, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Kết quả từ API khi tạo comment:", response.data);
        return response.data;
      } catch (reqError) {
        console.error("Chi tiết lỗi khi gọi API:", {
          status: reqError.response?.status,
          statusText: reqError.response?.statusText,
          data: reqError.response?.data,
          method: reqError.config?.method,
          url: reqError.config?.url,
        });

        // Nếu gặp lỗi 405 Method Not Allowed
        if (reqError.response?.status === 405) {
          console.error(
            "Lỗi 405 Method Not Allowed - API không chấp nhận phương thức hoặc định dạng dữ liệu"
          );

          if (isReply) {
            console.log(
              "Đây là reply comment, thử chuyển sang JSON và/hoặc tạm bỏ hình ảnh"
            );

            // Chuyển đổi FormData sang JSON object
            const jsonData = {
              PostId: parseInt(formData.get("PostId"), 10),
              Comment: formData.get("Comment"),
              ParentCommentId: parseInt(parentId, 10),
            };

            console.log("Thử gửi dưới dạng JSON:", jsonData);

            try {
              // Thử gửi dưới dạng JSON
              const jsonResponse = await axiosInstance.post(apiUrl, jsonData, {
                headers: {
                  "Content-Type": "application/json",
                },
              });
              console.log("Tạo reply thành công với JSON:", jsonResponse.data);
              return jsonResponse.data;
            } catch (jsonError) {
              console.error("Vẫn gặp lỗi khi gửi JSON:", {
                status: jsonError.response?.status,
                statusText: jsonError.response?.statusText,
                data: jsonError.response?.data,
              });

              // Thử PUT method
              try {
                console.log("Thử gửi dùng PUT method với JSON:", jsonData);
                const putResponse = await axiosInstance.put(apiUrl, jsonData, {
                  headers: {
                    "Content-Type": "application/json",
                  },
                });
                console.log(
                  "Tạo reply thành công với PUT và JSON:",
                  putResponse.data
                );
                return putResponse.data;
              } catch (putError) {
                console.error("Vẫn gặp lỗi khi dùng PUT với JSON:", putError);

                // Thử thêm một endpoint khác /Comments/Reply
                try {
                  console.log("Thử endpoint /Comments/Reply...");
                  const replyResponse = await axiosInstance.post(
                    "/Comments/Reply",
                    jsonData,
                    {
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  console.log(
                    "Tạo reply thành công với endpoint /Comments/Reply:",
                    replyResponse.data
                  );
                  return replyResponse.data;
                } catch (replyError) {
                  console.error(
                    "Không thể tạo reply với mọi phương pháp đã thử:",
                    replyError
                  );
                  throw replyError;
                }
              }
            }
          }
        }

        throw reqError;
      }
    } catch (error) {
      console.error("Lỗi khi tạo comment:", error);
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
