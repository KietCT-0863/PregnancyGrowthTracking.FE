import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Edit2, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./NoteDetailModal.scss";

const NoteDetailModal = ({ 
  isOpen, 
  onClose, 
  note, 
  onDelete 
}) => {
  if (!isOpen || !note) return null;

  const handleDelete = () => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa ghi chú này?");
    if (confirmDelete) {
      onDelete(note.noteId || note.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="note-detail-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="note-detail-modal"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 title={note.note || "Chi tiết ghi chú"}>{note.note || "Chi tiết ghi chú"}</h2>
              <div className="date-info">
                <Calendar size={16} />
                <span>{note.date || "Chưa có ngày"}</span>
              </div>
              <button className="close-button" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              {note.diagnosis && (
                <div className="info-section">
                  <h3>Chẩn đoán:</h3>
                  <p>{note.diagnosis}</p>
                </div>
              )}

              {note.detail && (
                <div className="info-section">
                  <h3>Chi tiết:</h3>
                  <p>{note.detail}</p>
                </div>
              )}

              {note.userNotePhoto && (
                <div className="image-section">
                  <h3>Hình ảnh đính kèm:</h3>
                  <div className="image-container">
                    <img 
                      src={note.userNotePhoto} 
                      alt="Ghi chú bác sĩ" 
                      onClick={() => window.open(note.userNotePhoto, "_blank")}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <Link
                to={`/member/doctor-notes/edit/${note.noteId || note.id}`}
                state={{ noteData: note }}
                className="edit-btn"
              >
                <Edit2 size={18} />
                <span>Chỉnh sửa</span>
              </Link>
              <button className="delete-btn" onClick={handleDelete}>
                <Trash2 size={18} />
                <span>Xóa ghi chú</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

NoteDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  note: PropTypes.shape({
    noteId: PropTypes.string,
    id: PropTypes.string,
    note: PropTypes.string,
    date: PropTypes.string,
    diagnosis: PropTypes.string,
    detail: PropTypes.string,
    userNotePhoto: PropTypes.string
  }),
  onDelete: PropTypes.func.isRequired
};

export default NoteDetailModal; 