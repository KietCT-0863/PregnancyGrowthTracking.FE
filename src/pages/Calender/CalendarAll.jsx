import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import moment from "moment"
import {
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
  Pill,
  Stethoscope,
  Baby,
  Dumbbell,
  Apple,
  Calendar,
  MapPin,
  History
} from "lucide-react"
import { FaUserCircle } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import "./CalendarAll.scss"
import reminderService from "../../api/services/reminderService"
import userService from "../../api/services/userService"
import profileImageService from "../../api/services/profileImageService"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import CalendarWeekly from "./CalendarWeekly"
import CalendarDay from "./CalendarDay"



const CalendarAll = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState("week") // Mặc định xem theo tuần
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [currentTimePosition, setCurrentTimePosition] = useState('0px');
  const [userData, setUserData] = useState({
    name: "",
    role: "Mẹ bầu",
    avatar: ""
  })

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("HH:mm"),
    reminderType: "",
    notification: "",
    location: "",
  })

  const [loading, setLoading] = useState(false);

  // Lấy thông tin người dùng từ API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Lấy thông tin người dùng
        const userInfo = await userService.getUserInfo();
        console.log("Thông tin người dùng:", userInfo);
        
        // Lấy ảnh đại diện
        let profileImageUrl = "";
        try {
          const profileImageData = await profileImageService.getProfileImage();
          console.log("Dữ liệu ảnh đại diện:", profileImageData);
          
          if (profileImageData && profileImageData.profileImageUrl) {
            profileImageUrl = profileImageData.profileImageUrl;
            console.log("URL ảnh đại diện:", profileImageUrl);
          } else if (userInfo && userInfo.profileImageUrl) {
            // Kiểm tra xem thông tin ảnh có trong userData không
            profileImageUrl = userInfo.profileImageUrl;
            console.log("URL ảnh từ userInfo:", profileImageUrl);
          }
        } catch (error) {
          console.error("Lỗi khi lấy ảnh đại diện:", error);
        }

        // Kiểm tra xem có data trong localStorage không
        const localUserData = localStorage.getItem('userData');
        if (!profileImageUrl && localUserData) {
          try {
            const parsedUserData = JSON.parse(localUserData);
            if (parsedUserData.profileImageUrl) {
              profileImageUrl = parsedUserData.profileImageUrl;
              console.log("URL ảnh từ localStorage:", profileImageUrl);
            }
          } catch (e) {
            console.error("Lỗi khi đọc userData từ localStorage:", e);
          }
        }

        setUserData({
          name: userInfo.fullName || "Người dùng",
          role: "Mẹ bầu",
          avatar: profileImageUrl || "https://randomuser.me/api/portraits/women/65.jpg" // Ảnh mặc định nếu không có
        });
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        toast.error("Không thể tải thông tin người dùng");
      }
    };

    fetchUserData();
  }, []);

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
  ]

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6) // 6am to 7pm

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getDaysInWeek = (date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust for starting week on Monday

    return Array(7)
      .fill()
      .map((_, i) => {
        const d = new Date(date)
        d.setDate(diff + i)
        return d
      })
  }

  const navigateMiniCalendar = (direction) => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + direction, 1))
  }

  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const handleAddEvent = async (e) => {
    e.preventDefault()
    try {
      // Validate form data
      if (!validateEventForm(newEvent)) {
        return
      }

      const reminderData = {
        title: newEvent.title.trim(),
        date: newEvent.date,
        time: newEvent.time,
        reminderType: newEvent.reminderType,
        notification: newEvent.notification || "",
        location: newEvent.location || "",
        description: "",
      }

      const response = await reminderService.createReminder(reminderData)

      if (response) {
        updateEventsAfterAdd(response)
        resetForm()
        toast.success("Tạo lịch nhắc nhở thành công!")
        fetchEvents()
      }
    } catch (error) {
      toast.error(error.message || "Không thể tạo lịch nhắc nhở")
    }
  }

  const validateEventForm = (eventData) => {
    if (!eventData.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề")
      return false
    }

    // Kiểm tra ngày có hợp lệ không
    const selectedDate = new Date(eventData.date)
    const today = new Date(getCurrentDate())

    if (!eventData.date) {
      toast.error("Vui lòng chọn ngày")
      return false
    }

    if (selectedDate < today) {
      toast.error("Không thể chọn ngày trong quá khứ")
      return false
    }

    if (!eventData.time) {
      toast.error("Vui lòng chọn giờ")
      return false
    }

    if (!eventData.reminderType) {
      toast.error("Vui lòng chọn loại nhắc nhở")
      return false
    }
    return true
  }

  const resetForm = () => {
    setShowAddModal(false)
    setShowEventModal(false)
    setSelectedEvent(null)
    setNewEvent({
      title: "",
      date: moment().format("YYYY-MM-DD"),
      time: moment().format("HH:mm"),
      reminderType: categories[0].id,
      notification: "",
      location: "",
    })
  }

  const fetchEvents = async () => {
    try {
      console.log('DEBUG fetchEvents - Bắt đầu lấy dữ liệu sự kiện');
      setLoading(true);
      
      // Gọi API để lấy dữ liệu sự kiện từ reminderService
      const response = await reminderService.getReminderHistory();
      console.log('DEBUG fetchEvents - Dữ liệu gốc từ API:', response);
      
      // Xử lý dữ liệu và cập nhật state
      if (response && Array.isArray(response)) {
        // Map dữ liệu từ API sang định dạng phù hợp
        const formattedEvents = response.map(event => {
          // Format lại event theo cấu trúc cần thiết
          const formattedEvent = {
            id: event.remindId,
            title: event.title || '',
            date: event.date,
            time: event.time || '09:00',
            reminderType: event.reminderType || 'default',
            notification: event.notification || '',
            location: event.location || '',
            color: getColorByType(event.reminderType)
          };
          
          console.log('DEBUG fetchEvents - Event sau khi format:', formattedEvent);
          return formattedEvent;
        });
        
        setEvents(formattedEvents);
        console.log('DEBUG fetchEvents - Đã cập nhật events state với', formattedEvents.length, 'sự kiện');
      } else {
        console.error('DEBUG fetchEvents - Dữ liệu không hợp lệ:', response);
        setEvents([]);
      }
    } catch (error) {
      console.error('DEBUG fetchEvents - Lỗi khi lấy dữ liệu sự kiện:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('DEBUG useEffect - Gọi fetchEvents');
    fetchEvents();
  }, [selectedDate]);

  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Chỉ hiển thị đường kẻ thời gian nếu trong khoảng thời gian hiển thị (6am-8pm)
      if (hours >= 6 && hours <= 20) {
        const position = (hours - 6) + (minutes / 60);
        setCurrentTimePosition(`${position * 80}px`);
      }
    };

    updateCurrentTimePosition(); // Cập nhật ngay khi component mount
    
    const interval = setInterval(updateCurrentTimePosition, 60000); // Cập nhật mỗi phút
    
    return () => clearInterval(interval);
  }, []);

  const getEventsForMonth = (events, date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventsForDay = (events, date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const hasEventOnDay = (date) => {
    if (!date) return false;
    return events.some(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Lọc sự kiện theo thể loại và từ khóa tìm kiếm
  const getFilteredEvents = () => {
    if (!events || !events.length) return [];
    
    return events.filter((event) => {
      if (!event) return false;
      
      // Lọc theo loại sự kiện
      const matchesType = selectedCategory === 'all' || 
        (event.reminderType && event.reminderType === selectedCategory);
        
      // Lọc theo từ khóa tìm kiếm
      const matchesSearch = !searchTerm || 
        (event.title && event.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (event.notification && event.notification.toLowerCase().includes(searchTerm.toLowerCase()));
        
      return matchesType && matchesSearch;
    });
  };

  const getCategoryStats = () => {
    const monthEvents = getEventsForMonth(events, currentDate)
    const stats = categories.reduce((acc, cat) => {
      acc[cat.id] = monthEvents.filter((event) => event.reminderType === cat.id).length
      return acc
    }, {})

    // Thêm tổng số sự kiện
    stats.all = monthEvents.length
    return stats
  }

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(selectedDay)
    newDate.setDate(newDate.getDate() + direction * 7)
    setSelectedDay(newDate)
  }

  const formatMonthYear = (date) => {
    const formatted = date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }
  
  const formatDayMonth = (date) => {
    const formatted = date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const formatWeekDay = (date) => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    const day = days[date.getDay()]
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  const updateEventsAfterAdd = (newEvent) => {
    setEvents((prevEvents) => {
      const currentEvents = Array.isArray(prevEvents) ? prevEvents : []
      return [...currentEvents, newEvent]
    })
  }

  const handleMiniCalendarDayClick = (day) => {
    if (!day) return;
    setSelectedDay(day);
    setSelectedDate(day);
    setViewMode("day");
  };

  const handleEventClick = (event) => {
    console.log('Sự kiện được click:', event);
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDayClick = (day) => {
    setSelectedDay(day)
    setViewMode("day")
  }

  const getEventPosition = (time) => {
    if (!time) return '0px';
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      // Kiểm tra tính hợp lệ của giờ và phút
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`Thời gian không hợp lệ: ${time}`);
        return '0px';
      }
      
      const startHour = 6; // 6am
      // Tính toán vị trí dựa trên giờ và phút
      const position = (hours - startHour) + (minutes / 60);
      
      // Trả về vị trí tính bằng pixel (80px cho mỗi giờ)
      if (position < 0) {
        return '0px'; // Nếu thời gian trước 6am
      } else if (position > 14) {
        return `${14 * 80}px`; // Nếu thời gian sau 8pm
      }
      
      return `${position * 80}px`;
    } catch (error) {
      console.error(`Lỗi khi xử lý thời gian: ${time}`, error);
      return '0px';
    }
  };

  const getEventHeight = (duration = 1) => {
    // Mặc định là 60 phút (1 giờ)
    return `${Math.max(30, duration * 80)}px`; // Tối thiểu 30px, 80px cho mỗi giờ
  };

  const renderMiniCalendar = () => {
    const days = getDaysInMonth(miniCalendarDate);
    const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

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
          {weekdays.map(day => (
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
          {categories.map(cat => {
            const count = stats[cat.id] || 0;
            const percentage = totalEvents > 0 ? (count / totalEvents) * 100 : 0;
            
            return (
              <div key={cat.id} className="category-item">
                <div className="category-color" style={{ backgroundColor: cat.color }}></div>
                <span>{cat.label.charAt(0).toUpperCase() + cat.label.slice(1)}</span>
                <div className="category-progress">
                  <div className="progress-bar" style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: cat.color 
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUpcomingEvent = () => {
    // Find the next upcoming event
    const today = new Date();
    const upcomingEvent = events
      .filter(event => new Date(`${event.date}T${event.time}`) >= today)
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];

    if (!upcomingEvent) return null;

    const eventDate = new Date(`${upcomingEvent.date}T${upcomingEvent.time}`);
    const category = categories.find(c => c.id === upcomingEvent.reminderType) || categories[0];

    return (
      <div className="upcoming-event" style={{ borderColor: category.color }}>
        <div className="event-time">{moment(eventDate).format("dddd, D MMMM • HH:mm")}</div>
        <h4>{upcomingEvent.title}</h4>
        {upcomingEvent.location && <p>{upcomingEvent.location}</p>}
        <div className="event-actions">
          <button className="later-btn">Sau này</button>
          <button className="details-btn" onClick={() => handleEventClick(upcomingEvent)}>Chi tiết</button>
        </div>
      </div>
    );
  };

  // Quyết định kiểu hiển thị dựa trên viewMode
  const renderCalendarView = () => {
    // Lấy sự kiện đã lọc
    const filtered = getFilteredEvents();
    console.log('Các sự kiện đã lọc:', filtered);
    
    // Nếu chỉ muốn hiển thị dạng lưới tháng
    if (viewMode === "month") {
      return (
        <div className="month-view">
          <div className="month-header">
            {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day) => (
              <div key={day} className="month-weekday">
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </div>
            ))}
          </div>

          <div className="month-grid">
            {getDaysInMonth(currentDate).map((day, index) => (
              <div
                key={index}
                className={`month-day ${day === null ? "empty" : ""} ${
                  day?.toDateString() === new Date().toDateString() ? "today" : ""
                }`}
                onClick={() => day && handleDayClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-events">
                      {getEventsForDay(filtered, day).slice(0, 3).map((event) => {
                        const category = categories.find(c => c.id === event.reminderType) || categories[0];
                        return (
                          <div
                            key={event.id}
                            className="month-event"
                            style={{ backgroundColor: category.color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {event.time || (event.startTime ? moment(event.startTime).format('HH:mm') : '')} {event.title}
                          </div>
                        )
                      })}
                      {getEventsForDay(filtered, day).length > 3 && (
                        <div className="more-events">
                          +{getEventsForDay(filtered, day).length - 3} sự kiện
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } else if (viewMode === "week") {
      // Sử dụng component CalendarWeekly
      return (
        <>
          {console.log('DEBUG CalendarAll - Rendering Week View')}
          {console.log('DEBUG CalendarAll - selectedDate:', selectedDate)}
          {console.log('DEBUG CalendarAll - events được truyền vào:', events)}
          <CalendarWeekly 
            selectedDay={selectedDay}
            events={filtered}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
          />
        </>
      );
    } else if (viewMode === "day") {
      // Sử dụng component CalendarDay
      return (
        <CalendarDay 
          date={selectedDay}
          events={filtered}
          onEventClick={handleEventClick}
        />
      );
    }
  };
  
  // Hàm để lấy màu dựa trên loại sự kiện
  const getColorByType = (type) => {
    if (!type) return '#FF6B6B'; // Màu mặc định
    
    const typeMap = {
      'Khám thai': '#4f46e5', // Appointment - Màu tím indigo
      'Uống thuốc': '#10b981', // Medicine - Màu xanh lá
      'Khám định kỳ': '#0ea5e9', // Checkup - Màu xanh dương
      'Nhắc nhở': '#f59e0b', // Reminder - Màu cam
      'default': '#8b5cf6' // Other - Màu tím
    };
    
    return typeMap[type] || typeMap.default;
  };

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
                    console.log("Lỗi khi tải ảnh đại diện:", userData.avatar);
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

          {renderMiniCalendar()}
          {renderCategories()}
          {renderUpcomingEvent()}
        </div>

        {/* Main Calendar */}
        <div className="calendar-main">
          <div className="calendar-header">
            <div className="current-date-display">
              <h2>
                {viewMode === "day"
                  ? `${formatDayMonth(selectedDay)}`
                  : viewMode === "week"
                  ? `${formatMonthYear(selectedDay)}`
                  : formatMonthYear(currentDate)}
              </h2>
              <div className="view-mode-selector">
                <button 
                  className={viewMode === "month" ? "active" : ""}
                  onClick={() => setViewMode("month")}
                >
                  Month
                </button>
                <button 
                  className={viewMode === "week" ? "active" : ""}
                  onClick={() => setViewMode("week")}
                >
                  Week
                </button>
                <button 
                  className={viewMode === "day" ? "active" : ""}
                  onClick={() => setViewMode("day")}
                >
                  Day
                </button>
              </div>
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
                  {categories.map(cat => (
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
                Today
              </button>
              <button 
                className="nav-btn"
                onClick={() => viewMode === "week" ? navigateWeek(-1) : navigateMonth(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                className="nav-btn"
                onClick={() => viewMode === "week" ? navigateWeek(1) : navigateMonth(1)}
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

          {renderCalendarView()}

          <button className="floating-add-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={24} />
          </button>
        </div>
      </div>

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
              className="modal-content simple-modal"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Thêm sự kiện mới</h2>
              </div>

              <form onSubmit={handleAddEvent}>
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
                        setNewEvent({ ...newEvent, time: e.target.value, startTime: e.target.value })
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
                  <textarea
                    placeholder="Thông báo"
                    value={newEvent.notification}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, notification: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                    Hủy
                  </button>
                  <button type="submit" className="save-btn">
                    Lưu
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {showEventModal && selectedEvent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEventModal(false)}
          >
            <motion.div
              className="modal-content event-detail-modal"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Chi tiết nhắc nhở</h2>
                <button className="close-btn" onClick={() => setShowEventModal(false)}>&times;</button>
              </div>
              
              <div className="event-details">
                <div className="detail-item">
                  <Calendar size={18} />
                  <span>{moment(selectedEvent.date).format("dddd, D MMMM, YYYY")}</span>
                </div>
                
                <div className="detail-item">
                  <Clock size={18} />
                  <span>
                    {selectedEvent.startTime && selectedEvent.endTime 
                      ? `${selectedEvent.startTime} - ${selectedEvent.endTime}` 
                      : selectedEvent.time}
                  </span>
                </div>
                
                {selectedEvent.location && (
                  <div className="detail-item">
                    <MapPin size={18} />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                <div className="detail-item">
                  <div className="category-badge" style={{ 
                    backgroundColor: (categories.find(c => c.id === selectedEvent.reminderType) || categories[0]).color 
                  }}>
                    {(categories.find(c => c.id === selectedEvent.reminderType) || categories[0]).label}
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <Link 
                  to={`/member/calendar/change/${selectedEvent.id}`} 
                  className="edit-btn"
                >
                  Chỉnh sửa
                </Link>
                <button
                  className="delete-btn"
                  onClick={() => {
                    // Xác nhận xóa sự kiện
                    if(window.confirm('Bạn có chắc muốn xóa sự kiện này?')) {
                      reminderService.deleteReminder(selectedEvent.id)
                        .then(() => {
                          setShowEventModal(false);
                          fetchEvents();
                          toast.success('Xóa sự kiện thành công!');
                        })
                        .catch(error => {
                          toast.error(`Lỗi khi xóa sự kiện: ${error.message}`);
                        });
                    }
                  }}
                >
                  Xóa
                </button>
                <button 
                  className="close-event-btn" 
                  onClick={() => setShowEventModal(false)}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
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
    </div>
  )
}

export default CalendarAll

