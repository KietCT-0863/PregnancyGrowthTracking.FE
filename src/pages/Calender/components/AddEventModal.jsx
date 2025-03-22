import { motion } from "framer-motion";
import { Clock, Plus } from "lucide-react";
import PropTypes from 'prop-types';
import { useState } from "react";
import moment from "moment";

const AddEventModal = ({ visible, onClose, onSave, categories }) => {
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("HH:mm"),
    reminderType: "",
    notification: "",
    location: "",
  });

  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newEvent);
    
    // Reset form
    setNewEvent({
      title: "",
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm"),
      reminderType: "",
      notification: "",
      location: "",
    });
  };

  if (!visible) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content simple-modal"
        initial={{ scale: 0.8, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Thêm sự kiện mới</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tiêu đề"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <input
              type="date"
              value={newEvent.date}
              min={getCurrentDate()}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group time-selection">
            <label>Thời gian</label>
            <div className="time-input-wrapper">
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
                required
              />
              <Clock size={16} className="time-icon" />
            </div>
          </div>

          <div className="form-group">
            <select
              value={newEvent.reminderType}
              onChange={(e) =>
                setNewEvent({ ...newEvent, reminderType: e.target.value })
              }
              required
            >
              <option value="">-- Chọn loại sự kiện --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input
              type="text"
              placeholder="Địa điểm (không bắt buộc)"
              value={newEvent.location || ''}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <textarea
              placeholder="Thông báo (không bắt buộc)"
              value={newEvent.notification || ''}
              onChange={(e) =>
                setNewEvent({ ...newEvent, notification: e.target.value })
              }
              rows={4}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="save-btn">
              Lưu
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

AddEventModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired
};

export default AddEventModal; 