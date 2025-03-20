import React from 'react'
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react"

export const getAlertIcon = (type) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle size={16} />
    case 'success':
      return <CheckCircle size={16} />
    case 'danger':
      return <AlertTriangle size={16} className="danger" />
    case 'info':
      return <Info size={16} />
    default:
      return <AlertCircle size={16} />
  }
}

export const getAlertClass = (type) => {
  switch (type) {
    case 'warning':
      return 'alert-warning'
    case 'success':
      return 'alert-success'
    case 'danger':
      return 'alert-danger'
    case 'info':
      return 'alert-info'
    default:
      return 'alert-default'
  }
}

export const renderAlertContent = (alert, index) => {
  return (
    <motion.div
      key={index}
      className={`alert-item ${getAlertClass(alert.type)}`}
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
        {alert.icon || getAlertIcon(alert.type)}
      </motion.div>
      <div className="alert-text">
        <h5 className="alert-title">{alert.title}</h5>
        <p className="alert-description">{alert.description}</p>
        {alert.timestamp && (
          <span className="alert-timestamp">
            {new Date(alert.timestamp).toLocaleString('vi-VN')}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export const renderEmptyState = (selectedChild) => {
  if (!selectedChild) {
    return (
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
    )
  }

  return (
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
} 