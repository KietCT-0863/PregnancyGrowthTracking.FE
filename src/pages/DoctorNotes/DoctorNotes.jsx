"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FaPlus } from "react-icons/fa"
import userNoteService from "../../api/services/userNoteService"
import "./DoctorNotes.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPen, faTrash } from "@fortawesome/free-solid-svg-icons"
import Swal from "sweetalert2"
import { AlertTriangle, Calendar, Info, Bell } from "lucide-react"
import { toast } from "react-hot-toast"

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

  // Thêm các state mới
  const [alertHistory, setAlertHistory] = useState([])
  const [showAlertHistory, setShowAlertHistory] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false)

  // Fetch notes khi component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await userNoteService.getUserNotes()

      // Xử lý dữ liệu trước khi set vào state
      const processedNotes = response.map((note) => {
        return {
          ...note,
          // Thêm baseURL nếu cần
          fileUrl: note.fileUrl ? `${API_BASE_URL}${note.fileUrl}` : note.fileUrl,
          // Backup các trường có thể chứa URL ảnh
          imageUrl: note.imageUrl ? `${API_BASE_URL}${note.imageUrl}` : note.imageUrl,
          file: note.file ? `${API_BASE_URL}${note.file}` : note.file,
        }
      })

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

  // Hàm để lấy cảnh báo từ API
  const fetchAlertHistory = async (weekAge) => {
    try {
      setIsLoadingAlerts(true)
      
      // Đảm bảo weekAge là số
      const age = parseInt(weekAge)
      if (isNaN(age)) {
        toast.error("Tuần thai không hợp lệ")
        return
      }
      
      // Gọi API lấy dữ liệu cảnh báo cho tuần thai đó
      // Thay thế growthStatsService bằng service phù hợp của bạn
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (!userData?.userId) {
        toast.error("Không tìm thấy thông tin người dùng")
        return
      }
      
      // Giả định bạn có API lấy dữ liệu thai nhi theo tuần
      // Có thể bạn cần phải tạo một service mới để gọi API này
      const response = await fetch(`/api/foetus/alerts/${userData.userId}?age=${age}`)
      
      if (!response.ok) {
        throw new Error("Không thể lấy dữ liệu cảnh báo")
      }
      
      const data = await response.json()
      
      // Xử lý dữ liệu và cấu trúc giống như BasicTracking.jsx
      const alerts = data.map(item => {
        const alertItems = []
        
        // Kiểm tra cảnh báo HC
        if (item.hc?.isAlert) {
          alertItems.push({
            type: 'warning',
            measure: 'HC',
            value: item.hc.value,
            range: `${item.hc.minRange}-${item.hc.maxRange}`,
            date: item.date
          })
        }
        
        // Kiểm tra cảnh báo AC
        if (item.ac?.isAlert) {
          alertItems.push({
            type: 'warning',
            measure: 'AC',
            value: item.ac.value,
            range: `${item.ac.minRange}-${item.ac.maxRange}`,
            date: item.date
          })
        }
        
        // Kiểm tra cảnh báo FL
        if (item.fl?.isAlert) {
          alertItems.push({
            type: 'warning',
            measure: 'FL',
            value: item.fl.value,
            range: `${item.fl.minRange}-${item.fl.maxRange}`,
            date: item.date
          })
        }
        
        // Kiểm tra cảnh báo EFW
        if (item.efw?.isAlert) {
          alertItems.push({
            type: 'warning',
            measure: 'EFW',
            value: item.efw.value,
            range: `${item.efw.minRange}-${item.efw.maxRange}`,
            date: item.date
          })
        }
        
        return {
          date: item.date,
          age: item.age,
          alerts: alertItems
        }
      }).filter(item => item.alerts.length > 0)
      
      setAlertHistory(alerts)
      
      // Nếu có cảnh báo, hiển thị modal
      if (alerts.length > 0) {
        setSelectedWeek(age)
        setShowAlertHistory(true)
      } else {
        toast.info(`Không có cảnh báo nào cho tuần thai ${age}`)
      }
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử cảnh báo:', error)
      toast.error('Không thể lấy lịch sử cảnh báo')
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  // Component AlertHistoryModal
  const AlertHistoryModal = ({ isOpen, onClose, history, week }) => {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="alert-history-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="alert-history-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="alert-history-header">
                <h3>Cảnh báo tuần thai {week}</h3>
                <motion.button
                  onClick={onClose}
                  whileHover={{
                    rotate: 90,
                    backgroundColor: "rgba(255, 71, 87, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  ✕
                </motion.button>
              </div>
              <div className="alert-history-body">
                {history.length > 0 ? (
                  history.map((item, index) => (
                    <div key={index} className="alert-history-item">
                      <div className="alert-history-date">
                        <Calendar size={14} />
                        <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                        <span className="alert-history-week">Tuần {item.age}</span>
                      </div>
                      <div className="alert-history-alerts">
                        {item.alerts.map((alert, alertIndex) => (
                          <div key={alertIndex} className="alert-detail">
                            <AlertTriangle size={14} className="warning-icon" />
                            <span>
                              {alert.measure}: {alert.value} {alert.measure === 'EFW' ? 'g' : 'mm'}
                              {' '}(Khoảng an toàn: {alert.range} {alert.measure === 'EFW' ? 'g' : 'mm'})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-alerts-history">
                    <Info size={24} />
                    <p>Không có cảnh báo nào cho tuần thai này</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

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
              
              {/* Thêm nút xem cảnh báo */}
              <div className="note-alerts">
                <motion.button
                  className="view-alerts-btn"
                  onClick={() => {
                    // Trích xuất tuần thai từ nội dung ghi chú hoặc yêu cầu nhập
                    const weekMatch = note.detail?.match(/tuần\s+(\d+)/i) || note.diagnosis?.match(/tuần\s+(\d+)/i);
                    if (weekMatch && weekMatch[1]) {
                      fetchAlertHistory(weekMatch[1]);
                    } else {
                      // Nếu không tìm thấy thông tin tuần thai, hiển thị prompt để nhập
                      Swal.fire({
                        title: 'Nhập tuần thai',
                        input: 'number',
                        inputAttributes: {
                          min: 1,
                          max: 42,
                          step: 1
                        },
                        showCancelButton: true,
                        confirmButtonText: 'Xem cảnh báo',
                        cancelButtonText: 'Hủy',
                        inputValidator: (value) => {
                          if (!value || value < 1 || value > 42) {
                            return 'Vui lòng nhập tuần thai hợp lệ (1-42)';
                          }
                        }
                      }).then((result) => {
                        if (result.isConfirmed) {
                          fetchAlertHistory(result.value);
                        }
                      });
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={16} />
                  <span>Xem cảnh báo tuần thai</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Thêm AlertHistoryModal */}
      <AlertHistoryModal
        isOpen={showAlertHistory}
        onClose={() => setShowAlertHistory(false)}
        history={alertHistory}
        week={selectedWeek}
      />
      
      {/* Hiển thị loading khi đang lấy dữ liệu */}
      {isLoadingAlerts && (
        <div className="loading-overlay">
          <div className="loading-spinner">Đang tải dữ liệu cảnh báo...</div>
        </div>
      )}
    </div>
  )
}

export default DoctorNotes

