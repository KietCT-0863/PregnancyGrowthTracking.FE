import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import { BarChart2, Calendar, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import WeeksFilter from "../../WeeksFilter/WeeksFilter";
import growthStatsService from "../../../../api/services/growthStatsService";
import "./GrowthChart.scss";

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
      text: "Biểu đồ tăng trưởng thai nhi (12 tuần gần nhất)",
      font: {
        size: 18,
        family: "'Quicksand', sans-serif",
        weight: "bold",
      },
      padding: {
        top: 10,
        bottom: 30,
      },
      color: "#ff6b81",
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
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
          size: 12,
        },
        padding: {
          bottom: 10,
        },
      },
      grid: {
        color: "rgba(255, 107, 129, 0.1)",
      },
      ticks: {
        padding: 8,
        font: {
          size: 11,
        },
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          family: "'Quicksand', sans-serif",
          size: 11,
        },
        padding: 8,
        maxRotation: 0,
        autoSkip: false,
      },
    },
  },
  animation: {
    duration: 2000,
    easing: "easeOutQuart",
  },
  layout: {
    padding: {
      left: 15,
      right: 25,
      top: 0,
      bottom: 15,
    },
  },
};

const GrowthChart = ({ selectedChild, growthData, weeksToShow, onWeeksChange }) => {
  const [weeksWithData, setWeeksWithData] = useState([]);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [weekHistory, setWeekHistory] = useState([]);
  const [showWeekHistory, setShowWeekHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (selectedChild?.foetusId) {
      fetchWeeksWithData(selectedChild.foetusId);
    }
  }, [selectedChild]);

  const fetchWeeksWithData = async (foetusId) => {
    try {
      setLoadingWeeks(true);
      const alertHistory = await growthStatsService.getAlertHistory(foetusId);
      
      // Lọc ra các tuần đã có dữ liệu
      const weeks = [];
      if (Array.isArray(alertHistory)) {
        // Sử dụng Set để tránh trùng lặp
        const uniqueWeeks = new Set();
        alertHistory.forEach(item => {
          if (item.age) {
            uniqueWeeks.add(item.age);
          }
          if (item.alerts && Array.isArray(item.alerts)) {
            item.alerts.forEach(alert => {
              if (alert.age) {
                uniqueWeeks.add(alert.age);
              }
            });
          }
        });
        weeks.push(...Array.from(uniqueWeeks));
      }
      
      // Thêm các tuần từ growthData
      if (growthData[foetusId] && Array.isArray(growthData[foetusId])) {
        growthData[foetusId].forEach(data => {
          if (data.age && !weeks.includes(data.age)) {
            weeks.push(data.age);
          }
        });
      }
      
      setWeeksWithData(weeks);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu tuần:", error);
    } finally {
      setLoadingWeeks(false);
    }
  };

  const getChartData = () => {
    if (!selectedChild || !growthData[selectedChild?.foetusId]) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const foetusData = growthData[selectedChild?.foetusId];
    if (!Array.isArray(foetusData) || foetusData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sắp xếp dữ liệu theo tuần mới nhất trước
    const sortedData = [...foetusData].sort((a, b) => {
      if (a.age !== b.age) return b.age - a.age;
      return new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate);
    });

    // Lọc ra các tuần khác nhau
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
    
    // Hàm xử lý giá trị bất thường
    const normalizeValue = (value, maxThreshold = 1000) => {
      if (!value) return 0;
      return value > maxThreshold ? maxThreshold : value;
    };

    // Tạo dữ liệu chuẩn hóa với giới hạn bản đồ màu tốt hơn
    const hcData = recentWeeks.map(data => normalizeValue(data.hc?.value, 500) / 5);
    const acData = recentWeeks.map(data => normalizeValue(data.ac?.value, 500) / 5);
    const flData = recentWeeks.map(data => normalizeValue(data.fl?.value, 200) / 2);
    const efwData = recentWeeks.map(data => normalizeValue(data.efw?.value, 5000) / 50);

    // Lưu dữ liệu gốc
    const originalData = {
      hc: recentWeeks.map(data => data.hc?.value || 0),
      ac: recentWeeks.map(data => data.ac?.value || 0),
      fl: recentWeeks.map(data => data.fl?.value || 0),
      efw: recentWeeks.map(data => data.efw?.value || 0),
    };

    // Cập nhật title
    chartOptions.plugins.title.text = weeksToShow === "Tất cả" 
      ? "Biểu đồ tăng trưởng thai nhi (tất cả các tuần)" 
      : `Biểu đồ tăng trưởng thai nhi (${weeksToShow} tuần gần nhất)`;

    return {
      labels: recentWeeks.map((data) => `T${data.age}`),
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
    };
  };

  const renderWeekCalendar = () => {
    const weeks = Array.from({ length: 29 }, (_, i) => i + 12); // Tuần 12-40
    
    return (
      <div className="week-calendar">
        <div className="week-calendar-header">
          <h3>Lịch tuần thai</h3>
          <p>Nhấn vào tuần để xem/nhập dữ liệu</p>
        </div>
        <div className="week-grid">
          {weeks.map(week => {
            const hasData = weeksWithData.includes(week);
            return (
              <div 
                key={week} 
                className={`week-item ${hasData ? 'has-data' : ''}`}
                onClick={() => handleWeekSelect(week)}
              >
                <span className="week-number">T{week}</span>
                {hasData && <Check className="check-icon" size={16} />}
              </div>
            );
          })}
        </div>
        <div className="week-calendar-legend">
          <div className="legend-item">
            <div className="legend-color has-data"></div>
            <span>Đã có dữ liệu</span>
          </div>
          <div className="legend-item">
            <div className="legend-color"></div>
            <span>Chưa có dữ liệu</span>
          </div>
        </div>
      </div>
    );
  };

  const handleWeekSelect = async (week) => {
    try {
      if (!selectedChild?.foetusId) return;
      
      setSelectedWeek(week);
      setLoadingHistory(true);
      setShowWeekHistory(true);
      
      // Lấy dữ liệu tuần đã chọn từ growthData
      const weekData = [];
      if (growthData[selectedChild.foetusId] && Array.isArray(growthData[selectedChild.foetusId])) {
        growthData[selectedChild.foetusId].forEach(data => {
          if (data.age === week) {
            weekData.push({
              date: new Date(data.date || data.measurementDate).toLocaleDateString('vi-VN'),
              hc: data.hc?.value || 0,
              ac: data.ac?.value || 0,
              fl: data.fl?.value || 0,
              efw: data.efw?.value || 0,
              id: data.measurementId || `${data.date}-${data.age}`
            });
          }
        });
      }
      
      setWeekHistory(weekData);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử tuần:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeWeekHistory = () => {
    setShowWeekHistory(false);
    setSelectedWeek(null);
    setWeekHistory([]);
  };

  const renderWeekHistoryModal = () => {
    if (!showWeekHistory) return null;
    
    return (
      <div className="week-history-modal">
        <div className="week-history-content">
          <div className="week-history-header">
            <h3>Chi tiết lịch sử tuần {selectedWeek}</h3>
            <button className="close-button" onClick={closeWeekHistory}>
              <X size={18} />
            </button>
          </div>
          
          <div className="week-history-body">
            {loadingHistory ? (
              <div className="loading-spinner">Đang tải dữ liệu...</div>
            ) : weekHistory.length === 0 ? (
              <div className="no-data-message">
                Không có dữ liệu chi tiết cho tuần này
              </div>
            ) : (
              <>
                <div className="history-table">
                  <div className="table-header">
                    <div className="table-cell">Ngày đo</div>
                    <div className="table-cell">HC (mm)</div>
                    <div className="table-cell">AC (mm)</div>
                    <div className="table-cell">FL (mm)</div>
                    <div className="table-cell">EFW (g)</div>
                  </div>
                  {weekHistory.map((record) => (
                    <div className="table-row" key={record.id}>
                      <div className="table-cell">{record.date}</div>
                      <div className="table-cell">{record.hc}</div>
                      <div className="table-cell">{record.ac}</div>
                      <div className="table-cell">{record.fl}</div>
                      <div className="table-cell">{record.efw}</div>
                    </div>
                  ))}
                </div>
                
                <div className="history-note">
                  <p>* Dữ liệu được sắp xếp theo thời gian gần nhất</p>
                </div>
              </>
            )}
          </div>
          
          <div className="week-history-footer">
            <button 
              className="action-button" 
              onClick={closeWeekHistory}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="chart-section">
      {selectedChild && (
        <div className="chart-controls">
          <WeeksFilter weeksToShow={weeksToShow} onWeeksChange={onWeeksChange} />
        </div>
      )}
      
      <div className="chart-container">
        {selectedChild ? (
          <Line data={getChartData()} options={chartOptions} height={300} />
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
      
      {selectedChild && renderWeekCalendar()}
      {renderWeekHistoryModal()}
    </div>
  );
};

GrowthChart.propTypes = {
  selectedChild: PropTypes.shape({
    foetusId: PropTypes.string,
    name: PropTypes.string,
  }),
  growthData: PropTypes.object,
  weeksToShow: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onWeeksChange: PropTypes.func,
};

export default GrowthChart; 