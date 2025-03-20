import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

// Hàm tạo cảnh báo từ dữ liệu hiện tại
export const generateCurrentAlerts = (currentData) => {
  const alerts = [];

  // Kiểm tra HC
  if (currentData.hc) {
    if (currentData.hc.isAlert) {
      alerts.push({
        type: "warning",
        title: "Cảnh báo HC",
        description: `Chu vi đầu (HC) hiện tại là ${currentData.hc.value}mm, nằm ngoài khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
        icon: React.createElement(AlertTriangle)
      });
    } else {
      alerts.push({
        type: "success",
        title: "HC trong mức bình thường",
        description: `Chu vi đầu (HC) đang phát triển tốt trong khoảng an toàn (${currentData.hc.minRange}-${currentData.hc.maxRange}mm).`,
        icon: React.createElement(CheckCircle)
      });
    }
  }

  // Kiểm tra AC
  if (currentData.ac) {
    if (currentData.ac.isAlert) {
      alerts.push({
        type: "warning",
        title: "Cảnh báo AC",
        description: `Chu vi bụng (AC) hiện tại là ${currentData.ac.value}mm, nằm ngoài khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
        icon: React.createElement(AlertTriangle)
      });
    } else {
      alerts.push({
        type: "success",
        title: "AC trong mức bình thường",
        description: `Chu vi bụng (AC) đang phát triển tốt trong khoảng an toàn (${currentData.ac.minRange}-${currentData.ac.maxRange}mm).`,
        icon: React.createElement(CheckCircle)
      });
    }
  }

  // Kiểm tra FL
  if (currentData.fl) {
    if (currentData.fl.isAlert) {
      alerts.push({
        type: "warning",
        title: "Cảnh báo FL",
        description: `Chiều dài xương đùi (FL) hiện tại là ${currentData.fl.value}mm, nằm ngoài khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
        icon: React.createElement(AlertTriangle)
      });
    } else {
      alerts.push({
        type: "success",
        title: "FL trong mức bình thường",
        description: `Chiều dài xương đùi (FL) đang phát triển tốt trong khoảng an toàn (${currentData.fl.minRange}-${currentData.fl.maxRange}mm).`,
        icon: React.createElement(CheckCircle)
      });
    }
  }

  // Kiểm tra EFW
  if (currentData.efw) {
    if (currentData.efw.isAlert) {
      alerts.push({
        type: "warning",
        title: "Cảnh báo cân nặng",
        description: `Cân nặng ước tính (EFW) hiện tại là ${currentData.efw.value}g, nằm ngoài khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
        icon: React.createElement(AlertTriangle)
      });
    } else {
      alerts.push({
        type: "success",
        title: "Cân nặng trong mức bình thường",
        description: `Cân nặng ước tính (EFW) đang phát triển tốt trong khoảng an toàn (${currentData.efw.minRange}-${currentData.efw.maxRange}g).`,
        icon: React.createElement(CheckCircle)
      });
    }
  }

  return alerts;
};

// Hàm phân tích xu hướng tăng trưởng
export const analyzeGrowthTrend = (foetusData) => {
  if (!foetusData || !Array.isArray(foetusData) || foetusData.length < 2) {
    return [];
  }

  const sortedData = [...foetusData].sort((a, b) => a.age - b.age);
  const trendAlerts = [];
  const lastTwoMeasurements = sortedData.slice(-2);

  analyzeMetric(lastTwoMeasurements, 'hc', 5, trendAlerts);
  analyzeMetric(lastTwoMeasurements, 'ac', 7, trendAlerts);
  analyzeMetric(lastTwoMeasurements, 'fl', 2, trendAlerts);
  analyzeEFW(lastTwoMeasurements, trendAlerts);

  return trendAlerts;
};

const analyzeMetric = (measurements, metric, expectedRate, alerts) => {
  if (measurements[0][metric]?.value && measurements[1][metric]?.value) {
    const growth = measurements[1][metric].value - measurements[0][metric].value;
    const weeksDiff = measurements[1].age - measurements[0].age;
    const growthRate = weeksDiff > 0 ? growth / weeksDiff : growth;
    
    const isLatestSafe = !measurements[1][metric].isAlert;
    const metricLabels = {
      hc: 'HC',
      ac: 'AC',
      fl: 'FL'
    };
    
    if (!isLatestSafe) {
      alerts.push({
        type: "danger",
        title: `Cảnh báo ${metricLabels[metric]}`,
        description: `${metricLabels[metric]} hiện tại (${measurements[1][metric].value}mm) nằm ngoài khoảng an toàn (${measurements[1][metric].minRange}-${measurements[1][metric].maxRange}mm).`,
        icon: React.createElement(AlertTriangle)
      });
    } else if (growthRate < expectedRate) {
      alerts.push({
        type: "warning",
        title: `Tăng trưởng ${metricLabels[metric]} chậm`,
        description: `${metricLabels[metric]} tăng ${growthRate.toFixed(1)}mm/tuần, thấp hơn mức kỳ vọng.`,
        icon: React.createElement(AlertCircle)
      });
    } else {
      alerts.push({
        type: "success",
        title: `Tăng trưởng ${metricLabels[metric]} bình thường`,
        description: `${metricLabels[metric]} tăng ${growthRate.toFixed(1)}mm/tuần, phù hợp với mức chuẩn.`,
        icon: React.createElement(CheckCircle)
      });
    }
  }
};

const analyzeEFW = (measurements, alerts) => {
  if (measurements[0].efw?.value && measurements[1].efw?.value) {
    const growth = measurements[1].efw.value - measurements[0].efw.value;
    const weeksDiff = measurements[1].age - measurements[0].age;
    const growthRate = weeksDiff > 0 ? growth / weeksDiff : growth;
    
    const isLatestSafe = !measurements[1].efw.isAlert;
    
    if (!isLatestSafe) {
      alerts.push({
        type: "danger",
        title: "Cảnh báo cân nặng",
        description: `Cân nặng hiện tại (${measurements[1].efw.value}g) nằm ngoài khoảng an toàn (${measurements[1].efw.minRange}-${measurements[1].efw.maxRange}g).`,
        icon: React.createElement(AlertTriangle)
      });
    } else {
      const currentAge = measurements[1].age;
      const expectedGrowthRate = currentAge < 20 ? 25 : currentAge < 30 ? 85 : 200;
      
      if (growthRate < expectedGrowthRate * 0.7) {
        alerts.push({
          type: "warning",
          title: "Tăng cân chậm",
          description: `Cân nặng tăng ${growthRate.toFixed(0)}g/tuần, thấp hơn mức kỳ vọng (${expectedGrowthRate}g/tuần) ở tuần ${currentAge}.`,
          icon: React.createElement(AlertCircle)
        });
      } else {
        alerts.push({
          type: "success",
          title: "Tăng cân bình thường",
          description: `Cân nặng tăng ${growthRate.toFixed(0)}g/tuần, phù hợp với mức chuẩn ở tuần ${currentAge}.`,
          icon: React.createElement(CheckCircle)
        });
      }
    }
  }
}; 