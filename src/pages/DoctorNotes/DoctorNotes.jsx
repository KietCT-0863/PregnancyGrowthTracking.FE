"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import userNoteService from "../../api/services/userNoteService"
import { toast } from "react-hot-toast"
import NotesFilter from "./components/NotesFilter"
import NoteFormModal from "./components/NoteFormModal"
import NotesList from "./components/NotesList"
import NotificationPopup from './components/NotificationPopup'
import "./DoctorNotes.scss"
import { playNotificationSound, playDeleteSound } from "../../utils/soundUtils"

const DoctorNotes = () => {
  // Thêm class 'doctor-notes-page' vào body khi component được mount
  useEffect(() => {
    document.body.classList.add('doctor-notes-page');
    
    return () => {
      document.body.classList.remove('doctor-notes-page');
    };
  }, []);

  // State management
  const [notes, setNotes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [currentNote, setCurrentNote] = useState({
    date: "",
    note1: "",
    diagnosis: "",
    note2: "",
    images: [],
    currentImage: null,
  })
  const [searchTerm, setSearchTerm] = useState("") 
  const [filterType, setFilterType] = useState("all")
  const [dateFilterType, setDateFilterType] = useState("all") // "all", "day", "week", "month"
  const [selectedDate, setSelectedDate] = useState("")
  const [notification, setNotification] = useState({
    type: '',
    message: '',
    isVisible: false
  });

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes()
  }, [])

  // Data handling functions
  const fetchNotes = async () => {
    try {
      const response = await userNoteService.getUserNotes()
      const processedNotes = response.map((note) => ({
        ...note,
        fileUrl: note.fileUrl ? `${note.fileUrl}` : note.fileUrl,
        imageUrl: note.imageUrl ? `${note.imageUrl}` : note.imageUrl,
        file: note.file ? `${note.file}` : note.file,
      }))
      setNotes(processedNotes)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Không thể tải danh sách ghi chú")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCurrentNote(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 10MB")
        e.target.value = ""
        return
      }
      setCurrentNote(prev => ({ ...prev, images: [file] }))
      toast.success("Tải ảnh lên thành công!")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!currentNote.images || currentNote.images.length === 0) {
      toast.error("Vui lòng thêm ít nhất một ảnh cho ghi chú mới")
      return
    }

    try {
      await userNoteService.createNote(currentNote)
      toast.success("Tạo ghi chú mới thành công!")
      playNotificationSound();
      await fetchNotes()
      resetForm()
      showNotification('success', 'Ghi chú đã được thêm thành công!')
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi lưu ghi chú")
      showNotification('error', 'Có lỗi xảy ra khi thêm ghi chú.')
    }
  }

  const resetForm = () => {
    setCurrentNote({
      date: "",
      note1: "",
      diagnosis: "",
      note2: "",
      images: [],
      currentImage: null,
    })
    setShowForm(false)
  }

  const handleDelete = async (noteId) => {
    try {
      await userNoteService.deleteNote(noteId);
      setNotes((prevNotes) => prevNotes.filter((note) => note.noteId !== noteId && note.id !== noteId));
      toast.success("Xóa ghi chú thành công!");
      playDeleteSound();
      showNotification('success', 'Ghi chú đã được xóa thành công!')
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa ghi chú")
      showNotification('error', 'Có lỗi xảy ra khi xóa ghi chú.')
    }
  };

  // Date filtering functions
  const isDateInRange = (noteDate, selectedDate, filterType) => {
    if (!selectedDate || !noteDate) return true
    
    const date = new Date(noteDate)
    const selected = new Date(selectedDate)
    const noteWeek = date.getTime() / (7 * 24 * 60 * 60 * 1000)
    const selectedWeek = selected.getTime() / (7 * 24 * 60 * 60 * 1000)
    
    switch (filterType) {
      case "day":
        return date.toDateString() === selected.toDateString()
      
      case "week":
        return Math.floor(noteWeek) === Math.floor(selectedWeek)
      
      case "month":
        return (
          date.getMonth() === selected.getMonth() &&
          date.getFullYear() === selected.getFullYear()
        )
      
      default:
        return true
    }
  }

  // Filtering notes
  const filteredNotes = notes.filter(note => {
    // Search term filter
    const matchesSearch = 
      note.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.detail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.date?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Date range filter
    const matchesDate = isDateInRange(note.date, selectedDate, dateFilterType)
    
    // Time period filter
    if (filterType === "all") return matchesSearch && matchesDate
    
    const noteDate = new Date(note.date)
    const currentDate = new Date()
    
    if (filterType === "recent") {
      return matchesSearch && matchesDate && 
        noteDate >= new Date(currentDate.setMonth(currentDate.getMonth() - 3))
    } else if (filterType === "older") {
      return matchesSearch && matchesDate && 
        noteDate < new Date(currentDate.setMonth(currentDate.getMonth() - 3))
    }
    
    return false
  })

  // Add new note function
  const handleAddNew = () => {
    setCurrentNote({
      date: "",
      note1: "",
      diagnosis: "",
      note2: "",
      images: [],
      currentImage: null,
    });
    setShowForm(true);
  }

  // Function to show notifications
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      isVisible: true
    });
  };

  // Function to hide notification
  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  return (
    <div className="doctor-notes-container">
      <NotesFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFilterType={dateFilterType}
        setDateFilterType={setDateFilterType}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        filterType={filterType}
        setFilterType={setFilterType}
        onAddNote={handleAddNew}
      />

      {/* Main Content */}
      <NotesList
        notes={filteredNotes}
        searchTerm={searchTerm}
        onDelete={handleDelete}
        onAddNote={handleAddNew}
      />

      {/* Add/Edit Note Modal */}
      <AnimatePresence>
        {showForm && (
          <NoteFormModal
            showForm={showForm}
            currentNote={currentNote}
            handleInputChange={handleInputChange}
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Add the notification popup */}
      <NotificationPopup
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={3000}
      />
    </div>
  )
}

export default DoctorNotes

