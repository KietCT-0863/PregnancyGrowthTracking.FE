import { motion } from "framer-motion"
import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isFutureDate, getFutureDateErrorMessage } from './DateValidation'
import { AlertCircle } from 'lucide-react'
import './NoteFormModal.scss';


const NoteFormModal = ({
  currentNote,
  handleInputChange,
  handleImageUpload,
  handleSubmit,
  onClose
}) => {
  const navigate = useNavigate();
  const [dateWarning, setDateWarning] = useState(null);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  
  // Check if date is in the future and show warning
  useEffect(() => {
    if (currentNote.date && isFutureDate(currentNote.date)) {
      setDateWarning(getFutureDateErrorMessage());
    } else {
      setDateWarning(null);
    }
  }, [currentNote.date]);

  // Custom handler for form submission with validation
  const validateAndSubmit = (e) => {
    e.preventDefault();
    
    if (currentNote.date && isFutureDate(currentNote.date)) {
      setDateWarning(getFutureDateErrorMessage());
      setShowWarningPopup(true);
      return;
    }
    
    handleSubmit(e);
  };
  

  
  // Close warning popup
  const closeWarningPopup = () => {
    setShowWarningPopup(false);
  };



  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-container"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Thêm ghi chú mới</h2>
          <button 
            className="close-button"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={validateAndSubmit}>
          <div className="form-group">
            <label>Ngày khám</label>
            <input
              type="date"
              value={currentNote.date}
              onChange={handleInputChange}
              name="date"
              required
            />
            {dateWarning && (
              <div className="field-warning">
                <AlertCircle size={16} />
                <span>Bạn đang chọn ngày trong tương lai</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Bệnh viện và bác sĩ khám</label>
            <input
              type="text"
              value={currentNote.note1}
              onChange={handleInputChange}
              name="note1"
              placeholder="Nhập thông tin bác sĩ và bệnh viện/phòng khám"
              required
            />
          </div>

          <div className="form-group">
            <label>Chẩn đoán</label>
            <textarea
              value={currentNote.diagnosis}
              onChange={handleInputChange}
              name="diagnosis"
              placeholder="Nhập chẩn đoán của bác sĩ"
            />
          </div>

          <div className="form-group">
            <label>Chi tiết</label>
            <textarea
              value={currentNote.note2}
              onChange={handleInputChange}
              name="note2"
              placeholder="Nhập đơn thuốc và ghi chú thêm"
            />
          </div>

          <div className="form-group">
            <label>Ảnh ghi chú</label>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              required={currentNote.images.length === 0}
            />
            {currentNote.images.length > 0 && (
              <p className="file-name">
                Đã chọn: {currentNote.images[0].name}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Lưu ghi chú
            </button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </form>
        
        {/* Warning Popup */}
        {showWarningPopup && (
          <div className="warning-popup-overlay" onClick={closeWarningPopup}>
            <div className="warning-popup" onClick={(e) => e.stopPropagation()}>
              <div className="warning-popup-header">
                <h3>{dateWarning.title}</h3>
                <button className="close-warning-button" onClick={closeWarningPopup}>✕</button>
              </div>
              <div className="warning-popup-content">
                <p>{dateWarning.message}</p>
              </div>
              <div className="warning-popup-actions">
                <button className="secondary-button" onClick={closeWarningPopup}>
                  Hủy
                </button>
              
                <button className="primary-button " onClick={() => navigate('/member/calendar')}>
                  Chuyển tới lịch trình thăm khám
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

NoteFormModal.propTypes = {
  currentNote: PropTypes.shape({
    date: PropTypes.string,
    note1: PropTypes.string,
    diagnosis: PropTypes.string,
    note2: PropTypes.string,
    images: PropTypes.array,
  }).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleImageUpload: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default NoteFormModal; 