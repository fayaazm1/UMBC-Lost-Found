import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Messages.css';

const Messages = () => {
  const { dbUser: currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/conversations/${currentUser.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
        setLoading(false);
      }
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id || !selectedChat?.userId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/chat/${currentUser.id}/${selectedChat.userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedChat]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedChat?.userId) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          from: currentUser.id,
          to: selectedChat.userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to send message');
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setError(error.message || 'Failed to send message');
    }
  };

  if (!currentUser?.id) {
    return (
      <div className="messages-container">
        <div className="login-prompt">
          <p>Please log in to view your messages</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading">Loading conversations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="messages-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-content">
        <div className="conversations-list">
          <h2>Conversations</h2>
          {conversations.length === 0 ? (
            <div className="no-conversations">
              <div>
                <p>No conversations yet</p>
                <small>Start a conversation by messaging someone from their post</small>
              </div>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${selectedChat?._id === conv._id ? 'selected' : ''}`}
                onClick={() => setSelectedChat(conv)}
              >
                <div className="conversation-info">
                  <div className="username">{conv.username}</div>
                  <div className="last-message">{conv.last_message}</div>
                  <div className="timestamp">
                    {new Date(conv.timestamp).toLocaleString()}
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div className="unread-badge">{conv.unread}</div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="chat-area">
          {selectedChat ? (
            <div className="chat-container">
              <div className="chat-header">
                <h3>{selectedChat.username}</h3>
              </div>
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <small>Start the conversation by sending a message</small>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <p>{msg.content}</p>
                        <span className="timestamp">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <form className="message-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button type="submit">Send</button>
              </form>
            </div>
          ) : (
            <div className="no-chat-selected">
              <div>
                <p>Select a conversation to start chatting</p>
                <small>Your messages will appear here</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;