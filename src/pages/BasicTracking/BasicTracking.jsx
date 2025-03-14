"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
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
} from "chart.js";
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
} from "lucide-react";
import foetusService from "../../api/services/foetusService";
import growthStatsService from "../../api/services/growthStatsService";
import "./BasicTracking.scss";
import { toast } from "react-toastify";
import { Table } from "antd";
import GrowthAlert from "./components/GrowthAlert/GrowthAlert";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// Constants
const STATS_FIELDS = [
  { key: "hc", label: "HC", icon: Ruler },
  { key: "ac", label: "AC", icon: Heart },
  { key: "fl", label: "FL", icon: Scale },
  { key: "efw", label: "EFW", icon: Activity },
];

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
    dataIndex: "measurementDate",
    key: "measurementDate",
    width: 120,
    render: (date) => new Date(date).toLocaleDateString("vi-VN"),
  },
  {
    title: "HC (mm)",
    dataIndex: "hc",
    key: "hc",
    width: 100,
    render: (value) => value || "Chưa có",
  },
  {
    title: "AC (mm)",
    dataIndex: "ac",
    key: "ac",
    width: 100,
    render: (value) => value || "Chưa có",
  },
  {
    title: "FL (mm)",
    dataIndex: "fl",
    key: "fl",
    width: 100,
    render: (value) => value || "Chưa có",
  },
  {
    title: "EFW (g)",
    dataIndex: "efw",
    key: "efw",
    width: 100,
    render: (value) => value || "Chưa có",
  },
];

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
          family: "'Inter', sans-serif",
        },
        filter: function (item) {
          return item.datasetIndex < 4;
        },
      },
    },
    title: {
      display: true,
      text: "Biểu đồ tăng trưởng thai nhi (4 tuần gần nhất)",
      font: {
        size: 16,
        family: "'Inter', sans-serif",
        weight: "bold",
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Chỉ số (mm/g)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

const BasicTracking = () => {
  // State management
  const [childrenHistory, setChildrenHistory] = useState([]);
  const [growthData, setGrowthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tempStats, setTempStats] = useState({});
  const [selectedWeekHistory, setSelectedWeekHistory] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showGrowthAlert, setShowGrowthAlert] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [alertsOpen, setAlertsOpen] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [standardRanges, setStandardRanges] = useState({});
  const [loadingRanges, setLoadingRanges] = useState(false);

  // Data fetching
  const fetchData = async () => {
    try {
      setLoading(true);
      const foetusData = await foetusService.getFoetusList();
      const growthResults = await fetchGrowthData(foetusData);
      updateState(foetusData, growthResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrowthData = async (foetusData) => {
    const growthPromises = foetusData.map((foetus) =>
      growthStatsService
        .getGrowthData(foetus.foetusId)
        .then((data) => ({ [foetus.foetusId]: data }))
        .catch((err) => {
          console.error(
            `Error fetching growth data for foetus ${foetus.foetusId}:`,
            err
          );
          return { [foetus.foetusId]: null };
        })
    );
    return Object.assign({}, ...(await Promise.all(growthPromises)));
  };

  const updateState = (foetusData, growthResults) => {
    setChildrenHistory(foetusData);
    setGrowthData(growthResults);
    setError(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Event handlers
  const handleStatsUpdate = async (foetusId) => {
    try {
      const statsData = tempStats[foetusId] || {};

      // Log thông tin cập nhật
      console.group("Updating Growth Stats");
      console.log("Foetus ID:", foetusId);
      console.log("Stats Data:", statsData);

      validateStats(statsData);
      const result = await updateStats(foetusId, statsData);

      // Log kết quả
      console.log("Update Result:", result);
      console.groupEnd();

      if (result.success) {
        // Truyền toàn bộ result làm alertData
        setAlertData(result);
        setShowGrowthAlert(true);
        handleUpdateSuccess(result);
      }
    } catch (err) {
      handleUpdateError(err);
    }
  };

  const validateStats = (statsData) => {
    console.group("Validating Stats");

    const age = Number(statsData.age || 0);
    console.log("Age:", age);

    if (!age || age < 0 || age > 42) {
      console.error("Invalid age:", age);
      console.groupEnd();
      throw new Error("Tuần tuổi thai nhi không hợp lệ (0-42 tuần)");
    }

    console.log("Validation passed");
    console.groupEnd();
  };

  const updateStats = async (foetusId, statsData) => {
    const currentChild = childrenHistory.find(
      (child) => child.foetusId === foetusId
    );

    const updateData = {
      age: Number(statsData.age || currentChild.age || 0),
      hc: Number(statsData.hc || currentChild.hc || 0),
      ac: Number(statsData.ac || currentChild.ac || 0),
      fl: Number(statsData.fl || currentChild.fl || 0),
      efw: Number(statsData.efw || currentChild.efw || 0),
    };

    // Log dữ liệu trước khi gửi
    console.group("Sending Update Request");
    console.log("Update Data:", updateData);

    const response = await growthStatsService.updateGrowthStats(
      foetusId,
      updateData
    );

    console.log("Response:", response);
    console.groupEnd();

    return response;
  };

  const handleUpdateSuccess = async (result) => {
    console.group("Update Success");
    console.log("Success Data:", result);

    // Hiển thị thông báo thành công
    toast.success(
      <div>
        <h4>Cập nhật thành công!</h4>
        <p>ID: {result.data?.id || "N/A"}</p>
        <p>Tuần thai: {result.data?.age || "N/A"}</p>
        <p>
          Ngày đo: {new Date(result.data?.date).toLocaleDateString("vi-VN")}
        </p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
      }
    );

    await fetchData();
    setTempStats({});
    console.groupEnd();
  };

  const handleUpdateError = (err) => {
    // Log chi tiết lỗi
    console.group("Update Error");
    console.error("Error Details:", err);

    // Hiển thị thông báo lỗi với chi tiết
    toast.error(
      <div>
        <h4>Lỗi cập nhật!</h4>
        <p>Mã lỗi: {err.status || "N/A"}</p>
        <p>
          Chi tiết:{" "}
          {err.error || err.message || "Có lỗi xảy ra khi cập nhật chỉ số"}
        </p>
      </div>,
      {
        autoClose: 5000,
        position: "top-right",
      }
    );

    console.groupEnd();
    console.error("Update failed:", err);
    toast.error(err.message || "Có lỗi xảy ra khi cập nhật chỉ số");
  };

  const handleViewHistory = (foetusId) => {
    const foetusData = growthData[foetusId];
    if (foetusData && Array.isArray(foetusData)) {
      const sortedData = sortHistoryData(foetusData);
      if (sortedData.length > 0) {
        setSelectedWeekHistory(sortedData);
        setShowHistory(true);
      } else {
        toast.info("Không có dữ liệu lịch sử");
      }
    }
  };

  const sortHistoryData = (data) => {
    return [...data].sort((a, b) => {
      if (a.age !== b.age) return b.age - a.age;
      return new Date(b.measurementDate) - new Date(a.measurementDate);
    });
  };

  const handleInputChange = (foetusId, field, value) => {
    setTempStats((prev) => ({
      ...prev,
      [foetusId]: {
        ...(prev[foetusId] || {}),
        [field]: value,
      },
    }));
  };

  // Cập nhật hàm getChartData
  const getChartData = (selectedChild, growthData) => {
    if (!selectedChild || !growthData[selectedChild.foetusId]) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const foetusData = growthData[selectedChild.foetusId];
    if (!Array.isArray(foetusData) || foetusData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Lấy 4 tuần gần nhất và sắp xếp theo tuần tăng dần
    const recentWeeks = [...foetusData]
      .sort((a, b) => b.age - a.age)
      .slice(0, 4)
      .sort((a, b) => a.age - b.age);

    return {
      labels: recentWeeks.map((data) => `Tuần ${data.age}`),
      datasets: [
        {
          type: "bar",
          label: "HC (mm)",
          data: recentWeeks.map((data) => data.hc || 0),
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          borderColor: "rgb(255, 99, 132)",
          borderWidth: 1,
        },
        {
          type: "bar",
          label: "AC (mm)",
          data: recentWeeks.map((data) => data.ac || 0),
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
        {
          type: "bar",
          label: "FL (mm)",
          data: recentWeeks.map((data) => data.fl || 0),
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          borderColor: "rgb(75, 192, 192)",
          borderWidth: 1,
        },
        {
          type: "bar",
          label: "EFW (g)",
          data: recentWeeks.map((data) => data.efw || 0),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          borderColor: "rgb(153, 102, 255)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Thêm hàm xử lý khi click vào card thai nhi
  const handleChildSelect = (child) => {
    setSelectedChild(child === selectedChild ? null : child); // Toggle selection
  };

  // Thêm hàm để lấy khoảng chuẩn từ API
  const fetchStandardRanges = async (age) => {
    if (!age || standardRanges[age]) return;
    
    try {
      setLoadingRanges(true);
      const rangeData = await growthStatsService.getGrowthRanges(age);
      
      setStandardRanges(prev => ({
        ...prev,
        [age]: rangeData
      }));
    } catch (err) {
      console.error(`Lỗi khi lấy khoảng chuẩn cho tuần ${age}:`, err);
    } finally {
      setLoadingRanges(false);
    }
  };

  // Cập nhật useEffect để lấy khoảng chuẩn khi chọn thai nhi
  useEffect(() => {
    if (selectedChild && growthData[selectedChild.foetusId]) {
      const currentData = growthData[selectedChild.foetusId];
      if (Array.isArray(currentData) && currentData.length > 0) {
        // Lấy dữ liệu mới nhất
        const latestData = [...currentData].sort((a, b) => b.age - a.age)[0];
        if (latestData && latestData.age) {
          fetchStandardRanges(latestData.age);
        }
      }
    }
  }, [selectedChild, growthData]);

  // Cập nhật hàm phân tích xu hướng để sử dụng dữ liệu từ API
  const analyzeGrowthTrend = (foetusId) => {
    const foetusData = growthData[foetusId];
    if (!foetusData || !Array.isArray(foetusData) || foetusData.length < 2) {
      return [];
    }

    // Sắp xếp dữ liệu theo tuần tăng dần
    const sortedData = [...foetusData].sort((a, b) => a.age - b.age);
    const trendAlerts = [];

    // Phân tích xu hướng HC
    if (sortedData.length >= 2) {
      const lastTwoMeasurements = sortedData.slice(-2);
      const currentAge = lastTwoMeasurements[1].age;
      const currentRanges = standardRanges[currentAge];
      
      // Phân tích HC
      if (lastTwoMeasurements[0].hc && lastTwoMeasurements[1].hc) {
        const hcGrowth = lastTwoMeasurements[1].hc - lastTwoMeasurements[0].hc;
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age;
        const hcGrowthRate = weeksDiff > 0 ? hcGrowth / weeksDiff : hcGrowth;
        
        // Tốc độ tăng trưởng HC chuẩn theo tuần (mm/tuần)
        const expectedHcGrowthRate = currentRanges?.hcGrowthRate || 10; // Sử dụng giá trị từ API hoặc mặc định
        
        if (hcGrowthRate < expectedHcGrowthRate * 0.7) {
          trendAlerts.push({
            type: "danger",
            title: "Tăng trưởng HC chậm",
            description: `HC tăng ${hcGrowthRate.toFixed(1)}mm/tuần, thấp hơn mức chuẩn (${expectedHcGrowthRate}mm/tuần).`,
            icon: <AlertTriangle />
          });
        } else if (hcGrowthRate > expectedHcGrowthRate * 1.3) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng trưởng HC nhanh",
            description: `HC tăng ${hcGrowthRate.toFixed(1)}mm/tuần, cao hơn mức chuẩn (${expectedHcGrowthRate}mm/tuần).`,
            icon: <AlertCircle />
          });
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng trưởng HC bình thường",
            description: `HC tăng ${hcGrowthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
            icon: <CheckCircle />
          });
        }
      }
      
      // Phân tích AC
      if (lastTwoMeasurements[0].ac && lastTwoMeasurements[1].ac) {
        const acGrowth = lastTwoMeasurements[1].ac - lastTwoMeasurements[0].ac;
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age;
        const acGrowthRate = weeksDiff > 0 ? acGrowth / weeksDiff : acGrowth;
        
        // Tốc độ tăng trưởng AC chuẩn theo tuần (mm/tuần)
        const expectedAcGrowthRate = currentRanges?.acGrowthRate || 12; // Sử dụng giá trị từ API hoặc mặc định
        
        if (acGrowthRate < expectedAcGrowthRate * 0.7) {
          trendAlerts.push({
            type: "danger",
            title: "Tăng trưởng AC chậm",
            description: `AC tăng ${acGrowthRate.toFixed(1)}mm/tuần, thấp hơn mức chuẩn (${expectedAcGrowthRate}mm/tuần).`,
            icon: <AlertTriangle />
          });
        } else if (acGrowthRate > expectedAcGrowthRate * 1.3) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng trưởng AC nhanh",
            description: `AC tăng ${acGrowthRate.toFixed(1)}mm/tuần, cao hơn mức chuẩn (${expectedAcGrowthRate}mm/tuần).`,
            icon: <AlertCircle />
          });
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng trưởng AC bình thường",
            description: `AC tăng ${acGrowthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
            icon: <CheckCircle />
          });
        }
      }
      
      // Phân tích EFW (cân nặng ước tính)
      if (lastTwoMeasurements[0].efw && lastTwoMeasurements[1].efw) {
        const efwGrowth = lastTwoMeasurements[1].efw - lastTwoMeasurements[0].efw;
        const weeksDiff = lastTwoMeasurements[1].age - lastTwoMeasurements[0].age;
        const efwGrowthRate = weeksDiff > 0 ? efwGrowth / weeksDiff : efwGrowth;
        
        // Tốc độ tăng trưởng EFW chuẩn theo tuần (g/tuần)
        let expectedEfwGrowthRate = currentRanges?.efwGrowthRate;
        
        if (!expectedEfwGrowthRate) {
          // Giá trị mặc định nếu không có từ API
          if (currentAge < 20) {
            expectedEfwGrowthRate = 25; // g/tuần
          } else if (currentAge < 30) {
            expectedEfwGrowthRate = 85; // g/tuần
          } else {
            expectedEfwGrowthRate = 200; // g/tuần
          }
        }
        
        if (efwGrowthRate < expectedEfwGrowthRate * 0.7) {
          trendAlerts.push({
            type: "danger",
            title: "Tăng cân chậm",
            description: `Cân nặng tăng ${efwGrowthRate.toFixed(0)}g/tuần, thấp hơn mức chuẩn (${expectedEfwGrowthRate}g/tuần) ở tuần ${currentAge}.`,
            icon: <AlertTriangle />
          });
        } else if (efwGrowthRate > expectedEfwGrowthRate * 1.3) {
          trendAlerts.push({
            type: "warning",
            title: "Tăng cân nhanh",
            description: `Cân nặng tăng ${efwGrowthRate.toFixed(0)}g/tuần, cao hơn mức chuẩn (${expectedEfwGrowthRate}g/tuần) ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          trendAlerts.push({
            type: "success",
            title: "Tăng cân bình thường",
            description: `Cân nặng tăng ${efwGrowthRate.toFixed(0)}g/tuần, phù hợp với mức chuẩn ở tuần ${currentAge}.`,
            icon: <CheckCircle />
          });
        }
      }
    }
    
    return trendAlerts;
  };

  // Cập nhật useEffect để thêm phân tích xu hướng vào alerts và sử dụng dữ liệu từ API
  useEffect(() => {
    if (selectedChild && growthData[selectedChild.foetusId]) {
      const foetusData = growthData[selectedChild.foetusId];
      if (!Array.isArray(foetusData) || foetusData.length === 0) {
        setAlerts([]);
        return;
      }
      
      // Lấy dữ liệu mới nhất
      const currentData = [...foetusData].sort((a, b) => b.age - a.age)[0];
      const currentAge = currentData.age;
      const currentRanges = standardRanges[currentAge];
      
      let newAlerts = [];
      
      // Kiểm tra tuần thai
      if (currentAge < 20) {
        newAlerts.push({
          type: "info",
          title: "Thai nhi đang trong giai đoạn phát triển sớm",
          description: "Các chỉ số có thể chưa phản ánh đầy đủ sự phát triển.",
          icon: <Info />
        });
      }
      
      // Kiểm tra HC (Head Circumference)
      if (currentData.hc && currentRanges) {
        const hcMin = currentRanges.hcMin || getStandardHC(currentAge) * 0.9;
        const hcMax = currentRanges.hcMax || getStandardHC(currentAge) * 1.1;
        const hcStandard = currentRanges.hcStandard || getStandardHC(currentAge);
        
        if (currentData.hc < hcMin) {
          const hcDiff = ((currentData.hc - hcStandard) / hcStandard) * 100;
          newAlerts.push({
            type: "danger",
            title: "HC thấp hơn mức chuẩn",
            description: `Chu vi đầu (HC) thấp hơn ${Math.abs(Math.round(hcDiff))}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertTriangle />
          });
        } else if (currentData.hc > hcMax) {
          const hcDiff = ((currentData.hc - hcStandard) / hcStandard) * 100;
          newAlerts.push({
            type: "warning",
            title: "HC cao hơn mức chuẩn",
            description: `Chu vi đầu (HC) cao hơn ${Math.round(hcDiff)}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          newAlerts.push({
            type: "success",
            title: "HC trong mức bình thường",
            description: "Chu vi đầu (HC) đang phát triển tốt theo tuần thai.",
            icon: <CheckCircle />
          });
        }
      }
      
      // Kiểm tra AC (Abdominal Circumference)
      if (currentData.ac && currentRanges) {
        const acMin = currentRanges.acMin || getStandardAC(currentAge) * 0.9;
        const acMax = currentRanges.acMax || getStandardAC(currentAge) * 1.1;
        const acStandard = currentRanges.acStandard || getStandardAC(currentAge);
        
        if (currentData.ac < acMin) {
          const acDiff = ((currentData.ac - acStandard) / acStandard) * 100;
          newAlerts.push({
            type: "danger",
            title: "AC thấp hơn mức chuẩn",
            description: `Chu vi bụng (AC) thấp hơn ${Math.abs(Math.round(acDiff))}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertTriangle />
          });
        } else if (currentData.ac > acMax) {
          const acDiff = ((currentData.ac - acStandard) / acStandard) * 100;
          newAlerts.push({
            type: "warning",
            title: "AC cao hơn mức chuẩn",
            description: `Chu vi bụng (AC) cao hơn ${Math.round(acDiff)}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          newAlerts.push({
            type: "success",
            title: "AC trong mức bình thường",
            description: "Chu vi bụng (AC) đang phát triển tốt theo tuần thai.",
            icon: <CheckCircle />
          });
        }
      }
      
      // Kiểm tra FL (Femur Length)
      if (currentData.fl && currentRanges) {
        const flMin = currentRanges.flMin || (currentAge * 2);
        const flMax = currentRanges.flMax || (currentAge * 2.5);
        const flStandard = currentRanges.flStandard || (currentAge * 2.2);
        
        if (currentData.fl < flMin) {
          const flDiff = ((currentData.fl - flStandard) / flStandard) * 100;
          newAlerts.push({
            type: "danger",
            title: "FL thấp hơn mức chuẩn",
            description: `Chiều dài xương đùi (FL) thấp hơn ${Math.abs(Math.round(flDiff))}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertTriangle />
          });
        } else if (currentData.fl > flMax) {
          const flDiff = ((currentData.fl - flStandard) / flStandard) * 100;
          newAlerts.push({
            type: "warning",
            title: "FL cao hơn mức chuẩn",
            description: `Chiều dài xương đùi (FL) cao hơn ${Math.round(flDiff)}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          newAlerts.push({
            type: "success",
            title: "FL trong mức bình thường",
            description: "Chiều dài xương đùi (FL) đang phát triển tốt theo tuần thai.",
            icon: <CheckCircle />
          });
        }
      }
      
      // Kiểm tra EFW (Estimated Fetal Weight)
      if (currentData.efw && currentRanges) {
        const efwMin = currentRanges.efwMin || (currentAge * 50);
        const efwMax = currentRanges.efwMax || (currentAge * 70);
        const efwStandard = currentRanges.efwStandard || (currentAge * 60);
        
        if (currentData.efw < efwMin) {
          const efwDiff = ((currentData.efw - efwStandard) / efwStandard) * 100;
          newAlerts.push({
            type: "danger",
            title: "Cân nặng thấp hơn mức chuẩn",
            description: `Cân nặng ước tính (EFW) thấp hơn ${Math.abs(Math.round(efwDiff))}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertTriangle />
          });
        } else if (currentData.efw > efwMax) {
          const efwDiff = ((currentData.efw - efwStandard) / efwStandard) * 100;
          newAlerts.push({
            type: "warning",
            title: "Cân nặng cao hơn mức chuẩn",
            description: `Cân nặng ước tính (EFW) cao hơn ${Math.round(efwDiff)}% so với mức chuẩn ở tuần ${currentAge}.`,
            icon: <AlertCircle />
          });
        } else {
          newAlerts.push({
            type: "success",
            title: "Cân nặng trong mức bình thường",
            description: "Cân nặng ước tính (EFW) đang phát triển tốt theo tuần thai.",
            icon: <CheckCircle />
          });
        }
      }
      
      // Thêm phân tích xu hướng tăng trưởng từ lịch sử
      if (foetusData.length >= 2) {
        const trendAlerts = analyzeGrowthTrend(selectedChild.foetusId);
        
        // Thêm tiêu đề phần xu hướng nếu có dữ liệu
        if (trendAlerts.length > 0) {
          newAlerts.push({
            type: "info",
            title: "Phân tích xu hướng tăng trưởng",
            description: "Dựa trên dữ liệu lịch sử các lần đo gần nhất.",
            icon: <BarChart2 />
          });
          
          // Thêm các cảnh báo xu hướng
          newAlerts = [...newAlerts, ...trendAlerts];
        }
      }
      
      // Cập nhật state alerts
      setAlerts(newAlerts);
    } else {
      setAlerts([]);
    }
  }, [selectedChild, growthData, standardRanges]);

  // Thêm hàm helper để lấy giá trị chuẩn (đây chỉ là ví dụ, bạn cần điều chỉnh theo dữ liệu thực tế)
  const getStandardHC = (age) => {
    // Giá trị chuẩn HC theo tuần thai (đây là giá trị mẫu)
    const standardValues = {
      12: 80, 13: 90, 14: 100, 15: 110, 16: 120, 17: 130, 18: 140, 19: 150, 20: 160,
      21: 170, 22: 180, 23: 190, 24: 200, 25: 210, 26: 220, 27: 230, 28: 240, 29: 250,
      30: 260, 31: 270, 32: 280, 33: 290, 34: 300, 35: 310, 36: 320, 37: 330, 38: 340,
      39: 350, 40: 360
    };
    
    return standardValues[age] || 200; // Giá trị mặc định nếu không có dữ liệu
  };

  const getStandardAC = (age) => {
    // Giá trị chuẩn AC theo tuần thai (đây là giá trị mẫu)
    const standardValues = {
      12: 70, 13: 80, 14: 90, 15: 100, 16: 110, 17: 120, 18: 130, 19: 140, 20: 150,
      21: 160, 22: 170, 23: 180, 24: 190, 25: 200, 26: 210, 27: 220, 28: 230, 29: 240,
      30: 250, 31: 260, 32: 270, 33: 280, 34: 290, 35: 300, 36: 310, 37: 320,
      38: 330, 39: 340, 40: 350
    };
    
    return standardValues[age] || 180; // Giá trị mặc định nếu không có dữ liệu
  };

  if (loading) return <div className="loading-spinner">Đang tải...</div>;

  return (
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
        <p>Theo dõi sự phát triển của bé yêu</p>
      </motion.div>

      <div className="monitor-content">
        <motion.div
          className="children-grid"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {childrenHistory.map((child) => {
            const currentGrowthData = growthData[child.foetusId];
            const isSelected = selectedChild?.foetusId === child.foetusId;

            return (
              <motion.div
                key={child.foetusId}
                className={`child-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleChildSelect(child)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * child.foetusId }}
                whileHover={{ y: -5 }}
                style={{ cursor: "pointer" }}
              >
                <div className="card-header">
                  <h3>{child.name}</h3>
                </div>

                <div className="card-content">
                  <div className="basic-info">
                    <div className="info-title">
                      <Info size={16} />
                      <span>Thông tin cơ bản</span>
                    </div>
                    
                    <div className="info-grid">
                      <motion.div
                        className="info-item"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Baby size={16} />
                        <span>
                          {child.gender === "MALE"
                            ? "Nam"
                            : child.gender === "FEMALE"
                            ? "Nữ"
                            : child.gender === "OTHER"
                            ? "Khác"
                            : "Chưa xác định"}
                        </span>
                      </motion.div>
                      
                      <motion.div
                        className="info-item"
                        whileHover={{ scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Activity size={16} />
                        <div className="age-input-container">
                          <span>Tuần</span>
                          <input
                            type="number"
                            value={
                              tempStats[child.foetusId]?.age !== undefined
                                ? tempStats[child.foetusId].age
                                : currentGrowthData?.age || child.age || ""
                            }
                            onChange={(e) =>
                              handleInputChange(
                                child.foetusId,
                                "age",
                                e.target.value
                              )
                            }
                            min="0"
                            max="42"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {child.age < 12 ? (
                    <motion.div
                      className="warning-message"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertCircle size={16} />
                      <span>Thai nhi chưa đủ tuần tuổi để đo chỉ số</span>
                    </motion.div>
                  ) : (
                    <>
                      <div className="stats-container">
                        <div className="stats-title">
                          <BarChart2 size={16} />
                          <span>Chỉ số phát triển</span>
                        </div>
                        
                        <div className="stats-grid">
                          <motion.div
                            className="stat-item"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="stat-header">
                              <Ruler size={16} />
                              <span className="stat-label">HC</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[child.foetusId]?.hc !== undefined
                                    ? tempStats[child.foetusId].hc
                                    : currentGrowthData?.hc || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    child.foetusId,
                                    "hc",
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder="Nhập HC"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            className="stat-item"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="stat-header">
                              <Heart size={16} />
                              <span className="stat-label">AC</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[child.foetusId]?.ac !== undefined
                                    ? tempStats[child.foetusId].ac
                                    : currentGrowthData?.ac || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    child.foetusId,
                                    "ac",
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder="Nhập AC"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            className="stat-item"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="stat-header">
                              <Scale size={16} />
                              <span className="stat-label">FL</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[child.foetusId]?.fl !== undefined
                                    ? tempStats[child.foetusId].fl
                                    : currentGrowthData?.fl || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    child.foetusId,
                                    "fl",
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder="Nhập FL"
                              />
                              <span className="stat-unit">mm</span>
                            </div>
                          </motion.div>
                          
                          <motion.div
                            className="stat-item"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <div className="stat-header">
                              <Activity size={16} />
                              <span className="stat-label">EFW</span>
                            </div>
                            <div className="stat-input">
                              <input
                                type="number"
                                value={
                                  tempStats[child.foetusId]?.efw !== undefined
                                    ? tempStats[child.foetusId].efw
                                    : currentGrowthData?.efw || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    child.foetusId,
                                    "efw",
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder="Nhập EFW"
                              />
                              <span className="stat-unit">g</span>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      <div className="actions-container">
                        {currentGrowthData && (
                          <div className="history-section">
                            <div className="last-updated">
                              <Clock size={14} />
                              <span>
                                Cập nhật lần cuối: {" "}
                                {new Date(
                                  currentGrowthData.measurementDate
                                ).toLocaleDateString("vi-VN")}
                              </span>
                            </div>

                            <motion.button
                              className="view-history-button"
                              onClick={() => handleViewHistory(child.foetusId)}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              <FileText size={16} />
                              <span>Xem tất cả lịch sử</span>
                            </motion.button>
                          </div>
                        )}

                        <motion.button
                          className="update-stats-button"
                          onClick={() => handleStatsUpdate(child.foetusId)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Ruler size={16} />
                          <span>Cập nhật chỉ số</span>
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="chart-section">
          <div className="chart-container">
            {selectedChild && (
              <Bar
                data={getChartData(selectedChild, growthData)}
                options={chartOptions}
                height={300}
              />
            )}
          </div>
          <div className="chart-info">
            <p className="chart-note">
              {selectedChild
                ? `* Biểu đồ hiển thị sự tăng trưởng của ${selectedChild.name} theo tuần`
                : "* Chọn một thai nhi để xem biểu đồ tăng trưởng"}
            </p>
          </div>
          
          {/* Thêm phần alert box ở đây */}
          <div className="chart-alerts">
            <div className="alert-header">
              <h4>
                <Bell size={16} />
                <span>Cảnh báo & Thông báo</span>
              </h4>
              <button 
                className="alert-toggle"
                onClick={() => setAlertsOpen(!alertsOpen)}
              >
                {alertsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
            
            <div className={`alert-content ${alertsOpen ? 'open' : ''}`}>
              {selectedChild ? (
                alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div key={index} className={`alert-item ${alert.type}`}>
                      <div className="alert-icon">{alert.icon}</div>
                      <div className="alert-text">
                        <h5 className="alert-title">{alert.title}</h5>
                        <p className="alert-description">{alert.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-alerts">
                    <CheckCircle size={24} />
                    <p>Không có cảnh báo nào cho thai nhi này</p>
                  </div>
                )
              ) : (
                <div className="no-alerts">
                  <Info size={24} />
                  <p>Vui lòng chọn một thai nhi để xem cảnh báo</p>
                </div>
              )}
            </div>
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
                      rowKey={(record) =>
                        `${record.measurementDate}-${record.age}`
                      }
                      pagination={false}
                      scroll={{ x: "max-content" }}
                    />
                  ) : (
                    <div className="no-data-message">
                      Không có dữ liệu lịch sử
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal so sánh */}
        <AnimatePresence>
          {showCompareModal && (
            <motion.div
              key="compare-modal"
              className="compare-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="compare-modal-content"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: "spring", damping: 20 }}
              >
                <div className="compare-modal-header">
                  <h3>So sánh chỉ số thai nhi</h3>
                  <motion.button
                    onClick={() => setShowCompareModal(false)}
                    whileHover={{
                      rotate: 90,
                      backgroundColor: "rgba(255, 71, 87, 0.1)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    ✕
                  </motion.button>
                </div>
                <div className="compare-modal-body">
                  {selectedChild && (
                    <div className="comparison-chart">
                      <Bar
                        data={{
                          labels: ["HC", "AC", "FL", "EFW"],
                          datasets: [
                            {
                              label: "Chỉ số hiện tại",
                              data: [
                                growthData[selectedChild]?.hc || 0,
                                growthData[selectedChild]?.ac || 0,
                                growthData[selectedChild]?.fl || 0,
                                growthData[selectedChild]?.efw || 0,
                              ],
                              backgroundColor: "rgba(255, 107, 129, 0.5)",
                            },
                            {
                              label: "Chỉ số chuẩn",
                              data: [200, 180, 150, 500], // Thêm chỉ số chuẩn tương ứng
                              backgroundColor: "rgba(112, 161, 255, 0.5)",
                            },
                          ],
                        }}
                        options={chartOptions}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <GrowthAlert
          isOpen={showGrowthAlert}
          onClose={() => setShowGrowthAlert(false)}
          alertData={alertData}
        />
      </div>
    </div>
  );
};

export default BasicTracking;
