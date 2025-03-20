import React from 'react'

export const calculateAverages = (growthData) => {
  if (!Array.isArray(growthData) || growthData.length === 0) {
    return {
      hc: { avg: 0, min: 0, max: 0 },
      ac: { avg: 0, min: 0, max: 0 },
      fl: { avg: 0, min: 0, max: 0 },
      efw: { avg: 0, min: 0, max: 0 }
    }
  }

  const metrics = {
    hc: [],
    ac: [],
    fl: [],
    efw: []
  }

  // Thu thập tất cả các giá trị hợp lệ
  growthData.forEach(data => {
    if (data.hc?.value) metrics.hc.push(data.hc.value)
    if (data.ac?.value) metrics.ac.push(data.ac.value)
    if (data.fl?.value) metrics.fl.push(data.fl.value)
    if (data.efw?.value) metrics.efw.push(data.efw.value)
  })

  // Tính toán cho từng chỉ số
  const calculateStats = (values) => {
    if (values.length === 0) return { avg: 0, min: 0, max: 0 }
    
    const sum = values.reduce((acc, val) => acc + val, 0)
    return {
      avg: Number((sum / values.length).toFixed(1)),
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  return {
    hc: calculateStats(metrics.hc),
    ac: calculateStats(metrics.ac),
    fl: calculateStats(metrics.fl),
    efw: calculateStats(metrics.efw)
  }
}

export const renderStatsCard = (stats, title, unit = 'mm') => {
  return (
    <div className="stats-card">
      <h3>{title}</h3>
      <div className="stats-content">
        <div className="stat-item">
          <label>Trung bình:</label>
          <span>{stats.avg} {unit}</span>
        </div>
        <div className="stat-item">
          <label>Thấp nhất:</label>
          <span>{stats.min} {unit}</span>
        </div>
        <div className="stat-item">
          <label>Cao nhất:</label>
          <span>{stats.max} {unit}</span>
        </div>
      </div>
    </div>
  )
}

export const renderGrowthSummary = (growthData) => {
  const averages = calculateAverages(growthData)
  
  return (
    <div className="growth-summary">
      <h2>Tổng quan chỉ số</h2>
      <div className="stats-grid">
        {renderStatsCard(averages.hc, 'Chu vi đầu (HC)')}
        {renderStatsCard(averages.ac, 'Chu vi bụng (AC)')}
        {renderStatsCard(averages.fl, 'Chiều dài xương đùi (FL)')}
        {renderStatsCard(averages.efw, 'Cân nặng ước tính (EFW)', 'g')}
      </div>
      <div className="measurement-count">
        <p>Số lần đo: {growthData.length}</p>
        {growthData.length > 0 && (
          <p>
            Khoảng thời gian: Tuần {Math.min(...growthData.map(d => d.age))} - {Math.max(...growthData.map(d => d.age))}
          </p>
        )}
      </div>
    </div>
  )
} 