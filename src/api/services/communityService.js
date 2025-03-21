import axiosInstance from "../axiosConfig";
import { ENDPOINTS } from "../apiEndpoints";

// Kiểm tra environment (safe check)
const isDevelopment = () => {
  // Sử dụng hostname để kiểm tra môi trường phát triển
  try {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  } catch (e) {
    // Fallback trong trường hợp có lỗi
    return false;
  }
};

const handleApiError = (error, defaultMessage) => {
  console.error("API Error:", error);
  // Đảm bảo trả về một đối tượng lỗi có cấu trúc
  throw {
    message: error.response?.data?.message || error.message || defaultMessage,
    status: error.response?.status || 500,
    originalError: error,
  };
};

const communityService = {
  // Lấy danh sách bài viết
  getPosts: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.POSTS.LIST);
      console.log("API response data:", response.data);

      // Chuẩn hóa dữ liệu bài viết khi nhận từ API
      const normalizePostData = (posts) => {
        if (!Array.isArray(posts)) return [];

        return posts.map((post) => {
          // Chuẩn hóa cấu trúc postTags
          let normalizedTags = [];

          // Xử lý trường hợp API trả về postTags dưới nhiều dạng khác nhau
          if (post.postTags) {
            // Trường hợp 1: postTags là mảng các object {id, name}
            if (Array.isArray(post.postTags)) {
              normalizedTags = post.postTags.map((tag, index) => {
                if (typeof tag === "string") {
                  return { id: `tag_${index}`, name: tag };
                } else if (tag && typeof tag === "object") {
                  return {
                    id: tag.id || tag.tagId || `tag_${index}`,
                    name: tag.name || tag.tagName || "Tag " + index,
                  };
                }
                return { id: `tag_${index}`, name: "Unknown Tag" };
              });
            }
            // Trường hợp 2: postTags là string (comma-separated)
            else if (typeof post.postTags === "string") {
              normalizedTags = post.postTags.split(",").map((tag, index) => ({
                id: `tag_${index}`,
                name: tag.trim(),
              }));
            }
            // Trường hợp 3: postTags là object (không phải mảng)
            else if (typeof post.postTags === "object") {
              const entries = Object.entries(post.postTags);
              normalizedTags = entries.map(([key, value], index) => {
                if (typeof value === "string") {
                  return { id: key, name: value };
                } else if (value && typeof value === "object") {
                  return {
                    id: value.id || value.tagId || key,
                    name: value.name || value.tagName || `Tag ${index}`,
                  };
                }
                return { id: `tag_${index}`, name: key };
              });
            }
          }

          // Trả về bài viết đã được chuẩn hóa
          return {
            ...post,
            id:
              post.id ||
              `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postTags: normalizedTags,
          };
        });
      };

      // Kiểm tra và chuẩn hóa cấu trúc dữ liệu trả về
      const data = response.data;

      // Đảm bảo luôn trả về một mảng
      // Trường hợp API trả về mảng trực tiếp
      if (Array.isArray(data)) {
        return normalizePostData(data);
      }

      // Trường hợp API trả về object chứa mảng posts
      if (data && Array.isArray(data.posts)) {
        return normalizePostData(data.posts);
      }

      // Mock data khi API chưa ready hoặc không trả về dữ liệu đúng định dạng
      // Chỉ sử dụng cho môi trường development
      if (isDevelopment()) {
        console.warn("Sử dụng mock data cho chức năng Community");
        return normalizePostData([
          {
            id: "post1",
            title: "Chia sẻ kinh nghiệm mang thai tháng đầu",
            body: "Tôi muốn chia sẻ với mọi người về trải nghiệm của mình trong tháng đầu tiên mang thai. Đây là lần đầu tiên, và tôi đã trải qua rất nhiều cảm xúc khác nhau.",
            createdDate: new Date().toISOString(),
            createdBy: "Nguyễn Thị Hương",
            postTags: [
              { id: "tag1", name: "KinhNghiệm" },
              { id: "tag2", name: "ThángĐầu" },
            ],
            postImageUrl: "https://placehold.co/600x400",
          },
          {
            id: "post2",
            title: "Hỏi về dinh dưỡng cho bà bầu",
            body: "Các mẹ ơi, mình đang mang thai tuần 20 và đang tìm hiểu về chế độ dinh dưỡng tốt nhất. Mọi người có lời khuyên gì không? Những thực phẩm nào nên ăn và nên tránh?",
            createdDate: new Date().toISOString(),
            createdBy: "Trần Thanh Thảo",
            postTags: [
              { id: "tag3", name: "DinhDưỡng" },
              { id: "tag4", name: "HỏiĐáp" },
            ],
          },
        ]);
      }

      // Trường hợp khác, trả về mảng rỗng để tránh lỗi
      console.warn("Cấu trúc dữ liệu API không như mong đợi:", data);
      return [];
    } catch (error) {
      console.error("Error in getPosts:", error);
      // Trả về mảng rỗng thay vì throw exception để tránh crash UI
      return [];
    }
  },

  // Tạo bài viết mới
  createPost: async (formData) => {
    try {
      // FormData đã được tạo trong component, không cần kiểm tra ở đây vì
      // các trường required đã được xác thực bởi form trong UI

      console.log("FormData được gửi:");
      // In ra tất cả các trường trong FormData để debug
      if (formData instanceof FormData) {
        for (let pair of formData.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }
      } else {
        console.log(formData);
      }

      // Kiểm tra xem formData có phải là instance của FormData không
      if (!(formData instanceof FormData)) {
        // Nếu không phải FormData, chuyển đổi object thành FormData
        const newFormData = new FormData();
        if (formData.title) newFormData.append("title", formData.title.trim());
        if (formData.body) newFormData.append("body", formData.body.trim());

        if (formData.postImage) {
          newFormData.append("postImage", formData.postImage);
        }

        // Xử lý tags nếu có
        if (formData.tags && formData.tags.length > 0) {
          const tagsArray = formData.tags.map((tag) => ({
            tagName: tag.trim(),
          }));
          newFormData.append("postTags", JSON.stringify(tagsArray));
        }

        formData = newFormData;
      }

      // Xử lý nhất quán cho postTags
      const postTagsStr = formData.get("postTags");
      let postTags = [];

      if (postTagsStr) {
        try {
          // Parse JSON string thành object
          postTags = JSON.parse(postTagsStr);
          console.log("Parsed tags:", postTags);
        } catch (err) {
          console.error("Lỗi parse tags JSON:", err);
        }
      }

      // Tạo payload cho request
      const payload = {
        title: formData.get("title"),
        body: formData.get("body"),
      };

      // Thêm tags vào payload nếu có
      if (postTags.length > 0) {
        payload.postTags = postTags;
      }

      console.log("Payload cuối cùng gửi lên server:", payload);

      // Nếu có file ảnh, gửi dưới dạng multipart/form-data
      if (formData.get("postImage")) {
        const multipartFormData = new FormData();

        // Thêm các trường cơ bản
        multipartFormData.append("title", payload.title);
        multipartFormData.append("body", payload.body);
        multipartFormData.append("postImage", formData.get("postImage"));

        // Thêm tags vào FormData theo cấu trúc backend mong muốn
        if (postTags.length > 0) {
          multipartFormData.append("postTags", JSON.stringify(postTags));
        }

        console.log("Gửi multipart request với ảnh");
        const response = await axiosInstance.post(
          ENDPOINTS.POSTS.CREATE,
          multipartFormData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return response.data;
      } else {
        // Không có ảnh, gửi JSON data
        console.log("Gửi JSON request không có ảnh");
        const response = await axiosInstance.post(
          ENDPOINTS.POSTS.CREATE,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        return response.data;
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi tạo bài viết");
    }
  },

  // Cập nhật bài viết
  updatePost: async (postData) => {
    try {
      if (!postData.id) {
        throw new Error("ID bài viết không được để trống");
      }

      if (!postData.title?.trim() || !postData.body?.trim()) {
        throw new Error("Tiêu đề và nội dung không được để trống");
      }

      let postTags = [];
      if (postData instanceof FormData) {
        // Nếu postData là FormData
        const postTagsStr = postData.get("postTags");
        if (postTagsStr) {
          try {
            postTags = JSON.parse(postTagsStr);
          } catch (err) {
            console.error("Lỗi parse tags JSON:", err);
          }
        }

        // Chuẩn bị payload cho FormData
        const payload = {
          id: postData.get("id") || postData.id,
          title: postData.get("title"),
          body: postData.get("body"),
        };

        if (postTags.length > 0) {
          payload.postTags = postTags;
        }

        console.log("Payload cập nhật bài viết:", payload);
        const response = await axiosInstance.put(
          ENDPOINTS.POSTS.UPDATE,
          payload
        );
        return response.data;
      } else {
        // Nếu postData là object thông thường
        // Chuẩn bị dữ liệu để gửi đi
        const payload = {
          id: postData.id,
          title: postData.title.trim(),
          body: postData.body.trim(),
        };

        // Xử lý tags từ các nguồn khác nhau
        if (postData.tags && Array.isArray(postData.tags)) {
          payload.postTags = postData.tags.map((tag) => ({
            tagName:
              typeof tag === "string" ? tag.trim() : tag.tagName || tag.name,
          }));
        } else if (postData.postTags && Array.isArray(postData.postTags)) {
          payload.postTags = postData.postTags.map((tag) => ({
            tagName:
              typeof tag === "string" ? tag.trim() : tag.tagName || tag.name,
          }));
        }

        console.log("Dữ liệu cập nhật gửi đi:", payload);
        const response = await axiosInstance.put(
          ENDPOINTS.POSTS.UPDATE,
          payload
        );
        return response.data;
      }
    } catch (error) {
      handleApiError(error, "Lỗi khi cập nhật bài viết");
    }
  },

  // Xóa bài viết
  deletePost: async (postId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      await axiosInstance.delete(ENDPOINTS.POSTS.DELETE(postId));
      return { success: true, message: "Xóa bài viết thành công" };
    } catch (error) {
      handleApiError(error, "Lỗi khi xóa bài viết");
    }
  },
};

export default communityService;
