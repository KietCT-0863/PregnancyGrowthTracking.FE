"use client"

import { useState } from "react"
import { Calendar, Users, Baby, TrendingUp, Apple, Dumbbell } from "lucide-react"
import "./Dashboard.scss"
import { FaS } from "react-icons/fa6"

const mockUser = {
  name: "Nguyễn Thị A",
  email: "nguyenthia@example.com",
  dueDate: "2024-12-31",
  weeksPregant: 20,
}

const mockGrowthData = {
  weight: 300,
  height: 25,
}

const Dashboard = () => {
  const [weight, setWeight] = useState(1)
  const [height, setHeight] = useState(1)
  const [bmi, setBmi] = useState(false)
  const handleOnChangeWeight = (e) => {
    setWeight(e.target.value) }
    const handleOnChangeHeight = (e) => { setHeight(e.target.value) } 

  const handleUpdateGrowth = () => {
  setBmi(!bmi)
  alert("Cập nhật thành công!")
  }


const handleOnClose = () => {
  setBmi(false)
}
  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>Xin chào, {mockUser.name}!</h1>
        <p>Chúc bạn có một ngày tuyệt vời cùng Mẹ Bầu</p>
      </div>

      <div className="dashboard__stats">
        <div className="dashboard__card">
          <h2>
            <Baby className="icon" />
            Thông tin thai kỳ
          </h2>
          <p>
            Tuần thai: <span>{mockUser.weeksPregant}</span>
          </p>
          <p>
            Ngày dự sinh: <span>{mockUser.dueDate}</span>
          </p>
          <button className="btn btn--primary">
            <TrendingUp className="icon" />
            Xem biểu đồ tăng trưởng
          </button>
        </div>

        <div className="dashboard__card">
          <h2>Cập nhật chỉ số</h2>
         
            <div className="form-group">
              <label htmlFor="weight">Cân nặng (gram)</label>
              <input type="number" id="weight" value={weight} onChange={handleOnChangeWeight} />
            </div>
            <div className="form-group">
              <label htmlFor="height">Chiều cao (cm)</label>
              <input type="number" id="height" value={height} onChange={handleOnChangeHeight} />
            </div>
           
            <button type="submit" className="btn btn--primary" onClick={handleUpdateGrowth}>
      
              Cập nhật
            </button>
            {bmi && (   <div className="modal">
        <div className="modal_body">
            <button onClick={handleOnClose}  className="btn btn--primary">Close</button>
            <p> Chỉ Số IBM : {weight/(height * 2)}</p>
    </div>

    </div>)}
    
        </div>
      </div>

      <div className="dashboard__features">
        {[
          {
            icon: Calendar,
            title: "Nhắc nhở",
            description: "Xem lịch khám và nhắc nhở",
          },
          {
            icon: Apple,
            title: "Dinh dưỡng",
            description: "Theo dõi chế độ ăn uống",
          },
          {
            icon: Dumbbell,
            title: "Bài tập",
            description: "Hướng dẫn tập luyện an toàn",
          },
          {
            icon: Users,
            title: "Cộng đồng",
            description: "Chia sẻ và trao đổi kinh nghiệm",
          },
        ].map((item, index) => (
          <div key={index} className="dashboard__feature-card">
            <item.icon className="feature-icon" />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="dashboard__tip">
        <h2>Mẹo của ngày</h2>
        <div className="dashboard__tip-content">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
            alt="Healthy Food"
            className="tip-image"
          />
          <div>
            <h3>Ăn nhiều rau xanh</h3>
            <p>Rau xanh giàu folate, sắt và các vitamin cần thiết cho sự phát triển của thai nhi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

