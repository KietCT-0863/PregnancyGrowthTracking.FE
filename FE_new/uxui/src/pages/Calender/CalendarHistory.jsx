import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, Clock, Tag, Trash } from "lucide-react";
import "./CalendarHistory.scss";

const   CalendarHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState(null);

  const categories = [
    { id: "appointment", label: "Cuộc hẹn bác sĩ" },
    { id: "medication", label: "Uống thuốc" },
    { id: "checkup", label: "Khám thai" },
    { id: "exercise", label: "Tập thể dục" },
    { id: "nutrition", label: "Dinh dưỡng" },
  ];

  useEffect(() => {
    // Fetch event details
    // For now using mock data
    const mockEvent = {
      id,
      title: "Khám thai định kỳ",
      date: "2024-03-20",
      time: "09:00",
      category: "checkup",
      notes: "Nhớ mang theo sổ khám thai",
      createdAt: "2024-03-15T10:00:00Z",
    };
    
    setEvent(mockEvent);
    setEditedEvent(mockEvent);
  }, [id]);

  const handleSave = () => {
    setEvent(editedEvent);
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      // Here you would typically delete from backend
      navigate("/calendar");
    }
  };

  if (!event) return null;

  return (
    <div className="calendar-detail">
      <div className="calendar-detail-header">
        <button className="back-button" onClick={() => navigate("/calendar")}>
          <ArrowLeft />
        </button>
        
        <div className="header-actions">
          {!isEditing && (
            <>
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </button>
              <button className="delete-button" onClick={handleDelete}>
                <Trash size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="edit-form">
          <input
            type="text"
            value={editedEvent.title}
            onChange={(e) => setEditedEvent({...editedEvent, title: e.target.value})}
            placeholder="Tiêu đề"
          />
          
          <div className="form-row">
            <div className="form-group">
              <label>Ngày</label>
              <input
                type="date"
                value={editedEvent.date}
                onChange={(e) => setEditedEvent({...editedEvent, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Giờ</label>
              <input
                type="time"
                value={editedEvent.time}
                onChange={(e) => setEditedEvent({...editedEvent, time: e.target.value})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Danh mục</label>
            <select
              value={editedEvent.category}
              onChange={(e) => setEditedEvent({...editedEvent, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={editedEvent.notes}
              onChange={(e) => setEditedEvent({...editedEvent, notes: e.target.value})}
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button className="cancel-button" onClick={() => setIsEditing(false)}>
              Hủy
            </button>
            <button className="save-button" onClick={handleSave}>
              Lưu
            </button>
          </div>
        </div>
      ) : (
        <div className="event-details">
          <h1>{event.title}</h1>
          
          <div className="event-meta">
            <div className="meta-item">
              <CalendarIcon size={20} />
              <span>{new Date(event.date).toLocaleDateString("vi-VN")}</span>
            </div>
            
            <div className="meta-item">
              <Clock size={20} />
              <span>{event.time}</span>
            </div>
            
            <div className="meta-item">
              <Tag size={20} />
              <span>{categories.find(cat => cat.id === event.category)?.label}</span>
            </div>
          </div>
          
          <div className="event-notes">
            <h3>Ghi chú</h3>
            <p>{event.notes}</p>
          </div>
          
          <div className="event-created">
            <small>
              Tạo ngày: {new Date(event.createdAt).toLocaleDateString("vi-VN")}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

    export default CalendarHistory;