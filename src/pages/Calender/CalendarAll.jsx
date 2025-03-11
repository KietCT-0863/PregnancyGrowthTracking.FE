"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./CalendarAll.scss";
import reminderService from "../../api/services/reminderService";
import { toast } from "react-toastify";

const CalendarAll = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    reminderType: "appointment",
    notification: "",
  });

  const categories = [
    { id: "appointment", label: "Cuộc hẹn bác sĩ", color: "#FF6B6B" },
    { id: "medication", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "checkup", label: "Khám thai", color: "#45B7D1" },
    { id: "exercise", label: "Tập thể dục", color: "#FFA07A" },
    { id: "nutrition", label: "Dinh dưỡng", color: "#98D8C8" },
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

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      console.group("Add Event Details");
      console.log("New Event Data:", newEvent);

      const reminderData = {
        date: new Date(newEvent.date).toISOString(),
        time: newEvent.time,
        title: newEvent.title,
        notification: newEvent.notification,
        reminderType: newEvent.reminderType,
      };

      console.log("Formatted Reminder Data:", reminderData);

      const response = await reminderService.createReminder(reminderData);
      console.log("Create Reminder Response:", response);

      setEvents([...events, response.data]);
      setShowAddModal(false);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        reminderType: "appointment",
        notification: "",
      });

      toast.success("Tạo lịch nhắc nhở thành công!");
      console.groupEnd();
    } catch (error) {
      console.group("Add Event Error");
      console.error("Error Object:", error);
      console.error("Error Message:", error.message);
      console.error("Error Status:", error.status);
      console.groupEnd();

      toast.error(error.message || "Không thể tạo lịch nhắc nhở");
    }
  };

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await reminderService.getReminderHistory();
        setEvents(response.data);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        toast.error("Không thể tải danh sách lịch nhắc nhở");
      }
    };

    fetchReminders();
  }, []);

  const filteredEvents =
    events && events.length
      ? events.filter((event) => {
          if (!event) return false;

          const matchesSearch =
            event.title &&
            event.title.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory =
            selectedCategory === "all" ||
            event.reminderType === selectedCategory;

          return matchesSearch && matchesCategory;
        })
      : [];

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
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
          <Link to="/member/calendar-history/:id" className="history-btn">
            <Clock size={20} />
            Lịch sử
          </Link>
          <motion.button
            className="add-event-btn"
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Thêm sự kiện
          </motion.button>
        </div>
      </div>

      <div className="calendar-navigation">
        <motion.button
          onClick={() => navigateMonth(-1)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
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
          <ChevronRight size={24} />
        </motion.button>
      </div>

      <div className="calendar-tools">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sự kiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-filter"
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
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
                {filteredEvents
                  .filter(
                    (event) =>
                      new Date(event.date).toDateString() === day.toDateString()
                  )
                  .map((event) => (
                    <Link
                      to={`/member/calendar/${event.id}`}
                      key={event.id}
                      className={`event-pill ${event.reminderType}`}
                      style={{
                        backgroundColor: categories.find(
                          (cat) => cat.id === event.reminderType
                        )?.color,
                      }}
                    >
                      {event.title}
                    </Link>
                  ))}
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
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
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
                    onClick={() => setShowAddModal(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
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
    </motion.div>
  );
};

export default CalendarAll;
