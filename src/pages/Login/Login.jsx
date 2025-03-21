"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Login.scss"
import { toast } from "react-toastify"
import { jwtDecode } from "jwt-decode"
import authService from "../../api/services/authService"
import { Eye, EyeOff, ChevronLeft, ChevronRight, ArrowRight, Home } from "lucide-react"
import { motion } from "framer-motion"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState("right")
  const slideshowRef = useRef(null)

  // Danh sách ảnh nền cho slider
  const backgrounds = [
    "/1.png", 
    "/5.png", 
    "/8.png"
  ]

  useEffect(() => {
    // Kiểm tra xem có thông báo từ trang thanh toán không
    const paymentMessage = localStorage.getItem("paymentSuccessMessage")
    if (paymentMessage) {
      toast.success(paymentMessage)
      // Xóa thông báo sau khi đã hiển thị
      localStorage.removeItem("paymentSuccessMessage")
    }

    // Tự động chuyển slide sau 5 giây
    const interval = setInterval(() => {
      setSlideDirection("right")
      setCurrentSlide((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [backgrounds.length])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!formData.usernameOrEmail || !formData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin")
      }

      const response = await authService.login(formData)

      if (response && response.token) {
        const decoded = jwtDecode(response.token)
        const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]

        // Gọi hàm login từ AuthContext
        login(response.token, response.userData, rememberMe)

        toast.success("Đăng nhập thành công!")

        if (userRole === "guest") {
          navigate("/basic-user")
        } else if (userRole === "admin") {
          navigate("/admin")
        } else {
          navigate("/member")
        }
      } else {
        throw new Error("Đăng nhập thất bại: Không nhận được token")
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Thông tin đăng nhập không hợp lệ")
            break
          case 401:
            setError("Email hoặc mật khẩu không đúng")
            break
          case 404:
            setError("Tài khoản không tồn tại")
            break
          default:
            setError("Có lỗi xảy ra, vui lòng thử lại sau")
        }
      } else if (err.message) {
        setError(err.message)
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSignUp = () => {
    navigate("/register")
  }

  const handleExperienceClick = () => {
    navigate("/register")
  }

  const handlePrevSlide = () => {
    setSlideDirection("left")
    setCurrentSlide((prev) => (prev === 0 ? backgrounds.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setSlideDirection("right")
    setCurrentSlide((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1))
  }

  const handleHomeClick = () => {
    navigate("/")
  }

  return (
    <div className="login-container">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Phần form đăng nhập */}
        <div className="login-form-container">
          <motion.div 
            className="brand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="brand-name">Mẹ Bầu</h1>
            <p className="tagline">Đồng hành cùng mẹ và bé</p>
          </motion.div>

          <motion.img 
            src="/Logo bau-02.png" 
            alt="Logo Mẹ Bầu" 
            className="brand-logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          />

          <motion.div 
            className="action-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button 
              className="btn btn-outline" 
              onClick={handleSignUp}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Đăng Ký
            </motion.button>
            <motion.button 
              className="btn btn-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Đăng Nhập
            </motion.button>
          </motion.div>

          <motion.h2 
            className="login-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Hành Trình Bắt Đầu
          </motion.h2>
          
          <motion.p 
            className="login-subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Đăng nhập với tài khoản
          </motion.p>

          <motion.div 
            className="social-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <motion.button 
              className="social-btn"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.0001 2C6.47715 2 2.00005 6.47711 2.00005 12C2.00005 17.5229 6.47715 22 12.0001 22C17.523 22 22.0001 17.5229 22.0001 12C22.0001 6.47711 17.523 2 12.0001 2Z"
                  fill="#007AFF"
                />
                <path
                  d="M15.7909 12.5307C15.7909 10.2132 14.0584 9.32031 12.0584 9.32031C9.89092 9.32031 8.32092 10.5403 8.32092 12.6957C8.32092 14.6957 9.67592 16.0707 11.8459 16.0707C13.0584 16.0707 14.0584 15.6957 14.7284 15.0257"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
            <motion.button 
              className="social-btn"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </motion.button>
            <motion.button 
              className="social-btn"
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="#000000"
                />
              </svg>
            </motion.button>
          </motion.div>

          <motion.div 
            className="divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            hoặc
          </motion.div>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
          <div className="form-group">
              <label htmlFor="usernameOrEmail">Tên đăng nhập</label>
              <motion.input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
                placeholder="Nhập tên đăng nhập hoặc email"
              disabled={isLoading}
                whileFocus={{ scale: 1.01 }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
              <div className="password-field">
                <motion.input
              id="password"
                  type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
                  whileFocus={{ scale: 1.01 }}
                />
                <motion.button 
                  type="button" 
                  className="toggle-password" 
                  onClick={toggleShowPassword}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
          </div>

            <div className="form-options">
              <div className="checkbox-container">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <label htmlFor="remember-me">Ghi nhớ đăng nhập</label>
              </div>
              <Link 
                to="/forgot-password" 
                className="forgot-password"
              >
              Quên mật khẩu?
            </Link>
          </div>

            <motion.button 
              type="submit" 
              className="login-button" 
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.03, y: -3 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
                "Đăng Nhập"
              )}
            </motion.button>
            
            <motion.button 
              type="button"
              className="home-button" 
              onClick={handleHomeClick}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Home size={16} />
              <span>Quay về trang chủ</span>
            </motion.button>
          </motion.form>
          </div>

        {/* Phần hiển thị hình ảnh */}
        <div 
          className="image-container"
          ref={slideshowRef}
        >
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${backgrounds[currentSlide]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0
            }}
          />
          
          <motion.div 
            className="info-card"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            whileHover={{ y: -5 }}
          >
            <h3 className="info-title">Khám phá, Trải nghiệm</h3>
            <p className="info-desc">Theo dõi thai kỳ, tra cứu thông tin và nhận lời khuyên từ các chuyên gia</p>
            <span className="location">
              <span className="pin-icon">❤️</span> Vì tương lai của bé
            </span>
            <ArrowRight className="arrow-icon" size={16} />
          </motion.div>

          <motion.div 
            className="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <motion.h2 
              className="tagline-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Hành trình thai kỳ
              <br />
              Khởi đầu hạnh phúc!
            </motion.h2>
            <motion.button 
              className="experience-button" 
              onClick={handleExperienceClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              Trải nghiệm ngay hôm nay!
            </motion.button>
          </motion.div>

          <motion.div 
            className="navigation-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
          >
            <motion.button 
              className="dot" 
              onClick={handlePrevSlide}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button 
              className="dot" 
              onClick={handleNextSlide}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={16} />
            </motion.button>
          </motion.div>
      </div>
      </motion.div>
    </div>
  )
}

export default Login

