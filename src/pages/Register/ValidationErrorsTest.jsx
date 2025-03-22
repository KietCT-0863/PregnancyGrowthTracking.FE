import { useState } from 'react';
import ValidationErrors from './ValidationErrors';
import './ValidationErrorsTest.scss';

// Sample validation errors to test the component
const sampleErrors = {
  Email: "Email không hợp lệ hoặc đã được sử dụng.",
  Phone: "Số điện thoại phải có 10 số và không chứa ký tự đặc biệt.",
  FullName: "Họ tên không được để trống và phải có độ dài từ 3 đến 50 ký tự.",
  Password: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
  Username: "Tên đăng nhập đã tồn tại hoặc không hợp lệ."
};

// Test component to show how ValidationErrors works
const ValidationErrorsTest = () => {
  const [showErrors, setShowErrors] = useState(false);

  const toggleErrors = () => {
    setShowErrors(!showErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowErrors(true);
  };

  return (
    <div className="validation-test-container">
      <h1>Kiểm tra hiển thị lỗi xác thực</h1>
      
      <div className="controls">
        <button onClick={toggleErrors}>
          {showErrors ? 'Ẩn lỗi' : 'Hiện lỗi'}
        </button>
      </div>
      
      <div className="test-form">
        {showErrors && <ValidationErrors errors={sampleErrors} />}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input type="text" id="username" name="username" />
          </div>
          
          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input type="text" id="fullName" name="fullName" />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input type="tel" id="phone" name="phone" />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input type="password" id="password" name="password" />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input type="password" id="confirmPassword" name="confirmPassword" />
          </div>
          
          <button type="submit">Kiểm tra xác thực</button>
        </form>
      </div>
    </div>
  );
};

export default ValidationErrorsTest; 