import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const profileImageService = {
  updateProfileImage: async (file) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.userId) {
        console.error('Lỗi: Không tìm thấy userId trong userData');
        throw new Error('Không tìm thấy userId');
      }

      console.log('Chuẩn bị upload ảnh cho userId:', userData.userId);
      console.log('File được upload:', file.name, 'type:', file.type, 'size:', file.size);

      const formData = new FormData();
      formData.append('file', file);
      // Thêm timestamp để tránh cache
      formData.append('timestamp', new Date().getTime());

      // Debug kiểm tra FormData
      for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], typeof pair[1] === 'object' ? pair[1].name : pair[1]);
      }

      // Cấu hình request
      const config = {
        // Thêm timeout dài hơn cho upload file
        timeout: 60000,
        // Ghi đè header để đảm bảo không có Content-Type
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      };

      // Chiến lược thử nghiệm nhiều phương thức với fallback
      let response;
      let error;

      // Tạo endpoint đầy đủ
      const putEndpoint = ENDPOINTS.PROFILE_IMAGE.UPDATE(userData.userId);
      const postEndpoint = ENDPOINTS.PROFILE_IMAGE.UPDATE_POST ? 
        ENDPOINTS.PROFILE_IMAGE.UPDATE_POST(userData.userId) :
        putEndpoint;

      // Thử phương thức PUT trước
      try {
        console.log('Thử upload với phương thức PUT tới:', putEndpoint);
        response = await axiosInstance.put(putEndpoint, formData, config);
        console.log('Upload PUT thành công, status:', response.status);
      } catch (putError) {
        console.log('Upload PUT thất bại, thử phương thức POST...');
        error = putError;

        // Thử phương thức POST nếu PUT thất bại
        try {
          console.log('Thử upload với phương thức POST tới:', postEndpoint);
          response = await axiosInstance.post(postEndpoint, formData, config);
          console.log('Upload POST thành công, status:', response.status);
          // Reset error vì POST thành công
          error = null;
        } catch (postError) {
          console.log('Cả PUT và POST đều thất bại');
          // Nếu cả hai đều thất bại, ưu tiên lỗi từ PUT
          error = error || postError;
        }
      }

      // Nếu vẫn còn lỗi sau khi thử cả hai phương thức
      if (error && !response) {
        throw error;
      }

      console.log('Upload response status:', response.status);
      console.log('Upload response data:', response.data);

      // Cập nhật userData trong localStorage với URL ảnh mới
      if (response.data?.profileImageUrl) {
        // Thêm timestamp vào URL ảnh để tránh cache
        const profileImageUrl = response.data.profileImageUrl.includes('?') 
          ? `${response.data.profileImageUrl}&t=${new Date().getTime()}` 
          : `${response.data.profileImageUrl}?t=${new Date().getTime()}`;
        
        userData.profileImageUrl = profileImageUrl;
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('Đã cập nhật profileImageUrl trong localStorage:', profileImageUrl);
        
        // Trả về URL đã thêm timestamp
        return {
          ...response.data,
          profileImageUrl: profileImageUrl
        };
      } else {
        console.warn('Không tìm thấy profileImageUrl trong response data');
        // Trả về dữ liệu gốc nếu không có profileImageUrl
        return response.data;
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        // Nếu là lỗi 415 (Unsupported Media Type), thử lại với cách khác
        if (error.response.status === 415) {
          console.log('Lỗi định dạng media không được hỗ trợ');
          throw new Error('Định dạng file không được hỗ trợ. Vui lòng thử lại với hình ảnh PNG hoặc JPG.');
        } else if (error.response.status === 413) {
          console.log('Lỗi file quá lớn');
          throw new Error('File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.');
        } else if (error.response.status === 401) {
          console.log('Lỗi xác thực');
          throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        throw new Error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        console.error('Error message:', error.message);
      }
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