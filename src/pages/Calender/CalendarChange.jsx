import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";
import reminderService from "../../api/services/reminderService";
import "./CalendarChange.scss";

const CalendarChange = () => {
  const navigate = useNavigate();
  const { remindId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState({
    title: "",
    date: "",
    time: "",
    reminderType: "medication",
    notification: ""
  });

  // Danh sách loại nhắc nhở
  const reminderTypes = [
    { id: "medication", label: "Uống thuốc" },
    { id: "appointment", label: "Cuộc hẹn" },
    { id: "other", label: "Khác" }
  ];

  useEffect(() => {
    console.log('Current remindId:', remindId);
    fetchReminderDetails();
  }, [remindId]);

  const fetchReminderDetails = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminderHistory();
      const currentReminder = response.find(r => r.remindId === parseInt(remindId));
      
      if (!currentReminder) {
        toast.error("Không tìm thấy lịch nhắc nhở");
        navigate("/member/calendar-history");
        return;
      }

      setReminder({
        title: currentReminder.title || "",
        date: currentReminder.date?.split('T')[0] || "",
        time: currentReminder.time || "",
        reminderType: currentReminder.reminderType || "medication",
        notification: currentReminder.notification || ""
      });
    } catch (error) {
      toast.error("Không thể tải thông tin lịch nhắc nhở");
      navigate("/member/calendar-history");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!validateReminderForm()) {
        return;
      }

      await reminderService.updateReminder(remindId, reminder);
      toast.success("Cập nhật lịch nhắc nhở thành công!");
      navigate("/member/calendar-history");
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật lịch nhắc nhở");
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
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
          onClick={() => navigate("/member/calendar-history")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Chỉnh sửa lịch nhắc nhở</h1>
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
            placeholder="Nhập tiêu đề"
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
          <label htmlFor="reminderType">Loại nhắc nhở</label>
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

        <div className="form-group">
          <label htmlFor="notification">Ghi chú</label>
          <textarea
            id="notification"
            name="notification"
            value={reminder.notification}
            onChange={handleInputChange}
            placeholder="Nhập ghi chú (không bắt buộc)"
            rows={4}
          />
        </div>

        <div className="form-actions">
          <motion.button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/member/calendar-history")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hủy
          </motion.button>
          <motion.button
            type="submit"
            className="save-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Lưu thay đổi
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default CalendarChange;
