import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  Edit, 
  FileText, 
  User, 
  MapPin,
  MessageCircle
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";
import reminderService from "../../api/services/reminderService";
import "./CalendarDetail.scss";

const CalendarDetail = () => {
  const navigate = useNavigate();
  const { remindId } = useParams();
  const [loading, setLoading] = useState(true);
  const [reminder, setReminder] = useState(null);
  const [error, setError] = useState(null);

  // Ánh xạ reminderType sang loại sự kiện và màu sắc
  const reminderTypeMap = {
    "Cuộc hẹn bác sĩ": { color: "#FF6B81", icon: <User size={20} /> },
    "Uống thuốc": { color: "#4CAF50", icon: <FileText size={20} /> },
    "Khám thai": { color: "#FF6B81", icon: <User size={20} /> },
    "Tập thể dục": { color: "#9C27B0", icon: <Calendar size={20} /> },
    "Dinh dưỡng": { color: "#2196F3", icon: <Calendar size={20} /> }
  };

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
        setError("Không tìm thấy lịch nhắc nhở");
        toast.error("Không tìm thấy lịch nhắc nhở");
        return;
      }

      setReminder(currentReminder);
    } catch (error) {
      console.error("Error fetching reminder details:", error);
      setError("Không thể tải thông tin lịch nhắc nhở");
      toast.error("Không thể tải thông tin lịch nhắc nhở");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return moment(dateString).format('dddd, DD/MM/YYYY');
  };

  const getReminderTypeInfo = (type) => {
    return reminderTypeMap[type] || { color: "#98D8C8", icon: <Calendar size={20} /> };
  };

  const handleEdit = () => {
    navigate(`/member/calendar/change/${remindId}`);
  };

  if (loading) {
    return (
      <div className="calendar-detail">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !reminder) {
    return (
      <div className="calendar-detail">
        <div className="error-container">
          <AlertCircle size={40} />
          <p>{error || "Không tìm thấy thông tin lịch nhắc nhở"}</p>
          <button onClick={() => navigate("/member/calendar")}>
            Quay lại lịch
          </button>
        </div>
      </div>
    );
  }

  const { color, icon } = getReminderTypeInfo(reminder.reminderType);

  return (
    <motion.div
      className="calendar-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
        <h1>Chi tiết sự kiện</h1>
      </div>

      <div className="event-date-container">
        <Calendar size={20} className="date-icon" />
        <span>{formatDate(reminder.date)}</span>
      </div>

      <motion.div
        className="reminder-card"
        style={{ borderTopColor: color }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="card-header">
          <div className="reminder-title">
            <div className="title-icon" style={{ backgroundColor: color }}>
              {icon}
            </div>
            <h2>{reminder.title}</h2>
          </div>
          <div className="action-buttons">
            <button className="edit-button" onClick={handleEdit}>
              <Edit size={16} />
            </button>
          </div>
        </div>

        <div className="reminder-info">
          <div className="info-item">
            <Clock size={20} className="info-icon" />
            <span>{reminder.time}</span>
          </div>
          
          <div className="info-item">
            <Tag size={20} className="info-icon" />
            <span>{reminder.reminderType}</span>
          </div>

          {reminder.location && (
            <div className="info-item">
              <MapPin size={20} className="info-icon" />
              <span>{reminder.location}</span>
            </div>
          )}
          
          {reminder.notification && (
            <div className="reminder-note">
              <div className="note-header">
                <MessageCircle size={20} className="note-icon" />
                <span>Ghi chú</span>
              </div>
              <p>{reminder.notification}</p>
            </div>
          )}
        </div>

        <div className="reminder-actions">
          <motion.button
            className="back-button"
            onClick={() => navigate("/member/calendar")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Quay lại lịch
          </motion.button>
          <motion.button
            className="edit-button"
            onClick={handleEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Chỉnh sửa
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarDetail;
