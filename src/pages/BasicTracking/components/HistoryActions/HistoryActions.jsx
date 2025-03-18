import React from "react";
import { motion } from "framer-motion";
import { Clock, FileText, Ruler } from "lucide-react";
import "./HistoryActions.scss";

const HistoryActions = ({ currentGrowthData, handleViewHistory, handleStatsUpdate, foetusId }) => {
  return (
    <div className="actions-container">
      {currentGrowthData && (
        <div className="history-section">
          <div className="last-updated">
            <Clock size={14} />
            <span>
              Cập nhật lần cuối:{" "}
              {new Date(
                currentGrowthData.measurementDate
              ).toLocaleDateString("vi-VN")}
            </span>
          </div>

          <motion.button
            className="view-history-button"
            onClick={() => handleViewHistory(foetusId)}
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
        onClick={() => handleStatsUpdate(foetusId)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Ruler size={16} />
        <span>Cập nhật chỉ số</span>
      </motion.button>
    </div>
  );
};

export default HistoryActions; 