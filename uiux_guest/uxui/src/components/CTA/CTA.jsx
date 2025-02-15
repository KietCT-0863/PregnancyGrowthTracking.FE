"use client"

import { useState } from "react"
import "./CTA.scss"

const CTA = () => {
  const [email, setEmail] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Email submitted:", email)
    setEmail("")
  }

  return (
    <section className="cta">
      <div className="cta-content">
        <h2>Sẵn sàng đồng hành cùng Mẹ Bầu</h2>
        <p>Đăng ký ngay hôm nay để nhận những thông tin hữu ích về thai kỳ</p>
        <form className="cta-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-light">
            Đăng ký ngay
          </button>
        </form>
        <div className="cta-benefits">
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span className="benefit-text">Hoàn toàn miễn phí</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span className="benefit-text">Hủy đăng ký bất cứ lúc nào</span>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">✓</span>
            <span className="benefit-text">Tư vấn 24/7</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTA

