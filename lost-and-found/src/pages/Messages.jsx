// Final updated Messages.jsx matching the Trixie-style CSS design
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatMessageTime } from '../utils/dateUtils';
import { playMessageSound, playNotificationSound } from '../utils/soundEffects';
import '../assets/messages.css';
import Navbar from '../components/Navbar';

const MessageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="200"
    height="500"
    style={{ opacity: 0.4 }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const EMOJI_LIST = ["👋", "😊", "👍", "❤️", "🙌", "🎉", "😂", "🤔", "👀", "✨"];

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const { dbUser: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const emojiButtonRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/conversations/${currentUser.id}`);
        const data = await response.json();
        setConversations(data);
        setLoading(false);
      } catch (err) {
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
        const data = await response.json();
        setMessages(data);

        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/mark-read`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, conversationId: selectedChat.userId })
        });

      } catch {
        setError('Failed to load messages');
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [currentUser, selectedChat]);

  const handleChatSelect = (conv) => {
    setSelectedChat(conv);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojis(false);
  };

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (!newMessage.trim()) return;

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: newMessage,
            from: currentUser.id,
            to: selectedChat.userId,
            postId: selectedChat.postId
          })
        });
        setNewMessage("");
      } catch {
        setError('Failed to send message');
      }
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setIsMobileListVisible(true);
    setMessages([]);
    setNewMessage('');
    setShowEmojis(false);
  };

  if (!currentUser?.id) {
    return <div className="messages-page">Please sign in to view messages.</div>;
  }

  return (
    <div className="messages-page">
      <Navbar />
      <div className="app-container">
        <div className={`conversations-list ${!isMobileListVisible ? 'hidden' : ''}`}>
          <div className="conversations-header">Messages</div>
          <div className="conversation-items">
            {conversations.map(conv => (
              <div
                key={conv._id}
                className={`conversation-item ${selectedChat?._id === conv._id ? 'active' : ''}`}
                onClick={() => handleChatSelect(conv)}
              >
                <div className="conversation-avatar">
                  <div className="chat-avatar">{conv.username.charAt(0).toUpperCase()}</div>
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">{conv.username}</div>
                  <div className="conversation-preview">{conv.last_message}</div>
                </div>
                {conv.unread > 0 && <div className="unread-badge">{conv.unread}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className="chat-section">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-header-center">
                  <div className="chat-avatar">{selectedChat.username.charAt(0).toUpperCase()}</div>
                  <div className="chat-username">{selectedChat.username}</div>
                </div>
                <button className="close-chat-button" onClick={handleCloseChat}>✕</button>
              </div>
              <div className="chat-messages">
                <div className="messages-scroll-container">
                  {messages.map(msg => (
                    <div key={msg._id} className={`message ${msg.sender_id === currentUser.id ? 'sent' : 'received'}`}>
                      <div className="message-content">
                        <div className="message-bubble">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="message-input-container">
                <button className="emoji-button" onClick={() => setShowEmojis(!showEmojis)} ref={emojiButtonRef}>😊</button>
                {showEmojis && (
                  <div className="emoji-picker">
                    {EMOJI_LIST.map((emoji, index) => (
                      <button key={index} className="emoji-item" onClick={() => handleEmojiClick(emoji)}>{emoji}</button>
                    ))}
                  </div>
                )}
                <input
                  className="message-input"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => handleSendMessage(e)}
                />
                <button className="send-button" onClick={(e) => handleSendMessage(e)}>➤</button>
              </div>
            </>
          ) : (
            <div className="chat-empty-state">
              <MessageIcon />
              <h4>Select a conversation</h4>
              <p>Choose a chat from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;