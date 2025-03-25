import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Trash2,
  Edit,
  Search,
  Filter,
  Info,
  AlertCircle,
  CheckCircle,
  User,
  FileText,
  Pill,
  Activity,
  Apple,
  Eye
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import "./CalendarHistory.scss";
import reminderService from "../../api/services/reminderService";
import { playNotificationSound, playDeleteSound } from '../../utils/soundUtils';

const CalendarHistory = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm'),
    reminderType: "Uống thuốc",
    notification: "",
  });

  // Ánh xạ reminderType sang loại sự kiện, màu sắc và biểu tượng
  const reminderTypeMap = {
    "Cuộc hẹn bác sĩ": { 
      type: "appointment", 
      color: "#FF6B81", 
      icon: <User size={16} />,
      detailIcon: <User size={20} />
    },
    "Uống thuốc": { 
      type: "medication", 
      color: "#4CAF50", 
      icon: <Pill size={16} />,
      detailIcon: <Pill size={20} />
    },
    "Khám thai": { 
      type: "appointment", 
      color: "#FF6B81", 
      icon: <Eye size={16} />,
      detailIcon: <Eye size={20} />
    },
    "Tập thể dục": { 
      type: "personal", 
      color: "#9C27B0", 
      icon: <Activity size={16} />,
      detailIcon: <Activity size={20} />
    },
    "Dinh dưỡng": { 
      type: "milestone", 
      color: "#2196F3", 
      icon: <Apple size={16} />,
      detailIcon: <Apple size={20} />
    }
  };

  // Các loại sự kiện hiển thị trong dropdown
  const eventTypes = {
    "all": { label: "Tất cả", color: "#666666" },
    "appointment": { label: "Cuộc hẹn & Khám thai", color: "#FF6B81" },
    "medication": { label: "Thuốc & Vitamin", color: "#4CAF50" },
    "milestone": { label: "Dinh dưỡng", color: "#2196F3" },
    "personal": { label: "Tập thể dục & Cá nhân", color: "#9C27B0" }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách reminder
      const reminderData = await reminderService.getReminderHistory();
      
      // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
      const formattedEvents = reminderData.map(reminder => {
        // Lấy thông tin loại và màu sắc dựa trên reminderType
        const { type, color, icon, detailIcon } = reminderTypeMap[reminder.reminderType] || 
          { type: "personal", color: "#9C27B0", icon: <Calendar size={16} />, detailIcon: <Calendar size={20} /> };
          
        // Tạo đối tượng Date từ date và time của reminder
        const startDate = moment(`${reminder.date} ${reminder.time}`, 'YYYY-MM-DD HH:mm').toDate();
        
        return {
          id: reminder.remindId,
          title: reminder.title,
          start: startDate,
          type: type,
          description: reminder.notification,
          color: color,
          icon: icon,
          detailIcon: detailIcon,
          reminderType: reminder.reminderType,
          reminderData: reminder,
          date: reminder.date,
          time: reminder.time
        };
      });
      
      // Sắp xếp sự kiện theo thời gian, mới nhất lên đầu
      formattedEvents.sort((a, b) => b.start - a.start);
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      toast.error("Không thể tải danh sách lịch. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      setLoading(true);
      // Gọi API xóa reminder
      await reminderService.deleteReminder(eventToDelete.id);
      
      // Cập nhật danh sách hiển thị sau khi xóa
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete.id));
      toast.success("Xóa lịch thành công!");
      playDeleteSound(); // Play delete sound
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Lỗi khi xóa lịch:", error);
      toast.error(error.message || "Có lỗi xảy ra khi xóa lịch");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Kiểm tra xem một sự kiện có sắp diễn ra không (trong vòng 24 giờ)
  const isUpcoming = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = moment(`${eventDate} ${eventTime}`, 'YYYY-MM-DD HH:mm').toDate();
    const diffHours = (eventDateTime - now) / (1000 * 60 * 60);
    return diffHours > 0 && diffHours <= 24;
  };

  // Kiểm tra xem một sự kiện đã qua hay chưa
  const isPast = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = moment(`${eventDate} ${eventTime}`, 'YYYY-MM-DD HH:mm').toDate();
    return eventDateTime < now;
  };

  // Lọc sự kiện theo loại và từ khóa tìm kiếm
  const filteredEvents = events.filter(event => {
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Nhóm các sự kiện theo ngày
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const eventDate = formatDate(event.start);
    if (!groups[eventDate]) {
      groups[eventDate] = [];
    }
    groups[eventDate].push(event);
    return groups;
  }, {});

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateEventForm = (eventData) => {
    if (!eventData.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return false;
    }

    // Kiểm tra ngày có hợp lệ không
    const selectedDate = new Date(eventData.date);
    const today = new Date(getCurrentDate());

    if (!eventData.date) {
      toast.error("Vui lòng chọn ngày");
      return false;
    }

    if (selectedDate < today) {
      toast.error("Không thể chọn ngày trong quá khứ");
      return false;
    }

    if (!eventData.time) {
      toast.error("Vui lòng chọn giờ");
      return false;
    }

    if (!eventData.reminderType) {
      toast.error("Vui lòng chọn loại nhắc nhở");
      return false;
    }
    return true;
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      // Validate form data
      if (!validateEventForm(newEvent)) {
        return;
      }

      const reminderData = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        time: newEvent.time,
        reminderType: newEvent.reminderType,
        notification: newEvent.notification || "",
        location: "",
        description: "",
      };

      const response = await reminderService.createReminder(reminderData);

      if (response) {
        setShowAddModal(false);
        toast.success("Tạo lịch nhắc nhở thành công!");
        playNotificationSound();
        fetchEvents(); // Reload the events list
      }
    } catch (error) {
      toast.error(error.message || "Không thể tạo lịch nhắc nhở");
    }
  };

  const resetForm = () => {
    setShowAddModal(false);
    setNewEvent({
      title: "",
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      reminderType: "Uống thuốc",
      notification: "",
    });
  };

  return (
    <motion.div
      className="calendar-history-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="history-header">
        <motion.button
          className="back-button"
          onClick={() => navigate("/member/calendar")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} />
          <span>Quay lại lịch</span>
        </motion.button>
        <h1>Lịch sử sự kiện</h1>
      </div>

      <div className="filter-section">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="type-filter">
          <Filter size={18} className="filter-icon" />
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {Object.entries(eventTypes).map(([type, { label }]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải danh sách sự kiện...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Calendar size={40} className="empty-icon" />
          <h2>Không có sự kiện nào</h2>
          <p>
            {searchTerm || selectedType !== 'all'
              ? "Không tìm thấy sự kiện phù hợp với bộ lọc."
              : "Bạn chưa có sự kiện nào. Hãy tạo sự kiện mới!"}
          </p>
          <motion.button 
            onClick={() => setShowAddModal(true)} 
            className="create-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tạo sự kiện mới
          </motion.button>
        </div>
      ) : (
        <div className="events-by-date">
          {Object.entries(groupedEvents).map(([date, dateEvents]) => (
            <div key={date} className="event-date-group">
              <div className="date-header">
                <Calendar size={18} />
                <h2>{date}</h2>
              </div>
              
              <div className="events-list">
                {dateEvents.map(event => (
                  <motion.div
                    key={event.id}
                    className={`event-card ${isUpcoming(event.date, event.time) ? 'upcoming' : ''} ${isPast(event.date, event.time) ? 'past' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/member/calendar/detail/${event.id}`)}
                  >
                    <div className="event-header" style={{ backgroundColor: event.color }}>
                      <div className="event-title-container">
                        <div className="event-icon">{event.detailIcon}</div>
                        <h3>{event.title}</h3>
                      </div>
                      <div className="event-actions">
                        <motion.button
                          className="edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/member/calendar/change/${event.id}`);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit size={16} />
                        </motion.button>
                        <motion.button
                          className="delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(event);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="event-content">
                      <div className="event-info">
                        <div className="info-row">
                          <Clock size={16} />
                          <span>{formatTime(event.start)}</span>
                        </div>
                        
                        <div className="info-row">
                          <Tag size={16} />
                          <span>{event.reminderType}</span>
                        </div>
                      </div>
                      
                      {event.description && (
                        <div className="event-description">
                          <h4>
                            <Info size={16} />
                            Ghi chú
                          </h4>
                          <p>{event.description}</p>
                        </div>
                      )}

                      {isUpcoming(event.date, event.time) && (
                        <div className="event-badge upcoming-badge">
                          <AlertCircle size={14} />
                          <span>Sắp diễn ra</span>
                        </div>
                      )}

                      {isPast(event.date, event.time) && (
                        <div className="event-badge past-badge">
                          <CheckCircle size={14} />
                          <span>Đã hoàn thành</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          <motion.button 
            onClick={() => setShowAddModal(true)} 
            className="add-event-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tạo sự kiện mới
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="delete-confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="confirmation-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-icon">
                <AlertCircle size={50} />
              </div>
              <h2>Xác nhận xóa</h2>
              <p>Bạn có chắc chắn muốn xóa sự kiện "{eventToDelete?.title}"?</p>
              
              <div className="modal-actions">
                <motion.button
                  className="cancel-button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setEventToDelete(null);
                  }}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hủy
                </motion.button>
                <motion.button
                  className="confirm-button"
                  onClick={confirmDelete}
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Đang xóa...' : 'Xóa'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Thêm sự kiện mới</h2>
              <form onSubmit={handleAddEvent}>
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                />

                <input
                  type="date"
                  value={newEvent.date}
                  min={getCurrentDate()}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  required
                />

                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  required
                />

                <select
                  value={newEvent.reminderType}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, reminderType: e.target.value })
                  }
                  required
                >
                  <option value="">-- Chọn loại sự kiện --</option>
                  {Object.keys(reminderTypeMap).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <textarea
                  placeholder="Thông báo"
                  value={newEvent.notification}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notification: e.target.value })
                  }
                />

                <div className="modal-actions">
                  <motion.button
                    type="button"
                    className="cancel-button"
                    onClick={() => resetForm()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="confirm-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Lưu
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="bottom-right" />
    </motion.div>
  );
};

export default CalendarHistory;