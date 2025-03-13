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
  { key: "efw", label: "EFW", icon: Activity }
];

const HISTORY_COLUMNS = [
  {
    title: "Tuần thai",
    dataIndex: "age",
    key: "age",
    width: 100,
    render: (value) => `Tuần ${value || "?"}`
  },
  {
    title: "Ngày đo",
    dataIndex: "measurementDate",
    key: "measurementDate",
    width: 120,
    render: (date) => new Date(date).toLocaleDateString("vi-VN")
  },
  {
    title: "HC (mm)",
    dataIndex: "hc",
    key: "hc",
    width: 100,
    render: (value) => value || "Chưa có"
  },
  {
    title: "AC (mm)",
    dataIndex: "ac",
    key: "ac",
    width: 100,
    render: (value) => value || "Chưa có"
  },
  {
    title: "FL (mm)",
    dataIndex: "fl",
    key: "fl",
    width: 100,
    render: (value) => value || "Chưa có"
  },
  {
    title: "EFW (g)",
    dataIndex: "efw",
    key: "efw",
    width: 100,
    render: (value) => value || "Chưa có"
  }
];

// Chart Options
const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          filter: function(item) {
            // Chỉ hiển thị label cho bar charts
            return item.datasetIndex < 4;
          }
        }
      },
      title: {
        display: true,
      text: "Biểu đồ tăng trưởng thai nhi (4 tuần gần nhất)",
        font: {
          size: 16,
          family: "'Inter', sans-serif",
        weight: "bold"
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || "";
          const value = context.parsed.y || 0;
          const unit = label.includes('EFW') ? 'g' : 'mm';
          return `${label}: ${value} ${unit}`;
        }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
      title: {
        display: true,
        text: 'Chỉ số (mm/g)'
      },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)"
        }
      },
      x: {
        grid: {
          display: false
        },
      title: {
        display: true,
        text: 'Tuần thai'
      }
    }
  }
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
  const getChartData = () => {
    if (!selectedChild) {
      return {
        labels: [],
        datasets: []
      };
    }

    const foetusData = growthData[selectedChild.foetusId];
    if (!foetusData || !Array.isArray(foetusData)) {
          return {
        labels: [],
        datasets: []
      };
    }

    // Sắp xếp dữ liệu theo tuần giảm dần (mới nhất trước)
    const sortedData = foetusData.sort((a, b) => b.age - a.age);
    // Lấy 4 tuần gần nhất
    const recentWeeks = sortedData.slice(0, 4);
    // Sắp xếp lại theo tuần tăng dần
    const weeksToShow = recentWeeks.sort((a, b) => a.age - b.age);

    return {
      labels: weeksToShow.map(data => `Tuần ${data.age}`),
      datasets: [
        // Bar charts
        {
          key: 'hc-bar',
          type: 'bar',
          label: 'HC (mm)',
          data: weeksToShow.map(data => data.hc || 0),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          order: 2 // Hiển thị phía sau line
        },
        {
          key: 'ac-bar',
          type: 'bar',
          label: 'AC (mm)',
          data: weeksToShow.map(data => data.ac || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          order: 2
        },
        {
          type: 'bar',
          label: 'FL (mm)',
          data: weeksToShow.map(data => data.fl || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          order: 2
        },
        {
          type: 'bar',
          label: 'EFW (g)',
          data: weeksToShow.map(data => data.efw || 0),
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          order: 2
        },
        // Line charts
        {
          type: 'line',
          label: 'HC Trend',
          data: weeksToShow.map(data => data.hc || 0),
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          order: 1 // Hiển thị phía trước bar
        },
        {
          type: 'line',
          label: 'AC Trend',
          data: weeksToShow.map(data => data.ac || 0),
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          order: 1
        },
        {
          type: 'line',
          label: 'FL Trend',
          data: weeksToShow.map(data => data.fl || 0),
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          order: 1
        },
        {
          type: 'line',
          label: 'EFW Trend',
          data: weeksToShow.map(data => data.efw || 0),
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          order: 1
        }
      ]
    };
  };

  // Thêm hàm xử lý khi click vào card thai nhi
  const handleChildSelect = (child) => {
    setSelectedChild(child === selectedChild ? null : child); // Toggle selection
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
        <h1>Theo dõi thai kỳ</h1>
        <p>Theo dõi sự phát triển của thai nhi</p>
      </motion.div>

      <div className="monitor-content">
        <div className="chart-section">
          <div className="chart-container">
            <Bar 
              data={getChartData()} 
              options={CHART_OPTIONS} 
              height={300} 
            />
          </div>
          <div className="chart-info">
            <p className="chart-note">
              {selectedChild
                ? `* Biểu đồ hiển thị sự tăng trưởng của ${selectedChild.name} theo tuần`
                : "* Chọn một thai nhi để xem biểu đồ tăng trưởng"}
            </p>
            </div>
          </div>

        <motion.div
          className="children-grid"
          initial={{ opacity: 0, x: 30 }}
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
                  <div className="info-grid">
                    <motion.div
                      className="info-item"
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(255, 107, 129, 0.1)",
                      }}
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
                      whileHover={{
                        x: 5,
                        backgroundColor: "rgba(255, 107, 129, 0.1)",
                      }}
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
                      <div className="stats-grid">
                        {STATS_FIELDS.map(({ key, label, icon: Icon }) => (
                          <motion.div
                            key={`${child.foetusId}-${key}`}
                            className="stat-item"
                            whileHover={{ scale: 1.03 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <Icon className="stat-icon" size={16} />
                          <div className="stat-content">
                              <span className="stat-label">{label}</span>
                              <input
                                type="number"
                                value={
                                  tempStats[child.foetusId]?.[key] !== undefined
                                    ? tempStats[child.foetusId][key]
                                    : currentGrowthData?.[key] || ""
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    child.foetusId,
                                    key,
                                    e.target.value
                                  )
                                }
                                min="0"
                                placeholder={
                                  currentGrowthData?.[key]
                                    ? `Hiện tại: ${currentGrowthData[key]}`
                                    : "Chưa có dữ liệu"
                                }
                              />
                          </div>
                          </motion.div>
                        ))}
                        </div>

                      {currentGrowthData && (
                        <div className="history-section">
                          <div className="last-updated">
                            Cập nhật lần cuối:{" "}
                            {new Date(
                              currentGrowthData.measurementDate
                            ).toLocaleDateString("vi-VN")}
                      </div>

                          <motion.button
                            className="view-history-button"
                            onClick={() => handleViewHistory(child.foetusId)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Calendar size={16} />
                            Xem tất cả lịch sử
                          </motion.button>
                        </div>
                      )}

                      <motion.button
                        className="update-stats-button"
                        onClick={() => handleStatsUpdate(child.foetusId)}
                        whileHover={{ scale: 1.03, backgroundColor: "#5c8df6" }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Ruler size={16} />
                        <span>Cập nhật chỉ số</span>
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
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
                    rowKey={(record) => `${record.measurementDate}-${record.age}`}
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
                      options={CHART_OPTIONS}
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
  );
};

export default BasicTracking;
