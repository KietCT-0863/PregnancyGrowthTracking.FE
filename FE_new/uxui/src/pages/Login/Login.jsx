import { useState } from "react";
import "./Login.scss";

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={(e) => setFormData({...formData, usernameOrEmail: e.target.value})}
            placeholder="Email"
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Mật khẩu"
          />
        </div>

        <button type="submit" className="btn-primary">
          Đăng nhập
        </button>
      </form>
    </div>
  );
};

export default Login;