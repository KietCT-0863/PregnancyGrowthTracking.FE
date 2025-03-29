import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Activity, AlertTriangle } from 'lucide-react'
import { fetchStandardRanges } from '../../utils/apiHandler'
import './WeeklyStatsChart.scss'

// Đăng ký các thành phần ChartJS cần thiết
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const WeeklyStatsChart = ({ age, childStats, onError }) => {
  const [loading, setLoading] = useState(false)
  const [standardRange, setStandardRange] = useState(null)
  const [chartData, setChartData] = useState(null)

  // Tên hiển thị chi tiết cho các chỉ số
  const metricLabels = {
    hc: 'Chu vi đầu (HC)',
    ac: 'Chu vi bụng (AC)',
    fl: 'Chiều dài xương đùi (FL)',
    efw: 'Cân nặng ước tính (EFW)'
  }

  // Lấy dữ liệu chuẩn khi tuổi thai thay đổi
  useEffect(() => {
    const getStandardRange = async () => {
      if (!age || age < 12 || age > 40) {
        setStandardRange(null)
        // Bỏ qua việc thông báo lỗi qua onError
        return
      }
      
      setLoading(true)
      try {
        const rangeData = await fetchStandardRanges(parseInt(age))
        setStandardRange(rangeData)
      } catch (error) {
        // Chỉ hiển thị lỗi khi không phải lỗi về phạm vi tuần thai
        if (onError && !error.message?.includes('Tuần thai')) onError('Không thể lấy dữ liệu chuẩn cho tuần thai này')
      } finally {
        setLoading(false)
      }
    }
    
    getStandardRange()
  }, [age, onError])

  // Chuẩn bị dữ liệu biểu đồ khi có dữ liệu chuẩn và dữ liệu của trẻ
  useEffect(() => {
    if (!standardRange) return
    
    // Chuẩn bị dữ liệu giá trị chuẩn
    const standardValues = [
      standardRange.hc.median,
      standardRange.ac.median,
      standardRange.fl.median,
      standardRange.efw.median
    ]
    
    // Chuẩn bị dữ liệu người dùng nhập
    const userValues = [
      childStats.hc || 0,
      childStats.ac || 0, 
      childStats.fl || 0,
      childStats.efw || 0
    ]
    
    // Chuẩn bị giá trị tỷ lệ phần trăm so với chuẩn
    const percentValues = standardValues.map((std, index) => {
      if (!std || !userValues[index]) return 0
      return Math.round((userValues[index] / std) * 100)
    })
    
    setChartData({
      labels: ['HC', 'AC', 'FL', 'EFW'],
      datasets: [
        {
          label: 'Chỉ số tiêu chuẩn (%)',
          data: [100, 100, 100, 100],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Chỉ số của bé (%)',
          data: percentValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          fill: false
        }
      ]
    })
  }, [standardRange, childStats])

  // Tùy chọn cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: 120,
        ticks: {
          stepSize: 20,
          callback: (value) => `${value}%`
        },
        title: {
          display: true,
          text: 'Phần trăm so với chỉ số chuẩn (%)',
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.raw || 0;
            const index = context.dataIndex;
            const metricKey = ['hc', 'ac', 'fl', 'efw'][index];
            
            if (context.datasetIndex === 0) {
              return `${datasetLabel}: 100% (${standardRange[metricKey].median} ${metricKey === 'efw' ? 'g' : 'mm'})`;
            } else {
              const actualValue = childStats[metricKey] || 0;
              return `${datasetLabel}: ${value}% (${actualValue} ${metricKey === 'efw' ? 'g' : 'mm'})`;
            }
          }
        }
      }
    }
  }

  // Kiểm tra nếu có ít nhất một chỉ số được nhập
  const hasValues = childStats && Object.values(childStats).some(value => !!value)

  if (loading) {
    return (
      <div className="weekly-stats-chart loading">
        <div className="loading-spinner">
          <Activity className="spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    )
  }

  if (!standardRange || !chartData) {
    return (
      <div className="weekly-stats-chart no-data">
        <AlertTriangle />
        <span>Không có dữ liệu chuẩn cho tuần thai này</span>
      </div>
    )
  }

  if (!hasValues) {
    return (
      <div className="weekly-stats-chart no-data">
        <Activity />
        <span>Vui lòng nhập ít nhất một chỉ số để xem biểu đồ</span>
      </div>
    )
  }

  return (
    <motion.div
      className="weekly-stats-chart"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="chart-header">
        <h3>Biểu đồ chỉ số tuần {age}</h3>
        <div className="chart-legend">
          <div className="legend-item standard">
            <div className="legend-color"></div>
            <span>Chỉ số tiêu chuẩn</span>
          </div>
          <div className="legend-item actual">
            <div className="legend-color"></div>
            <span>Chỉ số của bé</span>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="metric-details">
        {Object.keys(metricLabels).map(key => (
          <div className="metric-item" key={key}>
            <div className="metric-name">{metricLabels[key]}</div>
            <div className="metric-values">
              <div className="actual-value">
                Chỉ số: <strong>{childStats[key] || '-'} {key === 'efw' ? 'g' : 'mm'}</strong>
              </div>
              <div className="standard-value">
                Chuẩn: {standardRange[key].median} {key === 'efw' ? 'g' : 'mm'}
              </div>
              {childStats[key] && (
                <div className={`percentage ${
                  childStats[key] >= standardRange[key].min && childStats[key] <= standardRange[key].max
                    ? 'normal'
                    : 'abnormal'
                }`}>
                  {Math.round((childStats[key] / standardRange[key].median) * 100)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default WeeklyStatsChart 