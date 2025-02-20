import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.scss";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

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

      const response = await login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      console.log("Login response in component:", response);

      if (
        response &&
        (response.token || (response.data && response.data.token))
      ) {
        const token = response.token || response.data.token;
        const decoded = jwtDecode(token);
        const role =
          decoded[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];
        toast.success("Đăng nhập thành công!");

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          const role =
            decoded[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ];
          toast.success("Đăng nhập thành công!");

          if (role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          throw new Error("Đăng nhập thất bại: Không nhận được token");
        }
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
      <div className="login-box">
        <div className="login-header">
          <h1>Đăng nhập</h1>
          {/* TODO: Thêm logo của bạn ở đây */}
          <img src="/logo.png" alt="Logo" className="logo" />
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
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
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          <div className="register-prompt">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="register-link">
              Đăng ký ngay
            </Link>
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
