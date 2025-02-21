"use client"

  import React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter } from "lucide-react"
import "./FooterContent.scss"

const FooterContent = () => {
  const [email, setEmail] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Email submitted:", email)
    setEmail("")
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <footer className="footer-content">
      <div className="footer-container">
        <motion.div className="footer-grid" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="footer-section newsletter" variants={itemVariants}>
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận thông tin mới nhất về sức khỏe mẹ và bé</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-submit">
                  Đăng ký
                </button>
              </div>
            </form>
          </motion.div>
          <motion.div className="footer-section social" variants={itemVariants}>
            <h3>Kết nối với chúng tôi</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter />
              </a>
            </div>
          </motion.div>
        </motion.div>
       
      </div>
    </footer>
  )
}

export default FooterContent

