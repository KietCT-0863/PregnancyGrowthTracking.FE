import { useState } from "react"
import { Calendar, Users, Baby, TrendingUp, Apple, Dumbbell, User, X, AlertCircle, Ruler } from "lucide-react"
import "./BasicTracking.scss"
import { FaS } from "react-icons/fa6"

const mockUser = {
  name: "Nguyễn Thị A",
  email: "nguyenthia@example.com",
  dueDate: "2024-12-31",
  weeksPregant: 20,
}

// Hàm tính ngày dự sinh dựa vào tuần thai
const calculateDueDate = (pregnancyWeek) => {
  const today = new Date();
  const weeksRemaining = 40 - pregnancyWeek; // 40 tuần là thời gian thai kỳ đủ
  const dueDate = new Date(today.getTime() + (weeksRemaining * 7 * 24 * 60 * 60 * 1000));
  return dueDate;
};

// Mock data cho lịch sử đứa trẻ
const mockChildren = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    gender: "male",
    pregnancyWeek: 24,
    stats: {
      weight: "3.5kg",
      height: "50cm"
    }
  },
  {
    id: 2,
    name: "Nguyễn Thị Bình",
    gender: "female",
    pregnancyWeek: 8,
    stats: {
      weight: "3.2kg",
      height: "48cm"
    }
  }
].map(child => ({
  ...child,
  dueDate: calculateDueDate(child.pregnancyWeek)
}));

const BasicTracking = () => {
  const [weight, setWeight] = useState(1)
  const [height, setHeight] = useState(1)
  const [bmi, setBmi] = useState(false)
  const [childrenHistory, setChildrenHistory] = useState(mockChildren)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [isUpdateStatsOpen, setIsUpdateStatsOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    pregnancyWeek: 0
  })
  const [statsForm, setStatsForm] = useState({
    HC: "",
    AC: "",
    FL: "",
    EFW: ""
  })

  const handleOnChangeWeight = (e) => {
    setWeight(e.target.value)
  }
  
  const handleOnChangeHeight = (e) => {
    setHeight(e.target.value)
  }

  const handleUpdateGrowth = () => {
    setBmi(!bmi)
    alert("Cập nhật thành công!")
  }

  const handleOnClose = () => {
    setBmi(false)
  }

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleChildSelect = (child) => {
    if (child.pregnancyWeek >= 12) {
      setSelectedChild(child);
      setStatsForm({
        HC: child.stats.HC || "",
        AC: child.stats.AC || "",
        FL: child.stats.FL || "",
        EFW: child.stats.EFW || ""
      });
      setIsUpdateStatsOpen(true);
    }
  }

  const handleUpdateStats = () => {
    if (selectedChild) {
      setStatsForm({
        HC: selectedChild.stats.HC || "",
        AC: selectedChild.stats.AC || "",
        FL: selectedChild.stats.FL || "",
        EFW: selectedChild.stats.EFW || ""
      });
      setIsUpdateStatsOpen(true);
    }
  }

  const handleEditClick = (child) => {
    setSelectedChild(child)
    setEditForm({
      name: child.name,
      pregnancyWeek: child.pregnancyWeek
    })
    setIsEditPopupOpen(true)
  }

  const handleEditClose = () => {
    setIsEditPopupOpen(false)
    setSelectedChild(null)
    setEditForm({
      name: "",
      pregnancyWeek: 0
    })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (selectedChild) {
      const updatedChildren = childrenHistory.map(child => {
        if (child.id === selectedChild.id) {
          const newPregnancyWeek = parseInt(editForm.pregnancyWeek);
          return {
            ...child,
            name: editForm.name,
            pregnancyWeek: newPregnancyWeek,
            dueDate: calculateDueDate(newPregnancyWeek)
          }
        }
        return child
      })
      setChildrenHistory(updatedChildren)
      handleEditClose()
    }
  }

  const handleUpdateStatsSubmit = (e) => {
    e.preventDefault();
    if (selectedChild) {
      const updatedChildren = childrenHistory.map(child => {
        if (child.id === selectedChild.id) {
          return {
            ...child,
            stats: {
              ...child.stats,
              HC: statsForm.HC || child.stats.HC,
              AC: statsForm.AC || child.stats.AC,
              FL: statsForm.FL || child.stats.FL,
              EFW: statsForm.EFW || child.stats.EFW
            }
          }
        }
        return child;
      });
      setChildrenHistory(updatedChildren);
      setIsUpdateStatsOpen(false);
      setSelectedChild(null);
      setStatsForm({
        HC: "",
        AC: "",
        FL: "",
        EFW: ""
      });
      alert("Cập nhật thông số thành công!");
    }
  };

  const handleStatsChange = (e) => {
    const { name, value } = e.target;
    setStatsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatsClose = () => {
    setIsUpdateStatsOpen(false);
    setSelectedChild(null);
    setStatsForm({
      HC: "",
      AC: "",
      FL: "",
      EFW: ""
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Xin chào, {mockUser.name}!</h1>
        <p>Chúc bạn có một ngày tuyệt vời cùng Mẹ Bầu</p>
      </div>

      <div className="dashboard__stats">
        <div className="dashboard__card">
          <h2>
            <Baby className="icon" />
            Thông tin thai kỳ
          </h2>
          <p>
            Tuần thai: <span>{mockUser.weeksPregant}</span>
          </p>
          <p>
            Ngày dự sinh: <span>{mockUser.dueDate}</span>
          </p>
          <button className="btn btn--primary">
            <TrendingUp className="icon" />
            Xem biểu đồ tăng trưởng
          </button>
        </div>

        <div className="dashboard__card">
          <h2>
            <Ruler className="icon" />
            Hướng dẫn cập nhật chỉ số
          </h2>
          <div className="measurement-guide">
            <p>Các chỉ số siêu âm cần cập nhật:</p>
            <ul>
              <li>HC - Chu vi đầu (mm)</li>
              <li>AC - Chu vi bụng (mm)</li>
              <li>FL - Chiều dài xương đùi (mm)</li>
              <li>EFW - Ước tính cân nặng (gram)</li>
            </ul>
            <p className="guide-note">Click vào hồ sơ trẻ bên dưới để cập nhật các chỉ số</p>
          </div>
        </div>
      </div>

      <div className="children-history">
        <h3>Lịch sử hồ sơ đứa trẻ</h3>
        {childrenHistory.length === 0 ? (
          <p className="no-history">Chưa có hồ sơ trẻ nào được tạo</p>
        ) : (
          <div className="history-list">
            {childrenHistory.map((child) => (
              <div 
                key={child.id} 
                className={`history-item ${selectedChild?.id === child.id ? 'selected' : ''}`}
                onClick={() => handleChildSelect(child)}
              >
                <div className="child-info">
                  <div className="child-header">
                    <h4>{child.name}</h4>
                    <button 
                      className="edit-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(child);
                      }}
                    >
                      <X className="icon" />
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className="info-details" onClick={() => handleChildSelect(child)}>
                    <span className="gender">
                      <User size={16} />
                      {child.gender === 'male' ? 'Nam' : 'Nữ'}
                    </span>
                    <span className="pregnancy-week">
                      <Baby size={16} />
                      Tuần thai: {child.pregnancyWeek}
                    </span>
                    <span className="due-date">
                      <Calendar size={16} />
                      Ngày dự sinh: {formatDate(child.dueDate)}
                    </span>
                    {child.pregnancyWeek < 12 ? (
                      <span className="warning">
                        <AlertCircle size={16} />
                        Thai nhi quá nhỏ để tính toán chỉ số
                      </span>
                    ) : (
                      <div className="stats-container">
                        <div className="stats-info">
                          {child.stats.HC && (
                            <span className="stat">HC: {child.stats.HC}</span>
                          )}
                          {child.stats.AC && (
                            <span className="stat">AC: {child.stats.AC}</span>
                          )}
                          {child.stats.FL && (
                            <span className="stat">FL: {child.stats.FL}</span>
                          )}
                          {child.stats.EFW && (
                            <span className="stat">EFW: {child.stats.EFW}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup cập nhật thông số */}
      {isUpdateStatsOpen && (
        <div className="edit-popup-overlay">
          <div className="edit-popup-content">
            <button className="close-button" onClick={handleStatsClose}>
              <X size={24} />
            </button>
            <h2>Cập nhật thông số siêu âm</h2>
            {selectedChild && (
              <div className="pregnancy-info">
                <p>Trẻ: {selectedChild.name}</p>
                <p>Tuần thai: {selectedChild.pregnancyWeek}</p>
              </div>
            )}
            <form onSubmit={handleUpdateStatsSubmit}>
              <div className="form-group">
                <label htmlFor="HC">HC - Chu vi đầu (mm):</label>
                <input
                  type="number"
                  id="HC"
                  name="HC"
                  value={statsForm.HC}
                  onChange={handleStatsChange}
                  placeholder="Nhập chu vi đầu"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="AC">AC - Chu vi bụng (mm):</label>
                <input
                  type="number"
                  id="AC"
                  name="AC"
                  value={statsForm.AC}
                  onChange={handleStatsChange}
                  placeholder="Nhập chu vi bụng"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="FL">FL - Chiều dài xương đùi (mm):</label>
                <input
                  type="number"
                  id="FL"
                  name="FL"
                  value={statsForm.FL}
                  onChange={handleStatsChange}
                  placeholder="Nhập chiều dài xương đùi"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="EFW">EFW - Ước tính cân nặng (gram):</label>
                <input
                  type="number"
                  id="EFW"
                  name="EFW"
                  value={statsForm.EFW}
                  onChange={handleStatsChange}
                  placeholder="Nhập ước tính cân nặng"
                  min="0"
                />
              </div>
              <button type="submit" className="btn btn--primary">
                <Ruler className="icon" />
                Lưu thông số
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Popup chỉnh sửa thông tin */}
      {isEditPopupOpen && (
        <div className="edit-popup-overlay">
          <div className="edit-popup-content">
            <button className="close-button" onClick={handleEditClose}>
              <X size={24} />
            </button>
            <h2>Chỉnh sửa thông tin</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="name">Tên trẻ:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="pregnancyWeek">Tuần thai:</label>
                <input
                  type="number"
                  id="pregnancyWeek"
                  name="pregnancyWeek"
                  value={editForm.pregnancyWeek}
                  onChange={handleEditChange}
                  min="0"
                  max="42"
                  required
                />
              </div>
              {editForm.pregnancyWeek && (
                <div className="due-date-preview">
                  Ngày dự sinh: {formatDate(calculateDueDate(parseInt(editForm.pregnancyWeek)))}
                </div>
              )}
              <button type="submit" className="btn btn--primary">
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard__tip">
        <h2>Mẹo của ngày</h2>
        <div className="dashboard__tip-content">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
            alt="Healthy Food"
            className="tip-image"
          />
          <div>
            <h3>Ăn nhiều rau xanh</h3>
            <p>Rau xanh giàu folate, sắt và các vitamin cần thiết cho sự phát triển của thai nhi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BasicTracking

