import { useEffect } from "react";
import HomeMember from "../../src/pages/HomeMember/HomeMember";
import ChatAI from "../../src/components/ChatBoxAI/ChatAI";
import "./Member.scss";

const Member = () => {
  useEffect(() => {
    document.body.classList.add('member-page');
    
    // Thêm style trực tiếp vào body để loại bỏ khoảng trắng
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.paddingTop = "0";
    
    return () => {
      document.body.classList.remove('member-page');
      // Xóa style khi unmount
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.paddingTop = "";
    };
  }, []);

  return (
    <div className="member-container" style={{ marginTop: 0, paddingTop: "70px" }}>
      <div className="member-waves">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      
      <ChatAI />
      <HomeMember />
    </div>
  );
};

export default Member;
