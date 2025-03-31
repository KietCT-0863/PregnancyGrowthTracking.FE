import axiosInstance from "../axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const isDevelopment = () => {
  try {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  } catch (e) {
    return false;
  }
};

const handleApiError = (error, defaultMessage) => {
  console.error("API Error:", error);

  throw {
    message: error.response?.data?.message || error.message || defaultMessage,
    status: error.response?.status || 500,
    originalError: error,
  };
};

const communityService = {
  getPosts: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.POSTS.LIST);
      console.log("API response data:", response.data);

      const normalizePostData = (posts) => {
        if (!Array.isArray(posts)) return [];

        return posts.map((post) => {
          let normalizedTags = [];

          if (post.postTags) {
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
            } else if (typeof post.postTags === "string") {
              normalizedTags = post.postTags.split(",").map((tag, index) => ({
                id: `tag_${index}`,
                name: tag.trim(),
              }));
            } else if (typeof post.postTags === "object") {
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

          let authorName = "Người dùng";
          if (post.createdBy) {
            authorName = post.createdBy;
          } else if (post.userName) {
            authorName = post.userName;
          } else if (post.author) {
            authorName = post.author;
          } else if (post.user && post.user.name) {
            authorName = post.user.name;
          } else if (post.userId) {
            authorName = `Người dùng #${post.userId}`;
          }

          // Trả về bài viết đã được chuẩn hóa
          return {
            ...post,
            id:
              post.id ||
              `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postTags: normalizedTags,
            createdBy: authorName, // Đảm bảo luôn có trường createdBy
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
      // Kiểm tra ID bài viết
      if (!postData.id) {
        console.error("Thiếu ID bài viết:", postData);
        throw new Error("ID bài viết không được để trống");
      }

      console.log("Đang cập nhật bài viết với ID:", postData.id);

      // Kiểm tra nội dung bài viết
      if (!postData.title?.trim() || !postData.body?.trim()) {
        throw new Error("Tiêu đề và nội dung không được để trống");
      }

      // Chuẩn bị payload
      const payload = {
        id: postData.id,
        title: postData.title.trim(),
        body: postData.body.trim(),
      };

      // Xử lý tags
      if (postData.postTags) {
        if (Array.isArray(postData.postTags)) {
          payload.postTags = postData.postTags.map((tag) => {
            if (typeof tag === "string") {
              return { tagName: tag.trim() };
            } else if (tag && typeof tag === "object") {
              return {
                tagName:
                  tag.tagName ||
                  tag.name ||
                  (typeof tag.trim === "function" ? tag.trim() : "Unknown"),
              };
            }
            return { tagName: "Unknown" };
          });
        } else if (typeof postData.postTags === "string") {
          try {
            // Thử parse nếu là JSON string
            const parsedTags = JSON.parse(postData.postTags);
            payload.postTags = Array.isArray(parsedTags)
              ? parsedTags
              : [{ tagName: postData.postTags }];
          } catch (e) {
            payload.postTags = [{ tagName: postData.postTags }];
          }
        }
      }

      console.log("Dữ liệu cập nhật gửi đi:", payload);
      const response = await axiosInstance.put(ENDPOINTS.POSTS.UPDATE, payload);
      return response.data;
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

      try {
        await axiosInstance.delete(ENDPOINTS.POSTS.DELETE(postId));
        return { success: true, message: "Xóa bài viết thành công" };
      } catch (apiError) {
        // Xử lý lỗi theo từng loại mã lỗi cụ thể
        if (apiError.response) {
          const { status, data } = apiError.response;

          // Lỗi 401 Unauthorized - Không đăng nhập
          if (status === 401) {
            console.error("Lỗi 401 - Chưa đăng nhập");
            throw {
              status: 401,
              message:
                data?.message || "Bạn cần đăng nhập để thực hiện thao tác này",
            };
          }

          // Lỗi 403 Forbidden - Không có quyền
          if (status === 403) {
            console.error("Lỗi 403 - Không có quyền xóa");
            throw {
              status: 403,
              message: data?.message || "Bạn không có quyền xóa bài viết này",
            };
          }

          // Lỗi 404 Not Found - Bài viết không tồn tại
          if (status === 404) {
            console.error("Lỗi 404 - Bài viết không tồn tại");
            throw {
              status: 404,
              message: data?.message || "Bài viết không tồn tại hoặc đã bị xóa",
            };
          }
        }

        // Ném lại lỗi cho hàm xử lý lỗi chung
        throw apiError;
      }
    } catch (error) {
      // Tạo đối tượng lỗi mới với cấu trúc đồng nhất thay vì sửa đổi tham số exception
      const formattedError = error.status
        ? error
        : {
            status: error.response?.status || 500,
            message:
              error.response?.data?.message ||
              error.message ||
              "Lỗi khi xóa bài viết",
            originalError: error,
          };

      console.error("Chi tiết lỗi xóa bài viết:", formattedError);
      throw formattedError; // Ném ra lỗi đã được định dạng để component xử lý
    }
  },

  // Cache cho trạng thái like của người dùng
  likedPostsCache: {},
  // Cache cho bài viết không tồn tại để tránh gọi API quá nhiều
  nonExistentPostsCache: new Set(),

  // Thêm phương thức toggle like để sử dụng cho bài viết, tương tự như comments
  togglePostLike: async (postId, userId) => {
    try {
      if (!postId || !userId) {
        throw new Error("ID bài viết và ID người dùng không được để trống");
      }

      // Kiểm tra trạng thái thích hiện tại
      const isCurrentlyLiked = await communityService.checkLikeStatus(
        postId,
        userId
      );

      console.log(
        `Toggle like bài viết ID ${postId}, trạng thái hiện tại: ${
          isCurrentlyLiked ? "đã thích" : "chưa thích"
        }`
      );

      // Cập nhật cache trước để UI phản hồi nhanh
      const cacheKey = `${postId}_${userId}`;
      communityService.likedPostsCache[cacheKey] = !isCurrentlyLiked;

      // Lưu vào localStorage để giữ trạng thái giữa các lần load trang
      try {
        const likedPostsStorage = JSON.parse(
          localStorage.getItem("likedPosts") || "{}"
        );

        if (!isCurrentlyLiked) {
          // Nếu chưa thích thì thêm vào danh sách thích
          likedPostsStorage[cacheKey] = true;
        } else {
          // Nếu đã thích thì xóa khỏi danh sách thích
          delete likedPostsStorage[cacheKey];
        }

        localStorage.setItem("likedPosts", JSON.stringify(likedPostsStorage));
      } catch (storageError) {
        console.error(
          "Lỗi khi lưu trạng thái like vào localStorage:",
          storageError
        );
      }

      try {
        // Gọi API toggle-like
        const response = await axiosInstance.post(
          ENDPOINTS.POSTS.LIKE(postId),
          { userId }
        );

        // Kiểm tra kết quả từ API
        console.log(
          `Kết quả toggle like bài viết ID ${postId}:`,
          response.data
        );

        return {
          success: true,
          isLiked: !isCurrentlyLiked,
          ...response.data,
        };
      } catch (error) {
        console.error(`Lỗi khi toggle like bài viết ID ${postId}:`, error);

        // Giữ nguyên giá trị đã cập nhật trong cache để UX tốt hơn
        return {
          success: true,
          simulated: true,
          isLiked: !isCurrentlyLiked,
        };
      }
    } catch (error) {
      console.error("Lỗi khi toggle like bài viết:", error);
      // Không throw lỗi để tránh làm gián đoạn UX
      return { success: false, message: error.message };
    }
  },

  // Kiểm tra xem bài viết có tồn tại không
  checkPostExists: async (postId) => {
    // Nếu đã biết bài viết không tồn tại từ cache, trả về false ngay
    if (communityService.nonExistentPostsCache.has(String(postId))) {
      console.log(`Bài viết ID ${postId} đã biết là không tồn tại từ cache`);
      return false;
    }

    try {
      // Cố gắng lấy số lượt like để kiểm tra bài viết có tồn tại không
      await communityService.getPostLikesCount(postId);
      // Nếu không lỗi, bài viết tồn tại
      return true;
    } catch (error) {
      if (error.message?.includes("không tồn tại")) {
        // Lưu vào cache nếu bài viết không tồn tại
        communityService.nonExistentPostsCache.add(String(postId));
        return false;
      }
      // Lỗi khác, giả định bài viết tồn tại để không làm gián đoạn UX
      return true;
    }
  },

  // Thả tim (like) bài viết
  likePost: async (postId, userId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      if (!userId) {
        throw new Error("ID người dùng không được để trống");
      }

      // Kiểm tra bài viết có tồn tại không trước khi gọi API
      const postExists = await communityService.checkPostExists(postId);
      if (!postExists) {
        console.log(`Không thể like bài viết ID ${postId} vì không tồn tại`);
        // Vẫn cập nhật cache để UI hiển thị đúng
        communityService.likedPostsCache[`${postId}_${userId}`] = true;
        return {
          success: true,
          simulated: true,
          message: "Bài viết không tồn tại",
        };
      }

      const payload = { userId };
      console.log(`Thả tim bài viết ID ${postId}:`, payload);

      try {
        // Gọi API toggle-like với phương thức POST
        const response = await axiosInstance.post(
          ENDPOINTS.POSTS.LIKE(postId),
          payload
        );

        // Cập nhật cache trạng thái like
        communityService.likedPostsCache[`${postId}_${userId}`] = true;

        return response.data;
      } catch (error) {
        console.log(`API like bài viết ID ${postId} gặp lỗi:`, error);

        // Kiểm tra nếu là lỗi 404, cập nhật cache bài viết không tồn tại
        if (error.response && error.response.status === 404) {
          communityService.nonExistentPostsCache.add(String(postId));
        }

        // Vẫn cập nhật UI bình thường
        communityService.likedPostsCache[`${postId}_${userId}`] = true;
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.warn("Lỗi khi thả tim bài viết:", error);
      // Không throw lỗi để tránh làm gián đoạn UX
      communityService.likedPostsCache[`${postId}_${userId}`] = true;
      return { success: true, simulated: true };
    }
  },

  // Bỏ tim (unlike) bài viết
  unlikePost: async (postId, userId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      if (!userId) {
        throw new Error("ID người dùng không được để trống");
      }

      // Kiểm tra bài viết có tồn tại không trước khi gọi API
      const postExists = await communityService.checkPostExists(postId);
      if (!postExists) {
        console.log(`Không thể unlike bài viết ID ${postId} vì không tồn tại`);
        // Vẫn cập nhật cache để UI hiển thị đúng
        communityService.likedPostsCache[`${postId}_${userId}`] = false;
        return {
          success: true,
          simulated: true,
          message: "Bài viết không tồn tại",
        };
      }

      const payload = { userId };
      console.log(`Bỏ tim bài viết ID ${postId}:`, payload);

      try {
        // Gọi API toggle-like với phương thức POST
        const response = await axiosInstance.post(
          ENDPOINTS.POSTS.UNLIKE(postId),
          payload
        );

        // Cập nhật cache trạng thái like
        communityService.likedPostsCache[`${postId}_${userId}`] = false;

        return response.data;
      } catch (error) {
        console.log(`API unlike bài viết ID ${postId} gặp lỗi:`, error);

        // Kiểm tra nếu là lỗi 404, cập nhật cache bài viết không tồn tại
        if (error.response && error.response.status === 404) {
          communityService.nonExistentPostsCache.add(String(postId));
        }

        // Vẫn cập nhật UI bình thường
        communityService.likedPostsCache[`${postId}_${userId}`] = false;
        return { success: true, simulated: true };
      }
    } catch (error) {
      console.warn("Lỗi khi bỏ tim bài viết:", error);
      // Không throw lỗi để tránh làm gián đoạn UX
      communityService.likedPostsCache[`${postId}_${userId}`] = false;
      return { success: true, simulated: true };
    }
  },

  // Lấy số lượt like của bài viết
  getPostLikesCount: async (postId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      try {
        const response = await axiosInstance.get(
          ENDPOINTS.POSTS.GET_LIKES_COUNT(postId)
        );

        // Nếu response là object với thuộc tính likeCount
        if (response.data && typeof response.data.likeCount !== "undefined") {
          return response.data.likeCount;
        }

        // Nếu response là số trực tiếp
        if (typeof response.data === "number") {
          return response.data;
        }

        // Trường hợp khác
        console.log("Dữ liệu số lượt like:", response.data);

        // Tìm kiếm thuộc tính với số lượt like
        if (response.data && typeof response.data === "object") {
          const possibleKeys = ["count", "likeCount", "likes", "totalLikes"];
          for (const key of possibleKeys) {
            if (typeof response.data[key] === "number") {
              return response.data[key];
            }
          }
        }
        return 0;
      } catch (apiError) {
        // Kiểm tra nếu bài viết không tồn tại (404)
        if (apiError.response && apiError.response.status === 404) {
          throw new Error(`Bài viết ID ${postId} không tồn tại`);
        }
        console.warn(
          `API lấy số lượt like gặp lỗi cho bài viết ${postId}:`,
          apiError
        );
        return 0;
      }
    } catch (error) {
      console.error(`Error getting likes count for post ${postId}:`, error);
      return 0; // Trả về 0 nếu có lỗi
    }
  },

  // Lấy danh sách người dùng đã like bài viết
  getPostLikes: async (postId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      const response = await axiosInstance.get(
        ENDPOINTS.POSTS.GET_POST_LIKES(postId)
      );
      return response.data || [];
    } catch (error) {
      console.error(`Error getting likes for post ${postId}:`, error);
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  },

  // Kiểm tra trạng thái like của người dùng đối với bài viết
  checkLikeStatus: async (postId, userId) => {
    try {
      if (!postId || !userId) {
        return false;
      }

      // Kiểm tra trong cache trước
      const cacheKey = `${postId}_${userId}`;
      if (typeof communityService.likedPostsCache[cacheKey] !== "undefined") {
        return communityService.likedPostsCache[cacheKey];
      }

      // Kiểm tra trong localStorage
      try {
        const likedPostsStorage = JSON.parse(
          localStorage.getItem("likedPosts") || "{}"
        );
        if (typeof likedPostsStorage[cacheKey] !== "undefined") {
          // Cập nhật lại cache từ localStorage
          communityService.likedPostsCache[cacheKey] =
            likedPostsStorage[cacheKey];
          return likedPostsStorage[cacheKey];
        }
      } catch (storageError) {
        console.error(
          "Lỗi khi đọc trạng thái like từ localStorage:",
          storageError
        );
      }

      // Nếu không có trong cache và localStorage, lấy danh sách người đã like và kiểm tra
      const likes = await communityService.getPostLikes(postId);

      // Kiểm tra xem có trong danh sách không
      let isLiked = false;

      if (Array.isArray(likes)) {
        isLiked = likes.some(
          (like) =>
            like.userId === userId || like.userId === parseInt(userId, 10)
        );
      }

      // Lưu kết quả vào cache
      communityService.likedPostsCache[cacheKey] = isLiked;

      // Lưu kết quả vào localStorage để duy trì giữa các lần tải trang
      try {
        const likedPostsStorage = JSON.parse(
          localStorage.getItem("likedPosts") || "{}"
        );
        if (isLiked) {
          likedPostsStorage[cacheKey] = true;
        } else {
          delete likedPostsStorage[cacheKey];
        }
        localStorage.setItem("likedPosts", JSON.stringify(likedPostsStorage));
      } catch (storageError) {
        console.error(
          "Lỗi khi lưu trạng thái like vào localStorage:",
          storageError
        );
      }

      return isLiked;
    } catch (error) {
      console.error(`Error checking like status for post ${postId}:`, error);
      return false; // Mặc định trả về false nếu có lỗi
    }
  },

  // Lấy thông tin tác giả của bài viết
  getPostAuthor: async (postId) => {
    try {
      if (!postId) {
        throw new Error("ID bài viết không được để trống");
      }

      try {
        const response = await axiosInstance.get(`/posts/${postId}/author`);
        return (
          response.data || { fullName: "Người dùng", profileImageUrl: null }
        );
      } catch (error) {
        console.error(
          `Lỗi khi lấy thông tin tác giả của bài viết ${postId}:`,
          error
        );
        return { fullName: "Người dùng", profileImageUrl: null };
      }
    } catch (error) {
      console.error(`Error getting author for post ${postId}:`, error);
      return { fullName: "Người dùng", profileImageUrl: null };
    }
  },

  // Lấy các bài viết của một người dùng cụ thể
  getPostsByUserId: async (userId) => {
    try {
      if (!userId) {
        throw new Error("User ID không được để trống");
      }

      console.log(`Bắt đầu lấy bài viết của người dùng có ID: ${userId}`);

      // Định nghĩa các endpoint có thể sử dụng để lấy bài viết theo userId
      const endpoints = [
        ENDPOINTS.POSTS.GET_BY_USER(userId), // Endpoint chính: /posts/userid/${userId}
        `/posts/userid/${userId}`, // Đảm bảo rằng endpoint chính được thử đầu tiên
        ENDPOINTS.POSTS.USER_POSTS_ALT1(userId),
        ENDPOINTS.POSTS.USER_POSTS_ALT2(userId),
        ENDPOINTS.POSTS.USER_POSTS_ALT3(userId),
        `/posts/user/${userId}`, // Endpoint cũ, giữ lại để tương thích ngược
      ];

      console.log("Danh sách endpoints sẽ được thử theo thứ tự:", endpoints);

      // Thử lần lượt từng endpoint
      let lastError = null;
      for (const endpoint of endpoints) {
        try {
          console.log(
            `[${new Date().toISOString()}] Đang thử endpoint: ${endpoint} để lấy bài viết của user ID: ${userId}`
          );

          const response = await axiosInstance.get(endpoint);
          console.log(
            `[${new Date().toISOString()}] Phản hồi API thành công:`,
            response.status,
            response.statusText
          );
          console.log("Dữ liệu trả về:", response.data);

          // Kiểm tra và chuẩn hóa dữ liệu trả về
          if (Array.isArray(response.data)) {
            console.log(
              `✓ Thành công! Tìm thấy ${response.data.length} bài viết của người dùng ID ${userId} từ endpoint: ${endpoint}`
            );
            // Chuẩn hóa dữ liệu bài viết
            return response.data.map((post) => ({
              ...post,
              postTags: Array.isArray(post.postTags) ? post.postTags : [],
            }));
          } else if (response.data && Array.isArray(response.data.posts)) {
            console.log(
              `✓ Thành công! Tìm thấy ${response.data.posts.length} bài viết từ trường posts của endpoint: ${endpoint}`
            );
            return response.data.posts.map((post) => ({
              ...post,
              postTags: Array.isArray(post.postTags) ? post.postTags : [],
            }));
          } else if (response.data && response.data.length === 0) {
            console.warn(`API trả về mảng rỗng từ endpoint: ${endpoint}`);
            return [];
          } else if (response.status === 204) {
            console.warn(`API trả về 204 No Content từ endpoint: ${endpoint}`);
            return [];
          } else {
            console.warn(
              `Endpoint ${endpoint} trả về dữ liệu không phải mảng:`,
              response.data
            );
            // Tiếp tục thử endpoint tiếp theo
          }
        } catch (apiError) {
          lastError = apiError;
          console.error(`✗ Lỗi với endpoint ${endpoint}:`, apiError.message);
          // Ghi log chi tiết hơn nếu có
          if (apiError.response) {
            console.error("Status:", apiError.response.status);
            console.error("Headers:", apiError.response.headers);
            console.error("Data:", apiError.response.data);
          }
          // Tiếp tục thử endpoint tiếp theo
        }
      }

      // Nếu tất cả các endpoint đều thất bại, hiển thị thông báo cụ thể hơn
      if (lastError) {
        console.error(
          `Không thể lấy bài viết của người dùng ${userId} từ tất cả các endpoint đã thử.`
        );
        throw {
          message: `Không tìm thấy API endpoint phù hợp để lấy bài viết của người dùng ID ${userId}. Vui lòng kiểm tra API hoặc cấu hình.`,
          originalError: lastError,
          endpoints: endpoints,
        };
      }

      // Nếu không có lỗi nhưng cũng không có dữ liệu hợp lệ, trả về mảng rỗng
      console.warn(
        "Không tìm thấy định dạng dữ liệu phù hợp từ tất cả các endpoint"
      );
      return [];
    } catch (error) {
      console.error(`Lỗi khi lấy bài viết theo user ID ${userId}:`, error);
      throw error; // Ném lỗi để component xử lý
    }
  },

  // Lấy bài viết của người dùng đang đăng nhập
  getMyPosts: async () => {
    try {
      console.log("Đang gọi API để lấy bài viết của người dùng đang đăng nhập");

      // Gọi API endpoint my-posts
      const response = await axiosInstance.get(ENDPOINTS.POSTS.MY_POSTS);
      console.log("Phản hồi API my-posts:", response.data);

      // Kiểm tra và chuẩn hóa dữ liệu
      if (Array.isArray(response.data)) {
        console.log(`Tìm thấy ${response.data.length} bài viết của tôi`);
        // Chuẩn hóa dữ liệu bài viết
        return response.data.map((post) => ({
          ...post,
          postTags: Array.isArray(post.postTags) ? post.postTags : [],
        }));
      } else if (response.data && Array.isArray(response.data.posts)) {
        console.log(
          `Tìm thấy ${response.data.posts.length} bài viết từ trường posts`
        );
        return response.data.posts.map((post) => ({
          ...post,
          postTags: Array.isArray(post.postTags) ? post.postTags : [],
        }));
      } else if (response.data && response.data.length === 0) {
        console.warn("API trả về mảng rỗng");
        return [];
      } else if (response.status === 204) {
        console.warn("API trả về 204 No Content");
        return [];
      } else {
        console.warn(
          "API my-posts trả về dữ liệu không phải mảng:",
          response.data
        );
        return [];
      }
    } catch (error) {
      console.error(
        "Lỗi khi lấy bài viết của người dùng đang đăng nhập:",
        error
      );

      // Kiểm tra lỗi cụ thể
      if (error.response) {
        const { status, data } = error.response;

        // Lỗi 401 Unauthorized - Chưa đăng nhập
        if (status === 401) {
          console.error("Lỗi 401 - Chưa đăng nhập");
          throw {
            status: 401,
            message:
              data?.message || "Bạn cần đăng nhập để xem bài viết của mình",
          };
        }

        // Các lỗi khác
        console.error("Status:", status);
        console.error("Data:", data);
      }

      throw error; // Ném lỗi để component xử lý
    }
  },
};

export default communityService;
