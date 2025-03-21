import { motion, AnimatePresence } from "framer-motion"
import { Bell, ChevronUp, ChevronDown } from "lucide-react"
import { renderAlertContent, renderEmptyState } from "../../utils/notificationHandler"
import "./AlertSection.scss"
import { useState } from "react"
import PropTypes from 'prop-types'

const AlertSection = ({
  alertHistory = [],
  alertsOpen,
  setAlertsOpen,
  alerts = [],
  selectedChild,
}) => {
  // Sử dụng state nội bộ khi props không được cung cấp
  const [internalAlertsOpen, setInternalAlertsOpen] = useState(false)
  
  // Sử dụng props nếu được cung cấp, ngược lại sử dụng state nội bộ
  const isAlertsOpen = alertsOpen !== undefined ? alertsOpen : internalAlertsOpen
  const handleToggleAlerts = () => {
    if (setAlertsOpen) {
      setAlertsOpen(!isAlertsOpen)
    } else {
      setInternalAlertsOpen(!isAlertsOpen)
    }
  }

  const hasNewAlerts = alertHistory && alertHistory.length > 0

  return (
    <div className="chart-alerts compact">
      <div className="alert-header">
        <h4>
          <motion.div
            animate={{
              scale: hasNewAlerts ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 1.5,
              repeat: hasNewAlerts ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
            }}
          >
            <Bell
              size={16}
              className={hasNewAlerts ? "has-alerts" : ""}
            />
          </motion.div>
          <span>Cảnh báo & Thông báo</span>
          {hasNewAlerts && (
            <motion.span 
              className="alert-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              {alertHistory.length}
            </motion.span>
          )}
        </h4>
        <motion.button
          className="alert-toggle"
          onClick={handleToggleAlerts}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAlertsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {isAlertsOpen && (
          <motion.div
            className="alert-content open"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", maxHeight: "200px" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="alert-scroll-container">
              {selectedChild ? (
                alerts && alerts.length > 0 ? (
                  alerts.map((alert, index) => renderAlertContent(alert, index))
                ) : (
                  renderEmptyState(selectedChild)
                )
              ) : (
                renderEmptyState(selectedChild)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

AlertSection.propTypes = {
  alertHistory: PropTypes.array,
  alertsOpen: PropTypes.bool,
  setAlertsOpen: PropTypes.func,
  alerts: PropTypes.array,
  selectedChild: PropTypes.object
}

export default AlertSection 