import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import reminderService from "../../api/services/reminderService";
import "./CalendarDetail.scss";

const CalendarDetail = () => {
  const navigate = useNavigate();
  const { remindId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState(null);

  // Danh sách loại nhắc nhở
  const categories = [
    { id: "Cuộc hẹn bác sĩ", label: "Cuộc hẹn bác sĩ", color: "#FF6B6B" },
    { id: "Uống thuốc", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "Khám thai", label: "Khám thai", color: "#45B7D1" },
    { id: "Tập thể dục", label: "Tập thể dục", color: "#FFA07A" },
    { id: "Dinh dưỡng", label: "Dinh dưỡng", color: "#98D8C8" },
  ];

  useEffect(() => {
    fetchReminderDetails();
  }, [remindId]);

  const fetchReminderDetails = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminderHistory();
      const currentReminder = response.find(
        (r) => r.remindId === parseInt(remindId)
      );

      if (!currentReminder) {
        toast.error("Không tìm thấy lịch nhắc nhở");
        navigate("/member/calendar");
        return;
      }

      setReminder(currentReminder);
    } catch (error) {
      console.error("Error fetching reminder details:", error);
      toast.error("Không thể tải thông tin lịch nhắc nhở");
      navigate("/member/calendar");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const getCategoryColor = (reminderType) => {
    const category = categories.find((cat) => cat.id === reminderType);
    return category?.color || "#98D8C8"; // Default color if not found
  };

  const getCategoryLabel = (reminderType) => {
    const category = categories.find((cat) => cat.id === reminderType);
    return category?.label || reminderType; // Return original type if not found
  };

  if (loading) {
    return (
      <div className="calendar-detail">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!reminder) {
    return (
      <div className="calendar-detail">
        <div className="error-message">
          Không tìm thấy thông tin lịch nhắc nhở
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="calendar-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="detail-header">
        <motion.button
          className="back-button"
          onClick={() => navigate("/member/calendar")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Chi tiết lịch nhắc nhở</h1>
      </div>

      <motion.div
        className="detail-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="detail-title"
          style={{
            borderColor: getCategoryColor(reminder.reminderType),
          }}
        >
          <h2>{reminder.title}</h2>
          <div
            className="category-badge"
            style={{
              backgroundColor: getCategoryColor(reminder.reminderType),
            }}
          >
            {getCategoryLabel(reminder.reminderType)}
          </div>
        </div>

        <div className="detail-info">
          <div className="info-item">
            <Calendar size={24} />
            <div className="info-content">
              <span className="info-label">Ngày</span>
              <span className="info-value">{formatDate(reminder.date)}</span>
            </div>
          </div>

          <div className="info-item">
            <Clock size={24} />
            <div className="info-content">
              <span className="info-label">Giờ</span>
              <span className="info-value">{reminder.time}</span>
            </div>
          </div>
        </div>

        {reminder.notification && (
          <div className="notification-section">
            <div className="notification-header">
              <AlertCircle size={20} />
              <h3>Ghi chú</h3>
            </div>
            <p>{reminder.notification}</p>
          </div>
        )}

        <div className="detail-actions">
          <motion.button
            className="edit-button"
            onClick={() =>
              navigate(`/member/calendar-change/${reminder.remindId}`)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Chỉnh sửa
          </motion.button>
          <motion.button
            className="back-to-calendar"
            onClick={() => navigate("/member/calendar")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Xem lịch
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarDetail;
