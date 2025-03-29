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
  handleUpdateError
} from './utils/statsHandler'
import { 
  fetchFoetusData, 
  fetchGrowthData, 
  fetchStandardRanges, 
  updateGrowthStats 
} from './utils/apiHandler'
import WeeklyStatsChart from './components/WeeklyStatsChart/WeeklyStatsChart'
import { FaCalendarAlt, FaHistory, FaSave } from 'react-icons/fa'
import { playNotificationSound, playDeleteSound } from "../../utils/soundUtils"
import { CloseOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { Modal } from 'antd'
import { taoGopYBaiViet } from './utils/blogSuggestionUtils'
import BlogSuggestion from './components/BlogSuggestion/BlogSuggestion'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

// Constants
const STATS_FIELDS = [
  { key: "hc", label: "HC" },
  { key: "ac", label: "AC" },
  { key: "fl", label: "FL" },
  { key: "efw", label: "EFW" },
]

function BasicTracking() {
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
  const [lastUpdateDate, setLastUpdateDate] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  
  // Thêm state cho modal xác nhận cập nhật tuần thai đã có dữ liệu
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingUpdate, setPendingUpdate] = useState(null)
  
  // Trong function BasicTracking, thêm state:
  const [blogSuggestions, setBlogSuggestions] = useState(null)
  const [showBlogSuggestions, setShowBlogSuggestions] = useState(false)
  
  // Theo dõi thay đổi của weeksToShow cho debug
  useEffect(() => {
    console.log("BasicTracking: weeksToShow đã thay đổi:", weeksToShow);
  }, [weeksToShow]);

  // Thêm hàm handleUpdate
  const handleUpdate = async () => {
    if (!selectedChild) {
      toast.warning("Vui lòng chọn một thai nhi để cập nhật");
      return;
    }

    try {
      await handleStatsUpdate(selectedChild.foetusId);
      playNotificationSound('trackingSuccess');
      toast.success("Cập nhật thành công!");
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

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
    
    // Tìm ngày đo gần nhất từ dữ liệu thay vì dùng ngày hiện tại
    let latestDate = null;
    
    // Lặp qua tất cả dữ liệu tăng trưởng để tìm ngày gần nhất
    Object.values(growthResults).forEach(childGrowthData => {
      if (Array.isArray(childGrowthData) && childGrowthData.length > 0) {
        // Sắp xếp các dữ liệu theo ngày giảm dần và lấy mục đầu tiên
        const sortedData = [...childGrowthData].sort((a, b) => {
          const dateA = a.date || a.measurementDate || a.createdAt || a.updatedAt;
          const dateB = b.date || b.measurementDate || b.createdAt || b.updatedAt;
          return new Date(dateB) - new Date(dateA);
        });
        
        const firstDate = sortedData[0]?.date || 
                          sortedData[0]?.measurementDate || 
                          sortedData[0]?.createdAt || 
                          sortedData[0]?.updatedAt;
                          
        if (firstDate) {
          const currentDate = new Date(firstDate);
          if (!latestDate || currentDate > latestDate) {
            latestDate = currentDate;
          }
        }
      }
    });
    
    // Nếu tìm thấy ngày gần nhất thì hiển thị, nếu không thì dùng ngày hiện tại
    if (latestDate) {
      setLastUpdateDate(latestDate.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } else {
      setLastUpdateDate(new Date().toLocaleString('vi-VN'));
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Event handlers
  const handleStatsUpdate = async (foetusId) => {
    try {
      const statsData = tempStats[foetusId] || {}
      
      // Kiểm tra dữ liệu và sử dụng kết quả trả về
      const isValid = validateStats(statsData)
      if (!isValid) {
        return; // Dừng quá trình cập nhật nếu dữ liệu không hợp lệ
      }
      
      // Thêm thuộc tính measurementDate vào dữ liệu cập nhật
      const updateData = formatUpdateData(statsData, childrenHistory.find(child => child.foetusId === foetusId))
      
      const result = await updateGrowthStats(foetusId, updateData)

      if (result.success) {
        setAlertData(result)
        setShowGrowthAlert(true)
        handleUpdateSuccess(result, selectedChild, tempStats)
        await fetchData()
        setTempStats({})
        playNotificationSound('trackingSuccess');
        
        // Thêm đoạn này để tạo gợi ý bài viết
        try {
          const tuanThai = parseInt(updateData.age);
          if (!isNaN(tuanThai)) {
            const chiSoList = {
              HC: updateData.hc !== undefined ? parseFloat(updateData.hc) : null,
              AC: updateData.ac !== undefined ? parseFloat(updateData.ac) : null,
              FL: updateData.fl !== undefined ? parseFloat(updateData.fl) : null,
              EFW: updateData.efw !== undefined ? parseFloat(updateData.efw) : null
            };
            
            const suggestions = await taoGopYBaiViet(tuanThai, chiSoList);
            setBlogSuggestions(suggestions);
            setShowBlogSuggestions(true);
          }
        } catch (err) {
          console.error("Lỗi khi tạo gợi ý bài viết:", err);
        }
      }
    } catch (err) {
      handleUpdateError(err)
    }
  }

  // Kiểm tra xem tuần thai đã có dữ liệu chưa
  const checkWeekHasData = (foetusId, age) => {
    if (!foetusId || !age || !growthData[foetusId]) return false;
    
    // Kiểm tra nếu có dữ liệu cho tuần thai này
    return growthData[foetusId].some(record => record.age === parseInt(age));
  };

  // Xử lý khi người dùng xác nhận cập nhật tuần thai đã có dữ liệu
  const handleConfirmUpdate = () => {
    if (!pendingUpdate) return;
    
    const { foetusId, field, value } = pendingUpdate;
    
    // Cập nhật dữ liệu
    setTempStats((prev) => {
      const foetusStats = prev[foetusId] || {};
      return {
        ...prev,
        [foetusId]: {
          ...foetusStats,
          [field]: value,
        },
      };
    });
    
    // Đóng modal và xóa dữ liệu chờ
    setShowConfirmModal(false);
    setPendingUpdate(null);
    
    // Thông báo cho người dùng
    toast.info("Dữ liệu sẽ được thay đổi. Lưu ý: Bạn cần  nhập chỉ số mới và nhấn  'Cập nhật chỉ số' để lưu thay đổi.", {
      autoClose: 5000
    });
  };

  // Xử lý khi người dùng hủy cập nhật
  const handleCancelUpdate = () => {
    // Đóng modal và xóa dữ liệu chờ
    setShowConfirmModal(false);
    setPendingUpdate(null);
  };

  const handleInputChange = (foetusId, field, value) => {
    console.log(`BasicTracking - handleInputChange for ${foetusId}, field: ${field}, value: ${value}`);
    
    const processedValue = value === '' ? '' : value;
    
    // Nếu là trường tuần thai (age) và có giá trị hợp lệ, kiểm tra xem tuần đã có dữ liệu chưa
    if (field === 'age' && processedValue !== '' && parseInt(processedValue) > 0) {
      if (checkWeekHasData(foetusId, processedValue)) {
        // Lưu thông tin cập nhật vào state và hiển thị modal xác nhận
        setPendingUpdate({ foetusId, field, value: processedValue });
        setShowConfirmModal(true);
        return;
      }
    }
    
    // Nếu không phải tuần thai hoặc tuần thai chưa có dữ liệu, cập nhật bình thường
    setTempStats((prev) => {
      const foetusStats = prev[foetusId] || {};
      
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
    <div className="basic-tracking-container">
      <div className="background-waves">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
        <div className="wave wave4"></div>
      </div>
      
      {/* Nội dung hiện tại */}
      <div className="pregnancy-monitor">
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
          <button 
            className="guide-button"
            onClick={() => setShowGuide(true)}
            title="Xem hướng dẫn"
          >
            <span>Hướng dẫn sử dụng</span>
          </button>
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
        </div>

        <div className="update-info">
          <div className="update-date">
            <span className="icon">
              <FaCalendarAlt />
            </span>
            <span>Cập nhật lần cuối: {lastUpdateDate}</span>
          </div>
          
          <div className="action-buttons">
            <button className="view-history" onClick={() => setShowHistory(true)}>
              <span className="icon">
                <FaHistory />
              </span>
              <span>Xem lịch sử</span>
            </button>

            <button className="update-button-main" onClick={handleUpdate}>
              <span className="icon">
                <FaSave />
              </span>
              <span>Cập nhật</span>
            </button>
          </div>
        </div>

        <GrowthAlert isOpen={showGrowthAlert} onClose={() => setShowGrowthAlert(false)} alertData={alertData} />
      </div>

      <button 
        className="floating-update-button"
        onClick={handleUpdate}
        title="Cập nhật số đo"
      >
        <FaSave />
      </button>

      {/* Modal Xác nhận cập nhật tuần thai đã có dữ liệu */}
      <Modal
        title={
          <div className="confirm-modal-title">
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
            <span>Tuần thai đã có dữ liệu</span>
          </div>
        }
        open={showConfirmModal}
        onOk={handleConfirmUpdate}
        onCancel={handleCancelUpdate}
        okText="Tiếp tục cập nhật"
        cancelText="Hủy"
        className="confirm-update-modal"
      >
        <p>Tuần thai này đã có dữ liệu trong hệ thống. Nếu bạn tiếp tục, dữ liệu mới sẽ ghi đè lên dữ liệu hiện có.</p>
        <p>Bạn có chắc chắn muốn tiếp tục không?</p>
      </Modal>

      {/* Modal Hướng dẫn sử dụng */}
      {showGuide && (
        <div className="guide-modal-overlay" onClick={(e) => {
          if (e.target.className === 'guide-modal-overlay') setShowGuide(false);
        }}>
          <div className="guide-modal">
            <div className="guide-modal-header">
              <h2>Hướng dẫn sử dụng</h2>
              <button className="close-button" onClick={() => setShowGuide(false)}>
                <CloseOutlined />
              </button>
            </div>
            <div className="guide-modal-content">
              <div className="user-guide">
                <div className="guide-header">
                  <h2>Hướng dẫn sử dụng tính năng theo dõi thai kỳ</h2>
                  <div className="disclaimer">
                    <strong>Lưu ý quan trọng:</strong> Ứng dụng này được thiết kế để giúp bạn theo dõi và lưu trữ thông tin sau khi đi khám thai tại cơ sở y tế. Các thông tin và chỉ số hiển thị chỉ mang tính chất tham khảo, không thay thế cho việc tư vấn và thăm khám của bác sĩ chuyên khoa.
                  </div>
                </div>
                
                <div className="guide-section">
                  <h3>Nhập và theo dõi các chỉ số thai nhi</h3>
                  <p>Bạn có thể nhập các chỉ số sau khi đi khám thai, bao gồm:</p>
                  <ul>
                    <li><strong>HC (Chu vi đầu):</strong> Đo bằng cm, giúp đánh giá sự phát triển não bộ của thai nhi.</li>
                    <li><strong>AC (Chu vi bụng):</strong> Đo bằng cm, giúp đánh giá sự phát triển nội tạng và lượng mỡ dưới da.</li>
                    <li><strong>FL (Chiều dài xương đùi):</strong> Đo bằng cm, giúp đánh giá chiều cao và sự phát triển xương.</li>
                    <li><strong>EFW (Cân nặng ước tính):</strong> Tính bằng gram, là ước tính cân nặng hiện tại của thai nhi.</li>
                  </ul>
                  <p>Các chỉ số này giúp bạn theo dõi sự phát triển của thai nhi qua từng tuần tuổi thai.</p>
                </div>
                
                <div className="guide-section">
                  <h3>Biểu đồ chỉ số chuẩn (WeeklyStatsChart)</h3>
                  <p>Biểu đồ này hiển thị các giá trị tham khảo về HC, AC, FL và EFW theo từng tuần tuổi thai. Đây chỉ là các số liệu tham khảo, giúp bạn có cái nhìn tổng quan về khoảng giá trị hợp lý khi nhập các chỉ số.</p>
                  <p>Các đường biểu đồ thể hiện khoảng phát triển bình thường của thai nhi theo tuần tuổi dựa trên dữ liệu tham khảo.</p>
                </div>
                
                <div className="guide-section">
                  <h3>Hệ thống cảnh báo (AlertSection)</h3>
                  <p>Phần này sẽ hiển thị các cảnh báo khi các chỉ số bạn nhập vào nằm ngoài khoảng tham khảo bình thường. Lưu ý:</p>
                  <ul>
                    <li>Cảnh báo chỉ mang tính chất tham khảo, giúp bạn nhận biết các chỉ số có thể cần được bác sĩ kiểm tra kỹ hơn.</li>
                    <li>Một số cảnh báo có thể xuất hiện do sự khác biệt tự nhiên trong quá trình phát triển của mỗi thai nhi.</li>
                    <li>Luôn tham khảo ý kiến bác sĩ nếu bạn thấy bất kỳ cảnh báo nào.</li>
                  </ul>
                </div>
                
                <div className="guide-section">
                  <h3>Biểu đồ tăng trưởng (GrowthChart)</h3>
                  <p>Biểu đồ này hiển thị các chỉ số HC, AC, FL và EFW của thai nhi bạn qua từng tuần tuổi thai dựa trên dữ liệu bạn đã nhập sau mỗi lần khám thai.</p>
                  <p>Bạn có thể:</p>
                  <ul>
                    <li>Theo dõi sự phát triển của thai nhi qua thời gian.</li>
                    <li>So sánh với các đường tham chiếu để có cái nhìn tổng quan về sự phát triển.</li>
                    <li>Xem lại lịch sử các chỉ số đã nhập trước đó.</li>
                  </ul>
                </div>
                
                <div className="guide-footer">
                  <p><strong>Quan trọng:</strong> Ứng dụng này là công cụ hỗ trợ theo dõi thai kỳ, không phải công cụ chẩn đoán y khoa. Mọi lo ngại về sức khỏe của bạn và thai nhi cần được tham vấn trực tiếp với bác sĩ chuyên khoa.</p>
                </div>
              </div>
            </div>
            <div className="guide-modal-footer">
              <button className="guide-close-btn" onClick={() => setShowGuide(false)}>
                Tôi đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gợi ý bài đọc */}
      <BlogSuggestion 
        isOpen={showBlogSuggestions}
        onClose={() => setShowBlogSuggestions(false)}
        suggestions={blogSuggestions}
      />
    </div>
  )
}

export default BasicTracking

