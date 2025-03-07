import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const profileImageService = {
  updateProfileImage: async (file) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error('Không tìm thấy userId');
      }

      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading image for userId:', userData.userId);

      const response = await axiosInstance.put(
        ENDPOINTS.PROFILE_IMAGE.UPDATE(userData.userId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          transformRequest: (data) => data // Không transform FormData
        }
      );

      console.log('Upload response:', response.data);

      // Cập nhật userData trong localStorage với URL ảnh mới
      if (response.data?.profileImageUrl) {
        userData.profileImageUrl = response.data.profileImageUrl;
        localStorage.setItem('userData', JSON.stringify(userData));
      }

      return response.data;
    } catch (error) {
      console.error('Error updating profile image:', error);
      throw error;
    }
  },

  getProfileImage: async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        throw new Error('Không tìm thấy userId');
      }

      const response = await axiosInstance.get(
        ENDPOINTS.PROFILE_IMAGE.GET(userData.userId)
      );
      return response.data;
    } catch (error) {
      console.error('Error getting profile image:', error);
      throw error;
    }
  }
};

export default profileImageService; 