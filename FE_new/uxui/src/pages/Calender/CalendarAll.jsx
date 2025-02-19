import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus, Search, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import "./CalendarAll.scss";

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
    category: "appointment",
    notes: "",
  });

  // Categories for pregnancy-related events
  const categories = [
    { id: "appointment", label: "Cuộc hẹn bác sĩ" },
    { id: "medication", label: "Uống thuốc" },
    { id: "checkup", label: "Khám thai" },
    { id: "exercise", label: "Tập thể dục" },
    { id: "nutrition", label: "Dinh dưỡng" },
  ];

  // Generate calendar days
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

  const handleAddEvent = (e) => {
    e.preventDefault();
    const event = {
      id: Date.now(),
      ...newEvent,
      createdAt: new Date().toISOString(),
    };
    
    setEvents([...events, event]);
    setShowAddModal(false);
    setNewEvent({
      title: "",
      date: "",
      time: "",
      category: "appointment",
      notes: "",
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Thêm hàm điều hướng tháng
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // Format tháng và năm hiện tại
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Lịch thai kỳ</h1>
        <div className="header-actions">
          <Link to="/calendar-history" className="history-btn">
            <Clock size={20} />
            Lịch sử
          </Link>
          <button className="add-event-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Thêm sự kiện
          </button>
        </div>
      </div>

      <div className="calendar-navigation">
        <button onClick={() => navigateMonth(-1)}>&lt;</button>
        <span className="current-month">{formatMonthYear(currentDate)}</span>
        <button onClick={() => navigateMonth(1)}>&gt;</button>
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
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </select>
      </div>

      <div className="calendar-grid">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
        
        {getDaysInMonth(currentDate).map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day === null ? 'empty' : ''} ${
              day?.toDateString() === new Date().toDateString() ? 'today' : ''
            }`}
          >
            {day && (
              <>
                <span className="day-number">{day.getDate()}</span>
                {filteredEvents
                  .filter(event => new Date(event.date).toDateString() === day.toDateString())
                  .map(event => (
                    <Link
                      to={`/calendar/${event.id}`}
                      key={event.id}
                      className={`event-pill ${event.category}`}
                    >
                      {event.title}
                    </Link>
                  ))}
              </>
            )}
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Thêm sự kiện mới</h2>
            <form onSubmit={handleAddEvent}>
              <input
                type="text"
                placeholder="Tiêu đề"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                required
              />
              
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                required
              />
              
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                required
              />
              
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <textarea
                placeholder="Ghi chú"
                value={newEvent.notes}
                onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})}
              />
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarAll;