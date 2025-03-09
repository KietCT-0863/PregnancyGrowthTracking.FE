"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Tách constants ra đầu file
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

const CHART_OPTIONS = {
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
      },
    },
    title: {
      display: true,
      text: "Biểu đồ chỉ số thai nhi",
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
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.1)",
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
  const [showCompareModal, setShowCompareModal] = useState(false); // Thêm state cho modal mới
  const [selectedFoetus, setSelectedFoetus] = useState(null); // State cho thai nhi được chọn
  const [selectedChild, setSelectedChild] = useState(null); // Thêm state cho việc chọn thai nhi

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
      validateStats(statsData);
      await updateStats(foetusId, statsData);
      handleUpdateSuccess();
    } catch (err) {
      handleUpdateError(err);
    }
  };

  const validateStats = (statsData) => {
    const age = Number(statsData.age || 0);
    if (!age || age < 0 || age > 42) {
      throw new Error("Tuần tuổi thai nhi không hợp lệ (0-42 tuần)");
    }
  };

  const updateStats = async (foetusId, statsData) => {
    const currentChild = childrenHistory.find(
      (child) => child.foetusId === foetusId
    );
    await growthStatsService.updateGrowthStats(foetusId, {
      age: Number(statsData.age || currentChild.age || 0),
      hc: Number(statsData.hc || currentChild.hc || 0),
      ac: Number(statsData.ac || currentChild.ac || 0),
      fl: Number(statsData.fl || currentChild.fl || 0),
      efw: Number(statsData.efw || currentChild.efw || 0),
    });
  };

  const handleUpdateSuccess = async () => {
    toast.success("Cập nhật chỉ số thành công");
    await fetchData();
    setTempStats({});
  };

  const handleUpdateError = (err) => {
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

  // Thêm hàm xử lý cho modal so sánh
  const handleCompare = (foetusId) => {
    setSelectedFoetus(foetusId);
    setShowCompareModal(true);
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

  // Hàm lấy dữ liệu mới nhất cho mỗi thai nhi
  const getLatestGrowthData = (foetusId) => {
    const foetusData = growthData[foetusId];
    if (!foetusData || !Array.isArray(foetusData) || foetusData.length === 0) {
      return null;
    }

    // Sắp xếp theo tuần mới nhất và lấy dữ liệu đầu tiên
    return foetusData.sort((a, b) => {
      if (a.age !== b.age) {
        return b.age - a.age; // Sắp xếp theo tuần giảm dần
      }
      // Nếu cùng tuần thì sắp xếp theo ngày đo
      return new Date(b.measurementDate) - new Date(a.measurementDate);
    })[0];
  };

  // Cập nhật hàm getChartData để chỉ hiển thị dữ liệu của thai nhi được chọn
  const getChartData = () => {
    if (!selectedChild) {
      return {
        labels: ["HC (mm)", "AC (mm)", "FL (mm)", "EFW (g)"],
        datasets: [], // Không có dữ liệu khi chưa chọn thai nhi
      };
    }

    const latestData = getLatestGrowthData(selectedChild.foetusId);

    return {
      labels: ["HC (mm)", "AC (mm)", "FL (mm)", "EFW (g)"],
      datasets: [
        {
          label: `${selectedChild.name} (Tuần ${latestData?.age || "?"})`,
          data: [
            latestData?.hc || 0,
            latestData?.ac || 0,
            latestData?.fl || 0,
            latestData?.efw || 0,
          ],
          backgroundColor: "rgba(255, 107, 129, 0.5)",
          borderColor: "rgb(255, 107, 129)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Cập nhật chartOptions để hiển thị tooltip chi tiết hơn
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
        },
      },
      title: {
        display: true,
        text: "Biểu đồ chỉ số thai nhi (Tuần mới nhất)",
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: "bold",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            const measureType = context.chart.data.labels[context.dataIndex];
            return `${label}: ${value} ${measureType.split(" ")[1]}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          callback: function (value) {
            return value.toLocaleString("vi-VN");
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
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
            <Bar data={getChartData()} options={chartOptions} height={300} />
          </div>
          <div className="chart-info">
            <p className="chart-note">
              {selectedChild
                ? `* Biểu đồ hiển thị các chỉ số mới nhất của ${selectedChild.name}`
                : "* Chọn một thai nhi để xem biểu đồ chỉ số"}
            </p>
          </div>
        </div>

        <motion.div
          className="children-grid"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {childrenHistory.map((child, index) => {
            const currentGrowthData = growthData[child.foetusId];
            const isSelected = selectedChild?.foetusId === child.foetusId;

            return (
              <motion.div
                key={child.foetusId}
                className={`child-card ${isSelected ? "selected" : ""}`}
                onClick={() => handleChildSelect(child)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
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
                            key={key}
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
                    rowKey={(record) => record.measurementDate}
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
                {selectedFoetus && (
                  <div className="comparison-chart">
                    <Bar
                      data={{
                        labels: ["HC", "AC", "FL", "EFW"],
                        datasets: [
                          {
                            label: "Chỉ số hiện tại",
                            data: [
                              growthData[selectedFoetus]?.hc || 0,
                              growthData[selectedFoetus]?.ac || 0,
                              growthData[selectedFoetus]?.fl || 0,
                              growthData[selectedFoetus]?.efw || 0,
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
    </div>
  );
};

export default BasicTracking;
