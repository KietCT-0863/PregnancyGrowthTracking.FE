export const BASE_URL =
  "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api";

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
};
