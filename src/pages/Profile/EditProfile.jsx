import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import profileImageService from "../../api/services/profileImageService";
import userService from "../../api/services/userService";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./EditProfile.scss";
import { playNotificationSound, playErrorSound } from "../../utils/soundUtils";

const EditProfile = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [profileImage, setProfileImage] = useState(
    userData?.profileImageUrl || "/placeholder.svg"
  );
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    password: "",
    dob: null,
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await userService.getUserInfo();
      setFormData({
        userName: response.userName || "",
        fullName: response.fullName || "",
        email: response.email || "",
        password: "",
        dob: response.dob ? new Date(response.dob) : null,
        phone: response.phone || "",
      });
      setProfileImage(response.profileImageUrl || "/placeholder.svg");
      setLoading(false);
    } catch (error) {
      toast.error("Không thể tải thông tin người dùng");
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate password if provided
    if (formData.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password =
          "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số";
      }
    }

    // Validate phone
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const updateData = {
        ...formData,
        dob: formData.dob
          ? formData.dob.toISOString().split("T")[0]
          : undefined,
        password: formData.password || undefined,
      };

      await userService.updateUserInfo(updateData);
      toast.success("Cập nhật thông tin thành công");
      playNotificationSound('profileSuccess');

      // Cập nhật thông tin trong localStorage
      const currentUserData = JSON.parse(localStorage.getItem("userData"));
      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...currentUserData,
          userName: formData.userName,
          fullName: formData.fullName,
          email: formData.email,
        })
      );
    } catch (error) {
      toast.error(
        "Không thể cập nhật thông tin: " +
          (error.response?.data?.message || "Đã có lỗi xảy ra")
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("Không tìm thấy file");
      return;
    }

    console.log("File được chọn:", file.name, "Kích thước:", file.size, "Loại:", file.type);

    // Kiểm tra kích thước file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Kích thước ảnh không được vượt quá 5MB",
      });
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG",
      });
      return;
    }

    try {
      setUploading(true);
      console.log("Bắt đầu tải ảnh lên...");

      // Hiển thị preview ảnh ngay lập tức
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Đã tạo preview ảnh");
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // In ra thông tin user trước khi gửi request
      const storedUserData = JSON.parse(localStorage.getItem("userData"));
      console.log("UserId hiện tại:", storedUserData?.userId);

      // Thông báo đang xử lý để cải thiện trải nghiệm người dùng
      toast.info("Đang cập nhật ảnh đại diện...", { 
        autoClose: 2000,
        position: "top-right"
      });

      // Upload ảnh lên server
      console.log("Gửi request API cập nhật ảnh đại diện...");
      const response = await profileImageService.updateProfileImage(file);
      console.log("Kết quả API:", response);

      if (response && response.profileImageUrl) {
        // Cập nhật URL ảnh mới trong localStorage
        const currentUserData = JSON.parse(localStorage.getItem("userData"));
        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...currentUserData,
            profileImageUrl: response.profileImageUrl,
          })
        );

        // Cập nhật state với URL mới kèm timestamp để buộc browser tải lại ảnh
        setProfileImage(response.profileImageUrl);

        // Tải lại ảnh đại diện trên header của ứng dụng (nếu có)
        if (window.updateHeaderAvatar) {
          window.updateHeaderAvatar();
        }

        toast.success("Cập nhật ảnh đại diện thành công");
        playNotificationSound('profileSuccess');
      } else {
        console.error("Không có URL ảnh trong response:", response);
        throw new Error("Không có URL ảnh trong kết quả trả về");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      console.log("Error details:", error.response?.data);
      
      // Hiển thị thông báo lỗi cụ thể và dễ hiểu hơn
      let errorMessage = "Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.";
      
      if (error.response?.status === 415) {
        errorMessage = "Định dạng file không được hỗ trợ. Vui lòng dùng JPG hoặc PNG.";
      } else if (error.response?.status === 413) {
        errorMessage = "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.";
      } else if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Phát âm thanh lỗi
      playErrorSound();
      
      // Khôi phục ảnh cũ nếu upload thất bại
      setProfileImage(userData?.profileImageUrl || "/placeholder.svg");
    } finally {
      setUploading(false);
      console.log("Kết thúc quá trình xử lý upload ảnh");
      
      // Reset input file để có thể chọn lại cùng 1 file
      const fileInput = document.getElementById('profile-image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <motion.div
      className="edit-profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="edit-profile-header">
        <motion.button
          className="back-button"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Chỉnh sửa thông tin cá nhân</h1>
      </div>

      <div className="edit-profile-content">
        <div className="profile-image-section">
          <div className="image-preview">
            <div className="image-container">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-image"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <User size={60} className="placeholder-icon" />
              )}
              <motion.div
                className={`upload-overlay ${uploading ? "uploading" : ""}`}
                whileHover={{ opacity: 1 }}
                onClick={() => {
                  // Kích hoạt click vào input file khi overlay được click
                  document.getElementById('profile-image-upload').click();
                }}
              >
                <label htmlFor="profile-image-upload" className="upload-button">
                  <Upload size={20} />
                  <span>{uploading ? "Đang tải..." : "Thay đổi ảnh"}</span>
                </label>
              </motion.div>
            </div>
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </div>
          <div className="image-info">
            <h3>Ảnh đại diện</h3>
            <p className="upload-hint">
              Cho phép: JPG, JPEG, PNG
              <br />
              Kích thước tối đa: 5MB
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {/* <div className="form-group">
              <label htmlFor="userName">Tên đăng nhập</label>
              <input
                type="text"
                id="userName"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                disabled
              />
            </div> */}

          <div className="form-group">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Mật khẩu mới (để trống nếu không muốn thay đổi)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dob">Ngày sinh</label>
            <DatePicker
              selected={formData.dob}
              onChange={(date) =>
                setFormData((prev) => ({ ...prev, dob: date }))
              }
              dateFormat="dd/MM/yyyy"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              placeholderText="Chọn ngày sinh"
              className="date-picker"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cập nhật thông tin
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProfile;
