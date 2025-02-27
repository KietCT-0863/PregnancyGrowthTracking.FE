"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHistory,
  FaPlus,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import "./DoctorNotes.scss";

const DoctorNotes = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentNote, setCurrentNote] = useState({
    date: "",
    doctorName: "",
    hospital: "",
    diagnosis: "",
    prescription: "",
    nextAppointment: "",
    notes: "",
    images: [],
  });

  // Giả lập dữ liệu lịch sử
  const mockHistory = [
    {
      id: 1,
      date: "2024-03-15",
      doctorName: "Dr. Nguyễn Văn A",
      hospital: "Bệnh viện Phụ sản Trung ương",
      diagnosis: "Thai kỳ bình thường",
      prescription: "Vitamin tổng hợp",
      nextAppointment: "2024-04-15",
      notes: "Thai nhi phát triển tốt",
      images: ["https://example.com/image1.jpg"],
    },
    {
      id: 2,
      date: "2024-02-15",
      doctorName: "Dr. Trần Thị B",
      hospital: "Phòng khám Sản phụ khoa ABC",
      diagnosis: "Thiếu sắt nhẹ",
      prescription: "Viên sắt, Vitamin tổng hợp",
      nextAppointment: "2024-03-15",
      notes: "Cần bổ sung thêm thực phẩm giàu sắt",
      images: [
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg",
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentNote((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setCurrentNote((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Thông tin ghi chú mới:", currentNote);

    if (isEditing) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingId ? { ...currentNote, id: editingId } : note
        )
      );
      setIsEditing(false);
      setEditingId(null);
    } else {
      const newNote = { ...currentNote, id: Date.now() };
      console.log("Danh sách ghi chú sau khi thêm:", [...notes, newNote]);
      setNotes((prev) => [...prev, newNote]);
    }
    setCurrentNote({
      date: "",
      doctorName: "",
      hospital: "",
      diagnosis: "",
      prescription: "",
      nextAppointment: "",
      notes: "",
      images: [],
    });
    setShowForm(false);
  };

  const handleEdit = (note) => {
    setCurrentNote(note);
    setIsEditing(true);
    setEditingId(note.id);
    setShowForm(true);
  };

  return (
    <div className="doctor-notes-container">
      <motion.h1
        className="page-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Ghi Chú Bác Sĩ
      </motion.h1>

      <div className="action-buttons">
        <motion.button
          className="add-note-btn"
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaPlus /> Thêm Ghi Chú Mới
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 9999 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
            >
              <h2>Thêm Ghi Chú Mới</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="date">Ngày khám</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={currentNote.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="doctorName">Bác sĩ khám</label>
                  <input
                    type="text"
                    id="doctorName"
                    name="doctorName"
                    value={currentNote.doctorName}
                    onChange={handleInputChange}
                    placeholder="Tên bác sĩ"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hospital">Bệnh viện/Phòng khám</label>
                  <input
                    type="text"
                    id="hospital"
                    name="hospital"
                    value={currentNote.hospital}
                    onChange={handleInputChange}
                    placeholder="Tên bệnh viện/phòng khám"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="diagnosis">Chẩn đoán</label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={currentNote.diagnosis}
                    onChange={handleInputChange}
                    placeholder="Nhập chẩn đoán của bác sĩ"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prescription">Đơn thuốc</label>
                  <textarea
                    id="prescription"
                    name="prescription"
                    value={currentNote.prescription}
                    onChange={handleInputChange}
                    placeholder="Nhập đơn thuốc"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Ghi chú thêm</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={currentNote.notes}
                    onChange={handleInputChange}
                    placeholder="Nhập ghi chú thêm"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nextAppointment">Lịch hẹn kế tiếp</label>
                  <input
                    type="date"
                    id="nextAppointment"
                    name="nextAppointment"
                    value={currentNote.nextAppointment}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="images">Hình ảnh</label>
                  <input
                    type="file"
                    id="images"
                    multiple
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </div>
                <div className="form-actions">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Lưu Ghi Chú
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setShowForm(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Hủy
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="notes-list">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            className="note-item"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => handleEdit(note)}
            style={{ cursor: "pointer" }}
          >
            <h3>
              {note.date} - {note.hospital}
            </h3>
            <p>
              <strong>Bác sĩ:</strong> {note.doctorName}
            </p>
            <p>
              <strong>Chẩn đoán:</strong> {note.diagnosis}
            </p>
            <p>
              <strong>Đơn thuốc:</strong> {note.prescription}
            </p>
            <p>
              <strong>Ghi chú:</strong> {note.notes}
            </p>
            <p>
              <strong>Lịch hẹn kế tiếp:</strong> {note.nextAppointment}
            </p>
            {note.images.length > 0 && (
              <div className="image-gallery">
                {note.images.map((img, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(img)}
                    alt={`Ảnh ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DoctorNotes;
