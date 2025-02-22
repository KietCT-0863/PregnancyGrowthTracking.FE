"use client"
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaArrowLeft } from "react-icons/fa"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import "./Contact.scss"

const Contact = () => {
  const address1 = "874/44/21 Đoàn Văn Bơ, Phường 16, Quận 4, Hồ Chí Minh, Vietnam"
  const address2 = "1146 Quang Trung, Phường 8, Quận Gò Vấp, Hồ Chí Minh, Vietnam"
  const phoneNumber = "0383989481"
  const email = "KhangDGSE184442@fpt.edu.vn"

  const googleMapUrl1 = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDMB5Rm4MKUWRqSf_dxbQ6vcu7oB59662U&q=${encodeURIComponent(address1)}`
  const googleMapUrl2 = `https://www.google.com/maps/embed/v1/place?key=AIzaSyDMB5Rm4MKUWRqSf_dxbQ6vcu7oB59662U&q=${encodeURIComponent(address2)}`

  return (
    <div className="contact-page">
      <div className="contact-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      <motion.div
        className="contact-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="contact-title">Liên hệ với chúng tôi</h1>

        <motion.div
          className="branch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="branch-title">Cơ sở 1</h2>
          <p className="address">
            <FaMapMarkerAlt /> {address1}
          </p>
          <iframe
            title="Google Map Cơ sở 1"
            src={googleMapUrl1}
            className="map"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </motion.div>

        <motion.div
          className="branch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="branch-title">Cơ sở 2</h2>
          <p className="address">
            <FaMapMarkerAlt /> {address2}
          </p>
          <iframe
            title="Google Map Cơ sở 2"
            src={googleMapUrl2}
            className="map"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </motion.div>

        <motion.div
          className="contact-info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="phone-number">
            <FaPhone /> {phoneNumber}
          </h3>
          <h3 className="email">
            <FaEnvelope />
            <a href={`mailto:${email}`} className="email-link">
              {email}
            </a>
          </h3>
        </motion.div>

        <motion.div
          className="back-link-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link to="/" className="back-link">
            <FaArrowLeft />
            <span>Quay lại trang chủ</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Contact

