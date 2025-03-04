export const ENDPOINTS = {
  // ... other endpoints ...
  FOETUS: {
    LIST: "/Foetus",
    DETAIL: (id) => `/Foetus/${id}`,
    CREATE: "/Foetus/Create",
    DELETE: (id) => `/Foetus/${id}`,
    // Thêm endpoint cập nhật tuần thai
    UPDATE_AGE: (id) => `/Foetus/UpdateAge?foetusId=${id}` // Endpoint mới
  }
}; 