import React from 'react';
import { Modal, Button } from 'antd';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './WeekWarningPopup.scss';

const WeekWarningPopup = ({ 
  visible, 
  onClose, 
  onConfirm, 
  weekExists, 
  weekNumber, 
  hasIssues = false,
  isValidWeek = true
}) => {
  // Check if the week number is in the valid range (12-40)
  const weekOutOfRange = !isValidWeek;

  return (
    <Modal
      title={
        <div className="week-warning-title">
          {weekOutOfRange ? (
            <XCircle size={24} className="error-icon" />
          ) : weekExists ? (
            <AlertTriangle size={24} className="warning-icon" />
          ) : (
            <CheckCircle size={24} className="success-icon" />
          )}
          <span>
            {weekOutOfRange 
              ? 'Tuần thai không hợp lệ' 
              : weekExists 
                ? 'Tuần thai đã tồn tại' 
                : 'Thêm tuần mới thành công'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {weekOutOfRange || !weekExists ? 'Đóng' : 'Hủy'}
        </Button>,
        weekExists && !weekOutOfRange && (
          <Button key="confirm" type="primary" onClick={onConfirm}>
            Tiếp tục cập nhật
          </Button>
        ),
      ]}
      className="week-warning-modal"
    >
      <div className="week-warning-content">
        {weekOutOfRange ? (
          <>
            <p>
              Tuần thai <strong>{weekNumber}</strong> không nằm trong phạm vi hợp lệ.
            </p>
            <p>
              Chỉ được nhập tuần thai từ <strong>12</strong> đến <strong>40</strong>.
            </p>
            <div className="error-message">
              <AlertCircle size={16} />
              <span>Vui lòng nhập lại tuần thai trong khoảng cho phép.</span>
            </div>
          </>
        ) : weekExists ? (
          <>
            <p>
              Tuần thai <strong>{weekNumber}</strong> đã có thông số được nhập trước đó.
            </p>
            <p>Bạn có muốn cập nhật lại thông số cho tuần này không?</p>
            
            {hasIssues && (
              <div className="issues-warning">
                <AlertCircle size={16} />
                <span>Lưu ý: Chỉ thay thông số thai nhi chỉ khi có sự thay đổi lớn , vui lòng kiểm tra kỹ lại.</span>
              </div>
            )}
          </>
        ) : (
          <>
            <p>
              Bạn đã thêm thành công tuần thai <strong>{weekNumber}</strong>.
            </p>
            <p>Vui lòng nhập các chỉ số phát triển đầy đủ cho tuần này.</p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default WeekWarningPopup; 