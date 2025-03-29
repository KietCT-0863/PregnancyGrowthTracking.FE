import { Modal, Tabs, Select, Slider, Button, Tooltip } from 'antd';
import { motion } from "framer-motion";
import { SearchOutlined, InfoCircleOutlined, FilterOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import { useState, useMemo } from 'react';
import "./MetricsGuideModal.scss";

const { TabPane } = Tabs;
const { Option } = Select;

const MetricsGuideModal = ({ isOpen, onClose }) => {
  // States for filtering
  const [activeTab, setActiveTab] = useState("1");
  const [weekRange, setWeekRange] = useState([12, 40]);
  const [showFilters, setShowFilters] = useState(false);
  // State cho tuần thai được chọn để hiển thị chi tiết
  const [selectedWeek, setSelectedWeek] = useState(20);
  // State cho loại chỉ số đã chọn trong phần gợi ý blog
  const [selectedMetricType, setSelectedMetricType] = useState("all");
  // State cho loại độ lệch đã chọn
  const [selectedDeviationType, setSelectedDeviationType] = useState("all");

  // Dữ liệu chỉ số thai kỳ theo tuần
  const weeklyGrowthData = [
    { tuanThai: 12, hc: { min: 63, max: 77, median: 70, lech: "±7" }, ac: { min: 50.4, max: 61.6, median: 56, lech: "±5.6" }, fl: { min: 7.2, max: 8.8, median: 8, lech: "±0.8" }, efw: { min: 12.6, max: 15.4, median: 14, lech: "±1.4" } },
    { tuanThai: 13, hc: { min: 75.6, max: 92.4, median: 84, lech: "±8.4" }, ac: { min: 62.1, max: 75.9, median: 69, lech: "±6.9" }, fl: { min: 9.9, max: 12.1, median: 11, lech: "±1.1" }, efw: { min: 20.7, max: 25.3, median: 23, lech: "±2.3" } },
    { tuanThai: 14, hc: { min: 88.2, max: 107.8, median: 98, lech: "±9.8" }, ac: { min: 72.9, max: 89.1, median: 81, lech: "±8.1" }, fl: { min: 13.5, max: 16.5, median: 15, lech: "±1.5" }, efw: { min: 37.8, max: 46.2, median: 42, lech: "±4.2" } },
    { tuanThai: 15, hc: { min: 99.9, max: 122.1, median: 111, lech: "±11.1" }, ac: { min: 83.7, max: 102.3, median: 93, lech: "±9.3" }, fl: { min: 16.2, max: 19.8, median: 18, lech: "±1.8" }, efw: { min: 63, max: 77, median: 70, lech: "±7" } },
    { tuanThai: 16, hc: { min: 111.6, max: 136.4, median: 124, lech: "±12.4" }, ac: { min: 94.5, max: 115.5, median: 105, lech: "±10.5" }, fl: { min: 18.9, max: 23.1, median: 21, lech: "±2.1" }, efw: { min: 90, max: 110, median: 100, lech: "±10" } },
    { tuanThai: 17, hc: { min: 123.3, max: 150.7, median: 137, lech: "±13.7" }, ac: { min: 105.3, max: 128.7, median: 117, lech: "±11.7" }, fl: { min: 21.6, max: 26.4, median: 24, lech: "±2.4" }, efw: { min: 126, max: 154, median: 140, lech: "±14" } },
    { tuanThai: 18, hc: { min: 135, max: 165, median: 150, lech: "±15" }, ac: { min: 116.1, max: 141.9, median: 129, lech: "±12.9" }, fl: { min: 24.3, max: 29.7, median: 27, lech: "±2.7" }, efw: { min: 171, max: 209, median: 190, lech: "±19" } },
    { tuanThai: 19, hc: { min: 145.8, max: 178.2, median: 162, lech: "±16.2" }, ac: { min: 126.9, max: 155.1, median: 141, lech: "±14.1" }, fl: { min: 27, max: 33, median: 30, lech: "±3" }, efw: { min: 216, max: 264, median: 240, lech: "±24" } },
    { tuanThai: 20, hc: { min: 157.5, max: 192.5, median: 175, lech: "±17.5" }, ac: { min: 136.8, max: 167.2, median: 152, lech: "±15.2" }, fl: { min: 29.7, max: 36.3, median: 33, lech: "±3.3" }, efw: { min: 270, max: 330, median: 300, lech: "±30" } },
    { tuanThai: 21, hc: { min: 168.3, max: 205.7, median: 187, lech: "±18.7" }, ac: { min: 147.6, max: 180.4, median: 164, lech: "±16.4" }, fl: { min: 32.4, max: 39.6, median: 36, lech: "±3.6" }, efw: { min: 324, max: 396, median: 360, lech: "±36" } },
    { tuanThai: 22, hc: { min: 178.2, max: 217.8, median: 198, lech: "±19.8" }, ac: { min: 157.5, max: 192.5, median: 175, lech: "±17.5" }, fl: { min: 35.1, max: 42.9, median: 39, lech: "±3.9" }, efw: { min: 387, max: 473, median: 430, lech: "±43" } },
    { tuanThai: 23, hc: { min: 189, max: 231, median: 210, lech: "±21" }, ac: { min: 167.4, max: 204.6, median: 186, lech: "±18.6" }, fl: { min: 37.8, max: 46.2, median: 42, lech: "±4.2" }, efw: { min: 450.9, max: 551.1, median: 501, lech: "±50.1" } },
    { tuanThai: 24, hc: { min: 198.9, max: 243.1, median: 221, lech: "±22.1" }, ac: { min: 177.3, max: 216.7, median: 197, lech: "±19.7" }, fl: { min: 39.6, max: 48.4, median: 44, lech: "±4.4" }, efw: { min: 540, max: 660, median: 600, lech: "±60" } },
    { tuanThai: 25, hc: { min: 208.8, max: 255.2, median: 232, lech: "±23.2" }, ac: { min: 187.2, max: 228.8, median: 208, lech: "±20.8" }, fl: { min: 42.3, max: 51.7, median: 47, lech: "±4.7" }, efw: { min: 594, max: 726, median: 660, lech: "±66" } },
    { tuanThai: 26, hc: { min: 217.8, max: 266.2, median: 242, lech: "±24.2" }, ac: { min: 197.1, max: 240.9, median: 219, lech: "±21.9" }, fl: { min: 44.1, max: 53.9, median: 49, lech: "±4.9" }, efw: { min: 684, max: 836, median: 760, lech: "±76" } },
    { tuanThai: 27, hc: { min: 226.8, max: 277.2, median: 252, lech: "±25.2" }, ac: { min: 206.1, max: 251.9, median: 229, lech: "±22.9" }, fl: { min: 46.8, max: 57.2, median: 52, lech: "±5.2" }, efw: { min: 787.5, max: 962.5, median: 875, lech: "±87.5" } },
    { tuanThai: 28, hc: { min: 235.8, max: 288.2, median: 262, lech: "±26.2" }, ac: { min: 216, max: 264, median: 240, lech: "±24" }, fl: { min: 48.6, max: 59.4, median: 54, lech: "±5.4" }, efw: { min: 904.5, max: 1105.5, median: 1005, lech: "±100.5" } },
    { tuanThai: 29, hc: { min: 243.9, max: 298.1, median: 271, lech: "±27.1" }, ac: { min: 225, max: 275, median: 250, lech: "±25" }, fl: { min: 50.4, max: 61.6, median: 56, lech: "±5.6" }, efw: { min: 1037.7, max: 1268.3, median: 1153, lech: "±115.3" } },
    { tuanThai: 30, hc: { min: 252, max: 308, median: 280, lech: "±28" }, ac: { min: 234, max: 286, median: 260, lech: "±26" }, fl: { min: 53.1, max: 64.9, median: 59, lech: "±5.9" }, efw: { min: 1187.1, max: 1450.9, median: 1319, lech: "±131.9" } },
    { tuanThai: 31, hc: { min: 259.2, max: 316.8, median: 288, lech: "±28.8" }, ac: { min: 243, max: 297, median: 270, lech: "±27" }, fl: { min: 54.9, max: 67.1, median: 61, lech: "±6.1" }, efw: { min: 1351.8, max: 1652.2, median: 1502, lech: "±150.2" } },
    { tuanThai: 32, hc: { min: 266.4, max: 325.6, median: 296, lech: "±29.6" }, ac: { min: 252, max: 308, median: 280, lech: "±28" }, fl: { min: 56.7, max: 69.3, median: 63, lech: "±6.3" }, efw: { min: 1531.8, max: 1872.2, median: 1702, lech: "±170.2" } },
    { tuanThai: 33, hc: { min: 273.6, max: 334.4, median: 304, lech: "±30.4" }, ac: { min: 261, max: 319, median: 290, lech: "±29" }, fl: { min: 58.5, max: 71.5, median: 65, lech: "±6.5" }, efw: { min: 1726.2, max: 2109.8, median: 1918, lech: "±191.8" } },
    { tuanThai: 34, hc: { min: 279.9, max: 342.1, median: 311, lech: "±31.1" }, ac: { min: 269.1, max: 328.9, median: 299, lech: "±29.9" }, fl: { min: 60.3, max: 73.7, median: 67, lech: "±6.7" }, efw: { min: 1931.4, max: 2360.6, median: 2146, lech: "±214.6" } },
    { tuanThai: 35, hc: { min: 286.2, max: 349.8, median: 318, lech: "±31.8" }, ac: { min: 278.1, max: 339.9, median: 309, lech: "±30.9" }, fl: { min: 61.2, max: 74.8, median: 68, lech: "±6.8" }, efw: { min: 2144.7, max: 2621.3, median: 2383, lech: "±238.3" } },
    { tuanThai: 36, hc: { min: 291.6, max: 356.4, median: 324, lech: "±32.4" }, ac: { min: 286.2, max: 349.8, median: 318, lech: "±31.8" }, fl: { min: 63, max: 77, median: 70, lech: "±7" }, efw: { min: 2359.8, max: 2884.2, median: 2622, lech: "±262.2" } },
    { tuanThai: 37, hc: { min: 297, max: 363, median: 330, lech: "±33" }, ac: { min: 294.3, max: 359.7, median: 327, lech: "±32.7" }, fl: { min: 64.8, max: 79.2, median: 72, lech: "±7.2" }, efw: { min: 2573.1, max: 3144.9, median: 2859, lech: "±285.9" } },
    { tuanThai: 38, hc: { min: 301.5, max: 368.5, median: 335, lech: "±33.5" }, ac: { min: 302.4, max: 369.6, median: 336, lech: "±33.6" }, fl: { min: 65.7, max: 80.3, median: 73, lech: "±7.3" }, efw: { min: 2774.7, max: 3391.3, median: 3083, lech: "±308.3" } },
    { tuanThai: 39, hc: { min: 306, max: 374, median: 340, lech: "±34" }, ac: { min: 310.5, max: 379.5, median: 345, lech: "±34.5" }, fl: { min: 67.5, max: 82.5, median: 75, lech: "±7.5" }, efw: { min: 2959.2, max: 3616.8, median: 3288, lech: "±328.8" } },
    { tuanThai: 40, hc: { min: 309.6, max: 378.4, median: 344, lech: "±34.4" }, ac: { min: 318.6, max: 389.4, median: 354, lech: "±35.4" }, fl: { min: 68.4, max: 83.6, median: 76, lech: "±7.6" }, efw: { min: 3115.8, max: 3808.2, median: 3462, lech: "±346.2" } },
  ];

  // Dữ liệu về mức độ chênh lệch
  const deviationLevelsData = [
    {
      metric: "HC (Chu vi đầu)",
      lowLevel: "Lệch ±5mm so với mức chuẩn",
      mediumLevel: "Lệch ±6-10mm",
      highLevel: "Lệch >10mm (nguy cơ bất thường não)",
    },
    {
      metric: "AC (Chu vi bụng)",
      lowLevel: "Lệch ±5-7mm",
      mediumLevel: "Lệch ±8-15mm",
      highLevel: "Lệch >15mm (nguy cơ đái đường, tiểu đường thai kỳ)",
    },
    {
      metric: "FL (Chiều dài xương đùi)",
      lowLevel: "Lệch ±2mm",
      mediumLevel: "Lệch ±3-5mm",
      highLevel: "Lệch >5mm (nguy cơ rối loạn tăng trưởng)",
    },
    {
      metric: "EFW (Cân nặng ước tính)",
      lowLevel: "Lệch ±100g",
      mediumLevel: "Lệch ±100-300g",
      highLevel: "Lệch >300g (nguy cơ thai quá nhỏ hoặc quá to)",
    },
  ];

  // Gợi ý về ý nghĩa các chỉ số
  const metricsExplanation = [
    {
      metric: "HC (Chu vi đầu)",
      explanation: "Đánh giá phát triển não bộ và kích thước đầu thai nhi. Chênh lệch lớn có thể là dấu hiệu của các vấn đề về phát triển thần kinh.",
    },
    {
      metric: "AC (Chu vi bụng)",
      explanation: "Phản ánh kích thước gan, thận và ruột. Chỉ số này giúp đánh giá tình trạng dinh dưỡng và dự đoán cân nặng thai.",
    },
    {
      metric: "FL (Chiều dài xương đùi)",
      explanation: "Đánh giá chiều dài xương và sự phát triển hệ cơ xương. Có thể giúp phát hiện một số dị tật di truyền.",
    },
    {
      metric: "EFW (Cân nặng ước tính)",
      explanation: "Ước tính cân nặng hiện tại của thai nhi. Giúp đánh giá tốc độ tăng trưởng và phát hiện thai nhỏ hoặc thai to.",
    },
  ];

  // Các giai đoạn thai kỳ
  const thaiKyStages = [
    { label: "Tam cá nguyệt đầu (12-13 tuần)", range: [12, 13] },
    { label: "Tam cá nguyệt giữa (14-27 tuần)", range: [14, 27] },
    { label: "Tam cá nguyệt cuối (28-40 tuần)", range: [28, 40] },
  ];

  // Hàm xác định class CSS dựa vào độ lệch
  const getDeviationClass = (lechValue) => {
    // Lấy giá trị số từ chuỗi (loại bỏ dấu ±)
    const numValue = parseFloat(lechValue.replace('±', ''));
    
    // Phân loại theo giá trị
    if (numValue <= 10) return 'deviation-low';
    if (numValue <= 30) return 'deviation-medium';
    return 'deviation-high';
  };

  // Lọc dữ liệu theo khoảng tuần thai đã chọn
  const filteredWeeklyData = useMemo(() => {
    return weeklyGrowthData.filter(
      week => week.tuanThai >= weekRange[0] && week.tuanThai <= weekRange[1]
    );
  }, [weeklyGrowthData, weekRange]);

  // Lấy dữ liệu cho tuần thai đã chọn
  const selectedWeekData = useMemo(() => {
    return weeklyGrowthData.find(week => week.tuanThai === selectedWeek) || null;
  }, [selectedWeek, weeklyGrowthData]);

  // Xử lý thay đổi tab
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Xử lý chọn giai đoạn thai kỳ
  const handleStageSelect = (value) => {
    const stage = thaiKyStages.find(stage => stage.label === value);
    if (stage) {
      setWeekRange(stage.range);
    }
  };

  // Reset bộ lọc
  const resetFilters = () => {
    setWeekRange([12, 40]);
  };

  // Xử lý thay đổi tuần thai được chọn
  const handleWeekChange = (value) => {
    setSelectedWeek(value);
  };

  // Xử lý thay đổi loại chỉ số được chọn trong phần gợi ý blog
  const handleMetricTypeChange = (value) => {
    setSelectedMetricType(value);
  };

  // Xử lý thay đổi loại độ lệch được chọn
  const handleDeviationTypeChange = (value) => {
    setSelectedDeviationType(value);
  };

  // Dữ liệu gợi ý bài blog theo từng loại chỉ số và mức độ lệch
  const blogSuggestions = [
    {
      metricType: "hc",
      deviationType: "low",
      title: "Chu vi đầu (HC) nhỏ hơn bình thường - Nguyên nhân và giải pháp",
      content: "Chu vi đầu thai nhi nhỏ hơn bình thường có thể là dấu hiệu của một số tình trạng cần lưu ý. Tìm hiểu các nguyên nhân từ dinh dưỡng đến di truyền và các biện pháp theo dõi phù hợp.",
      categories: ["Phát triển thai nhi", "Xét nghiệm & siêu âm", "Sức khỏe thai kỳ"],
      tags: ["HC thấp", "Phát triển não", "Dinh dưỡng"]
    },
    {
      metricType: "hc",
      deviationType: "high",
      title: "Khi chu vi đầu thai nhi (HC) lớn hơn bình thường - Những điều cần biết",
      content: "Chỉ số HC cao hơn bình thường thường gây lo lắng cho các mẹ bầu. Tìm hiểu các nguyên nhân phổ biến, các vấn đề cần theo dõi và khi nào bạn nên tham khảo ý kiến bác sĩ.",
      categories: ["Phát triển thai nhi", "Xét nghiệm & siêu âm", "Sức khỏe thai kỳ"],
      tags: ["HC cao", "Đầu to", "Phát triển não"]
    },
    {
      metricType: "ac",
      deviationType: "low",
      title: "Thai nhi có chu vi bụng (AC) nhỏ - Cách bổ sung dinh dưỡng hiệu quả",
      content: "Chu vi bụng thai nhi nhỏ hơn bình thường có thể liên quan đến chế độ dinh dưỡng. Bài viết chia sẻ thực đơn dinh dưỡng giàu protein và cách kết hợp thực phẩm tăng cường phát triển cho thai nhi.",
      categories: ["Dinh dưỡng mẹ bầu", "Phát triển thai nhi", "Xét nghiệm & siêu âm"],
      tags: ["AC thấp", "Dinh dưỡng", "Thai nhỏ tháng"]
    },
    {
      metricType: "ac",
      deviationType: "high",
      title: "Chu vi bụng (AC) thai nhi cao - Dấu hiệu cảnh báo tiểu đường thai kỳ",
      content: "Chỉ số AC cao thường liên quan đến việc tích tụ mỡ ở bụng thai nhi. Tìm hiểu mối liên hệ với tiểu đường thai kỳ, cách kiểm soát đường huyết và chế độ ăn phù hợp để duy trì lượng đường ổn định.",
      categories: ["Bệnh lý thai kỳ", "Dinh dưỡng mẹ bầu", "Xét nghiệm & siêu âm"],
      tags: ["AC cao", "Tiểu đường thai kỳ", "Chế độ ăn"]
    },
    {
      metricType: "fl",
      deviationType: "low",
      title: "Xương đùi (FL) ngắn hơn chuẩn - Khi nào cần lo lắng?",
      content: "Chiều dài xương đùi thấp hơn bình thường có thể chỉ là đặc điểm di truyền hoặc do yếu tố sắc tộc. Bài viết giúp phân biệt khi nào đây chỉ là đặc điểm bình thường và khi nào nên thăm khám chuyên sâu.",
      categories: ["Phát triển thai nhi", "Xét nghiệm & siêu âm", "Triệu chứng thai kỳ"],
      tags: ["FL thấp", "Xương khớp", "Siêu âm 3D/4D"]
    },
    {
      metricType: "fl",
      deviationType: "high",
      title: "Chiều dài xương đùi (FL) lớn hơn chuẩn - Thai nhi khỏe mạnh phát triển tốt",
      content: "Xương đùi dài hơn mức trung bình thường là dấu hiệu tốt, cho thấy thai nhi phát triển khỏe mạnh. Tìm hiểu các yếu tố tác động tích cực và chế độ dinh dưỡng tối ưu cho xương khớp thai nhi.",
      categories: ["Phát triển thai nhi", "Dinh dưỡng mẹ bầu", "Xét nghiệm & siêu âm"],
      tags: ["FL cao", "Canxi", "Phát triển xương"]
    },
    {
      metricType: "efw",
      deviationType: "low",
      title: "Thai nhẹ cân (EFW thấp) - Phương pháp tăng cân an toàn cho thai nhi",
      content: "Cân nặng ước tính thấp có thể gây lo lắng cho thai phụ. Bài viết cung cấp phương pháp tăng cân an toàn thông qua dinh dưỡng hợp lý và các loại thực phẩm nên bổ sung trong từng giai đoạn thai kỳ.",
      categories: ["Dinh dưỡng mẹ bầu", "Phát triển thai nhi", "Bệnh lý thai kỳ"],
      tags: ["EFW thấp", "Thai nhẹ cân", "Dinh dưỡng thai kỳ"]
    },
    {
      metricType: "efw",
      deviationType: "high",
      title: "Cảnh báo với thai to (EFW cao) - Phòng ngừa biến chứng khi sinh",
      content: "Thai có cân nặng ước tính cao có thể gây ra các biến chứng khi sinh. Tìm hiểu cách theo dõi, chế độ dinh dưỡng phù hợp và các phương pháp sinh an toàn cho cả mẹ và bé.",
      categories: ["Sinh thường & sinh mổ", "Bệnh lý thai kỳ", "Dinh dưỡng mẹ bầu"],
      tags: ["EFW cao", "Thai to", "Chuẩn bị sinh"]
    },
    {
      metricType: "all",
      deviationType: "combined",
      title: "Hiểu đúng về biểu đồ tăng trưởng thai nhi và các chỉ số siêu âm",
      content: "Hướng dẫn đọc hiểu biểu đồ tăng trưởng thai nhi, ý nghĩa của từng chỉ số HC, AC, FL, EFW và cách phân tích kết quả siêu âm để đánh giá toàn diện sức khỏe thai nhi.",
      categories: ["Xét nghiệm & siêu âm", "Phát triển thai nhi", "Lịch khám thai"],
      tags: ["Biểu đồ tăng trưởng", "Siêu âm", "Đọc kết quả"]
    },
    {
      metricType: "all",
      deviationType: "low",
      title: "Khi thai nhỏ hơn chuẩn (SGA) - Những việc cần làm ngay",
      content: "Thai phát triển chậm hơn so với chuẩn cần được theo dõi đặc biệt. Bài viết cung cấp thông tin về chế độ dinh dưỡng, lịch khám thai và các biện pháp hỗ trợ thai nhi phát triển tốt hơn.",
      categories: ["Phát triển thai nhi", "Bệnh lý thai kỳ", "Dinh dưỡng mẹ bầu"],
      tags: ["Thai chậm phát triển", "SGA", "Thai yếu"]
    },
    {
      metricType: "all",
      deviationType: "high",
      title: "Thai phát triển nhanh hơn chuẩn (LGA) - Lợi ích và rủi ro",
      content: "Thai phát triển nhanh hơn bình thường không phải lúc nào cũng tốt. Tìm hiểu ngưỡng an toàn, nguyên nhân và cách chuẩn bị cho quá trình chuyển dạ với thai to.",
      categories: ["Phát triển thai nhi", "Sinh thường & sinh mổ", "Bệnh lý thai kỳ"],
      tags: ["Thai to", "LGA", "Biến chứng sinh"]
    },
  ];

  // Lọc gợi ý bài blog dựa trên chỉ số và độ lệch đã chọn
  const filteredBlogSuggestions = useMemo(() => {
    if (selectedMetricType === "all" && selectedDeviationType === "all") {
      return blogSuggestions;
    }
    
    return blogSuggestions.filter(blog => {
      const matchMetric = selectedMetricType === "all" || blog.metricType === selectedMetricType || blog.metricType === "all";
      const matchDeviation = selectedDeviationType === "all" || blog.deviationType === selectedDeviationType || blog.deviationType === "combined";
      
      return matchMetric && matchDeviation;
    });
  }, [selectedMetricType, selectedDeviationType, blogSuggestions]);

  return (
    <Modal
      title={
        <div className="metrics-guide-title">
          <SearchOutlined style={{ color: '#ff6b81', marginRight: '10px' }} />
          <span>Bảng chỉ số thai kỳ & Gợi ý đọc</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      className="metrics-guide-modal"
      destroyOnClose
    >
      <div className="metrics-guide-content">
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="metrics-tabs">
          <TabPane tab="Bảng chỉ số thai kỳ" key="1">
            <div className="filter-controls">
              <Button 
                type="text" 
                icon={<FilterOutlined />} 
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-btn"
              >
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </Button>
              
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="filter-options"
                >
                  <div className="filter-row">
                    <div className="filter-item">
                      <label>Giai đoạn thai kỳ:</label>
                      <Select 
                        defaultValue="Tất cả các tuần" 
                        style={{ width: 250 }} 
                        onChange={handleStageSelect}
                      >
                        <Option value="Tất cả các tuần">Tất cả các tuần (12-40)</Option>
                        {thaiKyStages.map((stage, index) => (
                          <Option key={index} value={stage.label}>
                            {stage.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="filter-item">
                      <label>Chọn khoảng tuần thai cụ thể:</label>
                      <Slider
                        range
                        min={12}
                        max={40}
                        value={weekRange}
                        onChange={setWeekRange}
                        className="week-slider"
                      />
                      <div className="week-range-display">
                        Tuần {weekRange[0]} - Tuần {weekRange[1]}
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={resetFilters}
                      className="reset-btn"
                    >
                      Đặt lại
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="section"
            >
              <h2>
                Bảng chỉ số thai kỳ chuẩn
                <Tooltip title="Khoảng cho phép được tính xấp xỉ bằng chỉ số chuẩn (median) ± 10% của giá trị chuẩn đó">
                  <InfoCircleOutlined className="info-icon" />
                </Tooltip>
              </h2>
              <p className="description">
                {filteredWeeklyData.length > 0 
                  ? `Hiển thị chỉ số từ tuần ${filteredWeeklyData[0].tuanThai} đến tuần ${filteredWeeklyData[filteredWeeklyData.length - 1].tuanThai}. Tổng cộng: ${filteredWeeklyData.length} tuần.`
                  : "Không có dữ liệu cho khoảng tuần thai đã chọn."
                }
              </p>
              
              <div className="metrics-standard-table">
                <table className="full-metrics-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">Tuần</th>
                      <th colSpan="3">HC (mm)</th>
                      <th colSpan="3">AC (mm)</th>
                      <th colSpan="3">FL (mm)</th>
                      <th colSpan="3">EFW (g)</th>
                    </tr>
                    <tr>
                      <th>Khoảng cho phép</th>
                      <th>HC Chuẩn</th>
                      <th>HC Lệch</th>
                      <th>Khoảng cho phép</th>
                      <th>AC Chuẩn</th>
                      <th>AC Lệch</th>
                      <th>Khoảng cho phép</th>
                      <th>FL Chuẩn</th>
                      <th>FL Lệch</th>
                      <th>Khoảng cho phép</th>
                      <th>EFW Chuẩn</th>
                      <th>EFW Lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeeklyData.length > 0 ? (
                      filteredWeeklyData.map((week) => (
                        <tr key={week.tuanThai}>
                          <td className="week-number">{week.tuanThai}</td>
                          <td>{week.hc.min}-{week.hc.max}</td>
                          <td>{week.hc.median}</td>
                          <td>{week.hc.lech}</td>
                          <td>{week.ac.min}-{week.ac.max}</td>
                          <td>{week.ac.median}</td>
                          <td>{week.ac.lech}</td>
                          <td>{week.fl.min}-{week.fl.max}</td>
                          <td>{week.fl.median}</td>
                          <td>{week.fl.lech}</td>
                          <td>{week.efw.min}-{week.efw.max}</td>
                          <td>{week.efw.median}</td>
                          <td>{week.efw.lech}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="13" className="no-data">Không có dữ liệu cho khoảng tuần thai đã chọn</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="table-legend">
                <p>
                  <strong>HC:</strong> Chu vi đầu (head circumference) - <strong>AC:</strong> Chu vi bụng (abdominal circumference)
                  <br />
                  <strong>FL:</strong> Chiều dài xương đùi (femur length) - <strong>EFW:</strong> Cân nặng ước tính (estimated fetal weight)
                </p>
              </div>
            </motion.div>
          </TabPane>
          
          <TabPane tab="Mức độ chênh lệch" key="2">
            <div className="filter-controls">
              <Button 
                type="text" 
                icon={<FilterOutlined />} 
                onClick={() => setShowFilters(!showFilters)}
                className="filter-toggle-btn"
              >
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </Button>
              
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="filter-options"
                >
                  <div className="filter-row">
                    <div className="filter-item">
                      <label>Giai đoạn thai kỳ:</label>
                      <Select 
                        defaultValue="Tất cả các tuần" 
                        style={{ width: 250 }} 
                        onChange={handleStageSelect}
                      >
                        <Option value="Tất cả các tuần">Tất cả các tuần (12-40)</Option>
                        {thaiKyStages.map((stage, index) => (
                          <Option key={index} value={stage.label}>
                            {stage.label}
                          </Option>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="filter-item">
                      <label>Chọn khoảng tuần thai cụ thể:</label>
                      <Slider
                        range
                        min={12}
                        max={40}
                        value={weekRange}
                        onChange={setWeekRange}
                        className="week-slider"
                      />
                      <div className="week-range-display">
                        Tuần {weekRange[0]} - Tuần {weekRange[1]}
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={resetFilters}
                      className="reset-btn"
                    >
                      Đặt lại
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="section"
            >
              <div className="week-selector-container">
                <h2>Mức độ chênh lệch và ý nghĩa lâm sàng</h2>
                <div className="week-selector">
                  <label>Chọn tuần thai cụ thể:</label>
                  <Select 
                    value={selectedWeek}
                    style={{ width: 120 }} 
                    onChange={handleWeekChange}
                  >
                    {weeklyGrowthData.map((week) => (
                      <Option key={week.tuanThai} value={week.tuanThai}>
                        Tuần {week.tuanThai}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
              
              {selectedWeekData && (
                <div className="selected-week-info">
                  <h3>Chỉ số chuẩn và độ lệch cho tuần {selectedWeek}</h3>
                  <table className="selected-week-table">
                    <thead>
                      <tr>
                        <th>Chỉ số</th>
                        <th>Giá trị chuẩn</th>
                        <th>Khoảng cho phép</th>
                        <th>Độ lệch</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="metric-name">HC (Chu vi đầu)</td>
                        <td>{selectedWeekData.hc.median} mm</td>
                        <td>{selectedWeekData.hc.min} - {selectedWeekData.hc.max} mm</td>
                        <td className={getDeviationClass(selectedWeekData.hc.lech)}>{selectedWeekData.hc.lech}</td>
                      </tr>
                      <tr>
                        <td className="metric-name">AC (Chu vi bụng)</td>
                        <td>{selectedWeekData.ac.median} mm</td>
                        <td>{selectedWeekData.ac.min} - {selectedWeekData.ac.max} mm</td>
                        <td className={getDeviationClass(selectedWeekData.ac.lech)}>{selectedWeekData.ac.lech}</td>
                      </tr>
                      <tr>
                        <td className="metric-name">FL (Chiều dài xương đùi)</td>
                        <td>{selectedWeekData.fl.median} mm</td>
                        <td>{selectedWeekData.fl.min} - {selectedWeekData.fl.max} mm</td>
                        <td className={getDeviationClass(selectedWeekData.fl.lech)}>{selectedWeekData.fl.lech}</td>
                      </tr>
                      <tr>
                        <td className="metric-name">EFW (Cân nặng ước tính)</td>
                        <td>{selectedWeekData.efw.median} g</td>
                        <td>{selectedWeekData.efw.min} - {selectedWeekData.efw.max} g</td>
                        <td className={getDeviationClass(selectedWeekData.efw.lech)}>{selectedWeekData.efw.lech}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="deviation-explanation">
                <h3>Mức độ chênh lệch theo loại chỉ số</h3>
                <table className="deviation-levels-table">
                  <thead>
                    <tr>
                      <th>Chỉ số</th>
                      <th>Mức nhẹ<br/>(Trung tính, có thể tự điều chỉnh)</th>
                      <th>Mức cần theo dõi<br/>(Nên hỏi bác sĩ)</th>
                      <th>Mức đáng lo ngại<br/>(Cần khám ngay)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviationLevelsData.map((item, index) => (
                      <tr key={index}>
                        <td className="metric-name">{item.metric}</td>
                        <td>{item.lowLevel}</td>
                        <td>{item.mediumLevel}</td>
                        <td>{item.highLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="table-legend">
                <div className="deviation-legend">
                  <span className="legend-item">
                    <span className="color-box deviation-low"></span>
                    <span>Mức lệch nhẹ</span>
                  </span>
                  <span className="legend-item">
                    <span className="color-box deviation-medium"></span>
                    <span>Mức lệch trung bình</span>
                  </span>
                  <span className="legend-item">
                    <span className="color-box deviation-high"></span>
                    <span>Mức lệch cao ({'>'}10mm cho HC, {'>'}15mm cho AC, {'>'}5mm cho FL, {'>'}300g cho EFW)</span>
                  </span>
                </div>
              </div>
              
              <div className="deviation-range-table">
                <h3>Bảng độ lệch chi tiết theo tuần</h3>
                <table className="full-deviation-table">
                  <thead>
                    <tr>
                      <th rowSpan="2">Tuần</th>
                      <th colSpan="2">HC (mm)</th>
                      <th colSpan="2">AC (mm)</th>
                      <th colSpan="2">FL (mm)</th>
                      <th colSpan="2">EFW (g)</th>
                    </tr>
                    <tr>
                      <th>HC Chuẩn</th>
                      <th>HC Lệch</th>
                      <th>AC Chuẩn</th>
                      <th>AC Lệch</th>
                      <th>FL Chuẩn</th>
                      <th>FL Lệch</th>
                      <th>EFW Chuẩn</th>
                      <th>EFW Lệch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWeeklyData.length > 0 ? (
                      filteredWeeklyData.map((week) => (
                        <tr key={week.tuanThai} className={week.tuanThai === selectedWeek ? 'highlight-row' : ''}>
                          <td className="week-number">{week.tuanThai}</td>
                          <td>{week.hc.median}</td>
                          <td className={getDeviationClass(week.hc.lech)}>{week.hc.lech}</td>
                          <td>{week.ac.median}</td>
                          <td className={getDeviationClass(week.ac.lech)}>{week.ac.lech}</td>
                          <td>{week.fl.median}</td>
                          <td className={getDeviationClass(week.fl.lech)}>{week.fl.lech}</td>
                          <td>{week.efw.median}</td>
                          <td className={getDeviationClass(week.efw.lech)}>{week.efw.lech}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data">Không có dữ liệu cho khoảng tuần thai đã chọn</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </TabPane>
          
          <TabPane tab="Ý nghĩa chỉ số" key="3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="section"
            >
              <h2>Giải thích ý nghĩa các chỉ số</h2>
              <div className="metrics-explanation">
                {metricsExplanation.map((item, index) => (
                  <div key={index} className="metric-card">
                    <h3>{item.metric}</h3>
                    <p>{item.explanation}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </TabPane>
          
          <TabPane tab="Gợi ý bài blog" key="4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="section"
            >
              <div className="filter-controls">
                <Button 
                  type="text" 
                  icon={<FilterOutlined />} 
                  onClick={() => setShowFilters(!showFilters)}
                  className="filter-toggle-btn"
                >
                  {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </Button>
                
                {showFilters && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="filter-options"
                  >
                    <div className="filter-row">
                      <div className="filter-item">
                        <label>Lọc theo chỉ số:</label>
                        <Select 
                          defaultValue="all" 
                          style={{ width: 250 }} 
                          onChange={handleMetricTypeChange}
                          value={selectedMetricType}
                        >
                          <Option value="all">Tất cả các chỉ số</Option>
                          <Option value="hc">HC (Chu vi đầu)</Option>
                          <Option value="ac">AC (Chu vi bụng)</Option>
                          <Option value="fl">FL (Chiều dài xương đùi)</Option>
                          <Option value="efw">EFW (Cân nặng ước tính)</Option>
                        </Select>
                      </div>
                      
                      <div className="filter-item">
                        <label>Lọc theo độ lệch:</label>
                        <Select 
                          defaultValue="all" 
                          style={{ width: 250 }} 
                          onChange={handleDeviationTypeChange}
                          value={selectedDeviationType}
                        >
                          <Option value="all">Tất cả độ lệch</Option>
                          <Option value="low">Chỉ số thấp</Option>
                          <Option value="high">Chỉ số cao</Option>
                          <Option value="combined">Tổng hợp</Option>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <h2>Gợi ý bài viết theo độ lệch chỉ số</h2>
              <p className="description">
                Danh sách các bài viết liên quan đến chỉ số phát triển thai nhi và ý nghĩa của các chỉ số khi cao hơn hoặc thấp hơn mức chuẩn.
                {selectedMetricType !== "all" && ` Đang hiển thị các bài viết liên quan đến chỉ số ${selectedMetricType.toUpperCase()}.`}
                {selectedDeviationType !== "all" && ` Các bài viết tập trung vào trường hợp chỉ số ${selectedDeviationType === "low" ? "thấp" : selectedDeviationType === "high" ? "cao" : "tổng hợp"}.`}
              </p>
              
              <div className="blog-suggestions-container">
                {filteredBlogSuggestions.length > 0 ? (
                  filteredBlogSuggestions.map((blog, index) => (
                    <div key={index} className="blog-suggestion-card">
                      <h3 className="blog-title">{blog.title}</h3>
                      <p className="blog-content">{blog.content}</p>
                      
                      <div className="blog-meta">
                        <div className="blog-categories">
                          {blog.categories.map((category, idx) => (
                            <span key={idx} className="blog-category">
                              {category}
                            </span>
                          ))}
                        </div>
                        
                        <div className="blog-tags">
                          {blog.tags.map((tag, idx) => (
                            <span key={idx} className="blog-tag">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-blog-suggestions">
                    <p>Không tìm thấy bài viết phù hợp với bộ lọc đã chọn.</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="disclaimer">
              <strong>Lưu ý quan trọng về gợi ý bài viết:</strong> 
              <p>Các bài viết được gợi ý trên đây chỉ mang tính chất tham khảo và nên được đọc kết hợp với tư vấn từ bác sĩ. Độ lệch của các chỉ số nên được đánh giá bởi chuyên gia y tế có kinh nghiệm để có hướng xử lý phù hợp nhất.</p>
            </div>
          </TabPane>
        </Tabs>
        
        <div className="disclaimer">
          <strong>Lưu ý quan trọng:</strong> 
          <ol>
            <li>Khoảng cho phép (minRange-maxRange) được tính xấp xỉ bằng chỉ số chuẩn (median) ± 10% của giá trị chuẩn đó</li>
            <li>Độ lệch của mỗi chỉ số nhìn chung tăng dần theo tuần thai, tỷ lệ với kích thước và cân nặng của thai nhi</li>
            <li>Mỗi chỉ số đều có khoảng dao động khoảng ±10% so với giá trị chuẩn</li>
            <li>Các chỉ số này được sử dụng để đánh giá sự phát triển của thai nhi, với khoảng cho phép dao động trong một biên độ nhất định xung quanh giá trị trung bình chuẩn</li>
          </ol>
          <p>Thông tin này chỉ mang tính chất tham khảo. Luôn tham khảo ý kiến của bác sĩ chuyên khoa sản về kết quả siêu âm và chỉ số phát triển của thai nhi.</p>
        </div>
      </div>
    </Modal>
  );
};

MetricsGuideModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};  

export default MetricsGuideModal; 