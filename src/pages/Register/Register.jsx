"use client"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Calendar, Phone } from "lucide-react"
import { register } from "../../services/authService"
import { validateEmail, validatePassword } from "../../utils/validation"
import "./Register.scss"

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
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const emailError = validateEmail(formData.email)
    if (emailError) return emailError

    const passwordError = validatePassword(formData.password, formData.confirmPassword)
    if (passwordError) return passwordError

    if (!formData.phone?.match(/^\d{10}$/)) {
      return "Số điện thoại không hợp lệ"
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dob: formData.dob,
        phone: formData.phone,
      }

      await register(userData)
      navigate("/login")
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đăng ký")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="leaves">
        {[...Array(15)].map((_, index) => (
          <div key={index} className="leaf"></div>
        ))}
      </div>

      <div className="wave-container">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      {/* Thêm hiệu ứng thác đổ */}
      <div className="waterfall">
        {[...Array(20)].map((_, index) => (
          <div key={`drop-${index}`} className="water-drop"></div>
        ))}
      </div>

      <div className="register-box">
        <div className="register-header">
          <h1>Đăng ký tài khoản</h1>
          <img src="/Logo bau-02.png" alt="Logo" className="logo" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="glass-effect">
          {formFields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}</label>
              <div className="input-group">
                <field.icon className="input-icon" />
                <input
                  type={field.type}
                  name={field.name}
                  id={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                  disabled={loading}
                />
              </div>
            </div>
          ))}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Đăng ký"
            )}
          </button>

          <div className="login-prompt">
            <p>
              Đã có tài khoản?{" "}
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>
            </p>
            <button type="button" className="btn-back" onClick={() => navigate("/")}>
              Quay lại trang chủ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register

