import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react"
import "./PregnancyTimeline.scss"

const PregnancyTimeline = () => {
    const [expandedId, setExpandedId] = useState(null)
    const scrollContainerRef = useRef(null)
  
    const checkupSchedule = [
      {
        id: 1,
        period: "Tuần 5-8",
        title: "Khám lần 1",
        summary: "Khám thai lần đầu, xác định thai và các xét nghiệm cơ bản",
        details: {
          purpose: "Xác định chắc chắn có thai và vị trí làm tổ của thai",
          tests: [
            "Xác định chỉ số BMI",
            "Đo huyết áp",
            "Xét nghiệm nước tiểu (hCG)",
            "Siêu âm xác định tuổi thai",
            "Xét nghiệm máu tổng quát",
          ],
          advice: ["Bổ sung acid folic", "Tư vấn dinh dưỡng", "Từ bỏ thói quen có hại", "Sàng lọc trước sinh"],
        },
      },
    {
      id: 2,
      period: "Tuần 8",
      title: "Khám lần 2",
      summary: "Kiểm tra tim thai và siêu âm chi tiết",
      details: {
        purpose: "Kiểm tra toàn diện, xác định tim thai",
        tests: [
          "Siêu âm chi tiết",
          "Kiểm tra tim thai",
          "Các xét nghiệm định kỳ"
        ],
        advice: [
          "Theo dõi cân nặng",
          "Chế độ dinh dưỡng",
          "Các dấu hiệu cần lưu ý"
        ]
      }
    },
    {
      id: 3,
      period: "Tuần 10-13",
      title: "Khám lần 3",
      summary: "Sàng lọc dị tật và kiểm tra chi tiết",
      details: {
        purpose: "Kiểm tra các dị tật ở thai nhi",
        tests: [
          "Xét nghiệm Double test",
          "Siêu âm đo độ mờ da gáy",
          "Xét nghiệm Thalassemia",
          "Siêu âm kiểm tra dị dạng chi"
        ],
        advice: [
          "Theo dõi dinh dưỡng",
          "Các dấu hiệu bất thường cần lưu ý",
          "Tư vấn về kết quả xét nghiệm"
        ]
      }
    },
    {
      id: 4,
      period: "Tuần 14-20",
      title: "Khám lần 4-5",
      summary: "Kiểm tra chi tiết sự phát triển của thai",
      details: {
        purpose: "Kiểm tra sự phát triển và các dị tật bẩm sinh",
        tests: [
          "Triple test",
          "Siêu âm hình thái",
          "Xét nghiệm đường huyết",
          "Đo huyết áp định kỳ"
        ],
        advice: [
          "Chế độ ăn uống",
          "Vận động phù hợp",
          "Theo dõi cân nặng"
        ]
      }
    },
    {
      id: 5,
      period: "Tuần 20-27",
      title: "Khám lần 6-7",
      summary: "Theo dõi đặc biệt và kiểm tra định kỳ",
      details: {
        purpose: "Kiểm tra hình thái và theo dõi sự phát triển",
        tests: [
          "Siêu âm chi tiết",
          "Xét nghiệm nhóm máu",
          "Kiểm tra đường huyết",
          "Theo dõi huyết áp"
        ],
        advice: [
          "Chế độ dinh dưỡng đặc biệt",
          "Các dấu hiệu nguy hiểm",
          "Hoạt động phù hợp"
        ]
      }
    },
    {
      id: 6,
      period: "Tuần 28-36",
      title: "Khám lần 8-10",
      summary: "Chuẩn bị cho giai đoạn cuối thai kỳ",
      details: {
        purpose: "Kiểm tra ngôi thai và chuẩn bị sinh",
        tests: [
          "Siêu âm ngôi thai",
          "Xét nghiệm máu",
          "Non-stress test (NST)",
          "Tiêm phòng uốn ván"
        ],
        advice: [
          "Theo dõi cử động thai",
          "Chuẩn bị sinh",
          "Dấu hiệu chuyển dạ"
        ]
      }
    },
    {
      id: 7,
      period: "Tuần 36-42",
      title: "Khám lần 11-15",
      summary: "Theo dõi sát và chuẩn bị sinh",
      details: {
        purpose: "Đánh giá khả năng sinh và theo dõi sát",
        tests: [
          "Kiểm tra cổ tử cung",
          "Siêu âm định kỳ",
          "Theo dõi tim thai",
          "Đánh giá khung chậu"
        ],
        advice: [
          "Dấu hiệu chuyển dạ",
          "Chuẩn bị đồ sinh",
          "Kế hoạch sinh"
        ]
      }
    }
  ];

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const container = scrollContainerRef.current
      const newScrollPosition =
        direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="pregnancy-timeline" style={{ marginTop: "70px" }}>
      <div className="blog-background">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <motion.h2 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }}
      >
        Lịch Trình Gợi Ý Khám Thai
      </motion.h2>

      <motion.div
        className="timeline-note"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <p>* Lưu ý: Lịch trình này chỉ mang tính chất tham khảo. Vui lòng tuân theo hướng dẫn của bác sĩ.</p>
      </motion.div>

      <div className="timeline-container-wrapper">
        <button 
          className="scroll-button left" 
          onClick={() => scroll("left")} 
          aria-label="Scroll left"
        >
          <ChevronLeft />
        </button>

        <div className="timeline-scroll-container" ref={scrollContainerRef}>
          <div className="timeline-progress-bar">
            <div className="progress-line"></div>
            {checkupSchedule.map((_, index) => (
              <div key={index} className="progress-dot"></div>
            ))}
          </div>

          <div className="timeline-cards">
            {checkupSchedule.map((checkup, index) => (
              <motion.div
                key={checkup.id}
                className={`timeline-card ${expandedId === checkup.id ? "expanded" : ""}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div 
                  className="timeline-card-header" 
                  onClick={() => toggleExpand(checkup.id)}
                >
                  <div className="header-content">
                    <span className="period">{checkup.period}</span>
                    <h3>{checkup.title}</h3>
                    <p>{checkup.summary}</p>
                  </div>
                  <div className="expand-icon">
                    {expandedId === checkup.id ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === checkup.id && (
                    <motion.div
                      className="timeline-card-details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="details-section">
                        <h4>Mục đích</h4>
                        <p>{checkup.details.purpose}</p>
                      </div>
                      <div className="details-section">
                        <h4>Xét nghiệm</h4>
                        <ul>
                          {checkup.details.tests.map((test, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {test}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                      <div className="details-section">
                        <h4>Tư vấn</h4>
                        <ul>
                          {checkup.details.advice.map((item, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              {item}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        <button 
          className="scroll-button right" 
          onClick={() => scroll("right")} 
          aria-label="Scroll right"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

export default PregnancyTimeline

