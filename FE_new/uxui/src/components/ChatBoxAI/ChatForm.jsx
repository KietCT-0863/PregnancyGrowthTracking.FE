import { useRef } from 'react';

import "./ChatAi.scss";


const ChatForm = ({chatHistory, setChatHistory, generateResponse}) => {
    const inputRef = useRef();
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const userMessage = inputRef.current.value.trim();
        if (!userMessage) return;
        inputRef.current.value = "";
// chat history update
        setChatHistory((history) => [...history, {role: "user", text: userMessage}]);
// add thinking ......
        setTimeout(() => {
            setChatHistory((history) => [...history, {role: "model", text: "thinking ......"}]);
            generateResponse([...chatHistory, {role: "user", text: `Using the details provided above, please address this query: ${userMessage}`}]);
        }, 1000);
    };

        

  return (
    <form action="#" className='chat-form' onSubmit={handleFormSubmit}>
          <input ref={inputRef} type='text' placeholder='Type here...'
          className='message-input' required style={{borderRadius: "25px", backgroundColor: "whitesmoke"}}
          />        <button className="material-symbols
          
          
          
          
          -rounded">
   
          </button>
        </form>
  )
}

export default ChatForm;
