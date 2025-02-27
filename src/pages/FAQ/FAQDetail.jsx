"use client"
import { useParams, Link } from "react-router-dom"
import "./FAQDetail.scss"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"

const FAQDetail = () => {
  const params = useParams()
  const [faqData, setFaqData] = useState("")
  const [faqQuestion, setFaqQuestion] = useState("")

  useEffect(() => {
    fetch(`https://dummyjson.com/c/28da-503d-4c96-aebd/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        const faqs = data.faqs
        const faq = faqs.find((item) => item.id === Number.parseInt(params.id))
        setFaqData(faq.answer)
        setFaqQuestion(faq.question)
      })
  }, [params.id])

  return (
    <div className="faq-detail-container">
      <div className="faq-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>
      <motion.div
        className="faq-detail"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {faqQuestion}
        </motion.h1>
        <motion.div
          className="faq-answer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p>{faqData}</p>
        </motion.div>
        <motion.div
          className="back-link-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link to="/faq" className="back-link">
            <ArrowLeft size={20} />
            <span>Quay lại danh sách câu hỏi</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FAQDetail

