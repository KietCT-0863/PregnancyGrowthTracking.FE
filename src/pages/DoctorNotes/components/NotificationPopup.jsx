import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, X } from 'lucide-react';
import './NotificationPopup.scss';

const NotificationPopup = ({ type, message, isVisible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="icon success" />;
      case 'error':
        return <XCircle className="icon error" />;
      case 'warning':
        return <AlertCircle className="icon warning" />;
      default:
        return <CheckCircle className="icon success" />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`notification-popup ${type}`}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="notification-content">
            {getIcon()}
            <p>{message}</p>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup; 