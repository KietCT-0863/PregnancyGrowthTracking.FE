import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';
import './NotificationPopup.scss';

const NotificationPopup = ({ 
  type = 'success', 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  // Auto-close the notification after specified duration
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  // Select icon based on notification type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="notification-icon success" />;
      case 'error':
        return <XCircle className="notification-icon error" />;
      case 'warning':
        return <AlertCircle className="notification-icon warning" />;
      case 'info':
        return <Info className="notification-icon info" />;
      default:
        return <CheckCircle className="notification-icon success" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`calendar-notification-popup ${type}`}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="notification-content">
            {getIcon()}
            <p>{message}</p>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close notification">
            <X size={18} />
          </button>
          <div 
            className="progress-bar" 
            style={{ animationDuration: `${duration}ms` }} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup; 