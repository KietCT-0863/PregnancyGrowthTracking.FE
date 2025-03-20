import { motion } from "framer-motion"
import { Info } from "lucide-react"
import "./StatSuggestion.scss"

const StatSuggestion = ({ value, standardRange, metric }) => {
  if (!standardRange || !standardRange[metric] || !standardRange[metric].median) {
    return null;
  }

  const getUnit = (metric) => {
    return metric === 'efw' ? 'g' : 'mm'
  }

  const isWithinRange = (value) => {
    if (!value || !standardRange[metric]) return null
    const numValue = parseFloat(value)
    return numValue >= standardRange[metric].min && numValue <= standardRange[metric].max
  }

  const getStatusColor = (value) => {
    const status = isWithinRange(value)
    if (status === null) return 'default'
    return status ? 'success' : 'warning'
  }

  const getPercentage = (value) => {
    if (!value) return null
    const numValue = parseFloat(value)
    const median = standardRange[metric].median
    if (!median || median === 0) return null
    
    const percentage = ((numValue - median) / median) * 100
    return percentage.toFixed(1)
  }

  // Tính toán các giá trị
  const status = isWithinRange(value);
  const percentage = getPercentage(value);

  const percentageText = (percentage) => {
    if (percentage === null) return ''
    if (percentage > 0) return `(+${percentage}% so với trung bình)`
    return `(${percentage}% so với trung bình)`
  }

  return (
    <motion.div
      className={`stat-suggestion ${getStatusColor(value)}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="suggestion-icon"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Info size={12} />
      </motion.div>
      <div className="suggestion-content">
        <span className="median">
          Chỉ số chuẩn: {standardRange[metric].median} {getUnit(metric)}
        </span>
        <span className="range">
          Khoảng cho phép: {standardRange[metric].min} - {standardRange[metric].max} {getUnit(metric)}
        </span>
        {value && (
          <span className={`status ${getStatusColor(value)}`}>
            {isWithinRange(value) 
              ? `✓ Trong khoảng chuẩn ${percentageText(percentage)}` 
              : `⚠ Ngoài khoảng chuẩn ${percentageText(percentage)}`}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default StatSuggestion 