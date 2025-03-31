import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter, X, Calendar, Check, ArrowLeftRight } from "lucide-react";
import "./WeeksFilter.scss";

const WeeksFilter = ({ weeksToShow, onWeeksChange, weeksWithData = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [specificWeek, setSpecificWeek] = useState("12"); // Để nhập tuần cụ thể
  const [activeTab, setActiveTab] = useState("options"); // "options", "specific", "compare"
  const [selectedWeeks, setSelectedWeeks] = useState([]); // Lưu trữ các tuần được chọn để so sánh
  const inputRef = useRef(null);
  const specificInputRef = useRef(null);
  const weekOptions = [4, 8, 12, 16, "Tất cả", "Tùy chỉnh"];
  
  // Tạo danh sách tuần từ 12-40 cho chức năng so sánh
  const allWeeksOptions = Array.from({ length: 29 }, (_, i) => i + 12);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (weeks) => {
    if (weeks === "Tùy chỉnh") {
      // Khi chọn "Tùy chỉnh", reset các tùy chọn khác
      setIsCustomMode(true);
      setActiveTab("options");
      return;
    }
    
    // Khi chọn một tùy chọn khác, tắt chế độ tùy chỉnh
    onWeeksChange(weeks);
    setIsCustomMode(false);
    setIsOpen(false);
  };

  const handleCustomValueChange = (e) => {
    // Chỉ cho phép nhập số
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomValue(value);
  };

  const handleSpecificWeekChange = (e) => {
    // Chỉ cho phép nhập số từ 12-40
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '' || (parseInt(value) >= 12 && parseInt(value) <= 40)) {
      setSpecificWeek(value);
    }
  };

  const applyCustomValue = () => {
    if (customValue.trim() === "") {
      return;
    }

    const numValue = parseInt(customValue, 10);
    if (numValue > 0) {
      onWeeksChange(numValue);
      setIsOpen(false);
    }
  };

  const applySpecificWeek = () => {
    if (specificWeek.trim() === "") {
      return;
    }

    const weekNum = parseInt(specificWeek, 10);
    if (weekNum >= 12 && weekNum <= 40) {
      console.log("WeeksFilter: Áp dụng tuần cụ thể", weekNum);
      
      // Truyền một chuỗi "Tuần X" để GrowthChart biết đây là tuần cụ thể
      onWeeksChange(`Tuần ${weekNum}`);
      setIsOpen(false);
    }
  };

  // Xử lý chọn/bỏ chọn tuần để so sánh
  const toggleWeekSelection = (week) => {
    if (selectedWeeks.includes(week)) {
      // Nếu tuần đã được chọn, bỏ chọn
      setSelectedWeeks(selectedWeeks.filter(w => w !== week));
    } else {
      // Nếu tuần chưa được chọn và chưa đạt giới hạn, thêm vào
      if (selectedWeeks.length < 10) {
        setSelectedWeeks([...selectedWeeks, week]);
      }
    }
  };

  // Áp dụng các tuần đã chọn để so sánh
  const applyCompareWeeks = () => {
    if (selectedWeeks.length > 0) {
      // Truyền mảng các tuần đã chọn để so sánh
      console.log("WeeksFilter: So sánh các tuần", selectedWeeks);
      onWeeksChange({ type: 'compare', weeks: selectedWeeks });
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e, applyFunction) => {
    if (e.key === "Enter") {
      applyFunction();
    }
  };

  // Focus vào input khi chuyển sang chế độ tùy chỉnh
  useEffect(() => {
    if (isCustomMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustomMode]);

  // Focus vào input khi chuyển sang tab tuần cụ thể
  useEffect(() => {
    if (activeTab === "specific" && specificInputRef.current) {
      specificInputRef.current.focus();
    }
  }, [activeTab]);

  // Kiểm tra nếu giá trị weeksToShow hiện tại không phải là một trong các lựa chọn có sẵn
  useEffect(() => {
    // Nếu đang ở chế độ so sánh
    if (weeksToShow && typeof weeksToShow === 'object' && weeksToShow.type === 'compare') {
      setActiveTab("compare");
      setSelectedWeeks(weeksToShow.weeks || []);
      return;
    }
    
    // Nếu weeksToShow là mảng chỉ có 1 phần tử, giả định đó là tuần cụ thể
    if (Array.isArray(weeksToShow) && weeksToShow.length === 1) {
      setActiveTab("specific");
      setSpecificWeek(weeksToShow[0].toString());
      return;
    }

    // Xử lý các trường hợp khác
    if (
      weeksToShow !== 4 && 
      weeksToShow !== 8 && 
      weeksToShow !== 12 && 
      weeksToShow !== 16 && 
      weeksToShow !== "Tất cả" &&
      !Array.isArray(weeksToShow)
    ) {
      setActiveTab("options");
      setIsCustomMode(true);
      setCustomValue(weeksToShow.toString());
    }
  }, [weeksToShow]);

  // Hiển thị text trên nút filter
  const getButtonText = () => {
    console.log("WeeksFilter: Trạng thái hiện tại của weeksToShow", weeksToShow);
    
    // Nếu đang ở chế độ so sánh
    if (typeof weeksToShow === 'object' && weeksToShow.type === 'compare') {
      const weekList = weeksToShow.weeks.join(', ');
      return `So sánh tuần ${weekList}`;
    }
    
    // Nếu là tuần cụ thể (định dạng "Tuần X")
    if (typeof weeksToShow === 'string' && weeksToShow.startsWith('Tuần ')) {
      return weeksToShow;
    }
    
    // Nếu đang xem tuần cụ thể (mảng)
    if (Array.isArray(weeksToShow) && weeksToShow.length === 1) {
      return `Tuần ${weeksToShow[0]}`;
    }
    
    // Nếu đang ở chế độ tùy chỉnh
    if (isCustomMode) {
      return `Hiển thị ${customValue || weeksToShow} tuần`;
    }
    
    // Các trường hợp khác
    return `Hiển thị ${weeksToShow === "Tất cả" ? "tất cả" : `${weeksToShow} tuần`}`;
  };

  // Kiểm tra xem tuần nào đã có dữ liệu
  const hasDataForWeek = (week) => {
    return weeksWithData.includes(week);
  };

  return (
    <div className="weeks-filter-container">
      <motion.button
        className="weeks-filter-button"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Filter size={16} />
        <span>{getButtonText()}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? "rotate" : ""}`} />
      </motion.button>

      {isOpen && (
        <motion.div
          className="weeks-dropdown"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="dropdown-header">
            <span>Chọn tuần hiển thị</span>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <X size={14} />
            </button>
          </div>
          
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'options' ? 'active' : ''}`}
              onClick={() => setActiveTab('options')}
            >
              Số tuần
            </button>
            <button 
              className={`tab ${activeTab === 'specific' ? 'active' : ''}`}
              onClick={() => setActiveTab('specific')}
            >
              Tuần cụ thể
            </button>
            <button 
              className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              So sánh tuần
            </button>
          </div>
          
          {activeTab === 'options' && (
            <div className="options-container">
              {weekOptions.map((option, index) => {
                // Xác định trạng thái active của từng option
                const isActive = 
                  // Nếu option là Tùy chỉnh và đang ở chế độ tùy chỉnh
                  (option === "Tùy chỉnh" && isCustomMode) ||
                  // Hoặc option bằng với weeksToShow và không ở chế độ tùy chỉnh
                  (option === weeksToShow && !isCustomMode);
                
                return (
                  <motion.div
                    key={index}
                    className={`option ${isActive ? "active" : ""}`}
                    onClick={() => handleSelect(option)}
                    whileHover={{ backgroundColor: "rgba(255, 107, 129, 0.1)" }}
                  >
                    {option === "Tất cả" 
                      ? "Tất cả các tuần" 
                      : option === "Tùy chỉnh" 
                        ? "Tùy chỉnh số tuần" 
                        : `${option} tuần gần nhất`}
                    {isActive && <Check size={14} className="check-icon" />}
                  </motion.div>
                );
              })}

              {isCustomMode && (
                <div className="custom-input-container">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customValue}
                    onChange={handleCustomValueChange}
                    onKeyDown={(e) => handleKeyDown(e, applyCustomValue)}
                    placeholder="Nhập số tuần..."
                    className="custom-weeks-input"
                  />
                  <div className="custom-input-actions">
                    <button 
                      className="apply-button"
                      onClick={applyCustomValue}
                    >
                      Áp dụng
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => setIsCustomMode(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'specific' && (
            <div className="specific-week-container">
              <div className="specific-week-header">
                <Calendar size={16} />
                <span>Chọn tuần thai cụ thể để xem</span>
              </div>
              <div className="specific-week-input-container">
                <input
                  ref={specificInputRef}
                  type="number"
                  min="12"
                  max="40"
                  value={specificWeek}
                  onChange={handleSpecificWeekChange}
                  onKeyDown={(e) => handleKeyDown(e, applySpecificWeek)}
                  placeholder="Nhập tuần từ 12-40..."
                  className="specific-week-input"
                />
   
              </div>
              
              <div className="specific-week-note">
                * Chỉ hiển thị dữ liệu cho một tuần thai nhi cụ thể (từ 12-40 tuần).
              </div>
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="compare-weeks-container">
              <div className="compare-header">
                <ArrowLeftRight size={16} />
                <span>So sánh dữ liệu các tuần thai</span>
              </div>
              
              <div className="selection-info">
                <span>Chọn các tuần để so sánh ({selectedWeeks.length})</span>
              </div>
              
              <div className="week-selection-grid">
                {allWeeksOptions.map(week => (
                  <motion.div
                    key={week}
                    className={`week-option ${selectedWeeks.includes(week) ? 'selected' : ''} ${hasDataForWeek(week) ? 'has-data' : ''}`}
                    onClick={() => toggleWeekSelection(week)}
                    whileHover={{ backgroundColor: "rgba(255, 107, 129, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!selectedWeeks.includes(week) && selectedWeeks.length >= 10}
                  >
                    <span>Tuần {week}</span>
                    {selectedWeeks.includes(week) && <Check size={14} className="check-icon" />}
                    {hasDataForWeek(week) && <span className="data-indicator"></span>}
                  </motion.div>
                ))}
              </div>
              
              <div className="compare-note">
                <span>* Tuần có chấm xanh là tuần đã có dữ liệu</span>
              </div>
              
              <div className="compare-actions">
                <button 
                  className="apply-button"
                  onClick={applyCompareWeeks}
                  disabled={selectedWeeks.length === 0}
                >
                  So sánh các tuần đã chọn
                </button>
                <button 
                  className="reset-button"
                  onClick={() => setSelectedWeeks([])}
                  disabled={selectedWeeks.length === 0}
                >
                  Bỏ chọn tất cả
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WeeksFilter; 