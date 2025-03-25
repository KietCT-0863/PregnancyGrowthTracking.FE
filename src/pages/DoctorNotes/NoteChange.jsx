import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Calendar, ArrowLeft, Save, Camera, FileEdit, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import userNoteService from "../../api/services/userNoteService";
import { isValidPastOrPresentDate, isFutureDate, getFutureDateErrorMessage, getCurrentDateString } from "./components/DateValidation";
import "./DoctorNotes.scss";
import "./NoteChange.scss";
import NotificationPopup from './components/NotificationPopup';
import { playNotificationSound } from "../../utils/soundUtils";

const NoteChange = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const noteData = location.state?.noteData || null;
  
  const [note, setNote] = useState({
    date: "",
    note1: "",
    diagnosis: "",
    note2: "",
    images: [],
    currentImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateError, setDateError] = useState(false);
  const [notification, setNotification] = useState({
    type: '',
    message: '',
    isVisible: false
  });

  useEffect(() => {
    if (noteData) {
      // Dữ liệu ghi chú đã được truyền qua state
      setNote({
        noteId: noteData.noteId || noteData.id,
        date: noteData.date || "",
        note1: noteData.note || "",
        diagnosis: noteData.diagnosis || "",
        note2: noteData.detail || "",
        images: [],
        currentImage: noteData.userNotePhoto || null,
      });
      setIsLoading(false);
    } else {
      // Nếu không có dữ liệu, lấy từ API bằng noteId
      fetchNote();
    }
  }, [noteId, noteData]);

  const fetchNote = async () => {
    try {
      setIsLoading(true);
      const data = await userNoteService.getNoteById(noteId);
      setNote({
        noteId: data.noteId || data.id,
        date: data.date || "",
        note1: data.note || "",
        diagnosis: data.diagnosis || "",
        note2: data.detail || "",
        images: [],
        currentImage: data.userNotePhoto || null,
      });
    } catch (error) {
      console.error("Error fetching note:", error);
      toast.error("Không thể tải thông tin ghi chú");
      navigate("/member/doctor-notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý riêng cho trường ngày
    if (name === "date") {
      // Kiểm tra ngày
      const isFuture = isFutureDate(value);
      setDateError(isFuture);
      
      if (isFuture) {
        const errorMsg = getFutureDateErrorMessage();
        toast.error(
          <div>
            <h4>{errorMsg.title}</h4>
            <p>{errorMsg.message}</p>
          </div>,
          { duration: 6000 }
        );
      }
    }
    
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB");
        e.target.value = "";
        return;
      }
      setNote((prev) => ({ ...prev, images: [file] }));
      toast.success("Tải ảnh lên thành công!");
    }
  };

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra ngày hợp lệ trước khi submit
    if (!isValidPastOrPresentDate(note.date)) {
      toast.error("Vui lòng chọn ngày hợp lệ (không được chọn ngày trong tương lai)");
      return;
    }

    try {
      await userNoteService.updateNote(noteId, note);
      playNotificationSound();
      showNotification('success', 'Ghi chú đã được cập nhật thành công!');
      setTimeout(() => {
        navigate("/member/doctor-notes");
      }, 1500);
    } catch (error) {
      console.error("Error updating note:", error);
      showNotification('error', 'Có lỗi xảy ra khi cập nhật ghi chú.');
    }
  };

  if (isLoading) {
    return (
      <div className="note-change-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin ghi chú...</p>
      </div>
    );
  }

  return (
    <div className="note-change-container">
      <div className="note-change-header">
        <button 
          className="back-button" 
          onClick={() => navigate("/member/doctor-notes")}
        >
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1>Chỉnh sửa ghi chú</h1>
      </div>

      <div className="note-change-content">
        <form onSubmit={handleSubmit}>
          <div className={`form-group ${dateError ? 'date-error' : ''}`}>
            <label>
              <Calendar size={20} className="icon" />
              Ngày khám
            </label>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={note.date}
                onChange={handleInputChange}
                name="date"
                max={getCurrentDateString()}
                required
              />
              {dateError && (
                <div className="date-warning">
                  <AlertTriangle size={16} />
                  <span>Ngày trong tương lai</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>
              <FileEdit size={20} className="icon" />
              Bệnh viện và bác sĩ khám
            </label>
            <input
              type="text"
              value={note.note1}
              onChange={handleInputChange}
              name="note1"
              placeholder="Nhập thông tin bác sĩ và bệnh viện/phòng khám"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FileEdit size={20} className="icon" />
              Chẩn đoán
            </label>
            <textarea
              value={note.diagnosis}
              onChange={handleInputChange}
              name="diagnosis"
              placeholder="Nhập chẩn đoán của bác sĩ"
            />
          </div>

          <div className="form-group">
            <label>
              <FileEdit size={20} className="icon" />
              Chi tiết
            </label>
            <textarea
              value={note.note2}
              onChange={handleInputChange}
              name="note2"
              placeholder="Nhập đơn thuốc và ghi chú thêm"
            />
          </div>

          <div className="form-group">
            <label>
              <Camera size={20} className="icon" />
              Ảnh ghi chú
            </label>
            
            <div className="image-upload-section">
              {note.currentImage && (
                <div className="current-image">
                  <h4>Ảnh hiện tại:</h4>
                  <img 
                    src={note.currentImage} 
                    alt="Ảnh ghi chú hiện tại" 
                    onClick={() => window.open(note.currentImage, "_blank")}
                  />
                </div>
              )}
              
              <div className="new-image-upload">
                <h4>Tải lên ảnh mới (không bắt buộc):</h4>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                {note.images.length > 0 && (
                  <p className="file-name">
                    Đã chọn: {note.images[0].name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate("/member/doctor-notes")}
            >
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={dateError}>
              <Save size={20} />
              Lưu ghi chú
            </button>
          </div>
        </form>
      </div>

      <NotificationPopup
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={3000}
      />
    </div>
  );
};

export default NoteChange; 