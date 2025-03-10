export const API_BASE_URL =
  "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/Login",
    REGISTER: "/Auth/Register",
    FORGOT_PASSWORD: "/Auth/ForgotPassword",
  },
  USER: {
    LIST: "/User",
    DETAIL: (id) => `/User/${id}`,
    CREATE: "/User",
    UPDATE: (id) => `/User/${id}`,
    DELETE: (id) => `/User/${id}`,
    PROFILE: "/User/Profile",
    GET_CURRENT: "/User/GetCurrentUser",
  },
  BLOG: {
    LIST: "/Blog",
    DETAIL: (id) => `/Blog/${id}`,
    DELETE: (id) => `/Blog?blogID=${id}`,
    UPLOAD_PHOTO: (blogId) => `/Blog/upload-photo/${blogId}`,
    REPLACE_PHOTO: (blogId) => `/Blog/replace-photo/${blogId}`,
    GET_PHOTO: (blogId) => `/Blog/${blogId}/photo`,
  },
  PAYMENT: {
    CREATE: "/Payment/create-payment",
    CHECK_RESULT: (transactionNo) => `/Payment/check-payment/${transactionNo}`,
  },
  FOETUS: {
    LIST: "/Foetus",
    DETAIL: (id) => `/Foetus/${id}`,
    CREATE: "/Foetus/Create",
    DELETE: (id) => `/Foetus/${id}`,
  },

  USER_NOTES: {
    GET_BY_USER: (userId) => `/user-notes/user/${userId}`,
    GET_BY_ID: (id) => `/user-notes/${id}`,
    CREATE: "/user-notes",
    UPDATE: (id) => `/user-notes/${id}`,
    DELETE: (id) => `/user-notes/${id}`,
  },
  PROFILE_IMAGE: {
    UPDATE: (userId) => `/ProfileImg/${userId}/profile-image`,
    GET: (userId) => `/ProfileImg/${userId}/profile-image`,
  },
  USER_MANAGEMENT: {
    LIST: "/User",
    DETAIL: (id) => `/User/${id}`,
    CREATE: "/User",
    UPDATE: (id) => `/User/${id}`,
    DELETE: (id) => `/User/${id}`,
  },
  GROWTHDATA: {
    GET_BY_FOETUS: (foetusId) => `/foetus/${foetusId}/growth-data`,
    CREATE: (foetusId) => `/foetus/${foetusId}/growth-data`,
    UPDATE: (foetusId, age) => `/foetus/${foetusId}/growth-data/${age}`,
    GET_RANGES: (age) => `/growth-data/ranges/${age}`,
  },
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/Auth/login",
  REGISTER: "/api/Auth/register",
  REFRESH_TOKEN: "/api/Auth/refresh-token",
  LOGOUT: "/api/Auth/logout",
  FORGOT_PASSWORD: "/api/Auth/forgot-password",
  RESET_PASSWORD: "/api/Auth/reset-password",
  CHANGE_PASSWORD: "/api/Auth/change-password",
};

// User endpoints
export const USER_ENDPOINTS = {
  GET_USER_PROFILE: "/api/User/profile",
  UPDATE_USER_PROFILE: "/api/User/profile",
  GET_ALL_USERS: "/api/User",
  GET_USER_BY_ID: "/api/User",
  UPDATE_USER: "/api/User",
  DELETE_USER: "/api/User",
};

// Payment endpoints
export const PAYMENT_ENDPOINTS = {
  CREATE_PAYMENT: "/api/Payment/create-payment",
  CHECK_PAYMENT: "/api/Payment/check-payment",
  PAYMENT_CALLBACK: "/api/Payment/payment-callback",
  PAYMENT_RESULT: "/payment-result",
};
