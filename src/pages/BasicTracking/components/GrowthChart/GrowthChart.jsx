import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import { BarChart2 } from "lucide-react";
import PropTypes from "prop-types";
import WeeksFilter from "../../WeeksFilter/WeeksFilter";
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