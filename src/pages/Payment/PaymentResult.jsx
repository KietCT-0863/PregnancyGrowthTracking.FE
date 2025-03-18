import React from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentResultCard from './PaymentResultCard';
import './PaymentResult.scss';

const PaymentResult = () => {
  const navigate = useNavigate();

  const handleBackHome = () => {
    localStorage.removeItem('lastPaymentDetails');
    navigate('/');
  };

  const handleRetry = () => {
    window.history.back();
  };

  const handleLogout = () => {
    // Xóa token và các thông tin đăng nhập
    localStorage.removeItem('token');
    localStorage.removeItem('lastPaymentDetails');
    // Có thể xóa thêm các thông tin khác nếu cần
    
    // Chuyển về trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="payment-result-page">
      <PaymentResultCard 
        onBackHome={handleBackHome}
        onRetry={handleRetry}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default PaymentResult; 