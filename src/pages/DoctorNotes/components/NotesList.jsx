import { motion } from "framer-motion"
import { Calendar, FileText, Edit2, Trash2, AlertTriangle, Plus } from "lucide-react"
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import './NotesList.scss'

const NotesList = ({
  notes = [],
  searchTerm = "",
  onDelete = () => {},
  onAddNote = () => {}
}) => {
  const handleDelete = (noteId) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa ghi chú này?")
    if (confirmDelete) {
      onDelete(noteId)
    }
  }

  return (
    <motion.div 
      className="notes-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {notes.length > 0 ? (
        notes.map((note) => (
          <motion.div
            key={note.noteId || note.id}
            className="note-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="note-header">
              <div className="note-title">
                <h3>{note.note || "Chưa có thông tin"}</h3>
              </div>
              <div className="note-date">
                <Calendar size={16} />
                <span>{note.date || "Chưa có ngày"}</span>
              </div>
            </div>

            <div className="note-content">
              {note.diagnosis && (
                <div className="diagnosis-section">
                  <h4>Chẩn đoán:</h4>
                  <p>{note.diagnosis}</p>
                </div>
              )}

              {note.detail && (
                <div className="detail-section">
                  <h4>Chi tiết:</h4>
                  <p>{note.detail}</p>
                </div>
              )}

              {note.userNotePhoto && (
                <div 
                  className="image-preview" 
                  onClick={() => window.open(note.userNotePhoto, "_blank")}
                >
                  <img src={note.userNotePhoto} alt="Ghi chú bác sĩ" />
                  <div className="image-overlay">
                    <FileText size={24} />
                  </div>
                </div>
              )}
            </div>

            <div className="note-actions">
              <Link 
                to={`/member/doctor-notes/edit/${note.noteId || note.id}`}
                state={{ noteData: note }}
                className="edit-btn"
              >
                <Edit2 size={18} />
                <span>Sửa</span>
              </Link>
              <button 
                className="delete-btn"
                onClick={() => handleDelete(note.noteId || note.id)}
                aria-label="Xóa ghi chú"
              >
                <Trash2 size={18} />
                <span>Xóa</span>
              </button>
            </div>
          </motion.div>
        ))
      ) : (
        <motion.div 
          className="no-notes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertTriangle size={48} />
          <p>
            {searchTerm 
              ? "Không tìm thấy ghi chú phù hợp" 
              : "Bạn chưa có ghi chú nào"}
          </p>
          <button onClick={onAddNote}>
            <Plus size={20} />
            Tạo ghi chú đầu tiên
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}

NotesList.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      noteId: PropTypes.string,
      id: PropTypes.string,
      note: PropTypes.string,
      date: PropTypes.string,
      diagnosis: PropTypes.string,
      detail: PropTypes.string,
      userNotePhoto: PropTypes.string
    })
  ).isRequired,
  searchTerm: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddNote: PropTypes.func.isRequired
}

export default NotesList 