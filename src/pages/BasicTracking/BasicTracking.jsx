import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Baby, Calendar, AlertCircle, Heart, Activity, Scale, Ruler } from "lucide-react"
import foetusService from "../../api/services/foetusService"
import growthStatsService from "../../api/services/growthStatsService"
import "./BasicTracking.scss"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const BasicTracking = () => {
  const [childrenHistory, setChildrenHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tempStats, setTempStats] = useState({})

  // Fetch danh sách thai nhi
  const fetchFoetusList = async () => {
    try {
      setLoading(true);
      const data = await foetusService.getFoetusList();
      setChildrenHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoetusList();
  }, []);

  // Xử lý cập nhật chỉ số
  const handleStatsUpdate = async (foetusId) => {
    try {
      const statsData = tempStats[foetusId] || {};
      const currentChild = childrenHistory.find(child => child.foetusId === foetusId);
      
      console.log('Updating stats with data:', {
        foetusId,
        age: Number(statsData.age || currentChild.age || 0),
        hc: Number(statsData.hc || currentChild.hc || 0),
        ac: Number(statsData.ac || currentChild.ac || 0),
        fl: Number(statsData.fl || currentChild.fl || 0),
        efw: Number(statsData.efw || currentChild.efw || 0)
      });

      await growthStatsService.updateGrowthStats(foetusId, {
        age: Number(statsData.age || currentChild.age || 0),
        hc: Number(statsData.hc || currentChild.hc || 0),
        ac: Number(statsData.ac || currentChild.ac || 0),
        fl: Number(statsData.fl || currentChild.fl || 0),
        efw: Number(statsData.efw || currentChild.efw || 0)
      });
      
      await fetchFoetusList(); // Refresh data
      setTempStats(prev => ({...prev, [foetusId]: {}}));
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.message);
    }
  };

  // Hàm xử lý thay đổi giá trị input
  const handleInputChange = (foetusId, field, value) => {
    setTempStats(prev => ({
      ...prev,
      [foetusId]: {
        ...(prev[foetusId] || {}),
        [field]: value
      }
    }));
  };

  const chartData = {
    labels: ["HC (mm)", "AC (mm)", "FL (mm)", "EFW (g)"],
    datasets: childrenHistory.map((child, index) => ({
      label: child.name,
      data: [child.hc || 0, child.ac || 0, child.fl || 0, child.efw || 0],
      backgroundColor: index % 2 === 0 ? "rgba(255, 107, 129, 0.5)" : "rgba(112, 161, 255, 0.5)",
      borderColor: index % 2 === 0 ? "rgb(255, 107, 129)" : "rgb(112, 161, 255)",
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
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  if (loading) return <div className="loading">Đang tải...</div>;

  return (
    <div className="pregnancy-monitor">
      {error && <div className="error-message">{error}</div>}
      
      <motion.div className="monitor-header">
        <h1>Theo dõi thai kỳ</h1>
        <p>Theo dõi sự phát triển của thai nhi</p>
      </motion.div>

      <div className="monitor-content">
        <div className="chart-section">
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} height={300} />
          </div>
        </div>

        <div className="children-grid">
          {childrenHistory.map((child) => (
            <motion.div key={child.foetusId} className="child-card">
              <div className="card-header">
                <h3>{child.name}</h3>
              </div>

              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <Baby size={16} />
                    <span>
                      {child.gender === "MALE" ? "Nam" : 
                       child.gender === "FEMALE" ? "Nữ" : 
                       child.gender === "OTHER" ? "Khác" : 
                       "Chưa xác định"}
                    </span>
                  </div>
                  <div className="info-item">
                    <Activity size={16} />
                    <div className="age-input-container">
                      <span>Tuần</span>
                      <input
                        type="number"
                        value={(tempStats[child.foetusId]?.age !== undefined ? 
                               tempStats[child.foetusId].age : 
                               child.age) || ""}
                        onChange={(e) => handleInputChange(child.foetusId, 'age', e.target.value)}
                        min="0"
                        max="42"
                      />
                    </div>
                  </div>
                </div>

                {child.age < 12 ? (
                  <div className="warning-message">
                    <AlertCircle size={16} />
                    <span>Thai nhi chưa đủ tuần tuổi để đo chỉ số</span>
                  </div>
                ) : (
                  <>
                    <div className="stats-grid">
                      {[
                        { key: 'hc', label: 'HC', icon: Ruler },
                        { key: 'ac', label: 'AC', icon: Heart },
                        { key: 'fl', label: 'FL', icon: Scale },
                        { key: 'efw', label: 'EFW', icon: Activity }
                      ].map(({ key, label, icon: Icon }) => (
                        <div key={key} className="stat-item">
                          <Icon className="stat-icon" size={16} />
                          <div className="stat-content">
                            <span className="stat-label">{label}</span>
                            <input
                              type="number"
                              value={(tempStats[child.foetusId]?.[key] !== undefined ? 
                                     tempStats[child.foetusId][key] : 
                                     child[key]) || ""}
                              onChange={(e) => handleInputChange(child.foetusId, key, e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="update-stats-button"
                      onClick={() => handleStatsUpdate(child.foetusId)}
                    >
                      <Ruler size={16} />
                      <span>Cập nhật chỉ số</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BasicTracking

