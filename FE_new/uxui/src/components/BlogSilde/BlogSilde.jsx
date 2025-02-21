"use client"

import { useEffect, useState } from "react"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"
import "./BlogSilde.scss"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"

const BlogSlide = () => {
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("https://dummyjson.com/posts")
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Lỗi khi lấy dữ liệu:", error)
        setIsLoading(false)
      })
  }, [])

  const CustomPrevArrow = (props) => (
    <button className="slick-arrow slick-prev custom-arrow" onClick={props.onClick}>
      <ChevronLeft size={24} />
    </button>
  )

  const CustomNextArrow = (props) => (
    <button className="slick-arrow slick-next custom-arrow" onClick={props.onClick}>
      <ChevronRight size={24} />
    </button>
  )

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 8,
    slidesToScroll: 1,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  }

  return (
    <section className="blog-posts">
      <div className="blog-background">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      <h1 className="blog-title">
        Bài viết mới nhất
      </h1>

      {isLoading ? (
        <div className="loading-cards">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="post-card skeleton">
              <div className="post-icon skeleton-image"></div>
              <div className="post-content">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Slider {...settings}>
          {posts.map(({ title, body, id }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -10 }}
            >
              <div className="post-card">
                <div className="post-icon">
                  <img src={`https://picsum.photos/seed/${id}/300/300`} alt={title} />
                </div>
                <div className="post-content">
                  <h3>{title}</h3>
                  <p>{body.substring(0, 100)}...</p>
                  <Link to={`/blog/${id}`} className="read-more">
                    Đọc thêm
                    <span className="ripple"></span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </Slider>
      )}
    </section>
  )
}

export default BlogSlide

