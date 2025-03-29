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
            // Làm tròn giá trị đến 2 chữ số thập phân
            const roundedValue = parseFloat(originalValue).toFixed(2);
            return `${label}: ${roundedValue}`;
          }
          // Làm tròn giá trị raw đến 2 chữ số thập phân
          const roundedRaw = parseFloat(context.raw).toFixed(2);
          return `${label}: ${roundedRaw}`;
        },
        title: function(context) {
          // Hiển thị tiêu đề tooltip chi tiết hơn
          const title = context[0].label || '';
          const data = context[0].chart.data;
          
          if (data.datasets[0]?.originalData?.length > 0) {
            // Nếu có dữ liệu gốc, hiển thị giá trị gốc
            return title;
          }
          
          return title;
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
        maxRotation: 45, // Cho phép xoay nhãn để tránh chồng chéo
        minRotation: 0,
        autoSkip: true,
        autoSkipPadding: 10, // Thêm padding khi tự động bỏ qua nhãn
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
  const [chartConfig, setChartConfig] = useState({
    options: JSON.parse(JSON.stringify(chartOptions)),
    data: { labels: [], datasets: [] }
  });
  
  // Kiểm tra nếu đang ở chế độ so sánh
  const isCompareMode = typeof weeksToShow === 'object' && weeksToShow.type === 'compare';

  useEffect(() => {
    if (selectedChild?.foetusId) {
      fetchWeeksWithData(selectedChild.foetusId);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (selectedChild) {
      const { data, options } = prepareChartData();
      setChartConfig({ data, options });
    }
  }, [selectedChild, growthData, weeksToShow]);

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

  const prepareChartData = () => {
    // Khởi tạo biến lưu trữ tùy chọn biểu đồ
    const currentOptions = JSON.parse(JSON.stringify(chartOptions));
    let chartData = { labels: [], datasets: [] };
    
    console.log("GrowthChart - weeksToShow:", weeksToShow);
    
    if (!selectedChild || !growthData[selectedChild?.foetusId]) {
      console.log("Không có dữ liệu hoặc không có thai nhi được chọn");
      return { data: chartData, options: currentOptions };
    }

    const foetusData = growthData[selectedChild?.foetusId];
    if (!Array.isArray(foetusData) || foetusData.length === 0) {
      console.log("Không có dữ liệu tăng trưởng cho thai nhi");
      return { data: chartData, options: currentOptions };
    }
    
    console.log("Dữ liệu gốc:", foetusData);
    
    // Kiểm tra nếu đang ở chế độ so sánh
    const isCompareMode = typeof weeksToShow === 'object' && weeksToShow.type === 'compare';
    const isSpecificWeek = typeof weeksToShow === 'string' && weeksToShow.startsWith('Tuần ');
    
    // Phần code xử lý dữ liệu từ getChartData
    // Sắp xếp dữ liệu theo tuần tăng dần (thay vì tuần mới nhất trước)
    const sortedData = [...foetusData].sort((a, b) => {
      // Sắp xếp chính theo tuần tăng dần
      if (a.age !== b.age) return a.age - b.age;
      // Nếu cùng tuần, sắp xếp theo ngày đo mới nhất trước
      return new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate);
    });
    
    // Lọc ra các tuần khác nhau - lấy dữ liệu mới nhất cho mỗi tuần
    const uniqueWeeks = [];
    const processedWeeks = new Set();
    
    sortedData.forEach(data => {
      if (!processedWeeks.has(data.age) && data.age >= 12 && data.age <= 40) {
        uniqueWeeks.push(data);
        processedWeeks.add(data.age);
      }
    });
    
    // Sắp xếp lại theo tuần
    uniqueWeeks.sort((a, b) => a.age - b.age);
    
    // Lấy số tuần dựa theo filter được chọn
    let recentWeeks;
    
    // Chế độ so sánh nhiều tuần cụ thể
    if (typeof weeksToShow === 'object' && weeksToShow.type === 'compare' && Array.isArray(weeksToShow.weeks)) {
      console.log("Chế độ so sánh các tuần:", weeksToShow.weeks);
      
      const compareWeeks = weeksToShow.weeks;
      recentWeeks = [];
      
      // Thu thập dữ liệu cho mỗi tuần được chọn để so sánh
      compareWeeks.forEach(weekNum => {
        const weekData = foetusData.filter(data => Number(data.age) === weekNum);
        
        if (weekData.length > 0) {
          // Lấy bản ghi mới nhất cho mỗi tuần
          const latestData = weekData.sort((a, b) => 
            new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate))[0];
          
          recentWeeks.push(latestData);
        } else {
          console.warn(`Không tìm thấy dữ liệu cho tuần ${weekNum}`);
        }
      });
      
      // Sắp xếp lại theo thứ tự tăng dần của tuần
      recentWeeks.sort((a, b) => a.age - b.age);
      
      console.log("Dữ liệu so sánh đã thu thập:", recentWeeks);
      
      // Không cần chuẩn hóa dữ liệu khi so sánh các tuần
      currentOptions.scales.y.title.text = "Chỉ số (mm/g) - Giá trị thực";
      
      // Cập nhật tiêu đề
      const weeksList = compareWeeks.join(', ');
      currentOptions.plugins.title.text = `So sánh các tuần thai nhi: ${weeksList}`;
    }
    // Kiểm tra nếu là tuần cụ thể (định dạng "Tuần X")
    else if (typeof weeksToShow === 'string' && weeksToShow.startsWith('Tuần ')) {
      // Xử lý tuần cụ thể (giữ nguyên code)
      const weekNum = parseInt(weeksToShow.replace('Tuần ', ''), 10);
      console.log(`Đang lọc dữ liệu cho tuần cụ thể: ${weekNum}`);
      
      const weekData = foetusData.filter(data => Number(data.age) === weekNum);
      
      if (weekData.length === 0) {
        console.warn(`Không tìm thấy dữ liệu cho tuần ${weekNum}!`);
        
        const allWeeks = [...new Set(foetusData.map(d => Number(d.age)))].sort();
        console.log("Tất cả các tuần có dữ liệu:", allWeeks);
        
        if (allWeeks.length === 0) {
          return { data: chartData, options: currentOptions };
        }
        
        let closestWeek = allWeeks.reduce((prev, curr) => 
          Math.abs(curr - weekNum) < Math.abs(prev - weekNum) ? curr : prev, 
          allWeeks[0]);
        
        console.log(`Sử dụng tuần gần nhất có dữ liệu: ${closestWeek}`);
        
        recentWeeks = foetusData
          .filter(data => Number(data.age) === closestWeek);
      } else {
        recentWeeks = weekData;
        
        if (weekData.length > 1) {
          recentWeeks = weekData.sort((a, b) => 
            new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate));
          
          console.log(`Có ${weekData.length} điểm dữ liệu cho tuần ${weekNum}`);
        }
      }
    } else if (Array.isArray(weeksToShow)) {
      // Xử lý trường hợp mảng (giữ nguyên code)
      console.log("Lọc cho tuần cụ thể (mảng):", weeksToShow);
      
      const weekData = foetusData.filter(data => 
        weeksToShow.includes(Number(data.age)));
      
      if (weekData.length === 0) {
        console.warn(`Không tìm thấy dữ liệu cho tuần ${weeksToShow[0]}!`);
        
        const allWeeks = foetusData.map(d => Number(d.age));
        const targetWeek = Number(weeksToShow[0]);
        let closestWeek = allWeeks.reduce((prev, curr) => 
          Math.abs(curr - targetWeek) < Math.abs(prev - targetWeek) ? curr : prev, 
          allWeeks[0]);
        
        console.log(`Sử dụng tuần gần nhất có dữ liệu: ${closestWeek}`);
        
        recentWeeks = foetusData
          .filter(data => Number(data.age) === closestWeek)
          .sort((a, b) => new Date(b.date || b.measurementDate) - new Date(a.date || a.measurementDate))
          .slice(0, 1); // Lấy bản ghi mới nhất của tuần đó
      } else {
        recentWeeks = weekData;
      }
      
      console.log("Dữ liệu tuần được lọc:", recentWeeks);
    } else if (weeksToShow === "Tất cả") {
      // Khi xem tất cả các tuần, sử dụng mảng đã được sắp xếp theo tuần tăng dần
      recentWeeks = uniqueWeeks;
    } else {
      // Khi xem X tuần gần nhất, lấy X tuần cuối cùng từ dữ liệu đã sắp xếp theo tuần tăng dần
      // Lấy X tuần gần đây nhất (từ cao xuống thấp), sau đó sắp xếp lại theo tuần tăng dần để hiển thị
      const sortedByNewest = [...foetusData].sort((a, b) => b.age - a.age);
      const newestWeeks = [];
      const processedNewestWeeks = new Set();
      
      // Lấy X tuần gần nhất (mỗi tuần lấy 1 bản ghi mới nhất)
      sortedByNewest.forEach(data => {
        if (!processedNewestWeeks.has(data.age) && newestWeeks.length < Number(weeksToShow)) {
          newestWeeks.push(data);
          processedNewestWeeks.add(data.age);
        }
      });
      
      // Sắp xếp lại theo tuần tăng dần để hiển thị
      recentWeeks = newestWeeks.sort((a, b) => a.age - b.age);
    }
    
    // Vẫn không có dữ liệu sau khi lọc, trả về trống
    if (!recentWeeks || recentWeeks.length === 0) {
      console.warn("Không có dữ liệu nào phù hợp với bộ lọc!");
      return { data: chartData, options: currentOptions };
    }
    
    // Hàm xử lý giá trị bất thường
    const normalizeValue = (value, maxThreshold = 1000) => {
      if (!value) return 0;
      return value > maxThreshold ? maxThreshold : value;
    };

    // Tạo dữ liệu với hệ số chuẩn hóa phù hợp
    let hcData, acData, flData, efwData;
    
    // Sử dụng giá trị gốc để so sánh các tuần hoặc xem một tuần cụ thể
    if (isCompareMode || isSpecificWeek || (Array.isArray(weeksToShow) && weeksToShow.length === 1)) {
      // Khi xem một tuần cụ thể hoặc so sánh các tuần, sử dụng giá trị gốc
      hcData = recentWeeks.map(data => data.hc?.value || 0);
      acData = recentWeeks.map(data => data.ac?.value || 0);
      flData = recentWeeks.map(data => data.fl?.value || 0);
      efwData = recentWeeks.map(data => data.efw?.value || 0);
      
      // Nếu chỉ có một điểm dữ liệu và không phải ở chế độ so sánh, thêm một điểm nữa để tạo đường
      if (recentWeeks.length === 1 && !isCompareMode) {
        console.log("Chỉ có một điểm dữ liệu, thêm điểm thứ hai để tạo đường");
        
        // Tạo dữ liệu điểm thứ hai gần giống điểm thứ nhất
        const cloneFactor = 0.985; // Giảm 1.5% để tạo đường dốc nhẹ
        hcData.push(hcData[0] > 0 ? hcData[0] * cloneFactor : 0);
        acData.push(acData[0] > 0 ? acData[0] * cloneFactor : 0);
        flData.push(flData[0] > 0 ? flData[0] * cloneFactor : 0);
        efwData.push(efwData[0] > 0 ? efwData[0] * cloneFactor : 0);
        
        // Sao chép label tuần để có hai điểm cùng tuần
        recentWeeks.push({...recentWeeks[0], isClone: true, isHidden: true});
        
        // Điều chỉnh cấu hình hiển thị cho trường hợp chỉ một điểm dữ liệu
        currentOptions.plugins.tooltip.filter = function(tooltipItem) {
          // Lọc để chỉ hiển thị tooltip cho điểm dữ liệu thật, không hiển thị cho điểm nhân tạo
          return !recentWeeks[tooltipItem.dataIndex]?.isHidden;
        };
      }
      
      console.log("Dữ liệu giá trị gốc:", {
        hc: hcData,
        ac: acData,
        fl: flData,
        efw: efwData
      });
      
      // Cấu hình cho biểu đồ khi xem tuần cụ thể
      currentOptions.scales.y.title.text = "Chỉ số (mm/g) - Giá trị thực";
      
      // Điều chỉnh các tham số hiển thị cho phù hợp
      currentOptions.scales.y.ticks.callback = function(value) {
        // Làm tròn giá trị trục y đến 2 chữ số thập phân
        return parseFloat(value).toFixed(2);
      };
      
      // Điều chỉnh khoảng giá trị để dữ liệu hiển thị rõ ràng
      const maxValues = {
        hc: Math.max(...hcData.filter(v => v > 0)) * 1.2 || 500,
        ac: Math.max(...acData.filter(v => v > 0)) * 1.2 || 500,
        fl: Math.max(...flData.filter(v => v > 0)) * 1.2 || 200,
        efw: Math.max(...efwData.filter(v => v > 0)) * 1.2 || 4000
      };
      
      // Điều chỉnh thang đo Y để phù hợp với dữ liệu
      const overallMax = Math.max(maxValues.hc, maxValues.ac, maxValues.fl, maxValues.efw);
      currentOptions.scales.y.max = overallMax;
      
      console.log("Điều chỉnh cấu hình biểu đồ cho dữ liệu gốc:", {
        maxValues,
        overallMax
      });
    } else {
      // Khi xem nhiều tuần, hiển thị giá trị thực (không chuẩn hóa) để người dùng dễ đọc
      hcData = recentWeeks.map(data => data.hc?.value || 0);
      acData = recentWeeks.map(data => data.ac?.value || 0);
      flData = recentWeeks.map(data => data.fl?.value || 0);
      efwData = recentWeeks.map(data => data.efw?.value || 0);
      
      // Cấu hình cho biểu đồ khi xem nhiều tuần
      currentOptions.scales.y.title.text = "Chỉ số (mm/g) - Giá trị thực";
      
      // Điều chỉnh các tham số hiển thị cho phù hợp
      currentOptions.scales.y.ticks.callback = function(value) {
        // Làm tròn giá trị trục y đến 2 chữ số thập phân
        return parseFloat(value).toFixed(2);
      };
      
      // Điều chỉnh các giá trị tối đa cho phù hợp
      const maxValues = {
        hc: Math.max(...hcData) * 1.1 || 500,
        ac: Math.max(...acData) * 1.1 || 500,
        fl: Math.max(...flData) * 1.1 || 200,
        efw: Math.max(...efwData) * 1.1 || 4000
      };
      
      // Điều chỉnh thang đo Y để phù hợp với dữ liệu
      currentOptions.scales.y.max = Math.max(maxValues.hc, maxValues.ac, maxValues.fl, maxValues.efw);
    }

    // Lưu dữ liệu gốc
    const originalData = {
      hc: recentWeeks.map(data => data.hc?.value || 0),
      ac: recentWeeks.map(data => data.ac?.value || 0),
      fl: recentWeeks.map(data => data.fl?.value || 0),
      efw: recentWeeks.map(data => data.efw?.value || 0),
    };

    // Cập nhật title
    if (isSpecificWeek) {
      currentOptions.plugins.title.text = weeksToShow;
    } else if (Array.isArray(weeksToShow) && weeksToShow.length === 1) {
      currentOptions.plugins.title.text = `Biểu đồ tăng trưởng thai nhi (Tuần ${weeksToShow[0]})`;
    } else if (isCompareMode) {
      // Title đã được cập nhật ở trên
    } else {
      currentOptions.plugins.title.text = weeksToShow === "Tất cả" 
        ? "Biểu đồ tăng trưởng thai nhi (tất cả các tuần)" 
        : `Biểu đồ tăng trưởng thai nhi (${weeksToShow} tuần gần nhất)`;
    }
    
    // Thiết lập định dạng hiển thị số cho y-axis dựa vào giá trị cao nhất
    const maxEfwValue = Math.max(...efwData.filter(Boolean));
    if (maxEfwValue > 1000) {
      // Nếu có giá trị lớn, tùy chỉnh hiển thị số nguyên
      currentOptions.scales.y.ticks.callback = function(value) {
        // Với giá trị lớn, hiển thị số nguyên, không có thập phân
        if (value >= 1000) {
          return Math.round(value).toString();
        }
        // Với giá trị nhỏ, hiển thị tối đa 2 chữ số thập phân
        return parseFloat(value).toFixed(2);
      };
    }
    
    console.log("Dữ liệu biểu đồ cuối cùng:", {
      labels: recentWeeks.map(data => `T${data.age}`),
      hc: hcData,
      ac: acData,
      fl: flData,
      efw: efwData
    });

    // Tạo nhãn trục X chi tiết hơn cho biểu đồ
    const generateLabels = () => {
      // Kiểm tra xem có nhiều điểm dữ liệu cho cùng một tuần không
      const weekCounts = {};
      recentWeeks.forEach(data => {
        if (!data.isHidden) {
          weekCounts[data.age] = (weekCounts[data.age] || 0) + 1;
        }
      });
      
      // Nếu có tuần nào có nhiều hơn 1 điểm dữ liệu, thêm chi tiết ngày
      const hasMultiplePointsForWeek = Object.values(weekCounts).some(count => count > 1);
      
      if (hasMultiplePointsForWeek || (isSpecificWeek && recentWeeks.length > 1)) {
        // Thêm ngày vào nhãn, trừ khi là điểm nhân tạo
        return recentWeeks.map((data, index) => {
          if (data.isHidden || data.isClone) {
            // Đối với điểm nhân tạo, sử dụng nhãn trống hoặc ẩn đi
            return '';
          }
          
          const date = new Date(data.date || data.measurementDate);
          const formattedDate = date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit' 
          });
          return `T${data.age} (${formattedDate})`;
        });
      }
      
      // Trường hợp bình thường, chỉ hiển thị tuần
      return recentWeeks.map((data, index) => {
        if (data.isHidden || data.isClone) {
          return '';
        }
        return `T${data.age}`;
      });
    };
    
    const chartLabels = generateLabels();

    chartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "HC (mm)",
          data: hcData.map(val => parseFloat(parseFloat(val).toFixed(2))), // Làm tròn giá trị xuất ra
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          tension: isSpecificWeek || (Array.isArray(weeksToShow) && weeksToShow.length === 1) ? 0 : 0.3, // Không làm cong đường khi chỉ có một tuần
          pointRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 4), // Ẩn điểm nhân tạo
          pointHoverRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 6), // Ẩn điểm nhân tạo khi hover
          pointStyle: recentWeeks.map(data => data.isClone ? 'dash' : 'circle'), // Điểm nhân tạo có kiểu khác
          fill: false,
          originalData: originalData.hc,
        },
        {
          label: "AC (mm)",
          data: acData.map(val => parseFloat(parseFloat(val).toFixed(2))), // Làm tròn giá trị xuất ra
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          tension: isSpecificWeek || (Array.isArray(weeksToShow) && weeksToShow.length === 1) ? 0 : 0.3,
          pointRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 4),
          pointHoverRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 6),
          pointStyle: recentWeeks.map(data => data.isClone ? 'dash' : 'circle'),
          fill: false,
          originalData: originalData.ac,
        },
        {
          label: "FL (mm)",
          data: flData.map(val => parseFloat(parseFloat(val).toFixed(2))), // Làm tròn giá trị xuất ra
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
          tension: isSpecificWeek || (Array.isArray(weeksToShow) && weeksToShow.length === 1) ? 0 : 0.3,
          pointRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 4),
          pointHoverRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 6),
          pointStyle: recentWeeks.map(data => data.isClone ? 'dash' : 'circle'),
          fill: false,
          originalData: originalData.fl,
        },
        {
          label: "EFW (g)",
          data: efwData.map(val => parseFloat(parseFloat(val).toFixed(2))), // Làm tròn giá trị xuất ra
          borderColor: "rgb(153, 102, 255)",
          backgroundColor: "rgba(153, 102, 255, 0.5)",
          tension: isSpecificWeek || (Array.isArray(weeksToShow) && weeksToShow.length === 1) ? 0 : 0.3,
          pointRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 4),
          pointHoverRadius: recentWeeks.map(data => data.isHidden || data.isClone ? 0 : 6),
          pointStyle: recentWeeks.map(data => data.isClone ? 'dash' : 'circle'),
          fill: false,
          originalData: originalData.efw,
        },
      ],
    };
    
    return { data: chartData, options: currentOptions };
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
          <WeeksFilter 
            weeksToShow={weeksToShow} 
            onWeeksChange={onWeeksChange} 
            weeksWithData={weeksWithData}
          />
        </div>
      )}
      
      <div className="chart-container">
        {selectedChild ? (
          <Line data={chartConfig.data} options={chartConfig.options} height={300} />
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
  weeksToShow: PropTypes.oneOfType([
    PropTypes.string, 
    PropTypes.number,
    PropTypes.array
  ]),
  onWeeksChange: PropTypes.func,
};

export default GrowthChart; 