"use client"
import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useAnimation } from "framer-motion"
import { ChevronLeft, Users, Heart, Shield } from "lucide-react"
import "./AboutUs.scss"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const AboutUs = () => {
    const controls = useAnimation()
    const sectionRefs = useRef([])
  
    useEffect(() => {
      const handleScroll = () => {
        sectionRefs.current.forEach((ref, index) => {
          if (ref) {
            const rect = ref.getBoundingClientRect()
            const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom >= 0
            if (isVisible) {
              ref.classList.add("visible")
            }
          }
        })
      }
  
      window.addEventListener("scroll", handleScroll)
      handleScroll() // Check visibility on initial load
  
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  
    const testimonials = [
      {
        id: 1,
        name: "Nguyễn Thị A",
        avatar: "/placeholder.svg?height=40&width=40",
        content:
          "Trang web Mẹ Bầu đã cung cấp cho tôi rất nhiều thông tin hữu ích trong suốt thai kỳ. Tôi cảm thấy tự tin hơn khi có sự hỗ trợ từ các chuyên gia.",
      },
      {
        id: 2,
        name: "Trần Thị B",
        avatar: "/placeholder.svg?height=40&width=40",
        content:
          "Tôi rất hài lòng với dịch vụ tư vấn của Mẹ Bầu. Các chuyên gia luôn nhiệt tình giải đáp mọi thắc mắc của tôi một cách chi tiết và dễ hiểu.",
      },
      {
        id: 3,
        name: "Lê Thị C",
        avatar: "/placeholder.svg?height=40&width=40",
        content:
          "Mẹ Bầu là một nguồn thông tin đáng tin cậy cho các mẹ bầu. Tôi đã học được rất nhiều điều về chăm sóc sức khỏe trong thai kỳ và sau sinh.",
      },
    ]
  
    const sliderSettings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 5000,
    };
  
    return (
      <div className="about-us">
        <motion.div
          className="hero-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Về Mẹ Bầu</h1>
          <p>Đồng hành cùng bạn trên hành trình làm mẹ</p>
        </motion.div>
  
        <section className="mission-section" ref={(el) => (sectionRefs.current[0] = el)}>
          <h2>Sứ mệnh của chúng tôi</h2>
          <p>
            Sứ mệnh của chúng tôi là đồng hành cùng các mẹ bầu trong suốt hành trình mang thai, cung cấp những thông tin
            hữu ích và đáng tin cậy để các mẹ có một thai kỳ khỏe mạnh và hạnh phúc.
          </p>
        </section>
  
        <section className="team-section" ref={(el) => (sectionRefs.current[1] = el)}>
          <h2>Đội ngũ chuyên gia</h2>
          <p>
            Đội ngũ của chúng tôi bao gồm các bác sĩ sản khoa, chuyên gia dinh dưỡng, chuyên gia chăm sóc trẻ có nhiều năm
            kinh nghiệm. Chúng tôi luôn nỗ lực nghiên cứu và cập nhật những kiến thức mới nhất về thai kỳ và chăm sóc bé
            sơ sinh.
          </p>
          <div className="team-icons">
            <div className="team-icon">
              <Users size={48} />
              <span>Đội ngũ chuyên nghiệp</span>
            </div>
            <div className="team-icon">
              <Heart size={48} />
              <span>Tận tâm chăm sóc</span>
            </div>
            <div className="team-icon">
              <Shield size={48} />
              <span>Thông tin đáng tin cậy</span>
            </div>
          </div>
        </section>
  
        <section className="commitment-section" ref={(el) => (sectionRefs.current[2] = el)}>
          <h2>Cam kết của chúng tôi</h2>
          <ul>
            <li>Cung cấp thông tin chính xác, khoa học và dễ hiểu</li>
            <li>Lắng nghe và giải đáp mọi thắc mắc của mẹ bầu</li>
            <li>Bảo mật thông tin cá nhân của khách hàng</li>
            <li>Không ngừng cải tiến chất lượng dịch vụ</li>
          </ul>
        </section>
  
        <section className="testimonials" ref={(el) => (sectionRefs.current[3] = el)}>
          <h2>Đánh giá từ khách hàng</h2>
          <div className="testimonial-container">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                animate={controls}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="card">
                  <div className="testimonial-header">
                    <img src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} className="avatar" />
                    <div>
                      <p className="name">{testimonial.name}</p>
                      <p className="role">Khách hàng</p>
                    </div>
                  </div>
                  <p className="testimonial-text">{testimonial.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
  
        <motion.div
          className="back-to-home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Link to="/">
            <button className="back-button">
              <ChevronLeft className="icon" /> Về trang chủ
            </button>
          </Link>
        </motion.div>
      </div>
    )
  }
  
  export default AboutUs
  
  