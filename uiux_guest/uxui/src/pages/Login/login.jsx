import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.scss";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (!formData.usernameOrEmail || !formData.password) {
      setErrors({ form: "Vui lòng nhập đầy đủ thông tin" });
      setIsLoading(false);
      return;
    }

    try {
      const url = "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Auth/Login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem("token", data.token);
        
        // Xác định role dựa trên response từ API
        let userRole;
        if (data.user.role === "Admin") {
          userRole = "admin";
        } else if (data.user.role === "VIP") {
          userRole = "vip";
        } else {
          userRole = "non-vip";
        }

        // Lưu thông tin user với role
        const userData = {
          ...data.user,
          role: userRole
        };
        
        login(userData);

        // Điều hướng dựa trên role
        switch (userRole) {
          case "admin":
            navigate("/admin");
            break;
          case "vip":
            navigate("/dashboard");
            break;
          case "non-vip":
            navigate("/dashboard");
            break;
          default:
            navigate("/");
        }
      } else {
        setErrors({
          form: data.message || "Tên đăng nhập hoặc mật khẩu không chính xác",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        form: "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse?.credential);
      console.log("Google login successful:", decoded);
      
      // Mặc định user Google là non-vip
      const userData = {
        email: decoded.email,
        name: decoded.name,
        role: "non-vip"
      };
      
      login(userData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({
        form: "Đăng nhập bằng Google thất bại",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-image">
          <img
            src="/images/pregnant-woman.jpg"
            alt="Pregnant woman"
            className="login-img"
          />
        </div>
        <div className="login-form">
          <h1>Đăng nhập</h1>
          {errors.form && (
            <div
              className="error-message"
              style={{ color: "red", marginBottom: "1rem" }}
            >
              {errors.form}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Tên đăng nhập</label>
              <div className="input-group">
                <Mail className="input-icon" />
                <input
                  type="text"
                  name="usernameOrEmail"
                  id="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="Nhập tên đăng nhập hoặc email"
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
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember-me" name="remember-me" />
                <label htmlFor="remember-me">Ghi nhớ đăng nhập</label>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
              style={{ width: "100%", marginTop: "1rem" }}
            >
              {isLoading ? <Loader className="spinner" /> : "Đăng nhập"}
            </button>
          </form>

          <div className="divider">
            <span>Hoặc</span>
          </div>

          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.log("Login Failed");
                setErrors({ form: "Đăng nhập bằng Google thất bại" });
              }}
            />
          </div>

          <p className="register-link">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
