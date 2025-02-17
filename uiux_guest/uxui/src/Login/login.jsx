import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.scss";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "member1", // Giá trị mặc định từ API
    password: "member123", // Giá trị mặc định từ API
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Xóa lỗi khi người dùng nhập
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.usernameOrEmail || !formData.password) {
      setErrors({ form: "Vui lòng nhập đầy đủ thông tin" });
      setIsLoading(false);
      return;
    }

    try {
      const url =
        "https://pregnancy-growth-tracking-web-app-ctc4dfa7bqgjhpdd.australiasoutheast-01.azurewebsites.net/api/Auth/Login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: "member1",
          password: "member123",
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        login(data.user);

        if (data.user.role === "Admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
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
                  placeholder="member1"
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
                  placeholder="member123"
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
