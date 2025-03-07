"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaPlus } from "react-icons/fa"
import userNoteService from "../../api/services/userNoteService"
import "./DoctorNotes.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"



const DoctorNotes = () => {
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

  // Fetch notes khi component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await userNoteService.getUserNotes()
      console.log("Fetched notes raw data:", response)

      // Xử lý dữ liệu trước khi set vào state
      const processedNotes = response.map((note) => {
        console.log("Processing note:", note)
        return {
          ...note,
          // Thêm baseURL nếu cần
          fileUrl: note.fileUrl ? `${API_BASE_URL}${note.fileUrl}` : note.fileUrl,
          // Backup các trường có thể chứa URL ảnh
          imageUrl: note.imageUrl ? `${API_BASE_URL}${note.imageUrl}` : note.imageUrl,
          file: note.file ? `${API_BASE_URL}${note.file}` : note.file,
        }
      })

      console.log("Processed notes:", processedNotes)
      setNotes(processedNotes)
    } catch (error) {
      console.error("Lỗi khi lấy danh sách ghi chú:", error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentNote((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        showAlert("warning", "Kích thước file không được vượt quá 10MB")
        e.target.value = ""
        return
      }
      setCurrentNote((prev) => ({
        ...prev,
        images: [file],
      }))
      showAlert("success", "Tải ảnh lên thành công!")
    }
  }

  const showAlert = (type, message) => {
    Swal.fire({
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 1500,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isEditing && (!currentNote.images || currentNote.images.length === 0)) {
      showAlert("warning", "Vui lòng thêm ít nhất một ảnh cho ghi chú mới")
      return
    }

    try {
      console.log("Submitting form with data:", currentNote)

      if (isEditing) {
        // Kiểm tra xem có thay đổi ảnh không
        if (currentNote.images && currentNote.images.length > 0) {
          console.log("Updating with new image")
        } else {
          console.log("Updating without new image")
        }

        await userNoteService.updateNote(editingId, currentNote)
        showAlert("success", "Cập nhật ghi chú thành công!")
      } else {
        await userNoteService.createNote(currentNote)
        showAlert("success", "Tạo ghi chú mới thành công!")
      }

      await fetchNotes()

      // Reset form
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
    } catch (error) {
      console.error("Submit error:", error)
      showAlert("error", error.response?.data?.message || "Có lỗi xảy ra khi lưu ghi chú. Vui lòng thử lại.")
    }
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
        showAlert("success", "Xóa ghi chú thành công!")
        await fetchNotes()
      }
    } catch (error) {
      console.error("Delete error:", error)
      showAlert("error", "Có lỗi xảy ra khi xóa ghi chú. Vui lòng thử lại.")
    }
  }

  return (
    <div className="doctor-notes-container">
      {/* Thêm hiệu ứng sóng */}
      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Thêm hiệu ứng thác đổ */}
      <div className="waterfall">
        {[...Array(20)].map((_, index) => (
          <div key={`drop-${index}`} className="water-drop"></div>
        ))}
      </div>

      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Ghi Chú Bác Sĩ
      </motion.h1>

      <div className="action-buttons">
        <motion.button
          className="add-note-btn"
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Thêm Ghi Chú Mới
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
            >
              <h2>{isEditing ? "Cập Nhật Ghi Chú" : "Thêm Ghi Chú Mới"}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="date">Ngày khám</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={currentNote.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="note1">Bệnh viện và bác sĩ khám</label>
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
                  <label htmlFor="diagnosis">Chẩn đoán</label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={currentNote.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Nhập chẩn đoán của bác sĩ"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="note2">Chi tiết</label>
                  <textarea
                    id="note2"
                    name="note2"
                    value={currentNote.note2}
                    onChange={handleInputChange}
                    placeholder="Nhập đơn thuốc và ghi chú thêm"
                  />
                </div>
                <div className="form-group">
                  <label>Ảnh hiện tại</label>
                  {isEditing && currentNote.currentImage && (
                    <div className="current-image">
                      <img
                        src={currentNote.currentImage || "/placeholder.svg"}
                        alt="Ảnh hiện tại"
                        onClick={() => window.open(currentNote.currentImage, "_blank")}
                      />
                    </div>
                  )}
                  <label htmlFor="images">
                    {isEditing ? "Thay đổi ảnh (không bắt buộc)" : "Thêm ảnh"}
                    {!isEditing && <span className="required">*</span>}
                  </label>
                  <input type="file" id="images" onChange={handleImageUpload} accept="image/*" required={!isEditing} />
                  {currentNote.images.length > 0 && (
                    <small className="success-text">Đã chọn ảnh mới: {currentNote.images[0].name}</small>
                  )}
                </div>
                <div className="form-actions">
                  <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {isEditing ? "Cập Nhật" : "Lưu Ghi Chú"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setIsEditing(false)
                      setEditingId(null)
                      setCurrentNote({
                        date: "",
                        note1: "",
                        diagnosis: "",
                        note2: "",
                        images: [],
                        currentImage: null,
                      })
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="notes-list">
        {notes.map((note) => (
          <motion.div
            key={note.noteId || note.id}
            className="note-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="note-header">
              <div className="note-info">
                <span className="note-hospital">{note.note || "Chưa có thông tin"}</span>
                <span className="note-date">{note.date || "Chưa có ngày"}</span>
              </div>
              <div className="note-actions">
                <button onClick={() => handleEdit(note)} className="edit-btn">
                  <FontAwesomeIcon icon={faPen} />
                </button>
                <button onClick={() => handleDelete(note.noteId || note.id)} className="delete-btn">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>

            <div className="note-content">
              {note.diagnosis && (
                <div className="diagnosis">
                  <strong>Chẩn đoán:</strong> {note.diagnosis}
                </div>
              )}
              {note.detail && (
                <div className="detail">
                  <strong>Ghi chú:</strong> {note.detail}
                </div>
              )}
              {note.userNotePhoto && (
                <div className="note-image">
                  <img
                    src={note.userNotePhoto || "/placeholder.svg"}
                    alt="Note attachment"
                    onClick={() => window.open(note.userNotePhoto, "_blank")}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default DoctorNotes

