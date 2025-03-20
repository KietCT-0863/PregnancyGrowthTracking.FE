"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Line } from "react-chartjs-2"
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
  Calendar,
  AlertCircle,
  Heart,
  Activity,
  Scale,
  Ruler,
  Clock,
  FileText,
  Info,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Bell,
  Sparkles,
} from "lucide-react"
import foetusService from "../../api/services/foetusService"
import growthStatsService from "../../api/services/growthStatsService"
import "./BasicTracking.scss"
import { toast } from "react-toastify"
import { Table } from "antd"
import GrowthAlert from "./components/GrowthAlert/GrowthAlert"
import WeeksFilter from "./WeeksFilter/WeeksFilter"
import ChildrenList from "./components/ChildrenList/ChildrenList"
import ChildInfoCard from "./components/ChildInfoCard/ChildInfoCard"
import AlertSection from "./components/AlertSection/AlertSection"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

// Constants
const STATS_FIELDS = [
  { key: "hc", label: "HC", icon: Ruler },
  { key: "ac", label: "AC", icon: Heart },
  { key: "fl", label: "FL", icon: Scale },
  { key: "efw", label: "EFW", icon: Activity },
]

const HISTORY_COLUMNS = [
  {
    title: "Tuần thai",
    dataIndex: "age",
    key: "age",
    width: 100,
    render: (value) => `Tuần ${value || "?"}`,
  },
  {
    title: "Ngày đo",
    dataIndex: "date",
    key: "date",
    width: 120,
    render: (date) => new Date(date).toLocaleDateString("vi-VN"),
  },
  {
    title: "HC (mm)",
    dataIndex: "hc",
    key: "hc",
    width: 100,
    render: (hc) => (hc ? hc.value || "Chưa có" : "Chưa có"),
  },
  {
    title: "AC (mm)",
    dataIndex: "ac",
    key: "ac",
    width: 100,
    render: (ac) => (ac ? ac.value || "Chưa có" : "Chưa có"),
  },
  {
    title: "FL (mm)",
    dataIndex: "fl",
    key: "fl",
    width: 100,
    render: (fl) => (fl ? fl.value || "Chưa có" : "Chưa có"),
  },
  {
    title: "EFW (g)",
    dataIndex: "efw",
    key: "efw",
    width: 100,
    render: (efw) => (efw ? efw.value || "Chưa có" : "Chưa có"),
  },
  {
    title: "Trạng thái",
    key: "status",
    width: 200,
    render: (_, record) => (
      <div className="status-indicators">
        {record.hc && (
          <span className={`status-badge ${record.hc.isAlert ? "warning" : "safe"}`}>
            {record.hc.isAlert ? (
              <>
                <AlertTriangle size={14} />
                <span>HC: Cần chú ý</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>HC: An toàn</span>
              </>
            )}
          </span>
        )}
        {record.ac && (
          <span className={`status-badge ${record.ac.isAlert ? "warning" : "safe"}`}>
            {record.ac.isAlert ? (
              <>
                <AlertTriangle size={14} />
                <span>AC: Cần chú ý</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>AC: An toàn</span>
              </>
            )}
          </span>
        )}
        {record.fl && (
          <span className={`status-badge ${record.fl.isAlert ? "warning" : "safe"}`}>
            {record.fl.isAlert ? (
              <>
                <AlertTriangle size={14} />
                <span>FL: Cần chú ý</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>FL: An toàn</span>
              </>
            )}
          </span>
        )}
        {record.efw && (
          <span className={`status-badge ${record.efw.isAlert ? "warning" : "safe"}`}>
            {record.efw.isAlert ? (
              <>
                <AlertTriangle size={14} />
                <span>EFW: Cần chú ý</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>EFW: An toàn</span>
              </>
            )}
          </span>
        )}
      </div>
    ),
  },
]

// Tách riêng cấu hình chart options - cập nhật để phù hợp với biểu đồ đường
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 12,
          family: "'Quicksand', sans-serif",
        },
        filter: (item) => item.datasetIndex < 4,
        padding: 15,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    title: {
      display: true,
      text: "Biểu đồ tăng trưởng thai nhi (4 tuần gần nhất)",
      font: {
        size: 18,
        family: "'Quicksand', sans-serif",
        weight: "bold",
      },
      padding: {
        top: 10,
        bottom: 20,
      },
      color: "#ff6b81",
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          // Lấy dữ liệu gốc nếu có
          const originalValue = context.dataset.originalData?.[context.dataIndex];
          if (originalValue !== undefined) {
            return `${label}: ${originalValue}`;
          }
          return `${label}: ${context.raw}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Chỉ số (mm/g) - Đã chuẩn hóa",
        font: {
          family: "'Quicksand', sans-serif",
        },
      },
      grid: {
        color: "rgba(255, 107, 129, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Quicksand', sans-serif",
        },
      },
    },
  },
  animation: {
    duration: 2000,
    easing: "easeOutQuart",
  },
}

const BasicTracking = () => {
  // State management
  const [childrenHistory, setChildrenHistory] = useState([])
  const [growthData, setGrowthData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tempStats, setTempStats] = useState({})
  const [showCompareModal, setShowCompareModal] = useState(false)
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
      const foetusData = await foetusService.getFoetusList()
      const growthResults = await fetchGrowthData(foetusData)
      updateState(foetusData, growthResults)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchGrowthData = async (foetusData) => {
    const growthPromises = foetusData.map((foetus) =>
      growthStatsService
        .getGrowthData(foetus.foetusId)
        .then((data) => ({ [foetus.foetusId]: data }))
        .catch(() => ({ [foetus.foetusId]: [] })),
    )
    return Object.assign({}, ...(await Promise.all(growthPromises)))
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
      const result = await updateStats(foetusId, statsData)

      if (result.success) {
        setAlertData(result)
        setShowGrowthAlert(true)
        handleUpdateSuccess(result)
      }
    } catch (err) {
      handleUpdateError(err)
    }
  }

  const validateStats = (statsData) => {
    const age = Number(statsData.age || 0)
    
    if (!age || age < 12 || age > 40) {
      throw new Error("Tuần tuổi thai nhi không hợp lệ (12-40 tuần)")
    }
  }

  const updateStats = async (foetusId, statsData) => {
    const currentChild = childrenHistory.find((child) => child.foetusId === foetusId)

    const updateData = {
      age: Number(statsData.age || currentChild?.age || 0),
      hc: Number(statsData.hc) || null,
      ac: Number(statsData.ac) || null,
      fl: Number(statsData.fl) || null,
      efw: Number(statsData.efw) || null,
    }

    return await growthStatsService.updateGrowthStats(foetusId, updateData)
  }

  const handleUpdateSuccess = async (result) => {
    try {
      // Lấy dữ liệu từ kết quả API một cách linh hoạt hơn
      const responseData = result.data || result

      // Lấy ID - kiểm tra nhiều trường ID có thể có
      const measurementId =
        responseData.id || responseData.measurementId || responseData.growthId || responseData._id || "Đã cập nhật"

      // Lấy tuần thai - kiểm tra nhiều trường có thể có
      const gestationalAge =
        responseData.age ||
        responseData.gestationalAge ||
        responseData.weekAge ||
        responseData.ageInWeeks ||
        tempStats[selectedChild?.foetusId]?.age ||
        "Đã cập nhật"

      // Xử lý date - kiểm tra nhiều trường ngày có thể có
      let measurementDate = "Ngày hôm nay"
      const dateValue =
        responseData.date ||
        responseData.measurementDate ||
        responseData.createdAt ||
        responseData.updateDate ||
        responseData.updatedAt ||
        new Date()

      // Đảm bảo dateValue là string hoặc Date object
      if (dateValue) {
        try {
          measurementDate = new Date(dateValue).toLocaleDateString("vi-VN")
        } catch (e) {
          // Bỏ qua lỗi xử lý ngày
        }
      }

      // Hiển thị thông báo thành công với dữ liệu đã trích xuất
    toast.success(
      <div>
        <h4>Cập nhật thành công!</h4>
          <p>ID: {measurementId}</p>
          <p>Tuần thai: {gestationalAge}</p>
          <p>Ngày đo: {measurementDate}</p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
        }
      )
    } catch (error) {
      toast.success("Cập nhật thành công!")
    }

    await fetchData()
    setTempStats({})
  }

  const handleUpdateError = (err) => {
    toast.error(
      <div>
        <h4>Lỗi cập nhật!</h4>
        <p>Mã lỗi: {err.status || "N/A"}</p>
        <p>Chi tiết: {err.error || err.message || "Có lỗi xảy ra khi cập nhật chỉ số"}</p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
      }
    )
  }

  const handleInputChange = (foetusId, field, value) => {
    // Kiểm tra giá trị tuần thai nếu đang cập nhật trường age
    if (field === 'age') {
      const numValue = Number(value);
      if (numValue && (numValue < 12 || numValue > 40)) {
        toast.warning(
          <div>
            <h4>Cảnh báo tuần thai</h4>
            <p>Tuần thai hợp lệ phải từ 12 đến 40 tuần</p>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
          }
        );
      }
    }
    
    setTempStats((prev) => ({
      ...prev,
      [foetusId]: {
        ...(prev[foetusId] || {}),
        [field]: value,
      },
    }))
  }

  // Hàm tạo dữ liệu biểu đồ - cập nhật để dùng biểu đồ đường thay vì cột
  const getChartData = (selectedChild, growthData) => {
    if (!selectedChild || !growthData[selectedChild.foetusId]) {
      return {
        labels: [],
        datasets: [],
      }
    }

    const foetusData = growthData[selectedChild.foetusId]
    if (!Array.isArray(foetusData) || foetusData.length === 0) {
      return {
        labels: [],
        datasets: [],
      }
    }

    // Sắp xếp dữ liệu theo tuần mới nhất trước
    const sortedData = [...foetusData].sort((a, b) => {
      // Sắp xếp theo tuổi thai (age) giảm dần
      if (a.age !== b.age) return b.age - a.age;
      // Nếu cùng tuần, sắp xếp theo ngày đo
      return new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate);
    });

    // Lọc ra các tuần khác nhau (chỉ lấy bản ghi mới nhất cho mỗi tuần)
    const uniqueWeeks = [];
    const processedWeeks = new Set();
    
    sortedData.forEach(data => {
      if (!processedWeeks.has(data.age)) {
        uniqueWeeks.push(data);
        processedWeeks.add(data.age);
      }
    });
    
    // Lấy số tuần dựa theo filter được chọn
    let recentWeeks;
    if (weeksToShow === "Tất cả") {
      recentWeeks = [...uniqueWeeks].sort((a, b) => a.age - b.age);
    } else {
      recentWeeks = uniqueWeeks.slice(0, Number(weeksToShow)).sort((a, b) => a.age - b.age);
    }
    
    // Hàm xử lý giá trị bất thường (outliers)
    const normalizeValue = (value, maxThreshold = 1000) => {
      if (!value) return 0;
      // Nếu giá trị vượt quá ngưỡng, trả về giá trị có ý nghĩa hơn
      return value > maxThreshold ? maxThreshold : value;
    };

    // Tạo dữ liệu chuẩn hóa cho biểu đồ
    const hcData = recentWeeks.map(data => normalizeValue(data.hc?.value, 500));
    const acData = recentWeeks.map(data => normalizeValue(data.ac?.value, 500));
    const flData = recentWeeks.map(data => normalizeValue(data.fl?.value, 200));
    const efwData = recentWeeks.map(data => normalizeValue(data.efw?.value, 5000));

    // Lưu dữ liệu gốc để hiển thị trong tooltip
    const originalData = {
      hc: recentWeeks.map(data => data.hc?.value || 0),
      ac: recentWeeks.map(data => data.ac?.value || 0),
      fl: recentWeeks.map(data => data.fl?.value || 0),
      efw: recentWeeks.map(data => data.efw?.value || 0),
    };

    // Cập nhật title trong chartOptions để phản ánh số tuần hiển thị
    chartOptions.plugins.title.text = weeksToShow === "Tất cả" 
      ? "Biểu đồ tăng trưởng thai nhi (tất cả các tuần)" 
      : `Biểu đồ tăng trưởng thai nhi (${weeksToShow} tuần gần nhất)`;

    return {
      labels: recentWeeks.map((data) => `Tuần ${data.age}`),
      datasets: [
        {
          label: "HC (mm)",
          data: hcData,
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          originalData: originalData.hc,
        },
        {
          label: "AC (mm)",
          data: acData,
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          originalData: originalData.ac,
        },
        {
          label: "FL (mm)",
          data: flData,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          originalData: originalData.fl,
        },
        {
          label: "EFW (g)",
          data: efwData,
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: false,
          originalData: originalData.efw,
        },
      ],
    }
  }

  const handleChildSelect = (child) => {
    setSelectedChild(child === selectedChild ? null : child) // Toggle selection
  }

  // Thêm hàm để lấy khoảng chuẩn từ API
  const fetchStandardRanges = async (age) => {
    if (!age || standardRanges[age]) return;
    
    try {
      setLoadingRanges(true);
      
      // Gọi hàm lấy khoảng chuẩn, không cần try-catch ở đây
      // vì đã xử lý lỗi bên trong growthStatsService
      const rangeData = await growthStatsService.getGrowthRanges(age);
      
      // Kiểm tra xem dữ liệu trả về có đúng định dạng không
 
      
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
        // Lấy dữ liệu mới nhất
        const latestData = [...currentData].sort((a, b) => b.age - a.age)[0]
        if (latestData && latestData.age) {
          fetchStandardRanges(latestData.age)
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

  // Thêm các hàm phân tích cảnh báo trực tiếp trong file
  const generateCurrentAlerts = (currentData) => {
    const alerts = [];

    // Kiểm tra HC
    if (currentData.hc) {
      if (currentData.hc.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo HC",
          description: `Chu vi đầu (HC) hiện tại là ${currentData.hc.value}mm, nằm ngoài khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
          icon: <AlertTriangle />
        });
      } else {
        alerts.push({
          type: "success",
          title: "HC trong mức bình thường",
          description: `Chu vi đầu (HC) đang phát triển tốt trong khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
          icon: <CheckCircle />
        });
      }
    }

    // Kiểm tra AC
    if (currentData.ac) {
      if (currentData.ac.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo AC",
          description: `Chu vi bụng (AC) hiện tại là ${currentData.ac.value}mm, nằm ngoài khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
          icon: <AlertTriangle />
        });
      } else {
        alerts.push({
          type: "success",
          title: "AC trong mức bình thường",
          description: `Chu vi bụng (AC) đang phát triển tốt trong khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
          icon: <CheckCircle />
        });
      }
    }

    // Kiểm tra FL
    if (currentData.fl) {
      if (currentData.fl.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo FL",
          description: `Chiều dài xương đùi (FL) hiện tại là ${currentData.fl.value}mm, nằm ngoài khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
          icon: <AlertTriangle />
        });
      } else {
        alerts.push({
          type: "success",
          title: "FL trong mức bình thường",
          description: `Chiều dài xương đùi (FL) đang phát triển tốt trong khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
          icon: <CheckCircle />
        });
      }
    }

    // Kiểm tra EFW
    if (currentData.efw) {
      if (currentData.efw.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo cân nặng",
          description: `Cân nặng ước tính (EFW) hiện tại là ${currentData.efw.value}g, nằm ngoài khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
          icon: <AlertTriangle />
        });
      } else {
        alerts.push({
          type: "success",
          title: "Cân nặng trong mức bình thường",
          description: `Cân nặng ước tính (EFW) đang phát triển tốt trong khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
          icon: <CheckCircle />
        });
      }
    }

    return alerts;
  };

  const analyzeGrowthTrend = (foetusData) => {
    if (!foetusData || !Array.isArray(foetusData) || foetusData.length < 2) {
      return [];
    }

    const sortedData = [...foetusData].sort((a, b) => a.age - b.age);
    const trendAlerts = [];
    const lastTwoMeasurements = sortedData.slice(-2);

    analyzeMetric(lastTwoMeasurements, 'hc', 5, trendAlerts);
    analyzeMetric(lastTwoMeasurements, 'ac', 7, trendAlerts);
    analyzeMetric(lastTwoMeasurements, 'fl', 2, trendAlerts);
    analyzeEFW(lastTwoMeasurements, trendAlerts);

    return trendAlerts;
  };

  const analyzeMetric = (measurements, metric, expectedRate, alerts) => {
    if (measurements[0][metric]?.value && measurements[1][metric]?.value) {
      const growth = measurements[1][metric].value - measurements[0][metric].value;
      const weeksDiff = measurements[1].age - measurements[0].age;
      const growthRate = weeksDiff > 0 ? growth / weeksDiff : growth;
      
      const isLatestSafe = !measurements[1][metric].isAlert;
      const metricLabels = {
        hc: 'HC',
        ac: 'AC',
        fl: 'FL'
      };
      
      if (!isLatestSafe) {
        alerts.push({
          type: "danger",
          title: `Cảnh báo ${metricLabels[metric]}`,
          description: `${metricLabels[metric]} hiện tại (${measurements[1][metric].value}mm) nằm ngoài khoảng an toàn (${measurements[1][metric].minRange}-${measurements[1][metric].maxRange}mm).`,
          icon: <AlertTriangle />
        });
      } else if (growthRate < expectedRate) {
        alerts.push({
          type: "warning",
          title: `Tăng trưởng ${metricLabels[metric]} chậm`,
          description: `${metricLabels[metric]} tăng ${growthRate.toFixed(1)}mm/tuần, thấp hơn mức kỳ vọng.`,
          icon: <AlertCircle />
        });
      } else {
        alerts.push({
          type: "success",
          title: `Tăng trưởng ${metricLabels[metric]} bình thường`,
          description: `${metricLabels[metric]} tăng ${growthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
          icon: <CheckCircle />
        });
      }
    }
  };

  const analyzeEFW = (measurements, alerts) => {
    if (measurements[0].efw?.value && measurements[1].efw?.value) {
      const growth = measurements[1].efw.value - measurements[0].efw.value;
      const weeksDiff = measurements[1].age - measurements[0].age;
      const growthRate = weeksDiff > 0 ? growth / weeksDiff : growth;
      
      const isLatestSafe = !measurements[1].efw.isAlert;
      
      if (!isLatestSafe) {
        alerts.push({
          type: "danger",
          title: "Cảnh báo cân nặng",
          description: `Cân nặng hiện tại (${measurements[1].efw.value}g) nằm ngoài khoảng an toàn (${measurements[1].efw.minRange}-${measurements[1].efw.maxRange}g).`,
          icon: <AlertTriangle />
        });
      } else {
        const currentAge = measurements[1].age;
        const expectedGrowthRate = currentAge < 20 ? 25 : currentAge < 30 ? 85 : 200;
        
        if (growthRate < expectedGrowthRate * 0.7) {
          alerts.push({
            type: "warning",
            title: "Tăng cân chậm",
            description: `Cân nặng tăng ${growthRate.toFixed(0)}g/tuần, thấp hơn mức kỳ vọng (${expectedGrowthRate}g/tuần) ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          alerts.push({
            type: "success",
            title: "Tăng cân bình thường",
            description: `Cân nặng tăng ${growthRate.toFixed(0)}g/tuần, phù hợp với mức chuẩn ở tuần ${currentAge}.`,
            icon: <CheckCircle />
          });
        }
      }
    }
  };

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
      {/* Background waves */}
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
        {/* Chuyển ChildrenList lên trên cùng */}
        <ChildrenList 
          children={childrenHistory} 
          selectedChild={selectedChild} 
          onChildSelect={handleChildSelect} 
        />

        {/* Chart Section - Now below the children list */}
        <motion.div
          className="chart-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {selectedChild && (
            <div className="chart-controls">
              <WeeksFilter weeksToShow={weeksToShow} onWeeksChange={setWeeksToShow} />
            </div>
          )}
          
          <div className="chart-container">
            {selectedChild ? (
              <Line data={getChartData(selectedChild, growthData)} options={chartOptions} height={300} />
            ) : (
              <div className="chart-placeholder">
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
                  <BarChart2 size={60} />
                  <p>Chọn một thai nhi để xem biểu đồ tăng trưởng</p>
                </motion.div>
              </div>
            )}
          </div>

          <div className="chart-info">
            <motion.p
              className="chart-note"
              animate={{
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              {selectedChild
                ? `* Biểu đồ hiển thị sự tăng trưởng của ${selectedChild.name} theo tuần`
                : "* Chọn một thai nhi để xem biểu đồ tăng trưởng"}
            </motion.p>
          </div>

          {/* Phần hiển thị cảnh báo */}
          <AlertSection
            alertHistory={[]}
            alertsOpen={alertsOpen}
            setAlertsOpen={setAlertsOpen}
            alerts={alerts}
            selectedChild={selectedChild}
                  />
                </motion.div>

        {/* Input Section - with the ChildrenList removed */}
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

      <GrowthAlert isOpen={showGrowthAlert} onClose={() => setShowGrowthAlert(false)} alertData={alertData} />
      </div>
                      </div>
  )
}

export default BasicTracking

