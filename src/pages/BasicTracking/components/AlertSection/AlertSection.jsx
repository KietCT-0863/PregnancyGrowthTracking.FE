import { motion, AnimatePresence } from "framer-motion"
import { Bell, ChevronUp, ChevronDown, CheckCircle, Info } from "lucide-react"
import "./AlertSection.scss"

const AlertSection = ({
  alertHistory,
  alertsOpen,
  setAlertsOpen,
  setShowAlertHistory,
  alerts,
  selectedChild,
}) => {
  return (
    <div className="chart-alerts">
      <div className="alert-header">
        <h4>
          <motion.div
            animate={{
              scale: alertHistory.length > 0 ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: alertHistory.length > 0 ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            <Bell
              size={16}
              className={alertHistory.length > 0 ? "has-alerts" : ""}
              onClick={() => setShowAlertHistory(true)}
            />
          </motion.div>
          <span>Cảnh báo & Thông báo</span>
        </h4>
        <motion.button
          className="alert-toggle"
          onClick={() => setAlertsOpen(!alertsOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {alertsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {alertsOpen && (
          <motion.div
            className="alert-content open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedChild ? (
              alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    className={`alert-item ${alert.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="alert-icon"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: index * 0.2,
                      }}
                    >
                      {alert.icon}
                    </motion.div>
                    <div className="alert-text">
                      <h5 className="alert-title">{alert.title}</h5>
                      <p className="alert-description">{alert.description}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div className="no-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <CheckCircle size={24} />
                  </motion.div>
                  <p>Không có cảnh báo nào cho thai nhi này</p>
                </motion.div>
              )
            ) : (
              <motion.div className="no-alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Info size={24} />
                </motion.div>
                <p>Vui lòng chọn một thai nhi để xem cảnh báo</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AlertSection 