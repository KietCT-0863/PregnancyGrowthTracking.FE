import { User, Send } from "lucide-react";
import { useState } from "react";
import "../styles/FeaturedComments.scss";

const FeaturedComments = () => {
  const [comment, setComment] = useState("");
  
  const featuredComments = [
    {
      id: 1,
      author: "Lan Anh",
      time: "Hôm nay, 10:45",
      content: "Bé nhà mình khi 6 tháng tuổi cũng ngủ tư thế này, thật đáng yêu!"
    },
    {
      id: 2,
      author: "Thu Hương",
      time: "Hôm qua, 15:20",
      content: "Mình đã thử nhiều tư thế ngủ nhưng con vẫn thích nằm nghiêng như thế này nhất."
    },
    {
      id: 3,
      author: "Bác sĩ Minh",
      time: "23/05, 09:15",
      content: "Đây là tư thế ngủ an toàn cho bé sơ sinh, giúp tránh nguy cơ ngạt thở và giúp bé ngủ ngon."
    }
  ];
  
  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // Ở đây sẽ xử lý gửi comment lên API
    console.log("Đã gửi bình luận:", comment);
    setComment("");
  };
  
  return (
    <div className="right-sidebar">
      <div className="sidebar-header">
        <h2>Bình luận nổi bật</h2>
      </div>
      <div className="featured-comments">
        {featuredComments.map((item) => (
          <div key={item.id} className="featured-comment">
            <div className="comment-user">
              <div className="avatar">
                <User size={18} />
              </div>
              <div className="user-info">
                <h4>{item.author}</h4>
                <span className="comment-time">{item.time}</span>
              </div>
            </div>
            <p className="comment-content">{item.content}</p>
          </div>
        ))}
      </div>
      <div className="comment-form">
        <form onSubmit={handleSubmitComment}>
          <input 
            type="text" 
            placeholder="Nhập bình luận..." 
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="submit" className="send-button">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeaturedComments; 