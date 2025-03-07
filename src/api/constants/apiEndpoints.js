export const API_BASE_URL = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/Auth/Login",
    REGISTER: "/Auth/Register", 
    FORGOT_PASSWORD: "/Auth/ForgotPassword"
  },
  USER: {
    LIST: "/User",
    DETAIL: (id) => `/User/${id}`,
    CREATE: "/User",
    UPDATE: (id) => `/User/${id}`,
    DELETE: (id) => `/User/${id}`,
    PROFILE: "/User/Profile",
    GET_CURRENT: "/User/GetCurrentUser"
  },
  BLOG: {
    LIST: "/Blog",
    DETAIL: (id) => `/Blog/${id}`,
    DELETE: (id) => `/Blog?blogID=${id}`
  },
  PAYMENT: {
    CREATE: "/Payment/create-payment",
    CHECK_RESULT: (transactionNo) => `/Payment/check-payment/${transactionNo}`
  },
  FOETUS: {
    LIST: "/Foetus",
    DETAIL: (id) => `/Foetus/${id}`,
    CREATE: "/Foetus/Create",
    DELETE: (id) => `/Foetus/${id}`
  },
  GROWTHDATA: {
    GET_BY_FOETUS: (foetusId) => `/GrowthData/GetByFoetusId?foetusId=${foetusId}`,
    CREATE: '/GrowthData/Create',
    UPDATE: (growthDataId) => `/GrowthData/Update?growthDataId=${growthDataId}`
  },
  USER_MANAGEMENT: {
    LIST: "/User",
    DETAIL: (id) => `/User/${id}`,
    CREATE: "/User",
    UPDATE: (id) => `/User/${id}`,
    DELETE: (id) => `/User/${id}`
  }
}; 