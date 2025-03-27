import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter, X, Calendar } from "lucide-react";
import "./WeeksFilter.scss";

const WeeksFilter = ({ weeksToShow, onWeeksChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [specificWeek, setSpecificWeek] = useState("12"); // Để nhập tuần cụ thể
  const [activeTab, setActiveTab] = useState("options"); // "options", "specific"
  const inputRef = useRef(null);
  const specificInputRef = useRef(null);
  const weekOptions = [4, 8, 12, 16, "Tất cả", "Tùy chỉnh"];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (weeks) => {
    if (weeks === "Tùy chỉnh") {
      setIsCustomMode(true);
      return;
    }
    
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
    
    // Nếu là tuần cụ thể (định dạng "Tuần X")
    if (typeof weeksToShow === 'string' && weeksToShow.startsWith('Tuần ')) {
      return weeksToShow;
    }
    
    // Nếu đang xem tuần cụ thể (mảng)
    if (Array.isArray(weeksToShow) && weeksToShow.length === 1) {
      return `Tuần ${weeksToShow[0]}`;
    }
    
    // Các trường hợp khác
    return `Hiển thị ${weeksToShow === "Tất cả" ? "tất cả" : `${weeksToShow} tuần`}`;
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
          </div>
          
          {activeTab === 'options' && (
            <div className="options-container">
              {weekOptions.map((option, index) => (
                <motion.div
                  key={index}
                  className={`option ${
                    option === weeksToShow || 
                    (option === "Tùy chỉnh" && isCustomMode) 
                      ? "active" 
                      : ""
                  }`}
                  onClick={() => handleSelect(option)}
                  whileHover={{ backgroundColor: "rgba(255, 107, 129, 0.1)" }}
                >
                  {option === "Tất cả" 
                    ? "Tất cả các tuần" 
                    : option === "Tùy chỉnh" 
                      ? "Tùy chỉnh số tuần" 
                      : `${option} tuần gần nhất`}
                </motion.div>
              ))}

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
                <button 
                  className="apply-button"
                  onClick={applySpecificWeek}
                >
                  Áp dụng
                </button>
              </div>
              <div className="specific-week-note">
                Chỉ hiển thị dữ liệu của tuần {specificWeek}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WeeksFilter; 