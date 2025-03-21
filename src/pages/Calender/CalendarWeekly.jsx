import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import { MapPin } from 'lucide-react';
import './CalendarAll.scss';
import PropTypes from 'prop-types';
import EventModal from './EventModal';
import { getColorByType } from './calendarHelpers';

const CalendarWeekly = ({ selectedDay = new Date(), events = [], onDayClick, onEventClick }) => {
  const [currentTimePosition, setCurrentTimePosition] = useState('0px');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Tạo mảng các khung giờ từ 0h đến 23h
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  useEffect(() => {
    // Cập nhật vị trí của chỉ báo thời gian hiện tại
    const updateTimeIndicator = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Cập nhật vị trí theo chiều ngang
      const position = hours * 120 + (minutes / 60) * 120; // 120px là chiều rộng của mỗi ô giờ
      setCurrentTimePosition(`${position}px`);
    };
    
    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Lấy các ngày trong tuần của ngày đã chọn
  const getDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    // Thiết lập ngày đầu tuần là thứ 2
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const result = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      result.push(nextDay);
    }
    
    return result;
  };
  
  // Lấy sự kiện cho ngày cụ thể
  const getEventsForDay = (day) => {
    if (!events || !events.length) return [];
    
    return events.filter(event => {
      if (!event) return false;
      
      // Hỗ trợ định dạng dữ liệu từ API
      const eventDate = event.date ? new Date(event.date) : null;
      
      if (!eventDate) return false;
      
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };
  
  // Định dạng tên ngày trong tuần
  const formatWeekDay = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };
  
  // Kiểm tra xem có phải ngày hiện tại không
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const daysInWeek = getDaysInWeek(selectedDay);
  
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
    if (onEventClick) onEventClick(event);
  };

  return (
    <div className="week-view">
      <div className="weekday-header">
        {daysInWeek.map((day, index) => (
          <div
            key={index}
            className={`weekday ${isToday(day) ? "today" : ""} ${
              day.toDateString() === selectedDay.toDateString() ? "selected" : ""
            }`}
            onClick={() => onDayClick && onDayClick(day)}
          >
            <div className="weekday-name">{formatWeekDay(day)}</div>
            <div className="weekday-date">{day.getDate()}</div>
          </div>
        ))}
      </div>
      
      <div className="scrollable-timetable">
        <div className="time-row">
          <div className="time-slot empty"></div>
          {timeSlots.map((hour) => (
            <div key={hour} className="time-slot">
              {hour}
            </div>
          ))}
        </div>
        
        <div className="calendar-content">
          {daysInWeek.map((day, dayIndex) => (
            <div key={dayIndex} className="hour-row">
              <div className="hour-label">
                <div className="weekday-name">{formatWeekDay(day)}</div>
                <div className="weekday-date">{day.getDate()}</div>
              </div>
              
              <div className="events-container">
                {/* Hiển thị chỉ báo thời gian hiện tại nếu là ngày hôm nay */}
                {isToday(day) && (
                  <motion.div 
                    className="current-time-indicator" 
                    style={{ 
                      left: currentTimePosition,
                      top: 0,
                      height: '100%',
                      width: '2px'
                    }}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
                
                <AnimatePresence>
                  {getEventsForDay(day).map((event) => {
                    // Lấy thời gian từ các định dạng dữ liệu có thể có
                    const eventTime = event.time || 
                                   (event.startTime ? moment(event.startTime).format('HH:mm') : '00:00');
                    
                    // Kiểm tra thời gian hợp lệ
                    const [hours, minutes] = eventTime.split(':').map(Number);
                    
                    // Tính toán vị trí theo chiều ngang
                    const leftPosition = hours * 120 + (minutes / 60) * 120;
                    
                    return (
                      <motion.div
                        key={event.id || event.remindId || `${day.toISOString()}-${eventTime}`}
                        className="horizontal-event"
                        style={{
                          left: `${leftPosition}px`,
                          width: '110px',
                          backgroundColor: event.color || getColorByType(event.reminderType) || '#FF6B6B',
                          top: '10px'
                        }}
                        onClick={() => handleEventClick(event)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{
                          y: -3,
                          boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="event-time">{eventTime}</div>
                        <div className="event-title">{event.title || 'Sự kiện'}</div>
                        {event.location && (
                          <div className="event-location">
                            <MapPin size={12} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <EventModal
        visible={modalVisible}
        event={selectedEvent}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

CalendarWeekly.propTypes = {
  selectedDay: PropTypes.instanceOf(Date),
  events: PropTypes.array,
  onDayClick: PropTypes.func,
  onEventClick: PropTypes.func
};

export default CalendarWeekly; 