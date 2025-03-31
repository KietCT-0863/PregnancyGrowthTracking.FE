import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';

// Hàm kiểm tra và xóa phiên đăng nhập khi tải lại trang từ đầu
const checkSessionOnInit = () => {
  // Nếu người dùng mở ứng dụng trong tab mới hoặc cửa sổ mới
  // Kiểm tra nếu có userData nhưng không có session
  const userData = localStorage.getItem("userData");
  const sessionActive = sessionStorage.getItem("sessionActive");
  
  if (userData && !sessionActive) {
    console.log("Phiên làm việc mới, xóa dữ liệu đăng nhập cũ");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  }
};

// Gọi hàm kiểm tra ngay khi trang được tải
checkSessionOnInit();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
