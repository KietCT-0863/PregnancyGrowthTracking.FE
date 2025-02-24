import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.scss";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import authService from "../../api/services/authService";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!formData.usernameOrEmail || !formData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      const response = await authService.login(formData);
      
      console.log('Login response:', response);
      
      const storedUserData = localStorage.getItem('userData');
      console.log('Stored user data:', storedUserData);

      if (response && response.token) {
        const decoded = jwtDecode(response.token);
        const userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        toast.success("Đăng nhập thành công!");

        if (userRole === "guest") {
          navigate("/basic-user");
        } else if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/member");
        }
      } else {
        throw new Error("Đăng nhập thất bại: Không nhận được token");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError("Thông tin đăng nhập không hợp lệ");
            break;
          case 401:
            setError("Email hoặc mật khẩu không đúng");
            break;
          case 404:
            setError("Tài khoản không tồn tại");
            break;
          default:
            setError("Có lỗi xảy ra, vui lòng thử lại sau");
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại sau");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="login-container">
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

      <div className="login-box">
        <div className="login-header">
          <h1>Đăng nhập</h1>
          <img src="/public/Logo bau-02.png" alt="Logo" className="logo" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="glass-effect">
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Email hoặc tên đăng nhập</label>
            <input
              id="usernameOrEmail"
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Nhập email hoặc tên đăng nhập"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
            />
          </div>

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-password">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <div className="register-prompt">
            <p>
              Chưa có tài khoản?{" "}
              <Link to="/register" className="register-link">
                Đăng ký ngay
              </Link>
            </p>
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate("/")}
            >
              Quay lại trang chủ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
