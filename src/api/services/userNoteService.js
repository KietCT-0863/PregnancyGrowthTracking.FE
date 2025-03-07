import axiosInstance from "../config/axiosConfig";
import { ENDPOINTS } from "../constants/apiEndpoints";

const userNoteService = {
  // GET - Lấy tất cả ghi chú của user
  getUserNotes: async () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.userId) throw new Error('Không tìm thấy userId');
    
    const response = await axiosInstance.get(
      ENDPOINTS.USER_NOTES.GET_BY_USER(userData.userId)
    );
    return response.data;
  },

  // POST - Tạo ghi chú mới
  createNote: async (noteData) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.userId) throw new Error('Không tìm thấy userId');

    const formData = new FormData();
    formData.append('userId', userData.userId);
    formData.append('date', noteData.date);
    formData.append('note', noteData.note1);
    formData.append('diagnosis', noteData.diagnosis || '');
    formData.append('detail', noteData.note2 || '');

    if (noteData.images?.[0]) {
      formData.append('file', noteData.images[0]);
    }

    const response = await axiosInstance.post(
      ENDPOINTS.USER_NOTES.CREATE,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },

  // PUT - Cập nhật ghi chú
  updateNote: async (noteId, noteData) => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.userId) throw new Error('Không tìm thấy userId');

    const formData = new FormData();
    formData.append('noteId', noteId);
    formData.append('userId', userData.userId);
    formData.append('date', noteData.date);
    formData.append('note', noteData.note1);
    formData.append('diagnosis', noteData.diagnosis || '');
    formData.append('detail', noteData.note2 || '');

    if (noteData.images?.[0]) {
      formData.append('file', noteData.images[0]);
    }

    const response = await axiosInstance.put(
      ENDPOINTS.USER_NOTES.UPDATE(noteId),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },

  // DELETE - Xóa ghi chú
  deleteNote: async (noteId) => {
    const response = await axiosInstance.delete(
      ENDPOINTS.USER_NOTES.DELETE(noteId)
    );
    return response.data;
  }
};

export default userNoteService; 