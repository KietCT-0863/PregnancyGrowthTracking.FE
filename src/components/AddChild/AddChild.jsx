import { useState } from "react";
import { X, Calendar, User } from "lucide-react";
import "./AddChild.scss";

const AddChild = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [childInfo, setChildInfo] = useState({
    name: "",
    gender: "male",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [childrenHistory, setChildrenHistory] = useState([]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    setChildInfo({ name: "", gender: "male" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChildInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newChild = {
      ...childInfo,
      id: Date.now(), // Tạo id tạm thời
      createdAt: new Date().toISOString(),
    };
    
    // Thêm đứa trẻ mới vào lịch sử
    setChildrenHistory(prev => [...prev, newChild]);
    
    // Tại đây sẽ thêm logic gọi API để lưu thông tin
    console.log("Child info submitted:", newChild);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      handleClose();
    }, 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="add-child-container">
      <button className="add-child-button" onClick={handleOpen}>
        Thêm thông tin trẻ
      </button>

      {isOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-button" onClick={handleClose}>
              <X size={24} />
            </button>
            <h2>Thêm thông tin trẻ</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Tên trẻ:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={childInfo.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Giới tính:</label>
                <select
                  id="gender"
                  name="gender"
                  value={childInfo.gender}
                  onChange={handleChange}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>

              <button type="submit" className="submit-button">
                Tạo
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-message">
          Thêm thông tin trẻ thành công!
        </div>
      )}

      {/* Phần hiển thị lịch sử */}
      <div className="children-history">
        <h3>Lịch sử thêm thông tin trẻ</h3>
        {childrenHistory.length === 0 ? (
          <p className="no-history">Chưa có thông tin trẻ nào được thêm</p>
        ) : (
          <div className="history-list">
            {childrenHistory.map((child) => (
              <div key={child.id} className="history-item">
                <div className="child-info">
                  <h4>{child.name}</h4>
                  <div className="info-details">
                    <span className="gender">
                      <User size={16} />
                      {child.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                    <span className="created-date">
                      <Calendar size={16} />
                      {formatDate(child.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddChild; 