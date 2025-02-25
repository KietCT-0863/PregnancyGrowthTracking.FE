import { useState } from "react";
import ChatboxIcon from "./ChatboxIcon";
import "./ChatAI.scss";
import ChatForm from "./ChatForm";
import ChatMessage from "./ChatMessage";
import { useRef, useEffect } from "react";
import { companyInfo } from "../../companyInfo";
    const ChatAI = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat : true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const [showChatbot, setShowChatbox] = useState(false);
  const chatBodyRef = useRef();
  //
  const generateResponse = async (history) => {
    // function to update chat history
    const updateChatHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking ......"),
        { role: "model", text, isError },
      ]);
    };
    // format history for api request
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents: history }),
    };
    try {
      //make the api call to get the response
      const response = await fetch(
        import.meta.env.VITE_API_URL,
        requestOptions
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error.message || "Something went wrong");
      const apiResponseText = data.candidates[0].content.parts[0].text
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .trim();
      updateChatHistory(apiResponseText);
    } catch (error) {
      updateChatHistory(error.message , true);

    }
  };
  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);
  return (
    <div className={`container ${showChatbot ? "show-chatbox" : ""}`}>
      <button  onClick={() => setShowChatbox((prev) => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded"><ChatboxIcon style={{width: "50px", height: "50px" , color: "white" ,backgroundColor: "white"}} /></span>
        <span className="material-symbols-rounded"><ChatboxIcon style={{width: "50px", height: "50px" , color: "white" ,backgroundColor: "white"}} /></span>
      </button>
      <div className="chatboot-popup">
        {/* header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatboxIcon />
            <h2 className="logo-text">Chatbot</h2>
          </div>
          <button className="material-symbols-rounded">
          
          </button>
        </div>
        {/* body */}
        <div className="chat-body" ref={chatBodyRef}>
          <div className="message bot-message">
            <ChatboxIcon />
            <p className="message-text">
              Hello there <br />
              how can I help you today?
            </p>
          </div>
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* footer */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateResponse={generateResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
