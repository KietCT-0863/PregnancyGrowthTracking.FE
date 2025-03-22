/**
 * Utility functions for date validation in Doctor Notes
 */

/**
 * Validates if the selected date is on or before the current date
 * @param {string} selectedDate - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is valid (on or before today), false otherwise
 */
export const isValidPastOrPresentDate = (selectedDate) => {
  if (!selectedDate) return false;
  
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selected <= today;
};

/**
 * Checks if a date is in the future
 * @param {string} selectedDate - Date in YYYY-MM-DD format
 * @returns {boolean} True if date is in the future, false otherwise
 */
export const isFutureDate = (selectedDate) => {
  if (!selectedDate) return false;
  
  const selected = new Date(selectedDate);
  selected.setHours(0, 0, 0, 0); // Reset time part for accurate comparison
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selected > today;
};

/**
 * Creates a formatted error message for invalid future dates
 * @returns {Object} Object containing title and message for the error popup
 */
export const getFutureDateErrorMessage = () => {
  return {
    title: "Lưu ý về tính năng ghi chú Bác sĩ",
    message: "Bạn đang chọn ngày trong tương lai. Đây là chức năng ghi chú cho các lần khám đã diễn ra. Nếu bạn đang lên lịch cho các lần thăm khám sắp tới, chúng tôi khuyên bạn nên sử dụng chức năng 'Lịch trình thăm khám' để được nhắc nhở đúng hạn."
  };
};

/**
 * Gets the current date in YYYY-MM-DD format for input max attribute
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}; 