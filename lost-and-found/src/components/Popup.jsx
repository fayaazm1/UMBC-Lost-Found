import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../assets/style.css";

const Popup = ({ post, onClose }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { dbUser: currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Debug logs
    console.log("Current user:", currentUser);
    console.log("Post:", post);
  }, [currentUser, post]);

  if (!post) {
    console.log("No post data received");
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    if (!currentUser?.id) {
      setError("You must be logged in to send messages");
      return;
    }

    if (!post.user?.id) {
      setError("Cannot send message: Post owner information is missing");
      return;
    }

    if (currentUser.id === post.user.id) {
      setError("You cannot send a message to yourself");
      return;
    }

    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      console.log("Sending message with data:", {
        message: message.trim(),
        from: currentUser.id,
        to: post.user.id,
        postId: post.id
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          from: currentUser.id,
          to: post.user.id,
          postId: post.id
        })
      });

      const data = await response.json();
      console.log("Server response:", data);

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send message');
      }

      setSuccess("Message sent successfully!");
      setMessage("");
      setTimeout(() => {
        onClose();
        navigate('/messages');
      }, 1500);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="popup-overlay" 
      onClick={(e) => {
        if (e.target.className === 'popup-overlay') {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div 
        className="popup-container" 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--background-card)',
          padding: '2rem',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'var(--shadow-soft)',
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ position: 'absolute', right: '1rem', top: '1rem' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ 
          marginBottom: '1rem',
        }}>
          <div style={{ 
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            background: 'var(--gradient-primary)',
            borderRadius: '999px',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            textTransform: 'uppercase'
          }}>
            {post.report_type || "UNKNOWN"}
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
            {post.item_name || post.title || "Untitled Item"}
          </h3>
          <p style={{ 
            margin: '0',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
          }}>
            Posted by <span style={{ color: 'var(--primary-color)' }}>{post.user?.username || "Unknown"}</span> on {formatDate(post.timestamp || post.date)}
          </p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Location:</strong> {post.location || "Not specified"}
          </p>
          <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            <strong>Description:</strong> {post.description}
          </p>
          {post.contact_details && (
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              <strong>Contact:</strong> {post.contact_details}
            </p>
          )}
        </div>

        {post.image_path && (
          <div style={{ marginBottom: '1rem' }}>
            <img
              src={`${import.meta.env.VITE_API_BASE_URL}/${post.image_path}`}
              alt="Item"
              style={{
                width: '100%',
                maxHeight: '200px',
                objectFit: 'cover',
                borderRadius: '4px',
              }}
            />
          </div>
        )}

        {currentUser?.id ? (
          <div style={{ marginTop: '1rem' }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to the user..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                marginBottom: '1rem',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                resize: 'vertical',
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
              }}
              disabled={isSending}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleSendMessage}
                style={{
                  background: 'var(--gradient-primary)',
                  color: 'var(--text-primary)',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s',
                  fontWeight: '500'
                }}
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Message"}
              </button>
            </div>
            {error && <p style={{ color: 'var(--text-error)', marginTop: '1rem' }}>{error}</p>}
            {success && <p style={{ color: 'var(--text-success)', marginTop: '1rem' }}>{success}</p>}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '1rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
              Please <span 
                onClick={() => navigate('/login')} 
                style={{ 
                  color: 'var(--primary-color)', 
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                login
              </span> to send messages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
