"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bar } from "react-chartjs-2"
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

// Tách riêng cấu hình chart options
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
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Chỉ số (mm/g)",
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
  const [selectedWeekHistory, setSelectedWeekHistory] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [showGrowthAlert, setShowGrowthAlert] = useState(false)
  const [alertData, setAlertData] = useState(null)
  const [alertsOpen, setAlertsOpen] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [standardRanges, setStandardRanges] = useState({})
  const [loadingRanges, setLoadingRanges] = useState(false)
  const [alertHistory, setAlertHistory] = useState([])
  const [showAlertHistory, setShowAlertHistory] = useState(false)

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
        .catch((err) => {
          console.error(`Error fetching growth data for foetus ${foetus.foetusId}:`, err)
          return { [foetus.foetusId]: [] }
        }),
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

      // Log thông tin cập nhật
      console.group("Updating Growth Stats")
      console.log("Foetus ID:", foetusId)
      console.log("Stats Data:", statsData)

      validateStats(statsData)
      const result = await updateStats(foetusId, statsData)

      // Log kết quả
      console.log("Update Result:", result)
      console.groupEnd()

      if (result.success) {
        // Truyền toàn bộ result làm alertData
        setAlertData(result)
        setShowGrowthAlert(true)
        handleUpdateSuccess(result)
      }
    } catch (err) {
      handleUpdateError(err)
    }
  }

  const validateStats = (statsData) => {
    console.group("Validating Stats")

    const age = Number(statsData.age || 0)
    console.log("Age:", age)

    if (!age || age < 0 || age > 42) {
      console.error("Invalid age:", age)
      console.groupEnd()
      throw new Error("Tuần tuổi thai nhi không hợp lệ (0-42 tuần)")
    }

    console.log("Validation passed")
    console.groupEnd()
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

    // Log dữ liệu trước khi gửi
    console.group("Sending Update Request")
    console.log("Update Data:", updateData)

    const response = await growthStatsService.updateGrowthStats(foetusId, updateData)

    console.log("Response:", response)
    console.groupEnd()

    return response
  }

  const handleUpdateSuccess = async (result) => {
    console.group("Update Success")
    console.log("Success Data:", result)

    try {
      // Lấy dữ liệu từ kết quả API một cách linh hoạt hơn
      const responseData = result.data || result

      // In chi tiết cấu trúc dữ liệu nhận được để debug
      console.log("Cấu trúc dữ liệu:", JSON.stringify(responseData, null, 2))

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
          console.error("Lỗi chuyển đổi ngày:", e)
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
        },
      )
    } catch (error) {
      console.error("Lỗi xử lý dữ liệu thành công:", error)
      toast.success("Cập nhật thành công!")
    }

    await fetchData()
    setTempStats({})
    console.groupEnd()
  }

  const handleUpdateError = (err) => {
    // Log chi tiết lỗi
    console.group("Update Error")
    console.error("Error Details:", err)

    // Hiển thị thông báo lỗi với chi tiết
    toast.error(
      <div>
        <h4>Lỗi cập nhật!</h4>
        <p>Mã lỗi: {err.status || "N/A"}</p>
        <p>Chi tiết: {err.error || err.message || "Có lỗi xảy ra khi cập nhật chỉ số"}</p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
      },
    )

    console.groupEnd()
  }

  const handleViewHistory = (foetusId) => {
    const foetusData = growthData[foetusId]
    if (foetusData && Array.isArray(foetusData)) {
      const sortedData = sortHistoryData(foetusData)
      if (sortedData.length > 0) {
        setSelectedWeekHistory(sortedData)
        setShowHistory(true)
      } else {
        toast.info("Không có dữ liệu lịch sử")
      }
    }
  }

  const sortHistoryData = (data) => {
    return [...data].sort((a, b) => {
      if (a.age !== b.age) return b.age - a.age
      return new Date(b.measurementDate || b.date) - new Date(a.measurementDate || a.date)
    })
  }

  const handleInputChange = (foetusId, field, value) => {
    setTempStats((prev) => ({
      ...prev,
      [foetusId]: {
        ...(prev[foetusId] || {}),
        [field]: value,
      },
    }))
  }

  // Hàm tạo dữ liệu biểu đồ
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

    // Lấy 4 tuần gần nhất và sắp xếp theo tuần tăng dần
    const recentWeeks = [...foetusData]
      .sort((a, b) => b.age - a.age)
      .slice(0, 4)
      .sort((a, b) => a.age - b.age)

    return {
      labels: recentWeeks.map((data) => `Tuần ${data.age}`),
      datasets: [
        {
          type: "bar",
          label: "HC (mm)",
          data: recentWeeks.map((data) => data.hc?.value || 0),
          backgroundColor: "rgba(255, 99, 132, 0.7)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(255, 99, 132, 0.9)",
        },
        {
          type: "bar",
          label: "AC (mm)",
          data: recentWeeks.map((data) => data.ac?.value || 0),
          backgroundColor: "rgba(54, 162, 235, 0.7)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(54, 162, 235, 0.9)",
        },
        {
          type: "bar",
          label: "FL (mm)",
          data: recentWeeks.map((data) => data.fl?.value || 0),
          backgroundColor: "rgba(75, 192, 192, 0.7)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(75, 192, 192, 0.9)",
        },
        {
          type: "bar",
          label: "EFW (g)",
          data: recentWeeks.map((data) => data.efw?.value || 0),
          backgroundColor: "rgba(153, 102, 255, 0.7)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(153, 102, 255, 0.9)",
        },
      ],
    }
  }

  const handleChildSelect = (child) => {
    setSelectedChild(child === selectedChild ? null : child) // Toggle selection
  }

  // Thêm hàm để lấy khoảng chuẩn từ API
  const fetchStandardRanges = async (age) => {
    if (!age || standardRanges[age]) return

    try {
      setLoadingRanges(true)

      let rangeData
      try {
        rangeData = await growthStatsService.getGrowthRanges(age)
      } catch (err) {
        console.error(`Lỗi khi lấy khoảng chuẩn cho tuần ${age}:`, err)

        // Tạo dữ liệu mặc định khi API lỗi
        rangeData = {
          hc: { minRange: 100, maxRange: 300 },
          ac: { minRange: 100, maxRange: 300 },
          fl: { minRange: 10, maxRange: 60 },
          efw: { minRange: 100, maxRange: 3000 },
        }
      }

      setStandardRanges((prev) => ({
        ...prev,
        [age]: rangeData,
      }))
    } finally {
      setLoadingRanges(false)
    }
  }

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

  // Hàm tạo cảnh báo từ dữ liệu
  const generateCurrentAlerts = (currentData) => {
    const alerts = []

    // Kiểm tra HC
    if (currentData.hc) {
      if (currentData.hc.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo HC",
          description: `Chu vi đầu (HC) hiện tại là ${currentData.hc.value}mm, nằm ngoài khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
          icon: <AlertTriangle />,
        })
      } else {
        alerts.push({
          type: "success",
          title: "HC trong mức bình thường",
          description: `Chu vi đầu (HC) đang phát triển tốt trong khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
          icon: <CheckCircle />,
        })
      }
    }

    // Kiểm tra AC
    if (currentData.ac) {
      if (currentData.ac.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo AC",
          description: `Chu vi bụng (AC) hiện tại là ${currentData.ac.value}mm, nằm ngoài khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
          icon: <AlertTriangle />,
        })
      } else {
        alerts.push({
          type: "success",
          title: "AC trong mức bình thường",
          description: `Chu vi bụng (AC) đang phát triển tốt trong khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
          icon: <CheckCircle />,
        })
      }
    }

    // Kiểm tra FL
    if (currentData.fl) {
      if (currentData.fl.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo FL",
          description: `Chiều dài xương đùi (FL) hiện tại là ${currentData.fl.value}mm, nằm ngoài khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
          icon: <AlertTriangle />,
        })
      } else {
        alerts.push({
          type: "success",
          title: "FL trong mức bình thường",
          description: `Chiều dài xương đùi (FL) đang phát triển tốt trong khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
          icon: <CheckCircle />,
        })
      }
    }

    // Kiểm tra EFW
    if (currentData.efw) {
      if (currentData.efw.isAlert) {
        alerts.push({
          type: "warning",
          title: "Cảnh báo cân nặng",
          description: `Cân nặng ước tính (EFW) hiện tại là ${currentData.efw.value}g, nằm ngoài khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
          icon: <AlertTriangle />,
        })
      } else {
        alerts.push({
          type: "success",
          title: "Cân nặng trong mức bình thường",
          description: `Cân nặng ước tính (EFW) đang phát triển tốt trong khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
          icon: <CheckCircle />,
        })
      }
    }

    return alerts
  }

  // Phân tích xu hướng tăng trưởng
  const analyzeGrowthTrend = (foetusId) => {
    const foetusData = growthData[foetusId]
    if (!foetusData || !Array.isArray(foetusData) || foetusData.length < 2) {
      return []
    }

    // Sắp xếp dữ liệu theo tuần tăng dần
    const sortedData = [...foetusData].sort((a, b) => a.age - b.age)
    const trendAlerts = []

    // Phân tích xu hướng HC
    if (sortedData.length >= 2) {
      const lastTwoMeasurements = sortedData.slice(-2)

      // Phân tích HC
      if (lastTwoMeasurements[0].hc?.value && lastTwoMeasurements[1].hc?.value) {
        const hcGrowth = lastTwoMeasurements[1].hc.value - lastTwoMeasurements[0].hc.value
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age
        const hcGrowthRate = weeksDiff > 0 ? hcGrowth / weeksDiff : hcGrowth

        // Kiểm tra trạng thái cảnh báo
        const isLatestHCSafe = !lastTwoMeasurements[1].hc.isAlert

        if (!isLatestHCSafe) {
          trendAlerts.push({
            type: "danger",
            title: "Cảnh báo HC",
            description: `HC hiện tại (${lastTwoMeasurements[1].hc.value}mm) nằm ngoài khoảng an toàn (${lastTwoMeasurements[1].hc.minRange}-${lastTwoMeasurements[1].hc.maxRange}mm).`,
            icon: <AlertTriangle />,
          })
        } else if (hcGrowthRate < 5) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng trưởng HC chậm",
            description: `HC tăng ${hcGrowthRate.toFixed(1)}mm/tuần, thấp hơn mức kỳ vọng.`,
            icon: <AlertCircle />,
          })
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng trưởng HC bình thường",
            description: `HC tăng ${hcGrowthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
            icon: <CheckCircle />,
          })
        }
      }

      // Phân tích AC
      if (lastTwoMeasurements[0].ac?.value && lastTwoMeasurements[1].ac?.value) {
        const acGrowth = lastTwoMeasurements[1].ac.value - lastTwoMeasurements[0].ac.value
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age
        const acGrowthRate = weeksDiff > 0 ? acGrowth / weeksDiff : acGrowth

        // Kiểm tra trạng thái cảnh báo
        const isLatestACSafe = !lastTwoMeasurements[1].ac.isAlert

        if (!isLatestACSafe) {
          trendAlerts.push({
            type: "danger",
            title: "Cảnh báo AC",
            description: `AC hiện tại (${lastTwoMeasurements[1].ac.value}mm) nằm ngoài khoảng an toàn (${lastTwoMeasurements[1].ac.minRange}-${lastTwoMeasurements[1].ac.maxRange}mm).`,
            icon: <AlertTriangle />,
          })
        } else if (acGrowthRate < 7) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng trưởng AC chậm",
            description: `AC tăng ${acGrowthRate.toFixed(1)}mm/tuần, thấp hơn mức kỳ vọng.`,
            icon: <AlertCircle />,
          })
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng trưởng AC bình thường",
            description: `AC tăng ${acGrowthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
            icon: <CheckCircle />,
          })
        }
      }

      // Phân tích FL
      if (lastTwoMeasurements[0].fl?.value && lastTwoMeasurements[1].fl?.value) {
        const flGrowth = lastTwoMeasurements[1].fl.value - lastTwoMeasurements[0].fl.value
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age
        const flGrowthRate = weeksDiff > 0 ? flGrowth / weeksDiff : flGrowth

        // Kiểm tra trạng thái cảnh báo
        const isLatestFLSafe = !lastTwoMeasurements[1].fl.isAlert

        if (!isLatestFLSafe) {
          trendAlerts.push({
            type: "danger",
            title: "Cảnh báo FL",
            description: `FL hiện tại (${lastTwoMeasurements[1].fl.value}mm) nằm ngoài khoảng an toàn (${lastTwoMeasurements[1].fl.minRange}-${lastTwoMeasurements[1].fl.maxRange}mm).`,
            icon: <AlertTriangle />,
          })
        } else if (flGrowthRate < 2) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng trưởng FL chậm",
            description: `FL tăng ${flGrowthRate.toFixed(1)}mm/tuần, thấp hơn mức kỳ vọng.`,
            icon: <AlertCircle />,
          })
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng trưởng FL bình thường",
            description: `FL tăng ${flGrowthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
            icon: <CheckCircle />,
          })
        }
      }

      // Phân tích EFW (cân nặng ước tính)
      if (lastTwoMeasurements[0].efw?.value && lastTwoMeasurements[1].efw?.value) {
        const efwGrowth = lastTwoMeasurements[1].efw.value - lastTwoMeasurements[0].efw.value
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age
        const efwGrowthRate = weeksDiff > 0 ? efwGrowth / weeksDiff : efwGrowth

        // Kiểm tra trạng thái cảnh báo
        const isLatestEFWSafe = !lastTwoMeasurements[1].efw.isAlert

        if (!isLatestEFWSafe) {
          trendAlerts.push({
            type: "danger",
            title: "Cảnh báo cân nặng",
            description: `Cân nặng hiện tại (${lastTwoMeasurements[1].efw.value}g) nằm ngoài khoảng an toàn (${lastTwoMeasurements[1].efw.minRange}-${lastTwoMeasurements[1].efw.maxRange}g).`,
            icon: <AlertTriangle />,
          })
        } else {
          const currentAge = lastTwoMeasurements[1].age
          let expectedGrowthRate

          if (currentAge < 20) {
            expectedGrowthRate = 25 // g/tuần
          } else if (currentAge < 30) {
            expectedGrowthRate = 85 // g/tuần
          } else {
            expectedGrowthRate = 200 // g/tuần
          }

          if (efwGrowthRate < expectedGrowthRate * 0.7) {
            trendAlerts.push({
              type: "warning",
              title: "Tăng cân chậm",
              description: `Cân nặng tăng ${efwGrowthRate.toFixed(0)}g/tuần, thấp hơn mức kỳ vọng (${expectedGrowthRate}g/tuần) ở tuần ${currentAge}.`,
              icon: <AlertCircle />,
            })
          } else {
            trendAlerts.push({
              type: "success",
              title: "Tăng cân bình thường",
              description: `Cân nặng tăng ${efwGrowthRate.toFixed(0)}g/tuần, phù hợp với mức chuẩn ở tuần ${currentAge}.`,
              icon: <CheckCircle />,
            })
          }
        }
      }
    }

    return trendAlerts
  }

  // Cập nhật useEffect để tạo cảnh báo dựa trên dữ liệu mới
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
        const trendAlerts = analyzeGrowthTrend(selectedChild.foetusId)

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

  // Thêm hàm để lấy lịch sử cảnh báo
  const fetchAlertHistory = async (foetusId) => {
    try {
      const response = await growthStatsService.getGrowthData(foetusId)
      if (Array.isArray(response)) {
        const alerts = response
          .map((data) => {
            const alerts = []
            if (data.hc?.isAlert) {
              alerts.push({
                type: "warning",
                measure: "HC",
                value: data.hc.value,
                range: `${data.hc.minRange}-${data.hc.maxRange}`,
                date: data.date,
              })
            }
            if (data.ac?.isAlert) {
              alerts.push({
                type: "warning",
                measure: "AC",
                value: data.ac.value,
                range: `${data.ac.minRange}-${data.ac.maxRange}`,
                date: data.date,
              })
            }
            if (data.fl?.isAlert) {
              alerts.push({
                type: "warning",
                measure: "FL",
                value: data.fl.value,
                range: `${data.fl.minRange}-${data.fl.maxRange}`,
                date: data.date,
              })
            }
            if (data.efw?.isAlert) {
              alerts.push({
                type: "warning",
                measure: "EFW",
                value: data.efw.value,
                range: `${data.efw.minRange}-${data.efw.maxRange}`,
                date: data.date,
              })
            }
            return {
              date: data.date,
              age: data.age,
              alerts,
            }
          })
          .filter((item) => item.alerts.length > 0)

        setAlertHistory(alerts)
      }
    } catch (error) {
      console.error("Error fetching alert history:", error)
      toast.error("Không thể lấy lịch sử cảnh báo")
    }
  }

  // Cập nhật useEffect khi chọn thai nhi
  useEffect(() => {
    if (selectedChild) {
      fetchAlertHistory(selectedChild.foetusId)
    }
  }, [selectedChild])

  // Component AlertHistoryModal
  const AlertHistoryModal = ({ isOpen, onClose, history }) => {
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
                <h3>Lịch sử cảnh báo</h3>
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
                        <span>{new Date(item.date).toLocaleDateString("vi-VN")}</span>
                        <span className="alert-history-week">Tuần {item.age}</span>
                      </div>
                      <div className="alert-history-alerts">
                        {item.alerts.map((alert, alertIndex) => (
                          <div key={alertIndex} className="alert-detail">
                            <AlertTriangle size={14} className="warning-icon" />
                            <span>
                              {alert.measure}: {alert.value} {alert.measure === "EFW" ? "g" : "mm"} (Khoảng an toàn:{" "}
                              {alert.range} {alert.measure === "EFW" ? "g" : "mm"})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-alerts-history">
                    <Info size={24} />
                    <p>Không có lịch sử cảnh báo</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

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
        {/* Chart Section - Now at the top */}
        <motion.div
          className="chart-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="chart-container">
            {selectedChild ? (
              <Bar data={getChartData(selectedChild, growthData)} options={chartOptions} height={300} />
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
          <div className="chart-alerts">
            <div className="alert-header">
              <h4>
                <motion.div
                  animate={{
                    scale: alertHistory.length > 0 ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: alertHistory.length > 0 ? Number.POSITIVE_INFINITY : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Bell
                    size={16}
                    className={alertHistory.length > 0 ? "has-alerts" : ""}
                    onClick={() => setShowAlertHistory(true)}
                  />
                </motion.div>
                <span>Cảnh báo & Thông báo</span>
              </h4>
              <motion.button
                className="alert-toggle"
                onClick={() => setAlertsOpen(!alertsOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {alertsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </motion.button>
            </div>

            <AnimatePresence>
              {alertsOpen && (
                <motion.div
                  className="alert-content open"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {selectedChild ? (
                    alerts.length > 0 ? (
                      alerts.map((alert, index) => (
                        <motion.div
                          key={index}
                          className={`alert-item ${alert.type}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 5 }}
                        >
                          <motion.div
                            className="alert-icon"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                              delay: index * 0.2,
                            }}
                          >
                            {alert.icon}
                          </motion.div>
                          <div className="alert-text">
                            <h5 className="alert-title">{alert.title}</h5>
                            <p className="alert-description">{alert.description}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div className="no-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <CheckCircle size={24} />
                        </motion.div>
                        <p>Không có cảnh báo nào cho thai nhi này</p>
                      </motion.div>
                    )
                  ) : (
                    <motion.div className="no-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0, -10, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Info size={24} />
                      </motion.div>
                      <p>Vui lòng chọn một thai nhi để xem cảnh báo</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Input Section - Now below the chart */}
        <div className="input-section">
          <motion.div
            className="children-list"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {childrenHistory.map((child, index) => (
              <motion.div
                key={child.foetusId}
                className={`child-name-tag ${selectedChild?.foetusId === child.foetusId ? "active" : ""}`}
                onClick={() => handleChildSelect(child)}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {child.name}
                {selectedChild?.foetusId === child.foetusId && (
                  <motion.div
                    className="active-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    layoutId="activeIndicator"
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {selectedChild ? (
            <motion.div
              className="child-input-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              layout
            >
              <div className="child-card">
                <div className="card-header">
                  <motion.h3
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {selectedChild.name}
                  </motion.h3>
                </div>

                <div className="card-content">
                  <motion.div
                    className="basic-info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="info-title">
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0, -10, 0],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <Info size={16} className="info-icon" />
                      </motion.div>
                      <span>Thông tin cơ bản</span>
                    </div>

                    <div className="info-grid">
                      <motion.div
                        className="info-item"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                      >
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <Baby size={16} className="gender-icon" />
                        </motion.div>
                        <span>
                          {selectedChild.gender === "Nam"
                            ? "Nam"
                            : selectedChild.gender === "Nữ"
                              ? "Nữ"
                              : selectedChild.gender === "Khác"
                                ? "Khác"
                                : "Chưa xác định"}
                        </span>
                      </motion.div>

                      <motion.div
                        className="info-item"
                        whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        >
                          <Activity size={16} className="age-icon" />
                        </motion.div>
                        <div className="age-input-container">
                          <span>Tuần</span>
                          <input
                            type="number"
                            value={
                              tempStats[selectedChild.foetusId]?.age !== undefined
                                ? tempStats[selectedChild.foetusId].age
                                : growthData[selectedChild.foetusId]?.length > 0
                                  ? growthData[selectedChild.foetusId][0].age || selectedChild.age || ""
                                  : selectedChild.age || ""
                            }
                            onChange={(e) => handleInputChange(selectedChild.foetusId, "age", e.target.value)}
                            min="0"
                            max="42"
                            className="week-input"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {selectedChild.age < 12 ? (
                    <motion.div
                      className="warning-message"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.7 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      >
                        <AlertCircle size={16} />
                      </motion.div>
                      <span>Thai nhi chưa đủ tuần tuổi để đo chỉ số</span>
                    </motion.div>
                  ) : (
                    <>
                      <motion.div
                        className="stats-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="stats-title">
                          <motion.div
                            animate={{
                              rotate: [0, 10, 0, -10, 0],
                            }}
                            transition={{
                              duration: 5,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            <BarChart2 size={16} className="stats-icon" />
                          </motion.div>
                          <span>Chỉ số phát triển</span>
                        </div>

                        <div className="stats-grid">
                          <motion.div
                            className="stat-item"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                          >
                            <div className="stat-header">
                              <motion.div
                                animate={{
                                  rotate: [0, 10, 0, -10, 0],
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <Ruler size={16} className="hc-icon" />
                              </motion.div>
                              <span className="stat-label">HC</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[selectedChild.foetusId]?.hc !== undefined
                                    ? tempStats[selectedChild.foetusId].hc
                                    : growthData[selectedChild.foetusId]?.length > 0
                                      ? growthData[selectedChild.foetusId][0].hc?.value || ""
                                      : ""
                                }
                                onChange={(e) => handleInputChange(selectedChild.foetusId, "hc", e.target.value)}
                                min="0"
                                placeholder="Nhập HC"
                                className="stat-input-field"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="stat-item"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                          >
                            <div className="stat-header">
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <Heart size={16} className="ac-icon" />
                              </motion.div>
                              <span className="stat-label">AC</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[selectedChild.foetusId]?.ac !== undefined
                                    ? tempStats[selectedChild.foetusId].ac
                                    : growthData[selectedChild.foetusId]?.length > 0
                                      ? growthData[selectedChild.foetusId][0].ac?.value || ""
                                      : ""
                                }
                                onChange={(e) => handleInputChange(selectedChild.foetusId, "ac", e.target.value)}
                                min="0"
                                placeholder="Nhập AC"
                                className="stat-input-field"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="stat-item"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                          >
                            <div className="stat-header">
                              <motion.div
                                animate={{
                                  y: [0, -5, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <Scale size={16} className="fl-icon" />
                              </motion.div>
                              <span className="stat-label">FL</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[selectedChild.foetusId]?.fl !== undefined
                                    ? tempStats[selectedChild.foetusId].fl
                                    : growthData[selectedChild.foetusId]?.length > 0
                                      ? growthData[selectedChild.foetusId][0].fl?.value || ""
                                      : ""
                                }
                                onChange={(e) => handleInputChange(selectedChild.foetusId, "fl", e.target.value)}
                                min="0"
                                placeholder="Nhập FL"
                                className="stat-input-field"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="stat-item"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.1 }}
                          >
                            <div className="stat-header">
                              <motion.div
                                animate={{
                                  rotate: [0, 10, 0, -10, 0],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <Activity size={16} className="efw-icon" />
                              </motion.div>
                              <span className="stat-label">EFW</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[selectedChild.foetusId]?.efw !== undefined
                                    ? tempStats[selectedChild.foetusId].efw
                                    : growthData[selectedChild.foetusId]?.length > 0
                                      ? growthData[selectedChild.foetusId][0].efw?.value || ""
                                      : ""
                                }
                                onChange={(e) => handleInputChange(selectedChild.foetusId, "efw", e.target.value)}
                                min="0"
                                placeholder="Nhập EFW"
                                className="stat-input-field"
                              />
                              <span className="stat-unit">g</span>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>

                      <motion.div
                        className="actions-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        {growthData[selectedChild.foetusId]?.length > 0 && (
                          <motion.div
                            className="history-section"
                            whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                          >
                            <div className="last-updated">
                              <motion.div
                                animate={{
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 20,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "linear",
                                }}
                              >
                                <Clock size={14} className="clock-icon" />
                              </motion.div>
                              <span>
                                Cập nhật lần cuối:{" "}
                                {new Date(
                                  growthData[selectedChild.foetusId][0].measurementDate ||
                                    growthData[selectedChild.foetusId][0].date ||
                                    new Date(),
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>

                            <motion.button
                              className="view-history-button"
                              onClick={() => handleViewHistory(selectedChild.foetusId)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <motion.div
                                animate={{
                                  y: [0, -3, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              >
                                <FileText size={16} className="history-icon" />
                              </motion.div>
                              <span>Xem tất cả lịch sử</span>
                            </motion.button>
                          </motion.div>
                        )}

                        <motion.button
                          className="update-stats-button"
                          onClick={() => handleStatsUpdate(selectedChild.foetusId)}
                          whileHover={{ scale: 1.03, y: -5 }}
                          whileTap={{ scale: 0.97 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.3 }}
                        >
                          <motion.div
                            animate={{
                              rotate: [0, 10, 0, -10, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          >
                            <Ruler size={16} className="update-icon" />
                          </motion.div>
                          <span>Cập nhật chỉ số</span>
                          <motion.div className="button-shine" />
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
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

      {/* Modal hiển thị lịch sử */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            key="history-modal"
            className="history-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="history-modal-content"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <div className="history-modal-header">
                <h3>Lịch sử đo thai nhi</h3>
                <motion.button
                  onClick={() => setShowHistory(false)}
                  whileHover={{
                    rotate: 90,
                    backgroundColor: "rgba(255, 71, 87, 0.1)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  ✕
                </motion.button>
              </div>

              <div className="history-modal-body">
                {selectedWeekHistory && selectedWeekHistory.length > 0 ? (
                  <Table
                    dataSource={selectedWeekHistory}
                    columns={HISTORY_COLUMNS}
                    rowKey={(record) => `${record.measurementDate || record.date}-${record.age}`}
                    pagination={false}
                    scroll={{ x: "max-content" }}
                  />
                ) : (
                  <div className="no-data-message">Không có dữ liệu lịch sử</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GrowthAlert isOpen={showGrowthAlert} onClose={() => setShowGrowthAlert(false)} alertData={alertData} />

      <AlertHistoryModal isOpen={showAlertHistory} onClose={() => setShowAlertHistory(false)} history={alertHistory} />
    </div>
  )
}

export default BasicTracking

