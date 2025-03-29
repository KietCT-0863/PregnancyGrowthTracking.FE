"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { ChevronLeft, ChevronRight } from "lucide-react";
import userNoteService from "../../api/services/userNoteService";
import "./NotesList.scss";

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 4; // Hiển thị 4 ghi chú mỗi trang

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await userNoteService.getUserNotes();
      const sortedNotes = data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setNotes(sortedNotes);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách ghi chú",
      });
    }
  };

  // Tính toán số trang
  const totalPages = Math.ceil(notes.length / notesPerPage);
  
  // Lấy các ghi chú cho trang hiện tại
  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);

  // Chuyển trang
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <motion.div
      className="notes-list-component"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="wave-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="notes-list-header">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Ghi chú gần đây
        </motion.h3>
      </div>

      <div className="notes-grid-container">
        {notes.length > 0 ? (
          currentNotes.map((note, index) => (
            <motion.div
              key={note.noteId || note.id}
              className="note-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{ scale: 1.03 }}
              onClick={() => setSelectedNote(note)}
            >
              <div className="note-card-header">
                <div className="note-info">
                  <span className="note-hospital" title={note.note || "Chưa có thông tin"}>
                    {note.note || "Chưa có thông tin"}
                  </span>
                  <span className="note-date">{note.date}</span>
                </div>
              </div>
              {note.diagnosis && (
                <div className="note-diagnosis">
                  <div className="diagnosis-label">Chẩn đoán:</div>
                  <div className="diagnosis-content" title={note.diagnosis}>{note.diagnosis}</div>
                </div>
              )}
              {note.userNotePhoto && (
                <div className="note-thumbnail">
                  <img
                    src={note.userNotePhoto || "/placeholder.svg"}
                    alt="Note"
                  />
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="no-notes">
            <p>Chưa có ghi chú nào</p>
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="pagination-container">
          <button 
            className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
            onClick={prevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          
          <button 
            className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
            onClick={nextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <button
                className="close-btn"
                onClick={() => setSelectedNote(null)}
                aria-label="Đóng"
              >
                ×
              </button>

              <div className="detail-header">
                <h3 title={selectedNote.note || "Chưa có thông tin"}>
                  {selectedNote.note || "Chưa có thông tin"}
                </h3>
                <span className="detail-date">
                  {new Date(selectedNote.date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="detail-content">
                {selectedNote.diagnosis && (
                  <motion.div
                    className="detail-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <strong>Chẩn đoán : </strong>
                    <p>{selectedNote.diagnosis}</p>
                  </motion.div>
                )}

                {selectedNote.detail && (
                  <motion.div
                    className="detail-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <strong>Ghi chú:</strong>
                    <p>{selectedNote.detail}</p>
                  </motion.div>
                )}

                {selectedNote.userNotePhoto && (
                  <motion.div
                    className="detail-image"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <img
                      src={selectedNote.userNotePhoto}
                      alt="Chi tiết ghi chú"
                      onClick={() =>
                        window.open(selectedNote.userNotePhoto, "_blank")
                      }
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotesList;
