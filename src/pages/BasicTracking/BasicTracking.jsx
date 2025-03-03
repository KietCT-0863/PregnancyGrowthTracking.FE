import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Baby, Calendar, Edit2, X, ChevronRight, AlertCircle, Heart, Activity, Scale, Ruler } from "lucide-react"
import "./BasicTracking.scss"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const mockUser = {
  name: "Nguyễn Thị A",
  email: "nguyenthia@example.com",
  dueDate: "2024-12-31",
  weeksPregant: 20,
}

// Hàm tính ngày dự sinh dựa vào tuần thai
const calculateDueDate = (pregnancyWeek) => {
  const today = new Date()
  const weeksRemaining = 40 - pregnancyWeek
  const dueDate = new Date(today.getTime() + weeksRemaining * 7 * 24 * 60 * 60 * 1000)
  return dueDate
}

// Mock data cho lịch sử đứa trẻ
const mockChildren = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    gender: "male",
    pregnancyWeek: 24,
    stats: {
      HC: "220",
      AC: "200",
      FL: "45",
      EFW: "650",
    },
  },
  {
    id: 2,
    name: "Nguyễn Thị Bình",
    gender: "female",
    pregnancyWeek: 28,
    stats: {
      HC: "240",
      AC: "220",
      FL: "52",
      EFW: "850",
    },
  },
].map((child) => ({
  ...child,
  dueDate: calculateDueDate(child.pregnancyWeek),
}))

const BasicTracking = () => {
  const [childrenHistory, setChildrenHistory] = useState(mockChildren)
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [isUpdateStatsOpen, setIsUpdateStatsOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    pregnancyWeek: 0,
  })
  const [statsForm, setStatsForm] = useState({
    HC: "",
    AC: "",
    FL: "",
    EFW: "",
  })

  const chartData = {
    labels: ["HC (mm)", "AC (mm)", "FL (mm)", "EFW (g)"],
    datasets: childrenHistory.map((child) => ({
      label: child.name,
      data: [child.stats.HC || 0, child.stats.AC || 0, child.stats.FL || 0, child.stats.EFW || 0],
      backgroundColor: child.id === 1 ? "rgba(255, 107, 129, 0.5)" : "rgba(112, 161, 255, 0.5)",
      borderColor: child.id === 1 ? "rgb(255, 107, 129)" : "rgb(112, 161, 255)",
      borderWidth: 1,
    })),
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: true,
        text: "Biểu đồ chỉ số thai nhi",
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)"
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      }
    }
  }

  const handleEditClick = (child) => {
    setSelectedChild(child)
    setEditForm({
      name: child.name,
      pregnancyWeek: child.pregnancyWeek,
    })
    setIsEditPopupOpen(true)
  }

  const handleStatsClick = (child) => {
    if (child.pregnancyWeek >= 12) {
      setSelectedChild(child)
      setStatsForm(child.stats)
      setIsUpdateStatsOpen(true)
    }
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (selectedChild) {
      const updatedChildren = childrenHistory.map((child) => {
        if (child.id === selectedChild.id) {
          const newPregnancyWeek = Number(editForm.pregnancyWeek)
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + (40 - newPregnancyWeek) * 7)
          return {
            ...child,
            name: editForm.name,
            pregnancyWeek: newPregnancyWeek,
            dueDate,
          }
        }
        return child
      })
      setChildrenHistory(updatedChildren)
      setIsEditPopupOpen(false)
    }
  }

  const handleStatsSubmit = (e) => {
    e.preventDefault()
    if (selectedChild) {
      const updatedChildren = childrenHistory.map((child) => {
        if (child.id === selectedChild.id) {
          return {
            ...child,
            stats: statsForm,
          }
        }
        return child
      })
      setChildrenHistory(updatedChildren)
      setIsUpdateStatsOpen(false)
    }
  }

  return (
    <div className="pregnancy-monitor">
      <motion.div
        className="monitor-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>Theo dõi thai kỳ</h1>
        <p>Theo dõi sự phát triển của thai nhi</p>
      </motion.div>

      <div className="monitor-content">
        <motion.div
          className="chart-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} height={300} />
          </div>
          <div className="chart-legend">
            <h3>Chú thích chỉ số</h3>
            <div className="legend-grid">
              <div className="legend-item">
                <div className="legend-marker hc"></div>
                <span>HC - Chu vi đầu</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker ac"></div>
                <span>AC - Chu vi bụng</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker fl"></div>
                <span>FL - Chiều dài xương đùi</span>
              </div>
              <div className="legend-item">
                <div className="legend-marker efw"></div>
                <span>EFW - Ước tính cân nặng</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="children-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2>Danh sách theo dõi</h2>
          <div className="children-grid">
            {childrenHistory.map((child, index) => (
              <motion.div
                key={child.id}
                className="child-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="card-header">
                  <h3>{child.name}</h3>
                  <button className="edit-button" onClick={() => handleEditClick(child)}>
                    <Edit2 size={16} />
                  </button>
                </div>

                <div className="card-content">
                  <div className="info-grid">
                    <div className="info-item">
                      <Baby size={16} />
                      <span>{child.gender === "male" ? "Nam" : "Nữ"}</span>
                    </div>
                    <div className="info-item">
                      <Activity size={16} />
                      <span>Tuần {child.pregnancyWeek}</span>
                    </div>
                    <div className="info-item">
                      <Calendar size={16} />
                      <span>
                        {child.dueDate.toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {child.pregnancyWeek < 12 ? (
                    <div className="warning-message">
                      <AlertCircle size={16} />
                      <span>Thai nhi chưa đủ tuần tuổi để đo chỉ số</span>
                    </div>
                  ) : (
                    <>
                      <div className="stats-grid">
                        <div className="stat-item">
                          <Ruler className="stat-icon" />
                          <div className="stat-content">
                            <span className="stat-label">HC</span>
                            <span className="stat-value">{child.stats.HC}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <Heart className="stat-icon" />
                          <div className="stat-content">
                            <span className="stat-label">AC</span>
                            <span className="stat-value">{child.stats.AC}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <Scale className="stat-icon" />
                          <div className="stat-content">
                            <span className="stat-label">FL</span>
                            <span className="stat-value">{child.stats.FL}</span>
                          </div>
                        </div>
                        <div className="stat-item">
                          <Activity className="stat-icon" />
                          <div className="stat-content">
                            <span className="stat-label">EFW</span>
                            <span className="stat-value">{child.stats.EFW}</span>
                          </div>
                        </div>
                      </div>

                      <button className="update-stats-button" onClick={() => handleStatsClick(child)}>
                        <Ruler size={16} />
                        <span>Cập nhật chỉ số</span>
                        <ChevronRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isEditPopupOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="close-button" onClick={() => setIsEditPopupOpen(false)}>
                <X size={24} />
              </button>
              <h2>Chỉnh sửa thông tin</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Tên thai nhi</label>
                  <input
                    type="text"
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="pregnancyWeek">Tuần thai</label>
                  <input
                    type="number"
                    id="pregnancyWeek"
                    value={editForm.pregnancyWeek}
                    onChange={(e) => setEditForm({ ...editForm, pregnancyWeek: Number(e.target.value) })}
                    min="0"
                    max="42"
                    required
                  />
                </div>
                <button type="submit" className="submit-button">
                  Lưu thay đổi
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isUpdateStatsOpen && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="close-button" onClick={() => setIsUpdateStatsOpen(false)}>
                <X size={24} />
              </button>
              <h2>Cập nhật chỉ số</h2>
              {selectedChild && (
                <div className="selected-child-info">
                  <h3>{selectedChild.name}</h3>
                  <p>Tuần thai: {selectedChild.pregnancyWeek}</p>
                </div>
              )}
              <form onSubmit={handleStatsSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="HC">HC - Chu vi đầu (mm)</label>
                    <input
                      type="number"
                      id="HC"
                      value={statsForm.HC}
                      onChange={(e) => setStatsForm({ ...statsForm, HC: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="AC">AC - Chu vi bụng (mm)</label>
                    <input
                      type="number"
                      id="AC"
                      value={statsForm.AC}
                      onChange={(e) => setStatsForm({ ...statsForm, AC: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="FL">FL - Chiều dài xương đùi (mm)</label>
                    <input
                      type="number"
                      id="FL"
                      value={statsForm.FL}
                      onChange={(e) => setStatsForm({ ...statsForm, FL: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="EFW">EFW - Ước tính cân nặng (g)</label>
                    <input
                      type="number"
                      id="EFW"
                      value={statsForm.EFW}
                      onChange={(e) => setStatsForm({ ...statsForm, EFW: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="submit-button">
                  Lưu chỉ số
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BasicTracking

