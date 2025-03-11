"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Tag, Trash, Edit } from "lucide-react";
import "./CalendarHistory.scss";
import reminderService from "../../api/services/reminderService";
import { toast } from "react-toastify";

const CalendarHistory = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "medication", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "Uống thuốc", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "string", label: "Khác", color: "#98D8C8" }
  ];

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminderHistory();
      const reminderData = Array.isArray(response) ? response : [];
      setReminders(reminderData);
    } catch (error) {
      toast.error("Không thể tải lịch sử nhắc nhở");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reminder) => {
    const remindId = reminder.remindId;
    
    if (!remindId) {
      toast.error("Không thể xóa: ID không hợp lệ");
      return;
    }

    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa lịch nhắc nhở này?")) {
        await reminderService.deleteReminder(remindId);
        setReminders(prevReminders => 
          prevReminders.filter(r => r.remindId !== remindId)
        );
        toast.success("Xóa lịch nhắc nhở thành công!");
      }
    } catch (error) {
      toast.error(error.message || "Không thể xóa lịch nhắc nhở");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getCategoryColor = (reminderType) => {
    const category = categories.find(cat => cat.id === reminderType);
    return category?.color || "#98D8C8"; // Default color if not found
  };

  const getCategoryLabel = (reminderType) => {
    const category = categories.find(cat => cat.id === reminderType);
    return category?.label || reminderType; // Return original type if not found
  };

  return (
    <motion.div
      className="calendar-history"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="history-header">
        <motion.button
          className="back-button"
          onClick={() => navigate("/member/calendar")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Lịch sử nhắc nhở</h1>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : reminders.length === 0 ? (
        <div className="no-reminders">Chưa có lịch nhắc nhở nào</div>
      ) : (
        <div className="reminders-list">
          {reminders.map((reminder, index) => (
            <motion.div
              key={reminder.remindId || index}
              className="reminder-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="reminder-header">
                <h3>{reminder.title}</h3>
                <div className="reminder-actions">
                  <motion.button
                    className="edit-button"
                    onClick={() => {
                      console.log('Navigating to edit page with remindId:', reminder.remindId);
                      navigate(`/member/calendar-change/${reminder.remindId}`);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Edit size={16} />
                  </motion.button>
                  <motion.button
                    className="delete-button"
                    onClick={() => handleDelete(reminder)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash size={16} />
                  </motion.button>
                </div>
              </div>

              <div className="reminder-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{formatDate(reminder.date)}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{reminder.time}</span>
                </div>
                <div className="detail-item">
                  <Tag size={16} />
                  <span style={{
                    color: getCategoryColor(reminder.reminderType)
                  }}>
                    {getCategoryLabel(reminder.reminderType)}
                  </span>
                </div>
              </div>

              {reminder.notification && (
                <div className="reminder-notification">
                  <p>{reminder.notification}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default CalendarHistory;
