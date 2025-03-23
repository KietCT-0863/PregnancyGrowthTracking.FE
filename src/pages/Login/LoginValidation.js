/**
 * Login form validation utilities
 * Handles form validation and error formatting for the login form
 */

/**
 * Validates login credentials
 * @param {Object} formData - The form data to validate (usernameOrEmail and password)
 * @returns {Object} - Object with isValid flag and any validation errors
 */
export const validateLoginCredentials = (formData) => {
  console.log("Validating form data:", formData);
  
  const errors = {};
  let isValid = true;

  // Validate username/email
  if (!formData.usernameOrEmail) {
    console.log("Username/email is empty");
    errors.usernameOrEmail = 'Vui lòng nhập tên đăng nhập hoặc email';
    isValid = false;
  } else if (formData.usernameOrEmail.trim().length < 3) {
    console.log("Username/email is too short (< 3 characters)");
    errors.usernameOrEmail = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    isValid = false;
  } else {
    console.log("Username/email validation passed");
  }

  // Validate password
  if (!formData.password) {
    console.log("Password is empty");
    errors.password = 'Vui lòng nhập mật khẩu';
    isValid = false;
  } else if (formData.password.length < 6) {
    console.log("Password is too short (< 6 characters)");
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    isValid = false;
  } else {
    console.log("Password validation passed");
  }

  console.log("Validation result:", { isValid, errors });
  return {
    isValid,
    errors
  };
};

/**
 * Formats API error responses into user-friendly messages
 * @param {Object|Error} error - The error object from the API or JS Error
 * @returns {Object} - Object with general and field-specific error messages
 */
export const formatLoginErrors = (error) => {
  console.log('Formatting error:', error);
  
  const result = {
    general: null,
    fields: {}
  };

  // Handle network errors or other non-HTTP errors
  if (!error.response) {
    console.log('Network error detected');
    result.general = 'Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng';
    return result;
  }

  // Log the response for debugging
  console.log('Error response:', error.response);
  console.log('Status:', error.response?.status);
  console.log('Data:', error.response?.data);

  // Handle different HTTP status codes
  const status = error.response?.status;

  switch (status) {
    case 400: 
      // Bad request - form validation error
      if (error.response.data && typeof error.response.data === 'object') {
        result.general = 'Vui lòng kiểm tra thông tin đăng nhập';
        
        // Handle Swagger-formatted validation errors
        if (error.response.data.errors) {
          Object.entries(error.response.data.errors).forEach(([field, messages]) => {
            const fieldName = field.toLowerCase();
            if (fieldName.includes('username') || fieldName.includes('email')) {
              result.fields.usernameOrEmail = Array.isArray(messages) ? messages[0] : messages;
            } else if (fieldName.includes('password')) {
              result.fields.password = Array.isArray(messages) ? messages[0] : messages;
            }
          });
        }
      } else {
        result.general = 'Thông tin đăng nhập không hợp lệ';
      }
      break;
      
    case 401:
      // Unauthorized - wrong credentials
      result.general = 'Tên đăng nhập hoặc mật khẩu không chính xác';
      break;
      
    case 403:
      // Forbidden - account locked
      result.general = 'Tài khoản đã bị khóa hoặc bạn không có quyền truy cập';
      break;
      
    case 429:
      // Too many requests
      result.general = 'Quá nhiều lần đăng nhập không thành công, vui lòng thử lại sau';
      break;
      
    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      result.general = 'Máy chủ đang gặp sự cố, vui lòng thử lại sau';
      break;
      
    default:
      // Unknown errors
      result.general = 'Đã xảy ra lỗi trong quá trình đăng nhập';
  }

  console.log('Formatted result:', result);
  return result;
}; 