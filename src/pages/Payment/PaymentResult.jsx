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

  return (
    <div className="payment-result-page">
      <PaymentResultCard 
        onBackHome={handleBackHome}
        onRetry={handleRetry}
      />
    </div>
  );
};

export default PaymentResult; 