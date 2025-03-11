"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  Tag,
  Trash,
  Edit,
  X,
} from "lucide-react";
import "./CalendarHistory.scss";
import reminderService from "../../api/services/reminderService";
import { toast } from "react-toastify";

const CalendarHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);

  const categories = [
    { id: "appointment", label: "Cuộc hẹn bác sĩ", color: "#FF6B6B" },
    { id: "medication", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "checkup", label: "Khám thai", color: "#45B7D1" },
    { id: "exercise", label: "Tập thể dục", color: "#FFA07A" },
    { id: "nutrition", label: "Dinh dưỡng", color: "#98D8C8" },
  ];

  useEffect(() => {
    const fetchReminderDetails = async () => {
      try {
        const response = await reminderService.getReminderHistory();
        const reminder = response.data.find((r) => r.id === id);
        setEvent(reminder);
        setEditedEvent(reminder);
      } catch (error) {
        console.error("Error fetching reminder:", error);
        toast.error("Không thể tải thông tin lịch nhắc nhở");
      }
    };

    fetchReminderDetails();
  }, [id]);

  const handleSave = async () => {
    try {
      const reminderData = {
        date: new Date(editedEvent.date).toISOString(),
        time: editedEvent.time,
        title: editedEvent.title,
        notification: editedEvent.notes,
        reminderType: editedEvent.category,
      };

      await reminderService.updateReminder(id, reminderData);
      setEvent(editedEvent);
      setIsEditing(false);
      toast.success("Cập nhật lịch nhắc nhở thành công!");
    } catch (error) {
      console.error("Error updating reminder:", error);
      toast.error(error.message || "Không thể cập nhật lịch nhắc nhở");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch nhắc nhở này?")) {
      try {
        await reminderService.deleteReminder(id);
        toast.success("Xóa lịch nhắc nhở thành công!");
        navigate("/member/calendar");
      } catch (error) {
        console.error("Error deleting reminder:", error);
        toast.error(error.message || "Không thể xóa lịch nhắc nhở");
      }
    }
  };

  if (!event) return null;

  return (
    <motion.div
      className="calendar-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="calendar-detail-header">
        <motion.button
          className="back-button"
          onClick={() => navigate("/member/calendar")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft />
          <span>Quay lại</span>
        </motion.button>

        <div className="header-actions">
          {!isEditing && (
            <>
              <motion.button
                className="edit-button"
                onClick={() => setIsEditing(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={20} />
                <span>Chỉnh sửa</span>
              </motion.button>
              <motion.button
                className="delete-button"
                onClick={handleDelete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash size={20} />
                <span>Xóa</span>
              </motion.button>
            </>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            className="edit-form"
            key="edit-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <input
              type="text"
              value={editedEvent.title}
              onChange={(e) =>
                setEditedEvent({ ...editedEvent, title: e.target.value })
              }
              placeholder="Tiêu đề"
            />

            <div className="form-row">
              <div className="form-group">
                <label>Ngày</label>
                <input
                  type="date"
                  value={editedEvent.date}
                  onChange={(e) =>
                    setEditedEvent({ ...editedEvent, date: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Giờ</label>
                <input
                  type="time"
                  value={editedEvent.time}
                  onChange={(e) =>
                    setEditedEvent({ ...editedEvent, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Danh mục</label>
              <select
                value={editedEvent.category}
                onChange={(e) =>
                  setEditedEvent({ ...editedEvent, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                value={editedEvent.notes}
                onChange={(e) =>
                  setEditedEvent({ ...editedEvent, notes: e.target.value })
                }
                rows={4}
              />
            </div>

            <div className="form-actions">
              <motion.button
                className="cancel-button"
                onClick={() => setIsEditing(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
                <span>Hủy</span>
              </motion.button>
              <motion.button
                className="save-button"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Edit size={20} />
                <span>Lưu</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="event-details"
            key="event-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1>{event.title}</h1>

            <div className="event-meta">
              <div className="meta-item">
                <CalendarIcon size={20} />
                <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="meta-item">
                <Clock size={20} />
                <span>{event.time}</span>
              </div>

              <div className="meta-item">
                <Tag size={20} />
                <span
                  style={{
                    color: categories.find((cat) => cat.id === event.category)
                      ?.color,
                  }}
                >
                  {categories.find((cat) => cat.id === event.category)?.label}
                </span>
              </div>
            </div>

            <div className="event-notes">
              <h3>Ghi chú</h3>
              <p>{event.notes}</p>
            </div>

            <div className="event-created">
              <small>
                Tạo ngày:{" "}
                {new Date(event.createdAt).toLocaleDateString("vi-VN")}
              </small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarHistory;
