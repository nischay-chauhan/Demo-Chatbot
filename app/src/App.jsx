import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.REACT_APP_OPENAI_API_KEY;

function App() {
  const [message, setMessage] = useState([
    {
      message: "Hello I am Chatbot. Ask me any query",
      sendTime: "just now",
      sender: "bot",
    },
  ]);

  const [typing, setTyping] = useState(false);

  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user',
    };
    setMessage((prevMessage) => [...prevMessage, newMessage]);
    setTyping(true);

    try {
      const response = await processMessageToChatGPT([...message, newMessage]);
      console.log("API Response:", response);

      const content = response.choices[0]?.message?.content;

      if (content) {
        const chatGptResponse = {
          message: content,
          sender: "bot",
        };
        setMessage((prevMessage) => [...prevMessage, chatGptResponse]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTyping(false);
    }
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "ChatGPT" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "I'm a Student using ChatGPT for learning" },
        ...apiMessages,
      ],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json();
  }

  return (
    <div className='App'>
      <div style={{ position: "relative", height: "800px", width: "700p" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content='Bot is typing' /> : null}
            >
              {message.map((msg) => (
                <Message key={uuidv4()} model={msg} />
              ))}
            </MessageList>
            <MessageInput placeholder='Send a message ' onSend={handleSendRequest} />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
