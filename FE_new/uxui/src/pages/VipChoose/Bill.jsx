"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, Mail, CreditCard, Package, QrCode, Check, ArrowLeft } from "lucide-react"
// import QRCode from "qrcode.react"
import "./Bill.scss"

const Bill = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { userName, phoneNumber, email, paymentMethod, vipPackage, cardNumber, cardExpiry } = location.state
  const [showQR, setShowQR] = useState(false)

  const handleGenerateQR = () => {
    setShowQR(true)
  }

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="bill-page">
      <motion.div
        className="bill-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={20} />
          Quay lại
        </button>
        <h1>Chi tiết hóa đơn</h1>
        <div className="bill-info">
          <div className="info-group">
            <User size={20} />
            <p>
              Tên người dùng: <span>{userName}</span>
            </p>
          </div>
          <div className="info-group">
            <Phone size={20} />
            <p>
              Số điện thoại: <span>{phoneNumber}</span>
            </p>
          </div>
          <div className="info-group">
            <Mail size={20} />
            <p>
              Email: <span>{email}</span>
            </p>
          </div>
          <div className="info-group">
            <CreditCard size={20} />
            <p>
              Phương thức thanh toán: <span>{paymentMethod}</span>
            </p>
            <p>Số thẻ: <span>{cardNumber}</span></p>
            <p>Ngày phát hành: <span>{cardExpiry}</span></p>
          </div>
          <div className="info-group">
            <Package size={20} />
            <p>
              Gói VIP đã chọn: <span>{vipPackage}</span>
            </p>
            <p>Số tiền thanh toán: <span>{/* Insert payment amount here */}</span></p>
          </div>
        </div>
        <motion.button
          className="generate-qr-button"
          onClick={handleGenerateQR}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {showQR ? <Check size={20} /> : <QrCode size={20} />}
          {showQR ? "Đã tạo mã QR" : "Tạo mã QR"}
        </motion.button>
        <AnimatePresence>
          {showQR && (
            <motion.div
              className="qr-code-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              {/* Placeholder for QR Code */}
              <div className="qr-code-placeholder">QR Code Placeholder</div>
              <p>Quét mã QR để xem chi tiết hóa đơn</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default Bill

