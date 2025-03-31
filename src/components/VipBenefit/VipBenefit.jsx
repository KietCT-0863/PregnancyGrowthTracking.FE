"use client"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import "./VipBenefit.scss"

const VipBenefits = () => {
  const navigate = useNavigate()

  const handleExperienceVip = () => {
    navigate("/basic-user/choose-vip")
  }

  const benefits = [
    "Truy cập không giới hạn",
    "Hỗ trợ 24/7",
    "Hỗ trợ theo dõi thay kỳ",
    "Lên lịch trình thăm khám ",  
    "Ghi chú bác sĩ sau thăm khám",
    "Tài liệu chăm sóc trẻ sơ sinh",
    "Cộng động kết nối Mẹ Bầu",
  ]

  const comparisonData = [
    { benefit: "Không có quảng cáo", guest: false, member: true },
    { benefit: "Truy cập nội dung độc quyền", guest: false, member: true },
    { benefit: "Ưu đãi đặc biệt cho các sự kiện", guest: false, member: true },
    { benefit: "Tương tác cộng đồng ", guest: false, member: true },
  ]

  return (
    <div className="vip-benefits">
      <div className="wave-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <motion.div
        className="content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Lợi ích của VIP</h1>
        <ul className="benefits-list">
          {benefits.map((benefit, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Check size={20} /> {benefit}
            </motion.li>
          ))}
        </ul>
        <h2>So sánh quyền lợi</h2>
        <div className="comparison-table">
          <div className="table-header">
            <div>Quyền lợi</div>
            <div>Guest</div>
            <div>Member</div>
          </div>
          {comparisonData.map((row, index) => (
            <motion.div
              className="table-row"
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div>{row.benefit}</div>
              <div>{row.guest ? <Check size={20} color="green" /> : <X size={20} color="red" />}</div>
              <div>{row.member ? <Check size={20} color="green" /> : <X size={20} color="red" />}</div>
            </motion.div>
          ))}
        </div>
        <motion.button onClick={handleExperienceVip} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Trải nghiệm VIP ngay
        </motion.button>
      </motion.div>
    </div>
  )
}

export default VipBenefits

