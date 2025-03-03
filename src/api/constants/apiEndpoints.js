export const API_BASE_URL = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/Login",
    REGISTER: "/Auth/Register", 
    FORGOT_PASSWORD: "/Auth/ForgotPassword"
  },
  USER: {
    PROFILE: "/User/Profile",
    GET_CURRENT: "/User/GetCurrentUser",
    UPDATE: "/User/Update"
  },
  BLOG: {
    LIST: "/Blog",
    DETAIL: (id) => `/Blog/${id}`,
    DELETE: (id) => `/Blog?blogID=${id}`
  },
  PAYMENT: {
    CREATE: "/Payment/create-payment",
    CHECK_RESULT: (transactionNo) => `/Payment/check-payment/${transactionNo}`
  }
}; 