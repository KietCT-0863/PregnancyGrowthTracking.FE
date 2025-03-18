import HeaderContent from "../../components/HeaderContent/HeaderContent";
import BlogSilde from "../../components/BlogSilde/BlogSilde";
import FooterContent from "../../components/FooterContent/FooterContent";
import ChatAI from "../../components/ChatBoxAI/ChatAI";
import "./HomePublic.scss"; // Thêm file SCSS nếu bạn muốn sử dụng

const HomePublic = () => {
  return (
    <div
      style={{
        backgroundColor: "#FFF0F5", // Màu hồng nhạt (Lavender Blush)
        minHeight: "100vh", // Đảm bảo màu nền trải dài toàn bộ trang
        position: "relative", // Để các thành phần con có thể định vị tương đối
        margin: 0,
        padding: 0,
        width: "100%",
        overflow: "hidden", // Ngăn không cho nội dung tràn ra ngoài
      }}
      className="home-public-container"
    >
      <ChatAI />
      <HeaderContent />
      <BlogSilde />
      <FooterContent />
    </div>
  );
};

export default HomePublic;
