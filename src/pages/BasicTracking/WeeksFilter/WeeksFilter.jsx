import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react";
import "./WeeksFilter.scss";

const WeeksFilter = ({ weeksToShow, onWeeksChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const inputRef = useRef(null);
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      applyCustomValue();
    }
  };

  // Focus vào input khi chuyển sang chế độ tùy chỉnh
  useEffect(() => {
    if (isCustomMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCustomMode]);

  // Kiểm tra nếu giá trị weeksToShow hiện tại không phải là một trong các lựa chọn có sẵn
  useEffect(() => {
    if (
      weeksToShow !== 4 && 
      weeksToShow !== 8 && 
      weeksToShow !== 12 && 
      weeksToShow !== 16 && 
      weeksToShow !== "Tất cả"
    ) {
      setIsCustomMode(true);
      setCustomValue(weeksToShow.toString());
    }
  }, [weeksToShow]);

  return (
    <div className="weeks-filter-container">
      <motion.button
        className="weeks-filter-button"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Filter size={16} />
        <span>
          Hiển thị {weeksToShow === "Tất cả" ? "tất cả" : `${weeksToShow} tuần`}
        </span>
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
            <span>Chọn số tuần hiển thị</span>
          </div>
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
                  onKeyDown={handleKeyDown}
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
        </motion.div>
      )}
    </div>
  );
};

export default WeeksFilter; 