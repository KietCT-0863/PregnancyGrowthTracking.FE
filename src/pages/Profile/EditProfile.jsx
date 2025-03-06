import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import profileImageService from '../../api/services/profileImageService';
import './EditProfile.scss';

const EditProfile = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const userData = JSON.parse(localStorage.getItem('userData'));
  const [profileImage, setProfileImage] = useState(userData?.profileImageUrl || '/placeholder.svg');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Kích thước ảnh không được vượt quá 5MB'
      });
      return;
    }

    // Kiểm tra định dạng file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Chỉ chấp nhận file ảnh định dạng JPG, JPEG hoặc PNG'
      });
      return;
    }

    try {
      setUploading(true);

      // Hiển thị preview ảnh ngay lập tức
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload ảnh lên server
      const response = await profileImageService.updateProfileImage(file);
      
      if (response.profileImageUrl) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Cập nhật ảnh đại diện thành công',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.'
      });
      // Khôi phục ảnh cũ nếu upload thất bại
      setProfileImage(userData?.profileImageUrl || '/placeholder.svg');
    } finally {
      setUploading(false);
    }
  };

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
          onClick={() => navigate('/member/profile')}
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
                    e.target.src = '/placeholder.svg';
                  }} 
                />
              ) : (
                <User size={60} className="placeholder-icon" />
              )}
              <motion.div 
                className={`upload-overlay ${uploading ? 'uploading' : ''}`}
                whileHover={{ opacity: 1 }}
              >
                <label htmlFor="profile-image-upload" className="upload-button">
                  <Upload size={20} />
                  <span>{uploading ? 'Đang tải...' : 'Thay đổi ảnh'}</span>
                </label>
              </motion.div>
            </div>
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              style={{ display: 'none' }}
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

        {/* Phần form chỉnh sửa thông tin khác sẽ được thêm sau */}
      </div>
    </motion.div>
  );
};

export default EditProfile; 