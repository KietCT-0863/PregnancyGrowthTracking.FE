import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import './LoginErrorBox.scss';

/**
 * Component to display login error messages as a popup
 */
const LoginErrorBox = ({ message, onDismiss, isVisible = true }) => {
  const errorBoxRef = useRef(null);
  
  // Log the message when it changes
  useEffect(() => {
    if (message && isVisible) {
      console.log("LoginErrorBox displaying message:", message);
    }
  }, [message, isVisible]);
  
  // Handle escape key to dismiss
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && onDismiss) {
        onDismiss();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible, onDismiss]);

  // Handle click to dismiss
  const handleClick = (e) => {
    // Prevent the click from bubbling up to parent elements
    e.stopPropagation();
    
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="login-error-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
        >
          <motion.div 
            className="login-error-box"
            ref={errorBoxRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30 
            }}
            // Prevent clicks inside the box from closing it unless specifically on the message
            onClick={(e) => e.stopPropagation()}
          >
            <div className="error-content">
              <div className="code-header">
                <span className="click-to-dismiss">Nhấn vào để đóng</span>
              </div>
              <pre className="code-block" onClick={handleClick}>
                <code>{message || 'Tên đăng nhập hoặc mật khẩu không chính xác'}</code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LoginErrorBox.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func,
  isVisible: PropTypes.bool
};

export default LoginErrorBox; 