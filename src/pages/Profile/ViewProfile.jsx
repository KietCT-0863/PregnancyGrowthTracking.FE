import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, ArrowLeft, Edit, Calendar, Mail, Phone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import userService from "../../api/services/userService";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import "./ViewProfile.scss";
import { playNotificationSound } from "../../utils/soundUtils";

const ViewProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const [profileImage, setProfileImage] = useState(
    userData?.profileImageUrl || "/placeholder.svg"
  );
  const [userInfo, setUserInfo] = useState({
    userName: "",
    fullName: "",
    email: "",
    dob: null,
    phone: "",
    membershipType: "",
    membershipExpiryDate: null,
    role: ""
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Lấy token và decode để đọc role từ JWT
      const token = localStorage.getItem("token");
      let userRole = "member"; // Mặc định là member

      if (token) {
        try {
          const decoded = jwtDecode(token);
          userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        } catch (tokenError) {
          console.error("Lỗi khi decode token:", tokenError);
        }
      }

      const response = await userService.getUserInfo();
      setUserInfo({
        userName: response.userName || "",
        fullName: response.fullName || "",
        email: response.email || "",
        dob: response.dob ? new Date(response.dob) : null,
        phone: response.phone || "",
        membershipType: response.membershipType || "Cơ bản",
        membershipExpiryDate: response.membershipExpiryDate ? new Date(response.membershipExpiryDate) : null,
        role: userRole // Sử dụng role từ token JWT
      });
      setProfileImage(response.profileImageUrl || "/placeholder.svg");
      setLoading(false);
    } catch (error) {
      toast.error("Không thể tải thông tin người dùng");
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Chưa cung cấp";
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  return (
    <motion.div
      className="view-profile-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="view-profile-header">
        <motion.button
          className="back-button"
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </motion.button>
        <h1>Thông tin cá nhân</h1>
        <motion.button
          className="edit-button"
          onClick={() => navigate("edit")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Edit size={20} />
          <span>Chỉnh sửa</span>
        </motion.button>
      </div>

      <div className="view-profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-image">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg";
                  }}
                />
              ) : (
                <User size={80} className="placeholder-icon" />
              )}
            </div>
            <div className="profile-name">
              <h2>{userInfo.fullName || "Người dùng"}</h2>
              <p className="username">@{userInfo.userName}</p>
              <div className="membership-badge">
                <span className={`badge ${userInfo.role === "vip" ? "vip" : "member"}`}>
                  {userInfo.role === "vip" ? "Thành viên VIP" : "Thành viên Cơ bản"}
                </span>
                {userInfo.membershipExpiryDate && userInfo.role === "vip" && (
                  <span className="expiry-date">
                    Hết hạn: {formatDate(userInfo.membershipExpiryDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <Mail size={20} />
              <div className="detail-content">
                <label>Email</label>
                <p>{userInfo.email || "Chưa cung cấp"}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Phone size={20} />
              <div className="detail-content">
                <label>Số điện thoại</label>
                <p>{userInfo.phone || "Chưa cung cấp"}</p>
              </div>
            </div>
            
            <div className="detail-item">
              <Calendar size={20} />
              <div className="detail-content">
                <label>Ngày sinh</label>
                <p>{userInfo.dob ? formatDate(userInfo.dob) : "Chưa cung cấp"}</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <Link to="edit" className="action-button primary">
              <Edit size={16} />
              Chỉnh sửa thông tin
            </Link>

            {userInfo.role !== "vip" && (
              <Link to="/basic-user/choose-vip" className="action-button upgrade">
                Nâng cấp lên VIP
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ViewProfile; 