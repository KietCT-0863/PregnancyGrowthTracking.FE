import { useState, useEffect } from 'react';
import { BarChart, CheckCircle, TrendingUp } from 'lucide-react';
import reminderService from '../../api/services/reminderService';
import './CalendarStats.scss';

const CalendarStats = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    completedEvents: 0,
    completionRate: 0,
    categoryCounts: {},
    loading: true
  });

  const categories = [
    { id: "Cuộc hẹn bác sĩ", label: "Cuộc hẹn bác sĩ", color: "#FF6B6B" },
    { id: "Uống thuốc", label: "Uống thuốc", color: "#4ECDC4" },
    { id: "Khám thai", label: "Khám thai", color: "#45B7D1" },
    { id: "Tập thể dục", label: "Tập thể dục", color: "#FFA07A" },
    { id: "Dinh dưỡng", label: "Dinh dưỡng", color: "#98D8C8" },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      // Lấy tất cả lịch nhắc nhở từ API
      const reminderHistory = await reminderService.getReminderHistory();
      
      if (!Array.isArray(reminderHistory)) {
        console.error('Dữ liệu lịch sử không hợp lệ:', reminderHistory);
        return;
      }
      
      // Lấy ngày hiện tại để so sánh
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian về đầu ngày để so sánh chính xác
      
      // Lọc chỉ lấy các sự kiện trong quá khứ
      const pastEvents = reminderHistory.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate < today;
      });
      
      // Tổng số lịch trình
      const totalEvents = reminderHistory.length;
      
      // Đánh dấu các sự kiện là hoàn thành nếu đã qua ngày đó
      // Với logic mới: Tất cả các sự kiện có ngày đã qua đều được coi là đã hoàn thành
      const completedEvents = pastEvents.length;
      
      // Tính tỉ lệ hoàn thành (dựa trên tổng số lịch trình)
      const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
      
      // Tính số lượng theo danh mục (tính trên tất cả các sự kiện, không chỉ sự kiện đã qua)
      const categoryCounts = {};
      categories.forEach(cat => {
        categoryCounts[cat.id] = reminderHistory.filter(
          event => event.reminderType === cat.id
        ).length;
      });
      
      setStats({
        totalEvents,
        completedEvents,
        completionRate,
        categoryCounts,
        loading: false
      });
      
    } catch (error) {
      console.error('Lỗi khi lấy thống kê lịch:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return <div className="calendar-stats-loading">Đang tải thống kê...</div>;
  }

  return (
    <div className="calendar-stats">
      <div className="stats-header">
        <div className="stats-icon">
          <BarChart size={20} />
        </div>
        <h4>Thống kê lịch trình</h4>
      </div>
      
      <div className="stats-summary">
        <div className="stat-item total">
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Tổng lịch trình</div>
        </div>
        <div className="stat-item completed">
          <div className="stat-value">
            <CheckCircle size={16} />
            {stats.completedEvents}
          </div>
          <div className="stat-label">Đã qua</div>
        </div>
      </div>
      
      <div className="completion-rate">
        <div className="rate-header">
          <div className="rate-icon">
            <TrendingUp size={14} />
          </div>
          <span>Tỉ lệ đã qua</span>
          <span className="rate-value">{stats.completionRate}%</span>
        </div>
        <div className="rate-progress">
          <div 
            className="rate-progress-bar" 
            style={{ width: `${stats.completionRate}%` }}
          ></div>
        </div>
      </div>
      
      <div className="category-stats">
        <h5>Theo danh mục</h5>
        {categories.map(category => {
          const count = stats.categoryCounts[category.id] || 0;
          const percentage = stats.totalEvents > 0 
            ? Math.round((count / stats.totalEvents) * 100) 
            : 0;
          
          return (
            <div key={category.id} className="category-stat-item">
              <div className="category-info">
                <div className="category-color" style={{ backgroundColor: category.color }}></div>
                <span className="category-name">{category.label}</span>
                <span className="category-count">{count}</span>
              </div>
              {count > 0 && (
                <div className="category-progress">
                  <div 
                    className="category-progress-bar" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: category.color 
                    }}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarStats; 