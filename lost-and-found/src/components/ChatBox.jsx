import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatBox.css';

const ChatBox = ({ currentUser, otherUser, messages, onMessageSent }) => {
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: currentUser.id,
          receiver_id: otherUser.user_id,
          content: newMessage,
          post_id: otherUser.post_id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      setNewMessage('');
      setError(null);
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="chatbox">
      <div className="chat-header">
        <h3>{otherUser.username}</h3>
        {otherUser.post_id && <span className="post-badge">Item Discussion</span>}
      </div>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
          >
            <div className="message-content">
              <p>{msg.content}</p>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        {error && <div className="error-message">{error}</div>}
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;