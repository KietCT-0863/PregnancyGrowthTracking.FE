import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, User, Calendar } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dueDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleGoogleSignIn = async () => {
    try {
      // Xử lý đăng nhập Google ở đây
      console.log("Google sign-in clicked");
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-image">
          <img
            src="/images/pregnant-woman.jpg"
            alt="Pregnant woman"
            className="register-img"
          />
        </div>
        <div className="register-form">
          <h1>Đăng ký tài khoản</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Họ và tên</label>
              <div className="input-group">
                <User className="input-icon" />
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="********"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="********"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Ngày dự sinh</label>
              <div className="input-group">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Đăng ký
            </button>
          </form>

          <p className="login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
