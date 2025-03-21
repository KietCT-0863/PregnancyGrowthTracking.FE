export const BASE_URL =
  "https://pregnancy-growth-tracking-web-api-a6hxfqhsenaagthw.australiasoutheast-01.azurewebsites.net/api";

export const USER_API = `${BASE_URL}/User`;

export const ENDPOINTS = {
  // ... other endpoints ...
  FOETUS: {
    LIST: "/Foetus",
    DETAIL: (id) => `/Foetus/${id}`,
    CREATE: "/Foetus/Create",
    DELETE: (id) => `/Foetus/${id}`,
    // Thêm endpoint cập nhật tuần thai
    UPDATE_AGE: (id) => `/Foetus/UpdateAge?foetusId=${id}`, // Endpoint mới
  },
  // Thêm endpoint cho Community/Posts
  POSTS: {
    LIST: "/posts",
    CREATE: "/posts",
    UPDATE: "/posts",
    DELETE: (postId) => `/posts?postID=${postId}`,
  },
};
