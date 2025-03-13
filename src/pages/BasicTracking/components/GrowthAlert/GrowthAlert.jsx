import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";
import "./GrowthAlert.scss";

const GrowthAlert = ({ isOpen, onClose, alertData }) => {
  if (!isOpen || !alertData) return null;

  const alerts = alertData.data?.alerts;
  if (!alerts) return null;

  const measurements = [
    { key: "AC", label: "AC (mm)" },
    { key: "HC", label: "HC (mm)" },
    { key: "FL", label: "FL (mm)" },
    { key: "EFW", label: "EFW (g)" }
  ];

  const alertItems = measurements
    .map(({ key, label }) => {
      const alert = alerts[key];
      if (!alert) return null;

      const value = alert.currentValue;
      const isNormal = alert.isAlert;

      return {
        label,
        value,
        isNormal,
        range: {
          min: alert.minRange,
          max: alert.maxRange
        },
        message: `${label} (${value}) ${isNormal ? 
          'đang trong' : 
          `${value < alert.minRange ? 'thấp hơn' : 'cao hơn'}`
        } khoảng an toàn (${alert.minRange}-${alert.maxRange})`
      };
    })
    .filter(Boolean);

  return (
    <AnimatePresence>
      <motion.div
        className="growth-alert-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="growth-alert-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="alert-header">
            <h3>Kết quả kiểm tra chỉ số</h3>
            <button onClick={onClose}>✕</button>
          </div>

          <div className="alert-body">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <motion.div
                  key={alert.label}
                  className={`alert-item ${
                    alert.isNormal ? "normal" : "warning"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="alert-icon">
                    {alert.isNormal ? (
                      <CheckCircle size={20} className="icon-success" />
                    ) : (
                      <AlertCircle size={20} className="icon-warning" />
                    )}
                  </div>
                  <div className="alert-content">
                    <h4>{alert.label}</h4>
                    <p>{alert.message}</p>
                    {!alert.isNormal && (
                      <div className="recommendation">
                        <p className="warning-text">
                          Cảnh báo: Chỉ số nằm ngoài khoảng an toàn!
                        </p>
                        <p className="advice-text">
                          Khuyến nghị: Tham khảo ý kiến bác sĩ để được tư vấn
                          chi tiết.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="no-alerts-message">
                <AlertCircle size={24} />
                <p>Không có dữ liệu cảnh báo</p>
              </div>
            )}
          </div>

          <div className="alert-footer">
            <button className="close-btn" onClick={onClose}>
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GrowthAlert;
