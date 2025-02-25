import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import "./PaymentResult.scss";
import paymentService from "../../api/services/paymentService";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaymentResult = async () => {
      try {
        // Lấy vnp_TransactionNo từ URL params
        const transactionNo = searchParams.get("vnp_TransactionNo");
        
        if (!transactionNo) {
          throw new Error("Không tìm thấy mã giao dịch");
        }

        // Gọi API kiểm tra kết quả thanh toán
        const result = await paymentService.checkPaymentResult(transactionNo);
        setPaymentResult(result);
      } catch (error) {
        console.error("Payment check error:", error);
        setPaymentResult({ success: false, message: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentResult();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="payment-result loading">
        <div className="spinner"></div>
        <p>Đang kiểm tra kết quả thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="payment-result">
      <motion.div 
        className={`result-card ${paymentResult?.success ? 'success' : 'error'}`}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="icon-wrapper">
          {paymentResult?.success ? (
            <Check className="success-icon" size={48} />
          ) : (
            <X className="error-icon" size={48} />
          )}
        </div>

        <h2>{paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại!'}</h2>
        <p className="message">{paymentResult?.message}</p>

        {paymentResult?.success && (
          <div className="payment-details">
            <p>Mã giao dịch: {paymentResult.transactionNo}</p>
            <p>Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentResult.amountVND)}</p>
          </div>
        )}

        <div className="button-group">
          {paymentResult?.success ? (
            <motion.button
              className="primary-button"
              onClick={() => navigate("/member")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đến trang thành viên
            </motion.button>
          ) : (
            <>
              <motion.button
                className="retry-button"
                onClick={() => navigate("/basic-user/choose-vip")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Thử lại
              </motion.button>
              <motion.button
                className="home-button"
                onClick={() => navigate("/basic-user")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Về trang chủ
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentResult; 