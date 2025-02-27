"use client"
import { Link } from "react-router-dom"
import "./FAQAll.scss"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaSearch } from 'react-icons/fa'

const FAQAll = () => {
  const [faqData, setFaqData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("https://dummyjson.com/c/28da-503d-4c96-aebd")
      .then((res) => res.json())
      .then((data) => {
        setFaqData(data.faqs)
        setLoading(false)
      })
  }, [])

  const handleOnClick = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
  }

  const filteredQuestions = faqData.filter(question =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="faq-container">
      <div className="faq-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      <motion.div
        className="faq"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Câu hỏi thường gặp</h1>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <ul className="faq-list">
          {currentItems.map(({ id, question }) => (
            <motion.li key={id} className="faq-item" whileHover={{ y: -5, transition: { duration: 0.2 } }}>
              <h3>{question}</h3>
              <Link to={`/faq/${id}`} className="view-detail-link">
                Xem chi tiết
              </Link>
            </motion.li>
          ))}
        </ul>
        <div className="pagination">
          {Array.from({ length: Math.ceil(faqData.length / itemsPerPage) }, (_, index) => (
            <motion.button
              key={index + 1}
              onClick={() => handleOnClick(index + 1)}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
            </motion.button>
          ))}
        </div>
        <Link to="/" className="back-to-home-link">
          Quay lại trang chủ
        </Link>
      </motion.div>
    </div>
  )
}

export default FAQAll

