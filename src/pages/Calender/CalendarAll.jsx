"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Clock,
  ChevronLeft,
  ChevronRight,
  Pill,
  Stethoscope,
  Baby,
  Dumbbell,
  Apple,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CalendarAll.scss";
import reminderService from "../../api/services/reminderService";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import moment from "moment";

const CalendarAll = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: moment().format('YYYY-MM-DD'),
    time: moment().format('HH:mm'),
    reminderType: "",
    notification: "",
  });

  const categories = [
    {
      id: "Cuộc hẹn bác sĩ",
      label: "Cuộc hẹn bác sĩ",
      color: "#FF6B6B",
      icon: Stethoscope,
    },
    { id: "Uống thuốc", label: "Uống thuốc", color: "#4ECDC4", icon: Pill },
    { id: "Khám thai", label: "Khám thai", color: "#45B7D1", icon: Baby },
    {
      id: "Tập thể dục",
      label: "Tập thể dục",
      color: "#FFA07A",
      icon: Dumbbell,
    },
    { id: "Dinh dưỡng", label: "Dinh dưỡng", color: "#98D8C8", icon: Apple },
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
        updateEventsAfterAdd(response);
        resetForm();
        toast.success("Tạo lịch nhắc nhở thành công!");
        fetchReminders();
      }
    } catch (error) {
      toast.error(error.message || "Không thể tạo lịch nhắc nhở");
    }
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

  const resetForm = () => {
    setShowAddModal(false);
    setNewEvent({
      title: "",
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('HH:mm'),
      reminderType: categories[0].id,
      notification: "",
    });
  };

  const fetchReminders = async () => {
    try {
      const response = await reminderService.getReminderHistory();
      const formattedData = Array.isArray(response)
        ? response.map((item) => ({
            id: item.remindId,
            title: item.title,
            date: item.date,
            time: item.time,
            reminderType: item.reminderType || "Uống thuốc",
            notification: item.notification,
          }))
        : [];

      setEvents(formattedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách nhắc nhở:", error);
      toast.error("Không thể tải danh sách lịch nhắc nhở");
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const getEventsForMonth = (events, date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const filteredEvents =
    events && events.length
      ? events.filter((event) => {
          if (!event) return false;

          // Kiểm tra sự kiện có trong tháng hiện tại không
          const eventDate = new Date(event.date);
          const isCurrentMonth =
            eventDate.getMonth() === currentDate.getMonth() &&
            eventDate.getFullYear() === currentDate.getFullYear();

          // Kiểm tra điều kiện tìm kiếm và category
          const matchesSearch =
            event.title &&
            event.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategory === "all" ||
            event.reminderType === selectedCategory;

          return isCurrentMonth && matchesSearch && matchesCategory;
        })
      : [];

  const getCategoryStats = () => {
    const monthEvents = getEventsForMonth(events, currentDate);
    const stats = categories.reduce((acc, cat) => {
      acc[cat.id] = monthEvents.filter(
        (event) => event.reminderType === cat.id
      ).length;
      return acc;
    }, {});

    // Thêm tổng số sự kiện
    stats.all = monthEvents.length;
    return stats;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  const getEventIcon = (reminderType) => {
    const category = categories.find((cat) => cat.id === reminderType);
    if (!category) return null;

    const IconComponent = category.icon;
    return <IconComponent size={16} />;
  };

  const updateEventsAfterAdd = (newEvent) => {
    setEvents((prevEvents) => {
      const currentEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...currentEvents, newEvent];
    });
  };

  const CategoryFilters = () => {
    return (
      <div className="category-filters">
        <motion.button
          className={`filter-btn all ${
            selectedCategory === "all" ? "active" : ""
          }`}
          onClick={() => setSelectedCategory("all")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="filter-label">Tất cả</span>
          <span className="filter-count">({getCategoryStats().all || 0})</span>
        </motion.button>

        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            className={`filter-btn ${
              selectedCategory === cat.id ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(cat.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor:
                selectedCategory === cat.id ? cat.color : "transparent",
              borderColor: cat.color,
            }}
          >
            {cat.icon && <cat.icon size={16} />}
            <span className="filter-label">{cat.label}</span>
            <span className="filter-count">({getCategoryStats()[cat.id] || 0})</span>
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="calendar-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="calendar-header">
        <h1>Lịch thai kỳ</h1>
        <div className="header-actions">
          <Link to="/member/calendar/history" className="history-btn">
            <History size={18} />
            <span>Lịch sử</span>
          </Link>
          <motion.button
            className="add-event-btn"
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            <span>Thêm sự kiện</span>
          </motion.button>
        </div>
      </div>

      <div className="calendar-navigation">
        <motion.button
          onClick={() => navigateMonth(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={20} />
        </motion.button>
        <motion.span
          className="current-month"
          key={currentDate.toISOString()}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {formatMonthYear(currentDate)}
        </motion.span>
        <motion.button
          onClick={() => navigateMonth(1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      <div className="calendar-tools">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <CategoryFilters />
      </div>

      <motion.div
        className="calendar-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {getDaysInMonth(currentDate).map((day, index) => (
          <motion.div
            key={index}
            className={`calendar-day ${day === null ? "empty" : ""} ${
              day?.toDateString() === new Date().toDateString() ? "today" : ""
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.01 }}
          >
            {day && (
              <>
                <span className="day-number">{day.getDate()}</span>
                <div className="day-events">
                  {filteredEvents
                    .filter(
                      (event) =>
                        new Date(event.date).toDateString() ===
                        day.toDateString()
                    )
                    .map((event) => (
                      <Link
                        to={`/member/calendar/detail/${event.id}`}
                        key={event.id}
                        className={`event-pill ${event.reminderType}`}
                        style={{
                          backgroundColor:
                            categories.find(
                              (cat) => cat.id === event.reminderType
                            )?.color || "#4ECDC4",
                        }}
                      >
                        <span className="event-icon">
                          {getEventIcon(event.reminderType) || (
                            <Clock size={16} />
                          )}
                        </span>
                        <span className="event-title">
                          {event.time} - {event.title}
                        </span>
                      </Link>
                    ))}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

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
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
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
                    className="cancel-btn"
                    onClick={() => setShowAddModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="save-btn"
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

export default CalendarAll;
