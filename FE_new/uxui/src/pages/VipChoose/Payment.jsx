"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, Mail, CreditCard, DollarSign, ArrowLeft } from "lucide-react"
import "./Payment.scss"

const PaymentForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { vipPackage, userName: initialUserName } = location.state || {}

  const [userData, setUserData] = useState({
    userName: initialUserName || localStorage.getItem("userName") || "Người dùng",
    phoneNumber: "",
    email: "",
    paymentMethod: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: ""
  })

  useEffect(() => {
    if (userData.userName !== "Người dùng") {
      localStorage.setItem("userName", userData.userName)
    }
  }, [userData.userName])

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    if (name === "cardName") {
      setUserData({ ...userData, [name]: value.toUpperCase().replace(/[^A-Z\s]/g, "") });
    } else if (name === "cardExpiry") {
      const formattedValue = value.replace(
        /^([1-9]\/|[2-9])$/g, '0$1/'
      ).replace(
        /^(0[1-9]|1[0-2])$/g, '$1/'
      ).replace(
        /^([0-1])([3-9])$/g, '0$1/$2'
      ).replace(
        /^(0[1-9]|1[0-2])([0-9]{2})$/g, '$1/$2'
      ).replace(
        /^([0]+)\/|[0]+$/g, '0'
      ).replace(
        /[^\d\/]|^[\/]*$/g, ''
      ).replace(
        /\/\//g, '/'
      );
      if (formattedValue.length <= 5) {
        setUserData({ ...userData, [name]: formattedValue });
      }
    } else {
      setUserData({ ...userData, [name]: value });
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate("/basic-user/bill", { state: { ...userData, vipPackage } })
  }

  const goBack = () => {
    navigate(-1)
  }

  return (
    <div className="payment-page">
      <motion.div
        className="payment-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button className="back-button" onClick={goBack}>
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h1>Thông tin thanh toán</h1>
        <form className="payment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">
              <User size={20} />
              <span className="sr-only">Tên người dùng</span>
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Tên người dùng"
              value={userData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">
              <Phone size={20} />
              <span className="sr-only">Số điện thoại</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Số điện thoại"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={20} />
              <span className="sr-only">Email</span>
            </label>
            <input type="email" id="email" name="email" placeholder="Email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="paymentMethod">
              <CreditCard size={20} />
              <span className="sr-only">Phương thức thanh toán</span>
            </label>
            <select id="paymentMethod" name="paymentMethod" onChange={handleChange} required defaultValue="">
              <option value="" disabled>
                Chọn phương thức thanh toán
              </option>
              <option value="Thẻ ATM Nội Địa">Thẻ ATM Nội Địa</option>
              <option value="Thẻ Tín Dụng">Thẻ Tín Dụng</option>
              <option value="VNPAY">VNPAY</option>
            </select>
          </div>
          {(userData.paymentMethod === "Thẻ ATM Nội Địa" || userData.paymentMethod === "Thẻ Tín Dụng") && (
            <div className="card-info-popup">
              <input
                type="text"
                name="cardNumber"
                placeholder="Số thẻ (16 số)"
                maxLength="16"
                onChange={handleCardInfoChange}
                required
              />
              <input
                type="text"
                name="cardName"
                placeholder="Tên in trên thẻ"
                onChange={handleCardInfoChange}
                required
              />
              <input
                type="text"
                name="cardExpiry"
                placeholder="Ngày phát hành (MM/YY)"
                onChange={handleCardInfoChange}
                required
              />
            </div>
          )}
          <AnimatePresence>
            {vipPackage && (
              <motion.div
                className="selected-package"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <DollarSign size={20} />
                <span>Gói VIP đã chọn: {vipPackage}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Xác nhận thanh toán
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default PaymentForm
