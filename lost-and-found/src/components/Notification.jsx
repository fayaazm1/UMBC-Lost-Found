import React, { useState, useEffect } from 'react';
import '../assets/notification.css';

const Notification = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};

export default Notification;
