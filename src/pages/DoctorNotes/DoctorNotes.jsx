"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash, faPlus, faNotesMedical, faCalendarAlt, faHospital } from "@fortawesome/free-solid-svg-icons"
import { AlertTriangle, Calendar, Info, Bell } from "lucide-react"
import userNoteService from "../../api/services/userNoteService"
import Swal from "sweetalert2"
import { toast } from "react-hot-toast"
import "./DoctorNotes.scss"

const DoctorNotes = () => {
  // State management
  const [notes, setNotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [currentNote, setCurrentNote] = useState({
    date: "",
    note1: "",
    diagnosis: "",
    note2: "",
    images: [],
    currentImage: null,
  })
  const [alertHistory, setAlertHistory] = useState([])
  const [showAlertHistory, setShowAlertHistory] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") 
  const [filterType, setFilterType] = useState("all")

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  // Data handling functions
  const fetchNotes = async () => {
    try {
      const response = await userNoteService.getUserNotes()
      const processedNotes = response.map((note) => ({
        ...note,
        fileUrl: note.fileUrl ? `${note.fileUrl}` : note.fileUrl,
        imageUrl: note.imageUrl ? `${note.imageUrl}` : note.imageUrl,
        file: note.file ? `${note.file}` : note.file,
      }))
      setNotes(processedNotes)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Không thể tải danh sách ghi chú")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentNote(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB")
        e.target.value = ""
        return
      }
      setCurrentNote(prev => ({ ...prev, images: [file] }))
      toast.success("Tải ảnh lên thành công!")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isEditing && (!currentNote.images || currentNote.images.length === 0)) {
      toast.error("Vui lòng thêm ít nhất một ảnh cho ghi chú mới")
      return
    }

    try {
      if (isEditing) {
        await userNoteService.updateNote(editingId, currentNote)
        toast.success("Cập nhật ghi chú thành công!")
      } else {
        await userNoteService.createNote(currentNote)
        toast.success("Tạo ghi chú mới thành công!")
      }

      await fetchNotes()
      resetForm()
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu ghi chú")
    }
  }

  const resetForm = () => {
    setCurrentNote({
      date: "",
      note1: "",
      diagnosis: "",
      note2: "",
      images: [],
      currentImage: null,
    })
    setShowForm(false)
    setIsEditing(false)
    setEditingId(null)
  }

  const handleEdit = (note) => {
    setCurrentNote({
      noteId: note.noteId,
      date: note.date,
      note1: note.note,
      diagnosis: note.diagnosis,
      note2: note.detail,
      images: [],
      currentImage: note.userNotePhoto,
    })
    setIsEditing(true)
    setEditingId(note.noteId)
    setShowForm(true)
  }

  const handleDelete = async (noteId) => {
    try {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa ghi chú này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa!",
        cancelButtonText: "Hủy",
      })

      if (result.isConfirmed) {
        await userNoteService.deleteNote(noteId)
        toast.success("Xóa ghi chú thành công!")
        await fetchNotes()
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Có lỗi xảy ra khi xóa ghi chú")
    }
  }

  // Filtering and search functionality
  const filteredNotes = notes.filter(note => {
    // Search term filter
    const matchesSearch = 
      note.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.detail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.date?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter type
    if (filterType === "all") return matchesSearch;
    
    const noteDate = new Date(note.date);
    const currentDate = new Date();
    
    if (filterType === "recent" && noteDate >= new Date(currentDate.setMonth(currentDate.getMonth() - 3))) {
      return matchesSearch; // Last 3 months
    } else if (filterType === "older" && noteDate < new Date(currentDate.setMonth(currentDate.getMonth() - 3))) {
      return matchesSearch; // Older than 3 months
    }
    
    return false;
  });

  return (
    <div className="doctor-notes-container">
      {/* Background effects */}
      <div className="doctor-notes-background">
        <div className="waves">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
        <div className="particles">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="particle"></div>
          ))}
        </div>
      </div>

      {/* Header section */}
      <div className="doctor-notes-header">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <FontAwesomeIcon icon={faNotesMedical} className="header-icon" />
          Ghi Chú Bác Sĩ
        </motion.h1>
        
        <motion.div 
          className="search-filter-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Tìm kiếm ghi chú..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-box">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="recent">3 tháng gần đây</option>
              <option value="older">Cũ hơn</option>
            </select>
          </div>
          
          <motion.button
            className="add-note-button"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faPlus} /> Thêm Ghi Chú Mới
          </motion.button>
        </motion.div>
      </div>

      {/* Notes grid */}
      <motion.div 
        className="notes-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note, index) => (
            <motion.div 
              key={note.noteId || note.id}
              className="note-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="note-header">
                <div className="note-title">
                  <FontAwesomeIcon icon={faHospital} className="hospital-icon" />
                  <h3>{note.note || "Chưa có thông tin"}</h3>
                </div>
                <div className="note-date">
                  <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
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
                  <div className="image-preview" onClick={() => window.open(note.userNotePhoto, "_blank")}>
                    <img src={note.userNotePhoto} alt="Ghi chú bác sĩ" />
                    <div className="image-overlay">
                      <span>Nhấn để xem</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="note-actions">
                <button className="edit-button" onClick={() => handleEdit(note)}>
                  <FontAwesomeIcon icon={faPen} /> Sửa
                </button>
                <button className="delete-button" onClick={() => handleDelete(note.noteId || note.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Xóa
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="no-notes">
            <Info size={48} />
            <p>{searchTerm ? "Không tìm thấy ghi chú phù hợp" : "Bạn chưa có ghi chú nào"}</p>
            <button onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} /> Tạo ghi chú đầu tiên
            </button>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Note Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-container"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="modal-header">
                <h2>{isEditing ? "Cập Nhật Ghi Chú" : "Thêm Ghi Chú Mới"}</h2>
                <button className="close-button" onClick={resetForm}>✕</button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">
                      <Calendar size={16} className="input-icon" />
                      Ngày khám <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={currentNote.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="note1">
                    <FontAwesomeIcon icon={faHospital} className="input-icon" />
                    Bệnh viện và bác sĩ khám <span className="required">*</span>
                  </label>
                  <textarea
                    id="note1"
                    name="note1"
                    value={currentNote.note1}
                    onChange={handleInputChange}
                    placeholder="Nhập thông tin bác sĩ và bệnh viện/phòng khám"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="diagnosis">
                    <FontAwesomeIcon icon={faNotesMedical} className="input-icon" />
                    Chẩn đoán
                  </label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={currentNote.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Nhập chẩn đoán của bác sĩ"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="note2">
                    <Info size={16} className="input-icon" />
                    Chi tiết
                  </label>
                  <textarea
                    id="note2"
                    name="note2"
                    value={currentNote.note2}
                    onChange={handleInputChange}
                    placeholder="Nhập đơn thuốc và ghi chú thêm"
                  />
                </div>
                
                <div className="form-group">
                  <label>
                    <Bell size={16} className="input-icon" />
                    Ảnh ghi chú
                  </label>
                  
                  {isEditing && currentNote.currentImage && (
                    <div className="current-image-preview">
                      <img
                        src={currentNote.currentImage}
                        alt="Ảnh hiện tại"
                        onClick={() => window.open(currentNote.currentImage, "_blank")}
                      />
                      <span>Ảnh hiện tại</span>
                    </div>
                  )}
                  
                  <div className="file-upload">
                    <label htmlFor="image-upload" className="upload-label">
                      {isEditing ? "Thay đổi ảnh (không bắt buộc)" : "Thêm ảnh ghi chú"}
                      {!isEditing && <span className="required">*</span>}
                    </label>
                    <input 
                      type="file" 
                      id="image-upload" 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      required={!isEditing} 
                    />
                    {currentNote.images.length > 0 && (
                      <p className="file-name">Đã chọn: {currentNote.images[0].name}</p>
                    )}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    {isEditing ? "Cập Nhật" : "Lưu Ghi Chú"}
                  </button>
                  <button type="button" className="cancel-button" onClick={resetForm}>
                    Hủy
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {isLoadingAlerts && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorNotes

