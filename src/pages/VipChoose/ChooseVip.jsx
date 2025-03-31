"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, Clock, Crown, Sparkles, ArrowRight, Loader } from "lucide-react"
import "./ChooseVip.scss"
import paymentService from "../../api/services/paymentService"
import { toast } from "react-toastify"

const ChooseVip = () => {
  const [selectedVip, setSelectedVip] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Kiểm tra role của user khi component mount
    const userData = localStorage.getItem("userData")
    if (userData) {
      const user = JSON.parse(userData)
      console.log("User role:", user.role) // Log để debug

      // Set current plan dựa vào role
      if (user.role === "member") {
        setCurrentPlan("free")
      } else if (user.role === "vip") {
        setCurrentPlan("vip")
      }
    }
  }, [])

  const handleSelectVip = (vip) => {
    setSelectedVip(vip)
  }

  const handleNavigateToPayment = async () => {
    try {
      setIsLoading(true)
      const userData = localStorage.getItem("userData")

      if (!userData) {
        toast.error("Vui lòng đăng nhập để tiếp tục")
        return
      }

      const user = JSON.parse(userData)
      const paymentData = {
        name: user.userName,
        userId: user.userId,
      }

      const response = await paymentService.createPayment(paymentData)

      if (response && response.paymentUrl) {
        window.location.href = response.paymentUrl
      } else {
        throw new Error("Không nhận được URL thanh toán")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Có lỗi xảy ra khi tạo thanh toán")
    } finally {
      setIsLoading(false)
    }
  }

  const vipOptions = [
    {
      title: "Đặc quyền thành viên Vip",
      duration: "Vĩnh viễn",
      benefits: [
        "Hỗ trợ Theo dõi thai kỳ",
        "Truy cập không giới hạn",
        "Hỗ trợ 24/7",
        "Lịch trình nhắc nhở cá nhân hoá",
        "Lưu trữ lịch sử khám thai đầy đủ",
        "Tài liệu chăm sóc trẻ sơ sinh",
        "Cộng đồng chia sẻ kết nối với các Mẹ Bầu",
      ],
      price: "245,000VND",
      highlight: true,
    },
  ]

  return (
    <div className="choose-vip-container">
      <motion.div
        className="choose-vip"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="choose-vip-background">
          <div className="wave wave1"></div>
          <div className="wave wave2"></div>
          <div className="wave wave3"></div>
        </div>

        <motion.h1
          className="title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Sparkles className="title-icon" />
          <span>Nâng Cấp Trải Nghiệm Của Bạn</span>
          <Sparkles className="title-icon" />
        </motion.h1>

        {/* Hiển thị gói hiện tại */}
        <AnimatePresence>
          {currentPlan && (
            <motion.div
              className="current-plan"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Crown className="plan-icon" />
              <span>
                {currentPlan === "free"
                  ? "Bạn đang sử dụng gói Miễn phí - Vui lòng chọn gói VIP để nâng cấp"
                  : "Bạn đang sử dụng gói VIP"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="vip-options">
          {/* Hiển thị gói Free nếu user đang dùng gói free */}
          {currentPlan === "free" && (
            <motion.div
              className="vip-option current"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="option-header">
                <h2>Miễn Phí</h2>
                <div className="current-badge">Đang sử dụng</div>
              </div>

              <div className="duration">
                <Clock className="duration-icon" />
                <span>Không giới hạn thời gian</span>
              </div>

              <ul className="benefits">
                <li>
                  <Check className="benefit-icon" />
                  <span>Các tính năng cơ bản</span>
                </li>
                <li>
                  <Check className="benefit-icon" />
                  <span>Theo dõi thai kỳ</span>
                </li>
                <li className="disabled">
                  <Check className="benefit-icon" />
                  <span>Hỗ trợ 24/7</span>
                </li>
                <li className="disabled">
                  <Check className="benefit-icon" />
                  <span>Tư vấn dinh dưỡng cá nhân</span>
                </li>
              </ul>

              <div className="price">0 VND</div>
            </motion.div>
          )}

          {vipOptions.map((option, index) => (
            <motion.div
              key={index}
              className={`vip-option ${
                selectedVip === option.title ? "selected" : ""
              } ${option.highlight ? "highlight" : ""}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              onClick={() => handleSelectVip(option.title)}
              whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              {option.highlight && (
                <div className="ribbon">
                  <span>Phổ biến</span>
                </div>
              )}

              <div className="option-header">
                <h2>{option.title}</h2>
                {selectedVip === option.title && (
                  <motion.div
                    className="selected-indicator"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Star className="star-icon" />
                  </motion.div>
                )}
              </div>

              <div className="duration">
                <Clock className="duration-icon" />
                <span>{option.duration}</span>
              </div>

              <ul className="benefits">
                {option.benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  >
                    <Check className="benefit-icon" />
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="price">{option.price}</div>
            </motion.div>
          ))}
        </div>

        {currentPlan === "free" && (
          <motion.button
            className="payment-button"
            onClick={handleNavigateToPayment}
            disabled={!selectedVip || isLoading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(255, 107, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <span className="loading-text">
                <Loader className="loading-icon" />
                Đang xử lý...
              </span>
            ) : (
              <span className="button-text">
                Tiếp tục thanh toán
                <ArrowRight className="arrow-icon" />
              </span>
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

export default ChooseVip

