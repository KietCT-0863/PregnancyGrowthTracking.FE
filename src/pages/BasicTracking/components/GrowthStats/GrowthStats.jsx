import React from "react";
import { motion } from "framer-motion";
import { Ruler, Heart, Scale, Activity, BarChart2 } from "lucide-react";
import "./GrowthStats.scss";

const GrowthStats = ({ tempStats, currentGrowthData, handleInputChange }) => {
  return (
    <div className="stats-container">
      <div className="stats-title">
        <BarChart2 size={16} />
        <span>Chỉ số phát triển</span>
      </div>
      
      <div className="stats-grid">
        <StatItem 
          icon={<Ruler size={16} />}
          label="HC"
          value={tempStats?.hc !== undefined ? tempStats.hc : currentGrowthData?.hc || ""}
          onChange={(e) => handleInputChange("hc", e.target.value)}
          unit="mm"
        />
        
        <StatItem 
          icon={<Heart size={16} />}
          label="AC"
          value={tempStats?.ac !== undefined ? tempStats.ac : currentGrowthData?.ac || ""}
          onChange={(e) => handleInputChange("ac", e.target.value)}
          unit="mm"
        />
        
        <StatItem 
          icon={<Scale size={16} />}
          label="FL"
          value={tempStats?.fl !== undefined ? tempStats.fl : currentGrowthData?.fl || ""}
          onChange={(e) => handleInputChange("fl", e.target.value)}
          unit="mm"
        />
        
        <StatItem 
          icon={<Activity size={16} />}
          label="EFW"
          value={tempStats?.efw !== undefined ? tempStats.efw : currentGrowthData?.efw || ""}
          onChange={(e) => handleInputChange("efw", e.target.value)}
          unit="g"
        />
      </div>
    </div>
  );
};

const StatItem = ({ icon, label, value, onChange, unit }) => {
  return (
    <motion.div
      className="stat-item"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="stat-header">
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-input">
        <input
          type="number"
          value={value}
          onChange={onChange}
          min="0"
          placeholder={`Nhập ${label}`}
        />
        <span className="stat-unit">{unit}</span>
      </div>
    </motion.div>
  );
};

export default GrowthStats; 