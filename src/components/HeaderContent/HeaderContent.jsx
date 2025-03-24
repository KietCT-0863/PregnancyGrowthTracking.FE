"use client"

import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import UserMenu from "../UserMenu/UserMenu"
import { Baby, Heart, Calendar, Book, Users, ChevronDown, Bell, Search, MessageCircle, Sun, Moon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import "./HeaderContent.scss"

const HeaderContent = ({ isDarkMode }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState("main")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSwitchLayout = () => {
    if (user && !user.isVip) {
      navigate("/basic-user/blog")
    } else if (user && user.isVip) {
      navigate("/admin")
    }
  }

  const features = [
    {
      icon: <Baby className="feature-icon" />,
      title: "Theo dõi thai kỳ",
      description: "Cập nhật thông tin và theo dõi sự phát triển của thai nhi hàng tuần",
      direction: "left",
      color: "#ffc2d1",
    },
    {
      icon: <Heart className="feature-icon" />,
      title: "Tư vấn dinh dưỡng",
      description: "Chế độ dinh dưỡng phù hợp cho từng giai đoạn thai kỳ",
      direction: "right",
      color: "#ff9a9e",
    },
    {
      icon: <Calendar className="feature-icon" />,
      title: "Lịch khám thai",
      description: "Quản lý lịch khám và nhắc nhở định kỳ",
      direction: "left",
      color: "#fad0c4",
    },
    {
      icon: <Book className="feature-icon" />,
      title: "Kiến thức hữu ích",
      description: "Thư viện bài viết phong phú về mang thai và chăm sóc em bé",
      direction: "right",
      color: "#a18cd1",
    },
    {
      icon: <Users className="feature-icon" />,
      title: "Cộng đồng",
      description: "Kết nối với các mẹ bầu khác và chia sẻ kinh nghiệm",
      direction: "left",
      color: "#fbc2eb",
    },
  ]

  const floatingItems = [
    { src: "/1.png", alt: "Baby Float 1", position: "left" },
    { src: "/2.png", alt: "Baby Float 2", position: "right" },
    { src: "/3.png", alt: "Baby Item 1", position: "left" },
    { src: "/4.png", alt: "Baby Item 2", position: "right" },
    { src: "/5.png", alt: "Baby Item 3", position: "bottom" },
    { src: "/6.png", alt: "Baby Item 4", position: "bottom" },
    { src: "/7.png", alt: "Baby Item 5", position: "left" },
    { src: "/8.png", alt: "Baby Item 6", position: "right" },

  ]

  

  return (
    <section className={`hero ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="hero-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>


      <AnimatePresence mode="wait">
        {isSearchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="search-container">
              <input type="text" placeholder="Tìm kiếm..." autoFocus className="search-input" />
              <button className="close-search" onClick={() => setIsSearchOpen(false)}>
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hero-content">
        <motion.div
          className="hero-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Đồng hành cùng mẹ bầu trên hành trình thiêng liêng</h1>
          <p>Ứng dụng thông minh giúp theo dõi thai kỳ, tư vấn dinh dưỡng và kết nối cộng đồng mẹ bầu</p>

          <div className="current-time">{currentTime.toLocaleTimeString()}</div>

          <div className="hero-buttons">
            <motion.button 
              className="btn btn-primary" 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => navigate("/login")}
            >
              Bắt đầu ngay để theo dõi hành trình mang thai đầy kì diệu của mẹ
            </motion.button>
            <motion.button className="btn btn-outline" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Tìm hiểu thêm
            </motion.button>
            {/* {user && (
              <motion.button
                className="btn btn-switch-layout"
                onClick={handleSwitchLayout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {user.isVip ? "Chuyển đến Admin" : "Xem Blog & Cộng đồng"}
              </motion.button>
            )} */}
          </div>

          <div className="hero-stats">
            <motion.div className="stat-item" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <span className="stat-number">10K+</span>
              <span className="stat-label">Mẹ bầu tin dùng</span>
            </motion.div>
            <motion.div className="stat-item" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <span className="stat-number">500+</span>
              <span className="stat-label">Bài viết hữu ích</span>
            </motion.div>
            <motion.div className="stat-item" whileHover={{ y: -10 }} transition={{ type: "spring", stiffness: 300 }}>
              <span className="stat-number">50+</span>
              <span className="stat-label">Chuyên gia tư vấn</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="features-waterfall">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`feature-card ${feature.direction}`}
              initial={{
                x: feature.direction === "left" ? -100 : 100,
                opacity: 0,
              }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: index * 0.2,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              <div className="water-drop"></div>
              <div className="feature-content">
                <div className="feature-icon-wrapper" style={{ backgroundColor: feature.color }}>
                  {feature.icon}
                  <div className="icon-ripple"></div>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
              <div className="water-stream"></div>
            </motion.div>
          ))}
        </div>

        <div className="auth-buttons">{user ? <UserMenu /> : <></>}</div>

        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <ChevronDown size={30} />
        </motion.div>
      </div>

      <div className="floating-items-container">
        {floatingItems.map((item, index) => (
          <motion.img
            key={index}
            src={item.src}
            alt={item.alt}
            className={`floating-item floating-item-${index + 1}`}
            initial={
              item.position === "left"
                ? { x: "-100%", opacity: 0 }
                : item.position === "right"
                  ? { x: "100%", opacity: 0 }
                  : { y: "100%", opacity: 0 }
            }
            animate={{
              x: 0,
              y: 0,
              opacity: 1,
              transition: {
                duration: 1.5,
                delay: index * 0.2,
                type: "spring",
                stiffness: 50,
              },
            }}
            whileHover={{
              scale: 1.1,
              transition: { duration: 0.3 },
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default HeaderContent

