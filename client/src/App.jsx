import { useState, useRef, useEffect } from "react";
import "./index.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(Date.now());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const apiUrl = "https://chatbot-backend-5cfa.onrender.com";

      const response = await fetch(`${apiUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.text,
          thread_id: threadId,
          video_id: "Rwt8wmhzCS8",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // If backend returns JSON
      const data = await response.json();

      const aiMessage = {
        id: Date.now(),
        text: data.content || JSON.stringify(data),
        isUser: false,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);

      const errorMessage = {
        id: Date.now(),
        text: "Sorry, there was an error processing your request.",
        isUser: false,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setThreadId(Date.now());
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>AI Chat</h1>

        <button className="reset-button" onClick={resetChat}>
          New Chat
        </button>
      </header>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start your conversation with the AI</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.isUser ? "user-message" : "ai-message"
              }`}
            >
              <div className="message-avatar">
                {message.isUser ? "You" : "AI"}
              </div>

              <div className="message-content">{message.text}</div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="message ai-message">
            <div className="message-avatar">AI</div>

            <div className="message-content loading">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
        />

        <button
          className="send-button"
          onClick={sendMessage}
          disabled={inputText.trim() === "" || isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
