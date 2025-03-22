import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Clock, ChevronLeft, ChevronRight, Pill, Stethoscope, 
  Baby, Dumbbell, Apple, CalendarIcon, MapPin, History, X
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PropTypes from "prop-types";

// Import services and helpers
import reminderService from "../../api/services/reminderService";
import userService from "../../api/services/userService";
import profileImageService from "../../api/services/profileImageService";
import { getColorByType } from './calendarHelpers';

// Import components
import CalendarStats from './CalendarStats';
import CalendarDayFilter from "./CalendarDayFilter";
import NotificationPopup from './components/NotificationPopup';

// Import styles
import "./CalendarAll.scss";

const INITIAL_USER_DATA = {
  id: 0,
  name: "Người dùng",
  email: "",
  role: "Thành viên",
  avatar: null
};

const INITIAL_EVENT_DATA = {
  title: "",
  date: moment().format("YYYY-MM-DD"),
  time: moment().format("HH:mm"),
  reminderType: "",
  notification: "",
  location: "",
};

const CATEGORIES = [
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

const VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MINI_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const CalendarAll = () => {
  const navigate = useNavigate();
  
  // State definitions
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState('0px');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(INITIAL_USER_DATA);
  const [newEvent, setNewEvent] = useState(INITIAL_EVENT_DATA);
  const [viewMode, setViewMode] = useState(VIEW_MODES.MONTH);
  const [weekDates, setWeekDates] = useState(() => {
    const today = moment().startOf('week');
    return Array.from({length: 7}, (_, i) => moment(today).add(i, 'days').toDate());
  });
  const [selectedDayDate, setSelectedDayDate] = useState(new Date());

  // Add notification state
  const [notification, setNotification] = useState({
    type: 'success',
    message: '',
    isVisible: false
  });

  // Helpers
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatMonthYear = (date) => {
    const formatted = date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Data fetching and manipulation
  const fetchUserData = async () => {
    try {
      const userInfo = await userService.getUserInfo();
      let profileImageUrl = "";
      
      try {
        const profileImageData = await profileImageService.getProfileImage();
        
        if (profileImageData?.profileImageUrl) {
          profileImageUrl = profileImageData.profileImageUrl;
        } else if (userInfo?.profileImageUrl) {
          profileImageUrl = userInfo.profileImageUrl;
        }
      } catch (error) {
        console.error("Lỗi khi lấy ảnh đại diện:", error);
      }

      // Check localStorage as fallback
      if (!profileImageUrl) {
        try {
          const localUserData = localStorage.getItem('userData');
          if (localUserData) {
            const parsedUserData = JSON.parse(localUserData);
            if (parsedUserData.profileImageUrl) {
              profileImageUrl = parsedUserData.profileImageUrl;
            }
          }
        } catch (e) {
          console.error("Lỗi khi đọc userData từ localStorage:", e);
        }
      }

      setUserData({
        id: userInfo.id,
        name: userInfo.fullName || "Người dùng",
        email: userInfo.email,
        role: "Thành viên",
        avatar: profileImageUrl || "https://randomuser.me/api/portraits/women/65.jpg"
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      toast.error("Không thể tải thông tin người dùng");
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getReminderHistory();
      
      if (response && Array.isArray(response)) {
        const formattedEvents = response.map(event => ({
          id: event.remindId,
          remindId: event.remindId,
          title: event.title || '',
          date: event.date,
          time: event.time || '09:00',
          reminderType: event.reminderType || 'default',
          notification: event.notification || '',
          location: event.location || '',
          color: getColorByType(event.reminderType)
        }));
        
        setEvents(formattedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sự kiện:', error);
    } finally {
      setLoading(false);
    }
  };

  // Event filters
  const getEventsForMonth = useCallback((eventsData, date) => {
    return eventsData.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, []);

  const getEventsForDay = useCallback((eventsData, date) => {
    return eventsData.filter((event) => {
      if (!event?.date) return false;
      
      const eventDate = new Date(event.date);
      const compareDate = new Date(date);
      
      return (
        eventDate.getDate() === compareDate.getDate() &&
        eventDate.getMonth() === compareDate.getMonth() &&
        eventDate.getFullYear() === compareDate.getFullYear()
      );
    });
  }, []);

  const hasEventOnDay = useCallback((date) => {
    if (!date) return false;
    return events.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  }, [events]);

  const getFilteredEvents = useCallback(() => {
    if (!events?.length) return [];
    
    return events.filter((event) => {
      if (!event) return false;
      
      // Filter by category
      const matchesType = selectedCategory === 'all' || 
        (event.reminderType === selectedCategory);
        
      // Filter by search term
      const matchesSearch = !searchTerm || 
        (event.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.notification?.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return matchesType && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

  const getCategoryStats = useCallback(() => {
    const monthEvents = getEventsForMonth(events, currentDate);
    const stats = CATEGORIES.reduce((acc, cat) => {
      acc[cat.id] = monthEvents.filter((event) => event.reminderType === cat.id).length;
      return acc;
    }, {});

    stats.all = monthEvents.length;
    return stats;
  }, [events, currentDate, getEventsForMonth]);

  // Calendar navigation
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const navigateMiniCalendar = (direction) => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + direction, 1));
  };

  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    // Fill with nulls for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, []);

  // Event handlers
  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
  };

  const handleMiniCalendarDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setSelectedDate(day);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleDayChange = (date) => {
    setSelectedDayDate(date);
  };

  // Function to show notification
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Update event handling functions to include notifications
  
  // For creating events
  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      if (!validateEventForm(newEvent)) {
        return;
      }

      const reminderData = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        time: newEvent.time,
        reminderType: newEvent.reminderType,
        notification: newEvent.notification || "",
        location: newEvent.location || "",
        description: "",
      };

      const response = await reminderService.createReminder(reminderData);

      if (response) {
        updateEventsAfterAdd(response);
        resetForm();
        showNotification('success', 'Sự kiện đã được thêm thành công');
        fetchEvents();
      }
    } catch (error) {
      console.error('Error adding event:', error);
      showNotification('error', 'Đã xảy ra lỗi khi thêm sự kiện');
    }
  };

  const validateEventForm = (eventData) => {
    if (!eventData.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return false;
    }

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
    setSelectedEvent(null);
    setNewEvent({
      ...INITIAL_EVENT_DATA,
      reminderType: CATEGORIES[0].id,
    });
  };

  const updateEventsAfterAdd = (newEvent) => {
    setEvents((prevEvents) => {
      const currentEvents = Array.isArray(prevEvents) ? prevEvents : [];
      return [...currentEvents, newEvent];
    });
  };

  // Effects
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      if (hours >= 6 && hours <= 20) {
        const position = (hours - 6) + (minutes / 60);
        setCurrentTimePosition(`${position * 80}px`);
      }
    };

    updateCurrentTimePosition();
    const interval = setInterval(updateCurrentTimePosition, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Render helpers
  const renderMiniCalendar = () => {
    const days = getDaysInMonth(miniCalendarDate);

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <h4>{formatMonthYear(miniCalendarDate)}</h4>
          <div className="mini-calendar-nav">
            <button onClick={() => navigateMiniCalendar(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => navigateMiniCalendar(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="mini-calendar-weekdays">
          {MINI_WEEKDAYS.map(day => (
            <div key={day} className="mini-calendar-weekday">{day}</div>
          ))}
        </div>
        
        <div className="mini-calendar-days">
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`mini-calendar-day ${day === null ? 'empty' : ''} ${
                day && day.toDateString() === new Date().toDateString() ? 'today' : ''
              } ${day && day.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
              onClick={() => day && handleMiniCalendarDayClick(day)}
            >
              {day && (
                <>
                  {day.getDate()}
                  {hasEventOnDay(day) && <div className="event-dot" />}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    const stats = getCategoryStats();
    const totalEvents = stats.all || 0;

    return (
      <div className="calendar-categories">
        <h4>Danh mục</h4>
        <div className="category-list">
          {CATEGORIES.map(cat => {
            const count = stats[cat.id] || 0;
            const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
            
            return (
              <div key={cat.id} className="category-item">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label.charAt(0).toUpperCase() + cat.label.slice(1)}</span>
                <div className="category-progress">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${percentage}%`, 
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUpcomingEvent = () => {
    const today = new Date();
    const upcomingEvent = events
      .filter(event => new Date(`${event.date}T${event.time}`) >= today)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];

    if (!upcomingEvent) return null;

    const eventDate = new Date(`${upcomingEvent.date}T${upcomingEvent.time}`);
    const category = CATEGORIES.find(c => c.id === upcomingEvent.reminderType) || CATEGORIES[0];

    return (
      <div className="upcoming-event" style={{ borderColor: category.color }}>
        <div className="event-time">
          {moment(eventDate).format("dddd, D MMMM • HH:mm")}
        </div>
        <h4>{upcomingEvent.title}</h4>
        {upcomingEvent.location && <p>{upcomingEvent.location}</p>}
        <div className="event-actions">
          <button className="later-btn">Sau này</button>
          <button 
            className="details-btn" 
            onClick={() => handleEventClick(upcomingEvent)}
          >
            Chi tiết
          </button>
        </div>
      </div>
    );
  };

  const renderViewModeSelector = () => {
    return (
      <div className="view-mode-selector">
        <button 
          className={viewMode === VIEW_MODES.MONTH ? 'active' : ''} 
          onClick={() => setViewMode(VIEW_MODES.MONTH)}
        >
          Tháng
        </button>
        <button 
          className={viewMode === VIEW_MODES.WEEK ? 'active' : ''} 
          onClick={() => setViewMode(VIEW_MODES.WEEK)}
        >
          Tuần
        </button>
        <button 
          className={viewMode === VIEW_MODES.DAY ? 'active' : ''} 
          onClick={() => setViewMode(VIEW_MODES.DAY)}
        >
          Ngày
        </button>
      </div>
    );
  };

  const renderMonthView = (filteredEvents) => {
    return (
      <div className="month-view">
        <div className="month-header">
          {WEEKDAYS.map((day) => (
            <div key={day} className="month-weekday">{day}</div>
          ))}
        </div>

        <div className="month-grid">
          {getDaysInMonth(currentDate).map((day, index) => {
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isSelected = day && day.toDateString() === selectedDay.toDateString();
            const dayEvents = day ? getEventsForDay(filteredEvents, day) : [];
            
            return (
              <div
                key={index}
                className={`month-day ${day === null ? "empty" : ""} ${
                  isToday ? "today" : ""
                } ${isSelected ? "selected" : ""} ${
                  day && dayEvents.length > 0 ? "has-events" : ""
                }`}
                onClick={() => day && handleDayClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-events">
                      {dayEvents.length > 0 && (
                        <div className="events-container">
                          {dayEvents.map((event) => {
                            const category = CATEGORIES.find(c => c.id === event.reminderType) || CATEGORIES[0];
                            return (
                              <div
                                key={event.id || event.remindId}
                                className="month-event"
                                style={{ backgroundColor: category.color }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventClick(event);
                                }}
                              >
                                <span className="event-time">{event.time}</span>
                                --
                                <span className="event-title">{event.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = (filteredEvents) => {
    return (
      <div className="week-view-container">
        <div className="week-header">
          <div className="week-info">
            <h3>
              Tuần: {moment(weekDates[0]).format('DD/MM')} - {moment(weekDates[6]).format('DD/MM/YYYY')}
            </h3>
            <div className="week-navigation">
              <button 
                className="today-btn" 
                onClick={() => {
                  const today = moment().startOf('week');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(today).add(i, 'days').toDate()));
                }}
              >
                <CalendarIcon size={16} />
                Hôm nay
              </button>
              <button 
                className="nav-btn prev" 
                onClick={() => {
                  const prevWeek = moment(weekDates[0]).subtract(7, 'days');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(prevWeek).add(i, 'days').toDate()));
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className="nav-btn next" 
                onClick={() => {
                  const nextWeek = moment(weekDates[0]).add(7, 'days');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(nextWeek).add(i, 'days').toDate()));
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="week-days-header">
          {WEEKDAYS.map((day, index) => (
            <div key={day} className="week-day-header">
              <div className="weekday-name">{day}</div>
              <div 
                className={`weekday-date ${
                  weekDates[index] && weekDates[index].toDateString() === new Date().toDateString() ? "today" : ""
                }`}
              >
                {weekDates[index] ? weekDates[index].getDate() : ""}
              </div>
            </div>
          ))}
        </div>
        
        <div className="week-events">
          {weekDates.map((date, index) => {
            const dayEvents = getEventsForDay(filteredEvents, date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index} 
                className={`day-column ${isToday ? "today" : ""}`}
              >
                <div className="events-container">
                  {dayEvents.length > 0 && dayEvents.map(event => (
                    <div 
                      key={event.id || event.remindId} 
                      className="week-event"
                      style={{ backgroundColor: getColorByType(event.reminderType) }}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="event-time">{event.time}</div>
                      <div className="event-title">{event.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = (filteredEvents) => {
    const dayEvents = getEventsForDay(filteredEvents, selectedDayDate);
    const isTodaySelected = moment(selectedDayDate).isSame(moment(), 'day');
    
    return (
      <div className="day-view-container">
        <CalendarDayFilter 
          onDayChange={handleDayChange} 
          currentTimePosition={currentTimePosition}
        />
        
        <div className="day-events">
          {isTodaySelected && (
            <div 
              className="current-time-indicator" 
              style={{ top: currentTimePosition }}
            ></div>
          )}
          
          {dayEvents.length > 0 ? (
            dayEvents.map(event => (
              <div 
                key={event.id || event.remindId} 
                className="day-event"
                style={{ backgroundColor: getColorByType(event.reminderType) }}
                onClick={() => handleEventClick(event)}
              >
                <div className="event-time">{event.time}</div>
                <div className="event-title">{event.title}</div>
                {event.notification && (
                  <div className="event-description">{event.notification}</div>
                )}
              </div>
            ))
          ) : (
            <div className="no-events">
              <p>Không có sự kiện nào trong ngày này</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const filteredEvents = getFilteredEvents();
    
    switch (viewMode) {
      case VIEW_MODES.MONTH:
        return renderMonthView(filteredEvents);
      case VIEW_MODES.WEEK:
        return renderWeekView(filteredEvents);
      case VIEW_MODES.DAY:
        return renderDayView(filteredEvents);
      default:
        return renderMonthView(filteredEvents);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="calendar-container-wrapper">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container-wrapper">
      <div className="modern-calendar-container">
        {/* Sidebar */}
        <div className="calendar-sidebar">
          <div className="user-profile">
            <div className="avatar">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.svg";
                    setUserData(prev => ({...prev, avatar: null}));
                  }}
                />
              ) : (
                <FaUserCircle size={40} color="#666" />
              )}
            </div>
            <div className="user-info">
              <h3>{userData.name}</h3>
              <p>{userData.role}</p>
            </div>
            <button className="new-event-button" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
            </button>
          </div>

          <CalendarStats />
          {renderMiniCalendar()}
          {renderCategories()}
          {renderUpcomingEvent()}
        </div>

        {/* Main Calendar */}
        <div className="calendar-main">
          <div className="calendar-header">
            <div className="header-top">
              <div className="view-filters">
                {renderViewModeSelector()}
              </div>
              
              <div className="search-filter-section">
                <div className="search-box">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="category-filter">
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Tất cả sự kiện</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="calendar-actions">
                <button 
                  className="today-btn"
                  onClick={() => {
                    const today = new Date();
                    setSelectedDay(today);
                    setCurrentDate(today);
                    setSelectedDate(today);
                  }}
                >
                  <CalendarIcon size={16} />
                  <span>Today</span>
                </button>
                <button 
                  className="nav-btn prev"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  className="nav-btn next"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight size={18} />
                </button>
                <button 
                  className="history-btn"
                  onClick={() => navigate("/member/calendar/history")}
                >
                  <History size={18} />
                  <span>Lịch sử</span>
                </button>
              </div>
            </div>
            
            <div className="current-date-display">
              <h2>
                {viewMode === VIEW_MODES.MONTH 
                  ? formatMonthYear(currentDate) 
                  : `Tháng ${moment(viewMode === VIEW_MODES.WEEK ? weekDates[0] : selectedDayDate).format('MM YYYY')}`
                }
              </h2>
            </div>
          </div>

          {renderCalendarView()}

          <button className="floating-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <EventFormModal 
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddEvent}
            event={newEvent}
            setEvent={setNewEvent}
            categories={CATEGORIES}
            getCurrentDate={getCurrentDate}
          />
        )}

        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={() => navigate(`/member/calendar/change/${selectedEvent.id || selectedEvent.remindId}`)}
            getColorByType={getColorByType}
          />
        )}
      </AnimatePresence>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Add notification popup component */}
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={3000}
      />
    </div>
  );
};

// Modal Components
const EventFormModal = ({ onClose, onSubmit, event, setEvent, categories, getCurrentDate }) => (
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

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Tiêu đề"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="date"
            value={event.date}
            min={getCurrentDate()}
            onChange={(e) => setEvent({ ...event, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group time-selection">
          <label>Thời gian</label>
          <div className="time-input-wrapper">
            <input
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ 
                ...event, 
                time: e.target.value, 
                startTime: e.target.value 
              })}
              required
            />
            <Clock size={16} className="time-icon" />
          </div>
        </div>

        <div className="form-group">
          <select
            value={event.reminderType}
            onChange={(e) => setEvent({ ...event, reminderType: e.target.value })}
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
          <textarea
            placeholder="Thông báo (không bắt buộc)"
            value={event.notification || ''}
            onChange={(e) => setEvent({ ...event, notification: e.target.value })}
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

EventFormModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  event: PropTypes.shape({
    title: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    reminderType: PropTypes.string,
    notification: PropTypes.string,
    startTime: PropTypes.string
  }).isRequired,
  setEvent: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  getCurrentDate: PropTypes.func.isRequired
};

const EventDetailsModal = ({ event, onClose, onEdit, getColorByType }) => (
  <motion.div
    className="modal-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="modal-content event-details-modal"
      initial={{ scale: 0.8, y: -50 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.8, y: 50 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="modal-header">
        <h2>Chi tiết sự kiện</h2>
        <div className="close-icon" onClick={onClose}>
          <X size={18} />
        </div>
      </div>
      
      <div className="event-details">
        <div 
          className="event-type-tag" 
          style={{ backgroundColor: getColorByType(event.reminderType) }}
        >
          {event.reminderType || 'Sự kiện'}
        </div>
        
        <h2 className="event-title">{event.title}</h2>
        
        <div className="detail-row">
          <CalendarIcon size={18} />
          <span>
            {event.date ? moment(event.date).format('DD/MM/YYYY') : ''}
          </span>
        </div>
        
        <div className="detail-row">
          <Clock size={18} />
          <span>{event.time || ''}</span>
        </div>
        
        {event.location && (
          <div className="detail-row">
            <MapPin size={18} />
            <span>{event.location}</span>
          </div>
        )}
        
        {event.notification && (
          <div className="detail-description">
            <h4>Ghi chú</h4>
            <p>{event.notification}</p>
          </div>
        )}
      </div>
      
      <div className="modal-actions">
        <button className="edit-button" onClick={onEdit}>
          Chỉnh sửa
        </button>
        <button className="close-button" onClick={onClose}>
          Đóng
        </button>
      </div>
    </motion.div>
  </motion.div>
);

EventDetailsModal.propTypes = {
  event: PropTypes.shape({
    title: PropTypes.string,
    date: PropTypes.string,
    time: PropTypes.string,
    reminderType: PropTypes.string,
    location: PropTypes.string,
    notification: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  getColorByType: PropTypes.func.isRequired
};

export default CalendarAll;