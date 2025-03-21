import { useEffect } from "react";
import HomeMember from "../../src/pages/HomeMember/HomeMember";
import ChatAI from "../../src/components/ChatBoxAI/ChatAI";
import "./Member.scss";

const Member = () => {
  useEffect(() => {
    // Thêm class và reset styles
    document.body.classList.add("member-page");
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.body.classList.remove("member-page");
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, []);

  return (
    <div className="member-container">
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
