import "./Features.scss"

const Features = () => {
  const features = [
    {
      icon: "🤰",
      title: "Theo dõi thai kỳ",
      description: "Cập nhật chi tiết về sự phát triển của em bé mỗi tuần",
    },
    {
      icon: "🥗",
      title: "Dinh dưỡng",
      description: "Gợi ý thực đơn cá nhân hóa cho từng giai đoạn thai kỳ",
    },
    {
      icon: "👥",
      title: "Cộng đồng",
      description: "Kết nối với các mẹ bầu khác để chia sẻ kinh nghiệm",
    },
    {
      icon: "📅",
      title: "Lịch khám thai",
      description: "Nhắc nhở lịch khám thai và các mốc quan trọng",
    },
    {
      icon: "📚",
      title: "Thư viện kiến thức",
      description: "Kho tàng thông tin về mang thai và chăm sóc em bé",
    },
    {
      icon: "🧘‍♀️",
      title: "Bài tập cho mẹ bầu",
      description: "Hướng dẫn các bài tập an toàn cho từng giai đoạn",
    },
  ]

  return (
    <section className="features">
      <h2>Tính năng nổi bật</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features

