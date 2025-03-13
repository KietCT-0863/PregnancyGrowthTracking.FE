"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { ChevronLeft, ChevronRight } from "lucide-react"
import userNoteService from "../../api/services/userNoteService"
import "./NotesList.scss"

const NotesList = () => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const notesContainerRef = useRef(null)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const data = await userNoteService.getUserNotes()
      const sortedNotes = data.sort((a, b) => new Date(b.date) - new Date(a.date))
      setNotes(sortedNotes)
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: "Không thể tải danh sách ghi chú",
      })
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - e.currentTarget.offsetLeft)
    setScrollLeft(e.currentTarget.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - e.currentTarget.offsetLeft
    const walk = (x - startX) * 2
    e.currentTarget.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleScroll = (direction) => {
    if (notesContainerRef.current) {
      const container = notesContainerRef.current
      const scrollAmount = 300
      const newScrollLeft =
        direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

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

      <div
        className="notes-container"
        ref={notesContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {notes.length > 0 ? (
          notes.map((note, index) => (
            <motion.div
              key={note.noteId || note.id}
              className="note-card"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
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
                  <span className="note-hospital">{note.note || "Chưa có thông tin"}</span>
                  <span className="note-date">{note.date}</span>
                </div>
              </div>
              {note.diagnosis && (
                <div className="note-diagnosis">
                  <span>Chẩn đoán: {note.diagnosis}</span>
                </div>
              )}
              {note.userNotePhoto && (
                <div className="note-thumbnail">
                  <img src={note.userNotePhoto || "/placeholder.svg"} alt="Note" />
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

      <div className="scroll-buttons">
        <motion.button
          className="scroll-btn"
          onClick={() => handleScroll("left")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <motion.button
          className="scroll-btn"
          onClick={() => handleScroll("right")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

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
              className="modal-wrapper"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="modal-content">
                <button 
                  className="close-btn" 
                  onClick={() => setSelectedNote(null)}
                  aria-label="Đóng"
                >
                  ×
                </button>

                <div className="detail-header">
                  <h3>{selectedNote.note || "Chưa có thông tin"}</h3>
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
                      <strong>Chẩn đoán:</strong>
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
                        onClick={() => window.open(selectedNote.userNotePhoto, "_blank")}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default NotesList

