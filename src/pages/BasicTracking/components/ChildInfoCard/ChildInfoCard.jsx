import { motion } from "framer-motion";
import {
  Baby,
  AlertCircle,
  Heart,
  Activity,
  Scale,
  Ruler,
  Clock,
  FileText,
  Info,
  BarChart2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import "./ChildInfoCard.scss";
import { Modal, Table } from "antd";
import { useState, useMemo } from "react";

const ChildInfoCard = ({
  selectedChild,
  growthData,
  tempStats,
  handleInputChange,
  handleStatsUpdate,
}) => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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
      render: (_, record) => (
        <div className="status-indicators">
          {record.hc && (
            <span className={`status-badge ${record.hc.isAlert ? "warning" : "safe"}`}>
              {record.hc.isAlert ? (
                <>
                  <AlertTriangle size={14} />
                  <span>HC: Cần chú ý</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>HC: An toàn</span>
                </>
              )}
            </span>
          )}
          {record.ac && (
            <span className={`status-badge ${record.ac.isAlert ? "warning" : "safe"}`}>
              {record.ac.isAlert ? (
                <>
                  <AlertTriangle size={14} />
                  <span>AC: Cần chú ý</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>AC: An toàn</span>
                </>
              )}
            </span>
          )}
          {record.fl && (
            <span className={`status-badge ${record.fl.isAlert ? "warning" : "safe"}`}>
              {record.fl.isAlert ? (
                <>
                  <AlertTriangle size={14} />
                  <span>FL: Cần chú ý</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>FL: An toàn</span>
                </>
              )}
            </span>
          )}
          {record.efw && (
            <span className={`status-badge ${record.efw.isAlert ? "warning" : "safe"}`}>
              {record.efw.isAlert ? (
                <>
                  <AlertTriangle size={14} />
                  <span>EFW: Cần chú ý</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>EFW: An toàn</span>
                </>
              )}
            </span>
          )}
        </div>
      ),
    },
  ];

  const handleViewHistory = () => {
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistory = () => {
    setIsHistoryModalOpen(false);
  };

  const sortedHistoryData = useMemo(() => {
    if (!selectedChild || !growthData[selectedChild.foetusId]) return [];
    return [...growthData[selectedChild.foetusId]].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }, [selectedChild, growthData]);

  return (
    <div className="child-card">
      <div className="card-header">
        <motion.h3
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {selectedChild.name}
        </motion.h3>
      </div>

      <div className="card-content">
        <motion.div
          className="basic-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="info-title">
            <motion.div
              animate={{
                rotate: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Info size={16} className="info-icon" />
            </motion.div>
            <span>Thông tin cơ bản</span>
          </div>
          
          <div className="info-grid">
            <motion.div
              className="info-item"
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
            >
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
                <Baby size={16} className="gender-icon" />
              </motion.div>
              <span>
                {selectedChild.gender === "Nam"
                  ? "Nam"
                  : selectedChild.gender === "Nữ"
                  ? "Nữ"
                    : selectedChild.gender === "Khác"
                  ? "Khác"
                  : "Chưa xác định"}
              </span>
            </motion.div>
            
            <motion.div
              className="info-item"
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Activity size={16} className="age-icon" />
              </motion.div>
              <div className="age-input-container">
                <span>Tuần</span>
                <input
                  type="number"
                  value={
                    tempStats[selectedChild.foetusId]?.age !== undefined
                      ? tempStats[selectedChild.foetusId].age
                      : growthData[selectedChild.foetusId]?.length > 0
                        ? growthData[selectedChild.foetusId][0].age || selectedChild.age || ""
                        : selectedChild.age || ""
                  }
                  onChange={(e) => handleInputChange(selectedChild.foetusId, "age", e.target.value)}
                  min="12"
                  max="40"
                  className="week-input"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {selectedChild.age < 12 || selectedChild.age > 40 ? (
          <motion.div
            className="warning-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <AlertCircle size={16} />
            </motion.div>
            <span>{selectedChild.age < 12 ? "Thai nhi chưa đủ tuần tuổi để đo chỉ số (tối thiểu 12 tuần)" : "Tuần thai vượt quá giới hạn cho phép (tối đa 40 tuần)"}</span>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="stats-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="stats-title">
                <motion.div
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <BarChart2 size={16} className="stats-icon" />
                </motion.div>
                <span>Chỉ số phát triển</span>
              </div>
              
              <div className="stats-grid">
                <motion.div
                  className="stat-item"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="stat-header">
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
                      <Ruler size={16} className="hc-icon" />
                    </motion.div>
                    <span className="stat-label">HC</span>
                  </div>
                  <div className="stat-input">
                    <input
                      type="number"
                      value={
                        tempStats[selectedChild.foetusId]?.hc !== undefined
                          ? tempStats[selectedChild.foetusId].hc
                          : growthData[selectedChild.foetusId]?.length > 0
                            ? growthData[selectedChild.foetusId][0].hc?.value || ""
                            : ""
                      }
                      onChange={(e) => handleInputChange(selectedChild.foetusId, "hc", e.target.value)}
                      min="0"
                      placeholder="Nhập HC"
                      className="stat-input-field"
                    />
                    <span className="stat-unit">mm</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="stat-item"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <div className="stat-header">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <Heart size={16} className="ac-icon" />
                    </motion.div>
                    <span className="stat-label">AC</span>
                  </div>
                  <div className="stat-input">
                    <input
                      type="number"
                      value={
                        tempStats[selectedChild.foetusId]?.ac !== undefined
                          ? tempStats[selectedChild.foetusId].ac
                          : growthData[selectedChild.foetusId]?.length > 0
                            ? growthData[selectedChild.foetusId][0].ac?.value || ""
                            : ""
                      }
                      onChange={(e) => handleInputChange(selectedChild.foetusId, "ac", e.target.value)}
                      min="0"
                      placeholder="Nhập AC"
                      className="stat-input-field"
                    />
                    <span className="stat-unit">mm</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="stat-item"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <div className="stat-header">
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
                      <Scale size={16} className="fl-icon" />
                    </motion.div>
                    <span className="stat-label">FL</span>
                  </div>
                  <div className="stat-input">
                    <input
                      type="number"
                      value={
                        tempStats[selectedChild.foetusId]?.fl !== undefined
                          ? tempStats[selectedChild.foetusId].fl
                          : growthData[selectedChild.foetusId]?.length > 0
                            ? growthData[selectedChild.foetusId][0].fl?.value || ""
                            : ""
                      }
                      onChange={(e) => handleInputChange(selectedChild.foetusId, "fl", e.target.value)}
                      min="0"
                      placeholder="Nhập FL"
                      className="stat-input-field"
                    />
                    <span className="stat-unit">mm</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="stat-item"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <div className="stat-header">
                    <motion.div
                      animate={{
                        rotate: [0, 10, 0, -10, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <Activity size={16} className="efw-icon" />
                    </motion.div>
                    <span className="stat-label">EFW</span>
                  </div>
                  <div className="stat-input">
                    <input
                      type="number"
                      value={
                        tempStats[selectedChild.foetusId]?.efw !== undefined
                          ? tempStats[selectedChild.foetusId].efw
                          : growthData[selectedChild.foetusId]?.length > 0
                            ? growthData[selectedChild.foetusId][0].efw?.value || ""
                            : ""
                      }
                      onChange={(e) => handleInputChange(selectedChild.foetusId, "efw", e.target.value)}
                      min="0"
                      placeholder="Nhập EFW"
                      className="stat-input-field"
                    />
                    <span className="stat-unit">g</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="actions-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {growthData[selectedChild.foetusId]?.length > 0 && (
                <motion.div
                  className="history-section"
                  whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(255, 107, 129, 0.2)" }}
                >
                  <div className="last-updated">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    >
                      <Clock size={14} className="clock-icon" />
                    </motion.div>
                    <span>
                      Cập nhật lần cuối:{" "}
                      {new Date(
                        growthData[selectedChild.foetusId][0].measurementDate ||
                          growthData[selectedChild.foetusId][0].date ||
                          new Date(),
                      ).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <motion.button
                    className="view-history-button"
                    onClick={handleViewHistory}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <FileText size={16} className="history-icon" />
                    </motion.div>
                    <span>Xem tất cả lịch sử</span>
                  </motion.button>
                </motion.div>
              )}

              <motion.button
                className="update-stats-button"
                onClick={() => handleStatsUpdate(selectedChild.foetusId)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
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
                  <Ruler size={16} className="update-icon" />
                </motion.div>
                <span>Cập nhật chỉ số</span>
                <motion.div className="button-shine" />
              </motion.button>
            </motion.div>
          </>
        )}
      </div>

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
            rowKey={(record) => record.date}
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