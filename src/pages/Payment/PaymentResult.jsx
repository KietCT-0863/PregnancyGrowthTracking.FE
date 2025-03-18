import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentResultCard from './PaymentResultCard';
import './PaymentResult.scss';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra xem URL hiện tại có phải là URL mong muốn không
  useEffect(() => {
    const currentUrl = window.location.href;
    console.log("Current URL:", currentUrl);
    
    if (currentUrl.includes('pregnancy-growth-tracking.vercel.app')) {
      // Lấy tham số từ URL
      const params = new URLSearchParams(location.search);
      const paramString = location.search;
      
      // Tạo URL mới với localhost
      const localUrl = `http://localhost:3000/basic-user/payment-result${paramString}`;
      console.log("Redirecting to local URL:", localUrl);
      
      // Lưu thông tin thanh toán trong session storage
      sessionStorage.setItem('vnpay_params', paramString);
      
      // Mở cửa sổ mới với URL localhost
      window.open(localUrl, '_self');
    } else {
      // Nếu đã ở localhost, kiểm tra xem có thông tin thanh toán từ Vercel không
      const savedParams = sessionStorage.getItem('vnpay_params');
      if (savedParams && !location.search) {
        console.log("Using saved params:", savedParams);
        navigate(`/basic-user/payment-result${savedParams}`, { replace: true });
        sessionStorage.removeItem('vnpay_params');
      }
    }
  }, [location, navigate]);

  const handleBackHome = () => {
    // Xóa token và thông tin người dùng (giống như logout)
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('lastPaymentDetails');
    
    // Chuyển hướng đến trang chủ
    navigate('/');
  };

  const handleRetry = () => {
    window.history.back();
  };

  const handleLoginRedirect = () => {
    // Lưu thông báo trong localStorage để hiển thị sau khi chuyển hướng
    localStorage.setItem('paymentSuccessMessage', 'Vui lòng đăng nhập lại để kích hoạt gói thành viên của bạn');
    
    // Xóa token và thông tin người dùng để đảm bảo người dùng phải đăng nhập lại
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
    // Chuyển hướng đến trang đăng nhập
    navigate('/login');
  };

  return (
    <div className="payment-result-page">
      <PaymentResultCard 
        onBackHome={handleBackHome}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
      />
    </div>
  );
};

export default PaymentResult; 