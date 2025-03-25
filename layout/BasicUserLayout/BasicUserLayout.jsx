import { useEffect } from "react";
import HomeBasicUser from "../../src/pages/HomeBasicUser/HomeBasicUser";
import ChatAI from "../../src/components/ChatBoxAI/ChatAI";
import "./BasicUserLayout.scss";

const BasicUserLayout = () => {
  useEffect(() => {
    // Thêm class và reset styles
    document.body.classList.add("basic-user-page");
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.body.classList.remove("basic-user-page");
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, []);

  return (
    <div className="basic-user-container">
      <div className="basic-user-waves">
        <div className="wave"></div>
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <div className="decorative-element circle1"></div>
      <div className="decorative-element circle2"></div>
      <div className="decorative-element blob1"></div>
      <div className="decorative-element blob2"></div>
      <ChatAI />
      <HomeBasicUser />
    </div>
  );
};

export default BasicUserLayout;
