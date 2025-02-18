"use client"

import React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, Lock, User, Calendar } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import "./Register.scss"

const formFields = [
  {
    name: "name",
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
    name: "dueDate",
    type: "date",
    label: "Ngày dự sinh",
    placeholder: "",
    icon: Calendar,
    required: true,
  },
]

const Register = () => {
  const [formData, setFormData] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  const handleGoogleSignIn = async () => {
    try {
      console.log("Google sign-in clicked")
    } catch (error) {
      console.error("Google sign-in error:", error)
    }
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-image">
          <img src="/images/pregnant-woman.jpg" alt="Pregnant woman" className="register-img" />
        </div>
        <div className="register-form">
          <h1>Đăng ký tài khoản</h1>
          <form onSubmit={handleSubmit}>
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
                  />
                </div>
              </div>
            ))}
            <button type="submit" className="btn-primary">
              Đăng ký
            </button>
          </form>

          <div className="divider">
            <span>Hoặc</span>
          </div>

          <button className="btn-google" onClick={handleGoogleSignIn}>
            <FcGoogle className="google-icon" />
            Đăng ký với Google
          </button>

          <p className="login-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register