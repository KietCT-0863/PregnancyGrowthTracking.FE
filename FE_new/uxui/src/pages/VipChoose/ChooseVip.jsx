"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, Star, Clock } from "lucide-react"
import "./ChooseVip.scss"

const ChooseVip = () => {
  const [selectedVip, setSelectedVip] = useState("")
  const navigate = useNavigate()

  const handleSelectVip = (vip) => {
    setSelectedVip(vip)
  }

  const handleNavigateToPayment = () => {
    const userName = localStorage.getItem('userName') || "Người dùng";
    navigate("/basic-user/payment", { state: { vipPackage: selectedVip, userName } })
  }

  const vipOptions = [
    {
      title: "2 Quý",
      duration: "8 tháng sử dụng",
      benefits: ["Truy cập không giới hạn", "Hỗ trợ 24/7", "Tư vấn dinh dưỡng cá nhân"],
      price: "1,999,000 VND",
    },
    {
      title: "1 Quý",
      duration: "4 tháng sử dụng",
      benefits: ["Truy cập không giới hạn", "Hỗ trợ trong giờ hành chính", "Tư vấn dinh dưỡng hàng tháng"],
      price: "1,199,000 VND",
    },
    {
      title: "1 Tháng",
      duration: "1 tháng sử dụng",
      benefits: ["Truy cập có giới hạn", "Hỗ trợ qua email", "Tư vấn dinh dưỡng cơ bản"],
      price: "399,000 VND",
    },
  ]

  return (
    <div className="choose-vip">
      <h1>Chọn Gói VIP</h1>
      <div className="vip-options">
        {vipOptions.map((option, index) => (
          <motion.div
            key={index}
            className={`vip-option ${selectedVip === option.title ? "selected" : ""}`}
            onClick={() => handleSelectVip(option.title)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <h2>{option.title}</h2>
            <div className="duration">
              <Clock size={20} />
              <span>{option.duration}</span>
            </div>
            <ul className="benefits">
              {option.benefits.map((benefit, i) => (
                <li key={i}>
                  <Check size={16} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="price">{option.price}</div>
            {selectedVip === option.title && (
              <div className="selected-indicator">
                <Star size={24} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <motion.button
        className="payment-button"
        onClick={handleNavigateToPayment}
        disabled={!selectedVip}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Tiếp tục thanh toán
      </motion.button>
    </div>
  )
}

export default ChooseVip

