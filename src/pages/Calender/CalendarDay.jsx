import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import moment from 'moment';
import { MapPin } from 'lucide-react';
import './CalendarAll.scss';
import EventModal from './EventModal';
import PropTypes from 'prop-types';
import { getColorByType } from './calendarHelpers';

const CalendarDay = ({ date = new Date(), events = [], onEventClick }) => {
  const [currentTimePosition, setCurrentTimePosition] = useState('0px');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Tạo mảng các khung giờ từ 0h đến 23h
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  
  useEffect(() => {
    // Cập nhật vị trí thời gian hiện tại và cập nhật mỗi phút
    const updateCurrentTime = () => {
      const now = new Date();
      
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Cập nhật vị trí theo chiều ngang
      const position = hours * 120 + (minutes / 60) * 120; // 120px là chiều rộng của mỗi ô giờ
      setCurrentTimePosition(`${position}px`);
    };
    
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Lọc sự kiện theo ngày được chọn - hỗ trợ định dạng từ API
  const filteredEvents = events.filter(event => {
    if (!event) return false;
    
    // Hỗ trợ định dạng dữ liệu từ API
    const eventDate = event.date ? new Date(event.date) : null;
    
    if (!eventDate) return false;
    
    const isSameDate = (
      eventDate.getDate() === date.getDate() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
    
    return isSameDate;
  });
  
  // Kiểm tra xem có phải là ngày hôm nay không
  const isToday = new Date().toDateString() === date.toDateString();
  
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
    if (onEventClick) onEventClick(event);
  };
  
  return (
    <div className="day-view">
      <div className="day-header">
        <motion.div 
          className="day-title-container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="day-title">
            <h3>{moment(date).format('dddd')}</h3>
            <span>{date.getDate()}</span>
          </div>
          <div className="day-subtitle">
            {moment(date).format('MMMM YYYY')}
          </div>
        </motion.div>
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
          <div className="hour-row">
            <div className="hour-label">
              <div className="day-label">Lịch ngày</div>
            </div>
            
            <div className="events-container">
              {isToday && (
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
              
              {filteredEvents.map((event) => {
                const eventTime = event.time || 
                                (event.startTime ? moment(event.startTime).format('HH:mm') : '00:00');
                
                // Kiểm tra thời gian hợp lệ
                const [hours, minutes] = eventTime.split(':').map(Number);
                
                // Tính toán vị trí theo chiều ngang
                const leftPosition = hours * 120 + (minutes / 60) * 120;
                
                return (
                  <motion.div
                    key={event.id || event.remindId || `${date.toISOString()}-${eventTime}`}
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
                      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                      transition: { duration: 0.2 }
                    }}
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
            </div>
          </div>
        </div>
      </div>
      
      <EventModal
        visible={modalVisible}
        event={selectedEvent}
        onCancel={() => setModalVisible(false)}
        onEdit={(event) => console.log('Edit event:', event)}
        onDelete={(event) => console.log('Delete event:', event)}
      />
    </div>
  );
};

CalendarDay.propTypes = {
  date: PropTypes.instanceOf(Date),
  events: PropTypes.array,
  onEventClick: PropTypes.func
};

export default CalendarDay; 