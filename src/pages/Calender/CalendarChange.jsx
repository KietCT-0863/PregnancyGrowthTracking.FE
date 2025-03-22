import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  FileText, 
  Save, 
  X,
  MapPin
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import reminderService from "../../api/services/reminderService";
import "./CalendarChange.scss";
import NotificationPopup from './components/NotificationPopup';

const CalendarChange = () => {
  const navigate = useNavigate();
  const { remindId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState({
    title: "",
    date: "",
    time: "",
    reminderType: "Uống thuốc",
    notification: "",
    location: ""
  });

  // Danh sách loại nhắc nhở
  const reminderTypes = [
    { id: "Cuộc hẹn bác sĩ", label: "Cuộc hẹn bác sĩ", color: "#FF6B81" },
    { id: "Uống thuốc", label: "Uống thuốc", color: "#4CAF50" },
    { id: "Khám thai", label: "Khám thai", color: "#FF6B81" },
    { id: "Tập thể dục", label: "Tập thể dục", color: "#9C27B0" },
    { id: "Dinh dưỡng", label: "Dinh dưỡng", color: "#2196F3" }
  ];

  // Add notification state
  const [notification, setNotification] = useState({
    type: 'success',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    fetchReminderDetails();
  }, [remindId]);

  const fetchReminderDetails = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminderHistory();
      const currentReminder = response.find(r => r.remindId === parseInt(remindId));
      
      if (!currentReminder) {
        toast.error("Không tìm thấy lịch nhắc nhở");
        navigate("/member/calendar/history");
        return;
      }

      setReminder({
        title: currentReminder.title || "",
        date: currentReminder.date?.split('T')[0] || "",
        time: currentReminder.time || "",
        reminderType: currentReminder.reminderType || "Uống thuốc",
        notification: currentReminder.notification || "",
        location: currentReminder.location || ""
      });
    } catch (error) {
      toast.error("Không thể tải thông tin lịch nhắc nhở");
      navigate("/member/calendar/history");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Thêm hàm để lấy ngày hiện tại theo định dạng YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Cập nhật hàm validateReminderForm
  const validateReminderForm = () => {
    if (!reminder.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return false;
    }
    if (!reminder.date) {
      toast.error("Vui lòng chọn ngày");
      return false;
    }
    
    // Kiểm tra ngày có nhỏ hơn ngày hiện tại không
    const selectedDate = new Date(reminder.date);
    const currentDate = new Date(getCurrentDate());
    if (selectedDate < currentDate) {
      toast.error("Không thể chọn ngày trong quá khứ");
      return false;
    }
    
    if (!reminder.time) {
      toast.error("Vui lòng chọn giờ");
      return false;
    }
    return true;
  };

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateReminderForm()) {
        return;
      }

      await reminderService.updateReminder(remindId, reminder);
      showNotification('success', 'Sự kiện đã được cập nhật thành công');
      
      // Navigate after a delay to allow the user to see the notification
      setTimeout(() => {
        navigate('/member/calendar/history');
      }, 1500);
    } catch (error) {
      console.error("Error updating event:", error);
      showNotification('error', 'Đã xảy ra lỗi khi cập nhật sự kiện');
    }
  };

  if (loading) {
    return (
      <div className="calendar-change">
        <div className="loading">
          Đang tải thông tin...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="calendar-change"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="change-header">
        <motion.button
          className="back-button"
          onClick={() => navigate("/member/calendar/history")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Chỉnh sửa sự kiện</h1>
      </div>

      <form onSubmit={handleSubmit} className="reminder-form">
        <div className="form-group">
          <label htmlFor="title">Tiêu đề</label>
          <input
            type="text"
            id="title"
            name="title"
            value={reminder.title}
            onChange={handleInputChange}
            placeholder="Nhập tiêu đề sự kiện"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Ngày</label>
          <div className="input-with-icon">
            <Calendar size={20} />
            <input
              type="date"
              id="date"
              name="date"
              value={reminder.date}
              onChange={handleInputChange}
              min={getCurrentDate()}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="time">Giờ</label>
          <div className="input-with-icon">
            <Clock size={20} />
            <input
              type="time"
              id="time"
              name="time"
              value={reminder.time}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reminderType">Loại sự kiện</label>
          <div className="input-with-icon">
            <Tag size={20} />
            <select
              id="reminderType"
              name="reminderType"
              value={reminder.reminderType}
              onChange={handleInputChange}
            >
              {reminderTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notification">Ghi chú</label>
          <div className="input-with-icon textarea-container">
            <FileText size={20} className="textarea-icon" />
            <textarea
              id="notification"
              name="notification"
              value={reminder.notification}
              onChange={handleInputChange}
              placeholder="Nhập ghi chú (không bắt buộc)"
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <motion.button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/member/calendar/history")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={18} />
            Hủy
          </motion.button>
          <motion.button
            type="submit"
            className="save-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save size={18} />
            Lưu thay đổi
          </motion.button>
        </div>
      </form>
      
      <ToastContainer position="bottom-right" />
      
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={3000}
      />
    </motion.div>
  );
};

export default CalendarChange;
