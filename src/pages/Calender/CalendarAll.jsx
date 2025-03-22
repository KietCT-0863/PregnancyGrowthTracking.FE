import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import moment from "moment"
import { FaUserCircle } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
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
  History,
  X
} from "lucide-react"
import "./CalendarAll.scss"
import reminderService from "../../api/services/reminderService"
import userService from "../../api/services/userService"
import profileImageService from "../../api/services/profileImageService"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getColorByType } from './calendarHelpers'
import CalendarStats from './CalendarStats'
import CalendarDayFilter from "./CalendarDayFilter"

const CalendarAll = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [currentTimePosition, setCurrentTimePosition] = useState('0px')
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    id: 0,
    name: "Người dùng",
    email: "",
    role: "Thành viên",
    avatar: null
  })

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: moment().format("YYYY-MM-DD"),
    time: moment().format("HH:mm"),
    reminderType: "",
    notification: "",
    location: "",
  })

  const [viewMode, setViewMode] = useState('month')
  const [weekDates, setWeekDates] = useState(() => {
    const today = moment().startOf('week');
    return Array.from({length: 7}, (_, i) => moment(today).add(i, 'days').toDate());
  })
  const [selectedDayDate, setSelectedDayDate] = useState(new Date())

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
          id: userInfo.id,
          name: userInfo.fullName || "Người dùng",
          email: userInfo.email,
          role: "Thành viên",
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
            id: event.remindId, // Giữ nguyên remindId làm id
            remindId: event.remindId, // Đảm bảo luôn có remindId
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
        console.log('DEBUG fetchEvents - Chi tiết events:', formattedEvents);
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
    console.log('DEBUG getEventsForDay - Ngày cần lọc:', moment(date).format('DD/MM/YYYY'));
    console.log('DEBUG getEventsForDay - Tổng số sự kiện trước khi lọc:', events.length);
    
    // Debug chi tiết từng sự kiện
    events.forEach((event, index) => {
      console.log(`DEBUG getEventsForDay - Chi tiết sự kiện ${index}:`, 
        { id: event.id, remindId: event.remindId, title: event.title, date: event.date });
    });
    
    const filteredEvents = events.filter((event) => {
      if (!event || !event.date) {
        console.log('DEBUG getEventsForDay - Sự kiện bị bỏ qua do không có event hoặc date:', event);
        return false;
      }
      
      // So sánh theo từng phần của ngày
      const eventDate = new Date(event.date);
      const eventDay = eventDate.getDate();
      const eventMonth = eventDate.getMonth();
      const eventYear = eventDate.getFullYear();
      
      const compareDate = new Date(date);
      const compareDay = compareDate.getDate();
      const compareMonth = compareDate.getMonth();
      const compareYear = compareDate.getFullYear();
      
      // Log chi tiết các giá trị so sánh
      console.log('DEBUG getEventsForDay - So sánh ngày:', {
        event: { id: event.id, title: event.title },
        eventDate: `${eventDay}/${eventMonth}/${eventYear}`,
        compareDate: `${compareDay}/${compareMonth}/${compareYear}`
      });
      
      const result = (
        eventDay === compareDay &&
        eventMonth === compareMonth &&
        eventYear === compareYear
      );
      
      if (result) {
        console.log('DEBUG getEventsForDay - Sự kiện phù hợp:', event);
      } else {
        console.log('DEBUG getEventsForDay - Sự kiện không phù hợp do khác ngày', { 
          eventDate: event.date, 
          compareDate: date.toISOString().split('T')[0] 
        });
      }
      
      return result;
    });
    
    console.log('DEBUG getEventsForDay - Số sự kiện sau khi lọc:', filteredEvents.length);
    console.log('DEBUG getEventsForDay - Sự kiện sau khi lọc:', filteredEvents);
    return filteredEvents;
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

  const formatMonthYear = (date) => {
    const formatted = date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const handleDayClick = (day) => {
    setSelectedDay(day)
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
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
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

  const handleDayChange = (date) => {
    setSelectedDayDate(date);
    // Có thể thêm logic lọc sự kiện theo ngày ở đây
  };

  const renderCalendarView = () => {
    const filtered = getFilteredEvents();
    
    if (viewMode === 'month') {
      return (
        <div className="month-view">
          <div className="month-header">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
              <div key={day} className="month-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="month-grid">
            {getDaysInMonth(currentDate).map((day, index) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isSelected = day && day.toDateString() === selectedDay.toDateString();
              const dayEvents = day ? getEventsForDay(filtered, day) : [];
              
              console.log('DEBUG renderCalendarView (day) -', day ? moment(day).format('DD/MM/YYYY') : 'null', 'Số sự kiện hiển thị:', dayEvents.length);
              
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
                              const category = categories.find(c => c.id === event.reminderType) || categories[0];
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
    } else if (viewMode === 'week') {
      return (
        <div className="week-view-container">
          <div className="week-header">
            <div className="week-info">
              <h3>Tuần: {moment(weekDates[0]).format('DD/MM')} - {moment(weekDates[6]).format('DD/MM/YYYY')}</h3>
              <div className="week-navigation">
                <button className="today-btn" onClick={() => {
                  const today = moment().startOf('week');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(today).add(i, 'days').toDate()));
                }}>Hôm nay</button>
                <button className="nav-btn" onClick={() => {
                  const prevWeek = moment(weekDates[0]).subtract(7, 'days');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(prevWeek).add(i, 'days').toDate()));
                }}><ChevronLeft size={18} /></button>
                <button className="nav-btn" onClick={() => {
                  const nextWeek = moment(weekDates[0]).add(7, 'days');
                  setWeekDates(Array.from({length: 7}, (_, i) => moment(nextWeek).add(i, 'days').toDate()));
                }}><ChevronRight size={18} /></button>
              </div>
            </div>
          </div>
          
          <div className="week-days-header">
            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, index) => (
              <div key={day} className="week-day-header">
                <div className="weekday-name">{day}</div>
                <div className={`weekday-date ${
                  weekDates[index] && weekDates[index].toDateString() === new Date().toDateString() ? "today" : ""
                }`}>{weekDates[index] ? weekDates[index].getDate() : ""}</div>
              </div>
            ))}
          </div>
          
          <div className="week-events">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDay(filtered, date);
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
    } else if (viewMode === 'day') {
      // Sử dụng CalendarDayFilter để hiển thị và điều hướng ngày
      return (
        <div className="day-view-container">
          <CalendarDayFilter 
            onDayChange={handleDayChange} 
            currentTimePosition={currentTimePosition}
          />
          
          <div className="day-events">
            {(() => {
              console.log('DEBUG renderCalendarView (day) - selectedDayDate:', moment(selectedDayDate).format('DD/MM/YYYY'));
              console.log('DEBUG renderCalendarView (day) - Tổng số sự kiện trước khi lọc:', filtered.length);
              const dayEvents = getEventsForDay(filtered, selectedDayDate);
              console.log('DEBUG renderCalendarView (day) - Số sự kiện hiển thị:', dayEvents.length);
              console.log('DEBUG renderCalendarView (day) - Chi tiết sự kiện hiển thị:', dayEvents);
              
              return (
                <>
                  {/* Hiển thị vạch chỉ thời gian hiện tại nếu ngày xem là ngày hôm nay */}
                  {moment(selectedDayDate).isSame(moment(), 'day') && (
                    <div className="current-time-indicator" style={{ top: currentTimePosition }}></div>
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
                </>
              );
            })()}
          </div>
        </div>
      );
    }
  };
  
  const renderViewModeSelector = () => {
    return (
      <div className="view-mode-selector">
        <button 
          className={viewMode === 'month' ? 'active' : ''} 
          onClick={() => setViewMode('month')}
        >
          Tháng
        </button>
        <button 
          className={viewMode === 'week' ? 'active' : ''} 
          onClick={() => setViewMode('week')}
        >
          Tuần
        </button>
        <button 
          className={viewMode === 'day' ? 'active' : ''} 
          onClick={() => setViewMode('day')}
        >
          Ngày
        </button>
      </div>
    );
  };

  // Render loading state if data is being fetched
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
                {viewMode === 'month' ? formatMonthYear(currentDate) : 'Tháng ' + moment(viewMode === 'week' ? weekDates[0] : selectedDayDate).format('M năm YYYY')}
              </h2>
            </div>
          </div>

          {/* Chỉ hiển thị view dựa trên renderCalendarView(), không gọi các filter component nữa */}
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
                    placeholder="Thông báo (không bắt buộc)"
                    value={newEvent.notification || ''}
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

        {selectedEvent && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
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
                <div className="close-icon" onClick={() => setSelectedEvent(null)}>
                  <X size={18} />
                </div>
              </div>
              
              <div className="event-details">
                <div 
                  className="event-type-tag" 
                  style={{ backgroundColor: getColorByType(selectedEvent.reminderType) }}
                >
                  {selectedEvent.reminderType || 'Sự kiện'}
                </div>
                
                <h2 className="event-title">{selectedEvent.title}</h2>
                
                <div className="detail-row">
                  <Calendar size={18} />
                  <span>
                    {selectedEvent.date ? moment(selectedEvent.date).format('DD/MM/YYYY') : ''}
                  </span>
                </div>
                
                <div className="detail-row">
                  <Clock size={18} />
                  <span>{selectedEvent.time || ''}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="detail-row">
                    <MapPin size={18} />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.notification && (
                  <div className="detail-description">
                    <h4>Ghi chú</h4>
                    <p>{selectedEvent.notification}</p>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                <button 
                  className="edit-button"
                  onClick={() => {
                    console.log('DEBUG Edit button - ID sự kiện:', selectedEvent.id || selectedEvent.remindId);
                    navigate(`/member/calendar/change/${selectedEvent.id || selectedEvent.remindId}`);
                  }}
                >
                  Chỉnh sửa
                </button>
                <button 
                  className="close-button"
                  onClick={() => setSelectedEvent(null)}
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

