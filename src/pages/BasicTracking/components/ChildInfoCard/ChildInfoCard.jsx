import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, History, Baby, RefreshCw, User, Circle, TrendingUp, AlertTriangle, FileText, CheckCircle, Info } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { Modal, Table } from 'antd';
import "./ChildInfoCard.scss";
import { fetchStandardRanges } from '../../utils/apiHandler'
import { getAuthToken } from '../../utils/apiHandler'
import { format } from 'date-fns'
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

dayjs.extend(relativeTime);
dayjs.locale('vi');

// Add this handler for week change
const handleWeekChange = (foetusId, weekNumber, handleInputChange) => {
  // Kiểm tra tuần thai có hợp lệ không
  const weekNum = parseInt(weekNumber);
  const isValidWeek = weekNum >= 12 && weekNum <= 40;
  
  // Luôn cập nhật giá trị để người dùng có thể thấy những gì họ đã nhập
  handleInputChange(foetusId, "age", weekNumber);
  
  // Hiển thị cảnh báo nếu tuần thai không hợp lệ
  if (weekNumber && !isValidWeek) {
    toast.warning(
      <div>
        <h4>Tuần thai không hợp lệ</h4>
        <p>Tuần thai {weekNum} không nằm trong phạm vi hợp lệ.</p>
        <p>Chỉ được nhập tuần thai từ <strong>12</strong> đến <strong>40</strong>.</p>
      </div>,
      {
        position: "top-right",
        autoClose: 3000,
      }
    );
  }
};

const ChildInfoCard = ({
  selectedChild,
  growthData,
  tempStats,
  handleInputChange,
  handleStatsUpdate,
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [standardRange, setStandardRange] = useState(null);
  const [error, setError] = useState(null);

  // Tạo state local để theo dõi giá trị đang nhập
  const [localInputValues, setLocalInputValues] = useState({});

  // Tạo một phiên bản debounced của hàm handleInputChange
  const debouncedInputChange = useCallback(
    debounce((foetusId, field, value) => {
      handleInputChange(foetusId, field, value);
    }, 300), // Độ trễ 300ms
    [handleInputChange]
  );

  // Lấy dữ liệu tuần thai hiện tại
  const currentAge = useMemo(() => {
    if (!selectedChild) return "";
    
    const childStats = tempStats[selectedChild.foetusId];
    if (childStats?.age !== undefined) return childStats.age;
    
    const childGrowthData = growthData[selectedChild.foetusId];
    if (childGrowthData?.length > 0) {
      return childGrowthData[0].age || selectedChild.age || "";
    }
    
    return selectedChild.age || "";
  }, [selectedChild, tempStats, growthData]);

  // Cập nhật giá trị local khi tempStats thay đổi hoặc khi chọn một đứa trẻ khác
  useEffect(() => {
    if (selectedChild?.foetusId) {
      setLocalInputValues(tempStats[selectedChild.foetusId] || {});
    }
  }, [selectedChild?.foetusId, tempStats]);

  // Lấy ngày cập nhật gần nhất
  const latestUpdate = useMemo(() => {
    if (!selectedChild || !growthData[selectedChild.foetusId]?.length) return null;
    
    // Sắp xếp dữ liệu theo ngày gần nhất
    const sortedData = [...growthData[selectedChild.foetusId]].sort((a, b) => {
      const dateA = a.date || a.measurementDate || a.createdAt || a.updatedAt;
      const dateB = b.date || b.measurementDate || b.createdAt || b.updatedAt;
      return new Date(dateB) - new Date(dateA);
    });
    
    // Lấy mục đầu tiên (gần nhất)
    const latestData = sortedData[0];
    
    // Lấy ngày từ bản ghi mới nhất
    return latestData?.measurementDate || latestData?.date || latestData?.createdAt || latestData?.updatedAt;
  }, [selectedChild, growthData]);

  // Kiểm tra xem có bất kỳ thay đổi nào trong dữ liệu không
  const isAnyStatUpdated = () => {
    if (!selectedChild) return false;
    
    const stats = tempStats[selectedChild.foetusId] || {};
    
    // Kiểm tra xem có bất kỳ giá trị nào không phải null, undefined, hoặc chuỗi rỗng
    return Object.values(stats).some(value => 
      value !== null && 
      value !== undefined && 
      value !== '' && 
      (typeof value !== 'string' || value.trim() !== '')
    );
  };

  // Tối ưu hóa fetch dữ liệu chuẩn để chỉ fetch khi currentAge thay đổi
  useEffect(() => {
    let isMounted = true;
    
    const fetchStandardRangesData = async () => {
      if (!selectedChild || !currentAge) {
        return;
      }
      
      // Kiểm tra token
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setError('Cần đăng nhập để xem chỉ số chuẩn');
          setStandardRange(null);
        }
        return;
      }
      
      // Bỏ hiển thị lỗi khi tuần thai không hợp lệ
      if (currentAge < 12 || currentAge > 40) {
        if (isMounted) {
          setStandardRange(null);
        }
        return;
      }

      try {
        if (isMounted) {
          setError(null);
        }
        
        // Bọc việc gọi API trong một timeout ngắn để tránh việc nhấp nháy khi nhập liệu
        const timeoutId = setTimeout(async () => {
          try {
            const rangeData = await fetchStandardRanges(currentAge);
            
            if (isMounted) {
              if (rangeData) {
                setStandardRange(rangeData);
              } else {
                setError('Không có dữ liệu chuẩn cho tuần thai này');
                setStandardRange(null);
              }
            }
          } catch (error) {
            console.error('Error fetching standard ranges:', error);
            if (isMounted) {
              const errorMessage = error.message?.includes('401')
                ? 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'
                : 'Lỗi khi lấy dữ liệu chuẩn';
                
              setError(errorMessage);
              setStandardRange(null);
            }
          }
        }, 600); // Chờ 600ms sau khi ngừng nhập liệu
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error in standard ranges fetch:', error);
      }
    };

    // Chỉ fetch khi currentAge thay đổi để tránh render loop
    fetchStandardRangesData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [selectedChild?.foetusId, currentAge]); // Chỉ phụ thuộc vào foetusId và currentAge

  const historyColumns = [
    {
      title: "Tuần thai",
      dataIndex: "age",
      key: "age",
      width: 80,
      render: (value) => `Tuần ${value || "?"}`,
    },
    {
      title: "Ngày đo",
      dataIndex: "date",
      key: "date",
      width: 100,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "HC (mm)",
      dataIndex: "hc",
      key: "hc",
      width: 90,
      render: (hc) => (hc ? hc.value || "Chưa có" : "Chưa có"),
    },
    {
      title: "AC (mm)",
      dataIndex: "ac",
      key: "ac",
      width: 90,
      render: (ac) => (ac ? ac.value || "Chưa có" : "Chưa có"),
    },
    {
      title: "FL (mm)",
      dataIndex: "fl",
      key: "fl",
      width: 90,
      render: (fl) => (fl ? fl.value || "Chưa có" : "Chưa có"),
    },
    {
      title: "EFW (g)",
      dataIndex: "efw",
      key: "efw",
      width: 90,
      render: (efw) => (efw ? efw.value || "Chưa có" : "Chưa có"),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 400,
      render: renderStatusIndicators,
    },
  ];

  // Hàm mở modal xem lịch sử
  const handleViewHistory = () => {
    setIsHistoryModalOpen(true);
  };

  // Hàm đóng modal lịch sử
  const handleCloseHistory = () => {
    setIsHistoryModalOpen(false);
  };

  const sortedHistoryData = useMemo(() => {
    if (!selectedChild || !growthData[selectedChild.foetusId]) return [];
    return [...growthData[selectedChild.foetusId]].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [selectedChild, growthData]);

  // Hàm render trạng thái
  function renderStatusIndicators(_, record) {
    const renderBadge = (metric, label) => {
      if (!record[metric]) return null;
      
      const isAlert = record[metric].isAlert;
      const className = `status-badge ${isAlert ? "warning" : "safe"}`;
      
      return (
        <span className={className}>
          {isAlert ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
          <span>{label}: {isAlert ? "Cần chú ý" : "An toàn"}</span>
        </span>
      );
    };
    
    return (
      <div className="status-indicators">
        {renderBadge("hc", "HC")}
        {renderBadge("ac", "AC")}
        {renderBadge("fl", "FL")}
        {renderBadge("efw", "EFW")}
      </div>
    );
  }

  // Hàm render trường đầu vào metric
  const renderMetricInput = (metricName, label, color, unit = "mm") => {
    // Ưu tiên giá trị local, sau đó là giá trị từ tempStats
    const displayValue = localInputValues[metricName] !== undefined 
      ? localInputValues[metricName]
      : (tempStats[selectedChild?.foetusId]?.[metricName] === null || 
         tempStats[selectedChild?.foetusId]?.[metricName] === undefined ? '' : 
         tempStats[selectedChild?.foetusId]?.[metricName]);
    
    return (
      <div className="metric-item">
        <label>
          <Circle className="icon" style={{ color }} />
          {label}
        </label>
        <div className="input-with-units">
          <input
            type="number"
            name={metricName}
            value={displayValue}
            onChange={(e) => {
              // Ngăn chặn hành vi mặc định có thể gây ra việc mất focus
              e.preventDefault();
              
              // Cập nhật giá trị local ngay lập tức
              const newValue = e.target.value;
              setLocalInputValues(prev => ({
                ...prev,
                [metricName]: newValue
              }));
              
              // Gọi hàm debounced để cập nhật state chính
              debouncedInputChange(selectedChild.foetusId, metricName, newValue);
            }}
            placeholder="0"
            min="0"
            step="any"
          />
          <span className="unit">{unit}</span>
        </div>
        <div className="metric-standard">
          <div className="standard-label">
            <Info className="info-icon" size={14} />
            Chỉ số chuẩn: {standardRange?.[metricName]?.median || '0'} {unit}
          </div>
          <div className="standard-range">
            Khoảng cho phép: {standardRange?.[metricName]?.min || '0'} - {standardRange?.[metricName]?.max || '0'} {unit}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="child-info-card">
      <div className="card-header" style={{ background: 'linear-gradient(135deg, #FF85A2, #FF9A8B)' }}>
        <h2>{selectedChild?.name}</h2>
      </div>

      <div className="card-content">
        {/* Thông tin cơ bản */}
        <div className="info-section">
          <h3>
            <User size={16} className="icon" />
            Thông tin cơ bản
          </h3>
          <div className="basic-info">
            <div className="info-row">
              <div className="info-item">
                <label>
                  <Baby className="icon" />
                  Giới tính
                </label>
                <span>{selectedChild?.gender}</span>
              </div>
              <div className="info-item">
                <label>
                  <Calendar className="icon" />
                  Tuần
                </label>
                <div className="input-with-units">
                  <input
                    type="number"
                    name="age"
                    value={localInputValues.age !== undefined ? localInputValues.age : (currentAge === null || currentAge === undefined || currentAge === '' ? '' : currentAge)}
                    onChange={(e) => {
                      // Prevent default behavior
                      e.preventDefault();
                      
                      const newValue = e.target.value;
                      // Cập nhật giá trị local
                      setLocalInputValues(prev => ({
                        ...prev,
                        age: newValue
                      }));
                      // Sử dụng hàm handleWeekChange với debounce
                      handleWeekChange(selectedChild.foetusId, newValue, debouncedInputChange);
                    }}
                    min="1"
                    max="42"
                    step="1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chỉ số phát triển */}
        <div className="info-section">
          <h3>
            <TrendingUp size={16} className="icon" />
            Chỉ số phát triển
          </h3>
          <div className="growth-metrics">
            <div className="metrics-row">
              {renderMetricInput("hc", "HC", "#FF6384")}
              {renderMetricInput("ac", "AC", "#36A2EB")}
            </div>

            <div className="metrics-row">
              {renderMetricInput("fl", "FL", "#4BC0C0")}
              {renderMetricInput("efw", "EFW", "#9966FF", "g")}
            </div>
          </div>
        </div>

        {/* Thông tin cập nhật */}
        <div className="info-section">
          <div className="update-info">
            <div className="update-date">
              <Clock className="icon" />
              Cập nhật lần cuối: {latestUpdate ? format(new Date(latestUpdate), 'dd/MM/yyyy HH:mm') : 'Chưa có dữ liệu'}
            </div>
            {selectedChild && (
              <motion.button 
                className="view-history" 
                onClick={handleViewHistory}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <History className="icon" /> Xem tất cả lịch sử
              </motion.button>
            )}
          </div>
        </div>

        {/* Nút cập nhật */}
        <motion.button
          className="update-button"
          onClick={() => handleStatsUpdate(selectedChild.foetusId)}
          disabled={!isAnyStatUpdated()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ background: 'linear-gradient(135deg, #FF85A2, #FF9A8B)' }}
        >
          <RefreshCw className="icon" /> Cập nhật chỉ số
        </motion.button>
      </div>

      {/* Modal lịch sử */}
      <Modal
        title={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="history-modal-title"
          >
            <FileText size={20} className="history-icon" />
            <span>Lịch sử đo chỉ số của {selectedChild?.name}</span>
          </motion.div>
        }
        open={isHistoryModalOpen}
        onCancel={handleCloseHistory}
        footer={null}
        width={1000}
        className="history-modal"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Table
            columns={historyColumns}
            dataSource={sortedHistoryData}
            rowKey={(record) => {
              // Sử dụng id hoặc measurementId nếu có, không thì kết hợp nhiều trường để tạo key duy nhất
              return record.id || record.measurementId || `${record.date}_${record.age}_${Math.random().toString(36).substr(2, 9)}`;
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng số ${total} bản ghi`,
            }}
            scroll={{ x: 1000 }}
          />
        </motion.div>
      </Modal>
    </div>
  );
};

export default ChildInfoCard; 