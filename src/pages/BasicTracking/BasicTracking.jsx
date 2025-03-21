"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import {
  Baby,
  BarChart2,
  Sparkles,
} from "lucide-react"
import "./BasicTracking.scss"
import { toast } from "react-toastify"
import GrowthAlert from "./components/GrowthAlert/GrowthAlert"
import GrowthChart from './components/GrowthChart/GrowthChart'
import ChildrenList from './components/ChildrenList/ChildrenList'
import ChildInfoCard from './components/ChildInfoCard/ChildInfoCard'
import AlertSection from './components/AlertSection/AlertSection'
import { generateCurrentAlerts, analyzeGrowthTrend } from './utils/alertAnalyzer'
import { 
  validateStats, 
  formatUpdateData, 
  handleUpdateSuccess, 
  handleUpdateError,
  handleInputValidation 
} from './utils/statsHandler'
import { 
  fetchFoetusData, 
  fetchGrowthData, 
  fetchStandardRanges, 
  updateGrowthStats 
} from './utils/apiHandler'
import WeeklyStatsChart from './components/WeeklyStatsChart/WeeklyStatsChart'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

// Constants
const STATS_FIELDS = [
  { key: "hc", label: "HC" },
  { key: "ac", label: "AC" },
  { key: "fl", label: "FL" },
  { key: "efw", label: "EFW" },
]

const BasicTracking = () => {
  // State management
  const [childrenHistory, setChildrenHistory] = useState([])
  const [growthData, setGrowthData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tempStats, setTempStats] = useState({})
  const [selectedChild, setSelectedChild] = useState(null)
  const [showGrowthAlert, setShowGrowthAlert] = useState(false)
  const [alertData, setAlertData] = useState(null)
  const [alertsOpen, setAlertsOpen] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [standardRanges, setStandardRanges] = useState({})
  const [loadingRanges, setLoadingRanges] = useState(false)
  const [weeksToShow, setWeeksToShow] = useState(4)

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true)
      const foetusData = await fetchFoetusData()
      const growthResults = await fetchGrowthData(foetusData)
      updateState(foetusData, growthResults)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateState = (foetusData, growthResults) => {
    setChildrenHistory(foetusData)
    setGrowthData(growthResults)
    setError(null)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Event handlers
  const handleStatsUpdate = async (foetusId) => {
    try {
      const statsData = tempStats[foetusId] || {}
      validateStats(statsData)
      const updateData = formatUpdateData(statsData, childrenHistory.find(child => child.foetusId === foetusId))
      const result = await updateGrowthStats(foetusId, updateData)

      if (result.success) {
        setAlertData(result)
        setShowGrowthAlert(true)
        handleUpdateSuccess(result, selectedChild, tempStats)
        await fetchData()
        setTempStats({})
      }
    } catch (err) {
      handleUpdateError(err)
    }
  }

  const handleInputChange = (foetusId, field, value) => {
    // Thêm console.log để debug
    console.log(`BasicTracking - handleInputChange for ${foetusId}, field: ${field}, value: ${value}`);
    
    // Đảm bảo giá trị không null hoặc undefined
    const processedValue = value === '' ? '' : value;
    
    // Validate giá trị
    handleInputValidation(field, processedValue);
    
    // Cập nhật tempStats một cách an toàn
    setTempStats((prev) => {
      const foetusStats = prev[foetusId] || {};
      
      // Log cho debug
      console.log('Previous stats:', foetusStats);
      console.log('New state:', { ...foetusStats, [field]: processedValue });
      
      return {
      ...prev,
      [foetusId]: {
          ...foetusStats,
          [field]: processedValue,
        },
      };
    });
  }

  const handleChildSelect = (child) => {
    setSelectedChild(child === selectedChild ? null : child) // Toggle selection
  }

  // Thêm hàm để lấy khoảng chuẩn từ API
  const handleFetchStandardRanges = async (age) => {
    if (!age || standardRanges[age]) return;
    
    try {
      setLoadingRanges(true);
      const rangeData = await fetchStandardRanges(age);
      setStandardRanges((prev) => ({
        ...prev,
        [age]: rangeData,
      }));
    } finally {
      setLoadingRanges(false);
    }
  };

  // Cập nhật useEffect để lấy khoảng chuẩn khi chọn thai nhi
  useEffect(() => {
    if (selectedChild && growthData[selectedChild.foetusId]) {
      const currentData = growthData[selectedChild.foetusId]
      if (Array.isArray(currentData) && currentData.length > 0) {
        const latestData = [...currentData].sort((a, b) => b.age - a.age)[0]
        if (latestData && latestData.age) {
          handleFetchStandardRanges(latestData.age)
        }
      }
    }
  }, [selectedChild, growthData])

  // Cập nhật useEffect để sử dụng các hàm mới
  useEffect(() => {
    if (selectedChild && growthData[selectedChild.foetusId]) {
      const foetusData = growthData[selectedChild.foetusId]
      if (!Array.isArray(foetusData) || foetusData.length === 0) {
        setAlerts([])
        return
      }
      
      // Lấy dữ liệu mới nhất
      const currentData = [...foetusData].sort((a, b) => b.age - a.age)[0]

      // Tạo cảnh báo từ dữ liệu hiện tại
      const currentAlerts = generateCurrentAlerts(currentData)
      
      // Thêm phân tích xu hướng tăng trưởng từ lịch sử
      if (foetusData.length >= 2) {
        const trendAlerts = analyzeGrowthTrend(foetusData)
        
        // Thêm tiêu đề phần xu hướng nếu có dữ liệu
        if (trendAlerts.length > 0) {
          currentAlerts.push({
            type: "info",
            title: "Phân tích xu hướng tăng trưởng",
            description: "Dựa trên dữ liệu lịch sử các lần đo gần nhất.",
            icon: <BarChart2 />,
          })
          
          // Thêm các cảnh báo xu hướng
          currentAlerts.push(...trendAlerts)
        }
      }
      
      // Cập nhật state alerts
      setAlerts(currentAlerts)
    } else {
      setAlerts([])
    }
  }, [selectedChild, growthData])

  // Render component
  if (loading)
    return (
      <div className="loading-spinner">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Sparkles size={40} />
        </motion.div>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Đang tải dữ liệu...
        </motion.span>
      </div>
    )

  return (
    <div className="pregnancy-monitor">
      <div className="background-waves">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      <motion.div
        className="monitor-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Theo dõi bé yêu</h1>
        <p>Theo dõi sự phát triển của bé yêu qua từng giai đoạn</p>
      </motion.div>

      <div className="monitor-content">
        <ChildrenList 
          children={childrenHistory} 
          selectedChild={selectedChild} 
          onChildSelect={handleChildSelect} 
        />

        <div className="dashboard-layout">
          {/* Cột trái chứa biểu đồ tăng trưởng chính và form nhập liệu (đã đổi vị trí) */}
          <div className="main-charts-column">
            {/* Biểu đồ tăng trưởng chính */}
            <div className="growth-chart-container">
              <GrowthChart 
                selectedChild={selectedChild}
                growthData={growthData}
                weeksToShow={weeksToShow}
                onWeeksChange={setWeeksToShow}
              />
            </div>

            {/* Form nhập thông tin (đã chuyển từ cột phải sang) */}
        <div className="input-section">
          {selectedChild ? (
            <motion.div
              className="child-input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              layout
            >
                  <ChildInfoCard
                    selectedChild={selectedChild}
                    growthData={growthData}
                    tempStats={tempStats}
                    handleInputChange={handleInputChange}
                    handleStatsUpdate={handleStatsUpdate}
                  />
              </motion.div>
          ) : (
            <motion.div
              className="select-child-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Baby size={60} />
                <p>Vui lòng chọn một thai nhi để bắt đầu theo dõi</p>
        </motion.div>
            </motion.div>
            )}
          </div>
        </div>

          {/* Cột phải chứa biểu đồ chỉ số và cảnh báo */}
          <div className="form-alerts-column">
            {/* Biểu đồ chỉ số (đã chuyển từ cột trái sang) */}
            {selectedChild && (
              <div className="weekly-stats-container">
                <WeeklyStatsChart 
                  age={tempStats[selectedChild.foetusId]?.age || 
                    (growthData[selectedChild.foetusId]?.length > 0 ? 
                    growthData[selectedChild.foetusId][0].age : selectedChild.age)}
                  childStats={{
                    hc: tempStats[selectedChild.foetusId]?.hc || 
                      (growthData[selectedChild.foetusId]?.length > 0 ? 
                      growthData[selectedChild.foetusId][0].hc?.value : null),
                    ac: tempStats[selectedChild.foetusId]?.ac || 
                      (growthData[selectedChild.foetusId]?.length > 0 ? 
                      growthData[selectedChild.foetusId][0].ac?.value : null),
                    fl: tempStats[selectedChild.foetusId]?.fl || 
                      (growthData[selectedChild.foetusId]?.length > 0 ? 
                      growthData[selectedChild.foetusId][0].fl?.value : null),
                    efw: tempStats[selectedChild.foetusId]?.efw || 
                      (growthData[selectedChild.foetusId]?.length > 0 ? 
                      growthData[selectedChild.foetusId][0].efw?.value : null),
                  }}
                  onError={(msg) => toast.error(msg)}
                />
                </div>
            )}
            
            {/* Phần cảnh báo */}
            <div className="alert-section-container">
              <AlertSection
                alertHistory={[]}
                alertsOpen={alertsOpen}
                setAlertsOpen={setAlertsOpen}
                alerts={alerts}
                selectedChild={selectedChild}
              />
                </div>
          </div>
        </div>

      <GrowthAlert isOpen={showGrowthAlert} onClose={() => setShowGrowthAlert(false)} alertData={alertData} />
      </div>
                      </div>
  )
}

export default BasicTracking

