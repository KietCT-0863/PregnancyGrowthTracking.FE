"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.scss";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import authService from "../../api/services/authService";
import {
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Home,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginErrorBox from "./LoginErrorBox";
import { validateLoginCredentials, formatLoginErrors } from "./LoginValidation";
import { playNotificationSound, playErrorSound } from "../../utils/soundUtils";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState("right");
  const slideshowRef = useRef(null);

  // Danh sách ảnh nền cho slider
  const backgrounds = ["/1.png", "/5.png", "/8.png"];

  useEffect(() => {
    // Kiểm tra xem có thông báo từ trang thanh toán không
    const paymentMessage = localStorage.getItem("paymentSuccessMessage");
    if (paymentMessage) {
      toast.success(paymentMessage);
      // Xóa thông báo sau khi đã hiển thị
      localStorage.removeItem("paymentSuccessMessage");
    }

    // Tự động chuyển slide sau 5 giây
    const interval = setInterval(() => {
      setSlideDirection("right");
      setCurrentSlide((prev) =>
        prev === backgrounds.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  const handleSubmit = async (e) => {
    // Stop form from submitting normally
    if (e) e.preventDefault();

    // Clear any previous errors
    setError("");
    setFormErrors({});

    // Validate form inputs
    const validation = validateLoginCredentials(formData);
    setValidated(true);

    // If validation fails, show field errors and stop
    if (!validation.isValid) {
      console.log("Form validation failed:", validation.errors);
      setFormErrors(validation.errors);

      // Play failure sound with direct user interaction connection
      setTimeout(() => {
        console.log("Playing validation failure sound");
        playErrorSound();
      }, 100);
      return;
    }

    // Start loading state
    setIsLoading(true);

    try {
      // Log the login attempt (without showing password)
      console.log("Attempting login with:", {
        usernameOrEmail: formData.usernameOrEmail,
        password: "********",
      });

      // Call the login API
      const response = await authService.login(formData);

      // If we got a token, login was successful
      if (response && response.token) {
        // Decode the JWT to get the user's role
        const decoded = jwtDecode(response.token);
        const userRole =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        // Call the AuthContext login function
        login(response.token, response.userData, rememberMe);

        // Lưu token vào localStorage để duy trì phiên đăng nhập khi refresh trang
        localStorage.setItem("token", response.token);
        localStorage.setItem("accessToken", response.token);
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken);
        }

        // Đánh dấu phiên làm việc hiện tại
        sessionStorage.setItem("sessionActive", "true");

        // Play success sound and show success toast
        playNotificationSound("loginSuccess");
        toast.success("Đăng nhập thành công!");

        // Navigate based on user role
        if (userRole === "guest" || userRole === "member") {
          navigate("/basic-user");
        } else if (userRole === "admin") {
          navigate("/admin");
        } else if (userRole === "vip") {
          navigate("/member");
        } else {
          // Trường hợp mặc định hoặc không xác định
          navigate("/");
        }
      } else {
        // If we don't have a token, throw an error
        throw new Error("Đăng nhập thất bại: Không nhận được token");
      }
    } catch (err) {
      // Log the error for debugging
      console.error("Login error:", err);

      // Format the error for display
      const formattedErrors = formatLoginErrors(err);

      // Set field errors and general error message
      setFormErrors(formattedErrors.fields || {});
      setError(
        formattedErrors.general || "Có lỗi xảy ra, vui lòng thử lại sau"
      );

      // Play failure sound after error message is shown
      setTimeout(() => {
        console.log("Playing login failure sound after API error");
        playErrorSound();
      }, 100);

      // Log what error message we're showing
      console.log("Showing error message:", formattedErrors.general);
    } finally {
      // Always turn off loading state
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing again
    if (validated && formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleExperienceClick = () => {
    navigate("/register");
  };

  const handlePrevSlide = () => {
    setSlideDirection("left");
    setCurrentSlide((prev) => (prev === 0 ? backgrounds.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setSlideDirection("right");
    setCurrentSlide((prev) => (prev === backgrounds.length - 1 ? 0 : prev + 1));
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      {error && (
        <LoginErrorBox
          message={error}
          onDismiss={() => setError("")}
          isVisible={!!error}
        />
      )}
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
            transition={{
              delay: 0.3,
              duration: 0.5,
              type: "spring",
              stiffness: 200,
            }}
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
          ></motion.p>

          <motion.div
            className="social-login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          ></motion.div>

          <motion.div
            className="divider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          ></motion.div>

          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            noValidate
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
                className={formErrors.usernameOrEmail ? "input-error" : ""}
              />
              <AnimatePresence>
                {formErrors.usernameOrEmail && (
                  <div className="error-message">
                    {formErrors.usernameOrEmail}
                  </div>
                )}
              </AnimatePresence>
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
                  className={formErrors.password ? "input-error" : ""}
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
              <AnimatePresence>
                {formErrors.password && (
                  <div className="error-message">{formErrors.password}</div>
                )}
              </AnimatePresence>
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
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <motion.button
              type="submit"
              className="login-button"
              disabled={isLoading}
              whileHover={
                !isLoading
                  ? {
                      scale: 1.03,
                      y: -3,
                      boxShadow: "0 8px 20px rgba(255, 143, 171, 0.4)",
                    }
                  : {}
              }
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
        <div className="image-container" ref={slideshowRef}>
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, x: slideDirection === "right" ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `url(${backgrounds[currentSlide]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: 0,
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
            <p className="info-desc">
              Theo dõi thai kỳ, tra cứu thông tin và nhận lời khuyên từ các
              chuyên gia
            </p>
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
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
              }}
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
  );
};

export default Login;
