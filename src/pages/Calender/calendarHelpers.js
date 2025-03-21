import moment from 'moment';

/**
 * Tạo các time slot cho lịch
 * @returns {Array} Mảng các time slot từ 00:00 đến 23:00
 */
export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let i = 0; i < 24; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return timeSlots;
};

/**
 * Format thời gian hiển thị cho sự kiện
 * @param {Object} event Sự kiện cần format thời gian
 * @returns {String} Chuỗi thời gian đã được format
 */
export const formatEventTime = (event) => {
  const start = moment(event.startTime).format('HH:mm');
  const end = moment(event.endTime).format('HH:mm');
  return `${start} - ${end}`;
};

/**
 * Tính toán vị trí top của sự kiện trên lịch
 * @param {string|Object} event Sự kiện cần tính toán vị trí hoặc chuỗi thời gian định dạng "HH:MM"
 * @returns {String} Vị trí top (pixel)
 */
export const getEventPosition = (event) => {
  let hours, minutes;
  
  if (typeof event === 'string') {
    // Nếu đầu vào là chuỗi thời gian (HH:MM)
    [hours, minutes] = event.split(':').map(Number);
  } else {
    // Nếu đầu vào là đối tượng sự kiện
    const startTime = moment(event.startTime);
    hours = startTime.hours();
    minutes = startTime.minutes();
  }
  
  // Tính vị trí (mỗi giờ là 80px)
  return `${(hours - 6) * 80 + minutes * (80/60)}px`;
};

/**
 * Tính toán chiều cao của sự kiện trên lịch
 * @param {Object} event Sự kiện cần tính toán chiều cao
 * @returns {Number} Chiều cao (pixel)
 */
export const getEventHeight = (event) => {
  const startTime = moment(event.startTime);
  const endTime = moment(event.endTime);
  
  // Tính chiều cao dựa trên thời gian (phút)
  const durationMinutes = endTime.diff(startTime, 'minutes');
  return Math.max(durationMinutes, 30); // Tối thiểu 30px để dễ nhìn
};

/**
 * Xử lý chồng chéo giữa các sự kiện
 * @param {Array} events Mảng các sự kiện cần xử lý
 * @returns {Array} Mảng các sự kiện đã được xử lý với thông tin hiển thị
 */
export const handleEventOverlap = (events) => {
  if (!events.length) return [];
  
  // Sao chép mảng sự kiện để không thay đổi dữ liệu gốc
  const processedEvents = JSON.parse(JSON.stringify(events));
  
  // Tìm các sự kiện chồng chéo
  const groups = [];
  let currentGroup = [];
  
  // Sắp xếp theo thời gian bắt đầu
  processedEvents.sort((a, b) => 
    moment(a.startTime).valueOf() - moment(b.startTime).valueOf()
  );
  
  // Phân nhóm các sự kiện chồng chéo
  processedEvents.forEach(event => {
    // Nếu sự kiện hiện tại không chồng chéo với nhóm hiện tại
    if (currentGroup.length === 0 || !isOverlap(currentGroup, event)) {
      // Lưu nhóm hiện tại (nếu có) và tạo nhóm mới
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]);
        currentGroup = [];
      }
    }
    
    currentGroup.push(event);
  });
  
  // Thêm nhóm cuối cùng
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
  
  // Xử lý vị trí hiển thị trong mỗi nhóm
  groups.forEach(group => {
    if (group.length === 1) {
      // Nếu chỉ có 1 sự kiện, chiếm toàn bộ chiều rộng
      group[0].column = 0;
      group[0].columnSpan = 1;
    } else {
      // Nếu có nhiều sự kiện, chia đều chiều rộng
      assignColumns(group);
    }
  });
  
  // Gộp lại tất cả các nhóm đã xử lý
  return groups.flat();
};

/**
 * Kiểm tra xem một sự kiện có chồng chéo với bất kỳ sự kiện nào trong nhóm không
 * @param {Array} group Nhóm sự kiện
 * @param {Object} event Sự kiện cần kiểm tra
 * @returns {Boolean} true nếu có chồng chéo, false nếu không
 */
const isOverlap = (group, event) => {
  const eventStart = moment(event.startTime);
  const eventEnd = moment(event.endTime);
  
  return group.some(groupEvent => {
    const groupEventStart = moment(groupEvent.startTime);
    const groupEventEnd = moment(groupEvent.endTime);
    
    // Kiểm tra điều kiện chồng chéo
    return (
      (eventStart.isBefore(groupEventEnd) && eventEnd.isAfter(groupEventStart)) ||
      (groupEventStart.isBefore(eventEnd) && groupEventEnd.isAfter(eventStart))
    );
  });
};

/**
 * Gán cột hiển thị cho các sự kiện trong một nhóm
 * @param {Array} group Nhóm sự kiện cần gán cột
 */
const assignColumns = (group) => {
  const numColumns = group.length;
  
  // Gán cột cho từng sự kiện
  group.forEach((event, index) => {
    event.column = index;
    event.columnSpan = numColumns;
  });
};

/**
 * Sắp xếp sự kiện theo thời gian
 * @param {Array} events - Mảng sự kiện cần sắp xếp
 * @returns {Array} Mảng sự kiện đã sắp xếp
 */
export const sortEventsByTime = (events) => {
  if (!events || !Array.isArray(events) || events.length === 0) {
    console.log('DEBUG sortEventsByTime - Mảng sự kiện trống hoặc không hợp lệ');
    return [];
  }

  console.log('DEBUG sortEventsByTime - Sắp xếp sự kiện:', events);
  
  return [...events].sort((a, b) => {
    // Extract time from various possible formats
    const getTimeValue = (event) => {
      try {
        if (event.time) {
          console.log(`DEBUG sortEventsByTime - Sử dụng event.time: ${event.time}`);
          const [hours, minutes] = event.time.split(':').map(Number);
          return hours * 60 + minutes;
        } else if (event.startTime) {
          console.log(`DEBUG sortEventsByTime - Sử dụng event.startTime: ${event.startTime}`);
          const date = new Date(event.startTime);
          return date.getHours() * 60 + date.getMinutes();
        } else if (event.reminderTime) {
          console.log(`DEBUG sortEventsByTime - Sử dụng event.reminderTime: ${event.reminderTime}`);
          const [hours, minutes] = event.reminderTime.split(':').map(Number);
          return hours * 60 + minutes;
        }
        
        // Default time if no time found
        console.log(`DEBUG sortEventsByTime - Không tìm thấy thời gian cho sự kiện:`, event);
        return 9 * 60; // Default to 9:00 AM
      } catch (error) {
        console.error('DEBUG sortEventsByTime - Lỗi khi xử lý thời gian:', error, event);
        return 9 * 60; // Default to 9:00 AM on error
      }
    };
    
    return getTimeValue(a) - getTimeValue(b);
  });
};

/**
 * Hàm lấy màu dựa trên loại sự kiện
 * @param {string} type - Loại sự kiện
 * @returns {string} - Mã màu hex
 */
export const getColorByType = (type) => {
  if (!type) return '#FF6B6B'; // Màu mặc định
  
  const typeMap = {
    'Cuộc hẹn bác sĩ': '#4f46e5', // Màu tím indigo
    'Uống thuốc': '#10b981', // Màu xanh lá
    'Khám thai': '#0ea5e9', // Màu xanh dương
    'Tập thể dục': '#FFA07A', // Màu cam đào
    'Dinh dưỡng': '#98D8C8', // Màu xanh mint
    'Khám định kỳ': '#0ea5e9', // Màu xanh dương
    'Nhắc nhở': '#f59e0b', // Màu cam
    'default': '#8b5cf6' // Màu tím
  };
  
  return typeMap[type] || typeMap.default;
}; 