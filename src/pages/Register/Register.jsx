"use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Calendar, Phone, Eye, EyeOff, Twitter } from "lucide-react"
import { register } from "../../services/authService"
import { validatePassword } from "../../utils/validation"
import "./Register.scss"
import ValidationErrors from "./ValidationErrors"
import { playNotificationSound, playErrorSound } from "../../utils/soundUtils"

const formFields = [
  {
    name: "username",
    type: "text",
    label: "Tên đăng nhập",
    placeholder: "Tên đăng nhập",
    icon: User,
    required: true,
  },
  {
    name: "fullName",
    type: "text",
    label: "Họ và tên",
    placeholder: "Nguyễn Văn A",
    icon: User,
    required: true,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeholder: "example@email.com",
    icon: Mail,
    required: true,
  },
  {
    name: "phone",
    type: "tel",
    label: "Số điện thoại",
    placeholder: "0974088571",
    icon: Phone,
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Mật khẩu",
    placeholder: "********",
    icon: Lock,
    required: true,
  },
  {
    name: "confirmPassword",
    type: "password",
    label: "Xác nhận mật khẩu",
    placeholder: "********",
    icon: Lock,
    required: true,
  },
  {
    name: "dob",
    type: "date",
    label: "Ngày sinh",
    placeholder: "",
    icon: Calendar,
    required: true,
  },
]

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({})
  const [structuredErrors, setStructuredErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")

  const validateField = (name, value) => {
    const fieldErrors = {};

    switch (name) {
      case 'email': {
        const trimmedEmail = value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmedEmail)) {
          fieldErrors.Email = "Email không hợp lệ.";
        }
        break;
      }
      case 'phone': {
        if (value && !value.match(/^\d{10}$/)) {
          fieldErrors.Phone = "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.";
        }
        break;
      }
      case 'fullName': {
        if (value.trim().length < 4) {
          fieldErrors.FullName = "Họ và tên phải có ít nhất 4 ký tự.";
        } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          fieldErrors.FullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng.";
        }
        break;
      }
      case 'username': {
        if (value.trim().length < 4) {
          fieldErrors.Username = "Tên đăng nhập phải có ít nhất 4 ký tự.";
        }
        break;
      }
      case 'password': {
        if (value.length < 6) {
          fieldErrors.Password = "Mật khẩu phải có ít nhất 6 ký tự.";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          fieldErrors.Password = "Mật khẩu phải chứa ít nhất một chữ cái thường, một chữ cái viết hoa và một chữ số.";
        }
        break;
      }
      case 'confirmPassword': {
        if (value !== formData.password) {
          fieldErrors.ConfirmPassword = "Mật khẩu xác nhận không khớp.";
        }
        break;
      }
      default:
        break;
    }

    return fieldErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    
    // Validate field on change
    const fieldErrors = validateField(name, value);
    
    // Update errors state
    setStructuredErrors(prevErrors => {
      // If there are errors for this field, add them
      if (Object.keys(fieldErrors).length > 0) {
        return { ...prevErrors, ...fieldErrors };
      }
      
      // If there are no errors for this field but there were before, remove them
      const newErrors = { ...prevErrors };
      const fieldErrorKey = Object.keys(fieldErrors).length === 0 
        ? Object.keys(prevErrors).find(key => key.toLowerCase() === name.toLowerCase())
        : null;
        
      if (fieldErrorKey) {
        delete newErrors[fieldErrorKey];
      }
      
      return newErrors;
    });
  }

  const validateForm = () => {
    const validationErrors = {}

    const trimmedEmail = formData.email?.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      validationErrors.Email = ["Email không hợp lệ."]
    }

    if (!formData.phone?.match(/^\d{10}$/)) {
      validationErrors.Phone = ["Số điện thoại phải có 10 chữ số và bắt đầu bằng 0."]
    }

    if (!formData.fullName || formData.fullName.trim().length < 4) {
      validationErrors.FullName = [
        "Họ và tên phải có ít nhất 4 ký tự.",
        "Họ và tên chỉ được chứa chữ cái và khoảng trắng, không chứa số hoặc ký tự đặc biệt."
      ]
    }

    if (!formData.password || formData.confirmPassword) {
      const passwordError = validatePassword(formData.password, formData.confirmPassword)
      if (passwordError) {
        validationErrors.Password = [passwordError]
      }
    } else if (!formData.password || formData.password.length < 6) {
      validationErrors.Password = [
        "Mật khẩu phải có ít nhất 6 ký tự.",
        "Mật khẩu phải chứa ít nhất một chữ cái thường, một chữ cái viết hoa và một chữ số."
      ]
    }

    if (!formData.username || formData.username.length < 4) {
      validationErrors.Username = ["Username phải có ít nhất 4 ký tự."]
    }

    return Object.keys(validationErrors).length > 0 ? validationErrors : null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setStructuredErrors({})

    // Validate form
    const errors = validateForm()
    if (errors) {
      setStructuredErrors(errors)
      // Add a small delay to ensure UI updates before playing sound
      setTimeout(() => {
        console.log("Playing register validation failure sound");
        playErrorSound()
      }, 100);
      return
    }

    try {
      setLoading(true)
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        fullname: formData.fullName,
        dob: formData.dob,
      })

      if (response && response.success) {
        playNotificationSound('loginSuccess')
        navigate("/login", { state: { message: "Đăng ký thành công, vui lòng đăng nhập" } })
      } else {
        setError(response?.message || "Đăng ký thất bại")
        setTimeout(() => {
          console.log("Playing register API failure sound");
          playErrorSound()
        }, 100);
      }
    } catch (error) {
      console.error("Registration error:", error)
      let errorMessage = "Đăng ký thất bại"
      
      if (error.response && error.response.data) {
        const serverErrors = error.response.data
        
        if (typeof serverErrors === 'string') {
          errorMessage = serverErrors
        } else if (serverErrors.errors) {
          setStructuredErrors(serverErrors.errors)
        } else if (serverErrors.message) {
          errorMessage = serverErrors.message
        }
      }
      
      setError(errorMessage)
      setTimeout(() => {
        console.log("Playing register error failure sound");
        playErrorSound()
      }, 100);
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const handleSocialRegister = (provider) => {
    // This would be implemented to handle social registration
    console.log(`Register with ${provider}`)
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-left">
          <div className="brand">
            <img src="/Logo bau-02.png" alt="Logo Mẹ Bầu" className="brand-logo" />
            <h1>Mẹ Bầu</h1>
            <p>Đồng hành cùng mẹ trong hành trình thai kỳ</p>
          </div>

          <div className="action-buttons">
            <Link to="/login" className="btn-outline">
              Đăng nhập
            </Link>
            <button className="btn-filled">Đăng ký</button>
          </div>

          <div className="register-content">
            <h2>Bắt đầu hành trình làm mẹ</h2>
            <p className="subtitle">Đăng ký tài khoản</p>

            <div className="social-login">
              <button
                className="social-btn facebook"
                onClick={() => handleSocialRegister("facebook")}
                aria-label="Đăng ký với Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 320 512" fill="#4267B2">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/>
                </svg>
              </button>
              <button
                className="social-btn google"
                onClick={() => handleSocialRegister("google")}
                aria-label="Đăng ký với Google"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
              </button>
              <button
                className="social-btn twitter"
                onClick={() => handleSocialRegister("twitter")}
                aria-label="Đăng ký với Twitter"
              >
                <Twitter size={20} />
              </button>
            </div>

            <div className="divider">
              <span>hoặc</span>
            </div>

            {error && <div className="error-message">{error}</div>}
            {Object.keys(structuredErrors).length > 0 && <ValidationErrors errors={structuredErrors} />}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-grid">
                {formFields.map((field) => (
                  <div key={field.name} className="form-group">
                    <label htmlFor={field.name} className="sr-only">
                      {field.label}
                    </label>
                    <div className="input-group">
                      <field.icon className="input-icon" />
                      <input
                        type={
                          field.name === "password"
                            ? showPassword
                              ? "text"
                              : "password"
                            : field.name === "confirmPassword"
                              ? showConfirmPassword
                                ? "text"
                                : "password"
                              : field.type
                        }
                        name={field.name}
                        id={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.label}
                        disabled={loading}
                        className="form-input"
                      />
                      {field.name === "password" && (
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="password-toggle"
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                      {field.name === "confirmPassword" && (
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="password-toggle"
                          aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-footer">
                <button type="submit" className="btn-register" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    "Đăng ký"
                  )}
                </button>

                <button type="button" className="btn-back" onClick={() => navigate("/")}>
                  Quay lại trang chủ
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="register-right">
          <img src="/4.png" alt="Mẹ bầu" className="background-image" />
          
          <div className="info-card">
            <div className="info-content">
              <div className="info-badge">
                <span className="heart-icon">❤</span>
              </div>
              <h3>Theo dõi thai kỳ. Chăm sóc sức khỏe. Nuôi dạy con cái.</h3>
              <p>Hỗ trợ mẹ theo dõi sự phát triển của thai nhi, quản lý lịch khám và chăm sóc sức khỏe suốt thai kỳ.</p>
              <div className="info-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 0L6.59 1.41L12.17 7H0V9H12.17L6.59 14.59L8 16L16 8L8 0Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          <div className="journey-text">
            <h2>Chăm sóc tinh tế</h2>
            <h2>Nuôi dưỡng tương lai!</h2>
          </div>

          <div className="features-preview">
            <div className="feature">
              <img src="/5.png" alt="Theo dõi thai kỳ" className="feature-icon" />
              <span>Theo dõi thai kỳ</span>
            </div>
            <div className="feature">
              <img src="/6.png" alt="Lịch khám thai" className="feature-icon" />
              <span>Lịch khám thai</span>
            </div>
            <div className="feature">
              <img src="/7.png" alt="Dinh dưỡng mẹ bầu" className="feature-icon" />
              <span>Dinh dưỡng</span>
            </div>
          </div>

          <button className="experience-btn">Bắt đầu hành trình làm mẹ ngay!</button>
        </div>
      </div>
    </div>
  )
}

export default Register

