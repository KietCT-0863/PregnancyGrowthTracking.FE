"use client";

import React, { useState } from "react";
import {
  Calendar,
  Activity,
  Book,
  Users,
  Baby,
  TrendingUp,
  Apple,
  Dumbbell,
} from "lucide-react";

const mockUser = {
  name: "Nguyễn Thị A",
  email: "nguyenthia@example.com",
  dueDate: "2024-12-31",
  weeksPregant: 20,
};

const mockGrowthData = {
  weight: 300,
  height: 25,
};

const Dashboard = () => {
  const [weight, setWeight] = useState(mockGrowthData.weight);
  const [height, setHeight] = useState(mockGrowthData.height);

  const handleUpdateGrowth = (e) => {
    e.preventDefault();
    alert("Cập nhật thành công!");
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Xin chào, {mockUser.name}!</h1>
        <p>Chúc bạn có một ngày tuyệt vời cùng Mẹ Bầu</p>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
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
          <button className="btn-primary">
            <TrendingUp className="icon" />
            Xem biểu đồ tăng trưởng
          </button>
        </div>

        <div className="stats-card">
          <h2>Cập nhật chỉ số</h2>
          <form onSubmit={handleUpdateGrowth}>
            <div className="form-group">
              <label htmlFor="weight">Cân nặng (gram)</label>
              <input
                type="number"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="height">Chiều cao (cm)</label>
              <input
                type="number"
                id="height"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="btn-primary">
              Cập nhật
            </button>
          </form>
        </div>
      </div>

      <div className="features-grid">
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
          <div key={index} className="feature-card">
            <item.icon className="feature-icon" />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>

      <div className="tip-section">
        <h2>Mẹo của ngày</h2>
        <div className="tip-content">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
            alt="Healthy Food"
            className="tip-image"
          />
          <div>
            <h3>Ăn nhiều rau xanh</h3>
            <p>
              Rau xanh giàu folate, sắt và các vitamin cần thiết cho sự phát
              triển của thai nhi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
