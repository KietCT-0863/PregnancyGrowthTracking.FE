export const validatePassword = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return "Mật khẩu xác nhận không khớp"
  }
  if (password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự"
  }
  return null
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return "Email không hợp lệ"
  }
  return null
}

export const validatePhone = (phone) => {
  if (!phone.match(/^\d{10}$/)) {
    return "Số điện thoại phải có 10 chữ số"
  }
  return null
} 