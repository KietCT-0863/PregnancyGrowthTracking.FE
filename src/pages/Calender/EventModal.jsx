import React from 'react';
import { Modal, Tag, Button } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import moment from 'moment';
import './EventModal.scss';
import PropTypes from 'prop-types';

const EventModal = ({ event, visible, onCancel, onEdit, onDelete }) => {
  if (!event) return null;
  
  // Xác định màu dựa trên loại sự kiện
  const getEventColor = (eventType) => {
    if (!eventType) return '#63B3ED';
    
    switch (eventType) {
      case 'Cuộc hẹn bác sĩ': return '#FF6B6B';
      case 'Uống thuốc': return '#4ECDC4';
      case 'Khám thai': return '#45B7D1';
      case 'Tập thể dục': return '#FFA07A';
      case 'Dinh dưỡng': return '#98D8C8';
      default: return '#63B3ED';
    }
  };
  
  // Sử dụng màu được lưu trữ trong sự kiện hoặc tính toán dựa trên loại
  const eventColor = event.color || getEventColor(event.reminderType || event.type);
  
  // Hỗ trợ nhiều định dạng dữ liệu ngày và thời gian
  const eventDate = event.date ? new Date(event.date) : 
                    event.startTime ? new Date(event.startTime) : 
                    event.startDate ? new Date(event.startDate) : null;
                    
  const eventTime = event.time || 
                   (event.startTime ? moment(event.startTime).format('HH:mm') : '');
  
  // Định dạng ngày và giờ
  const formattedDate = eventDate ? moment(eventDate).format('dddd, D MMMM, YYYY') : '';
  const formattedTime = eventTime;
  
  // Lấy tiêu đề sự kiện
  const eventTitle = event.title || event.name || 'Sự kiện không tiêu đề';
  
  // Lấy loại sự kiện
  const eventType = event.reminderType || event.type || 'Sự kiện';
  
  console.log('Chi tiết sự kiện modal:', event);
  
  return (
    <Modal
      open={visible}
      footer={null}
      onCancel={onCancel}
      className="event-modal"
      maskClosable={true}
      centered
      title={
        <div className="event-modal-title">Chi tiết sự kiện</div>
      }
      closeIcon={<motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>×</motion.div>}
    >
      <AnimatePresence>
        <motion.div 
          className="event-modal-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="event-type">
            <Tag color={eventColor} className="event-tag" style={{ borderRadius: '50px', padding: '5px 15px' }}>
              {eventType}
            </Tag>
          </div>
          
          <motion.h2 
            className="event-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {eventTitle}
          </motion.h2>
          
          {formattedDate && (
            <motion.div 
              className="event-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="event-date">
                <Calendar size={18} color={eventColor} />
                <span>{formattedDate}</span>
              </div>
            </motion.div>
          )}
          
          {formattedTime && (
            <motion.div 
              className="event-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="event-time">
                <Clock size={18} color={eventColor} />
                <span>{formattedTime}</span>
              </div>
            </motion.div>
          )}
          
          {event.location && (
            <motion.div 
              className="event-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="event-location">
                <MapPin size={18} color={eventColor} />
                <span>{event.location}</span>
              </div>
            </motion.div>
          )}
          
          {(event.notification || event.description) && (
            <motion.div 
              className="event-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="event-notification">
                <AlertCircle size={18} color={eventColor} />
                <span>{event.notification ? `Thông báo: ${event.notification}` : event.description}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        className="event-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            type="default" 
            onClick={onCancel}
            className="close-btn"
          >
            Đóng
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            type="primary" 
            onClick={() => onEdit && onEdit(event)}
            icon={<Edit2 size={16} />}
            className="edit-btn"
          >
            Chỉnh sửa
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            danger 
            onClick={() => onDelete && onDelete(event)}
            icon={<Trash2 size={16} />}
            className="delete-btn"
          >
            Xóa
          </Button>
        </motion.div>
      </motion.div>
    </Modal>
  );
};

EventModal.propTypes = {
  event: PropTypes.object,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default EventModal; 