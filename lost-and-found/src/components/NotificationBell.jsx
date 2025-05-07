import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../assets/notification.css';
import api from '../utils/apiConfig'; 

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!currentUser?.uid) {
      console.log('No valid user ID available');
      return;
    }
    
    try {
      const response = await api.get(`/api/notifications/user/${currentUser.uid}`);
      const data = response.data;
      
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      } else {
        console.error('Expected array of notifications but got:', data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId) => {
    if (!currentUser?.uid) return;

    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!currentUser?.uid) return;

    try {
      await api.delete(`/api/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBellClick = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
  };

  const handleViewAll = (e) => {
    e.preventDefault();
    navigate('/notifications');
    setShowNotifications(false);
  };

  // Create a notification speech text that includes the unread count
  const notificationSpeechText = unreadCount > 0 
    ? `Notifications. You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}.` 
    : 'Notifications. No unread notifications.';

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="nav-icon notification-bell speech-enabled" 
        onClick={handleBellClick}
        aria-label={notificationSpeechText}
        data-speech={notificationSpeechText}
        data-speech-enabled="true"
      >
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button 
              className="view-all speech-enabled" 
              onClick={handleViewAll}
              aria-label="View all notifications"
              data-speech="View all notifications"
              data-speech-enabled="true"
            >
              View All
            </button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''} speech-enabled`}
                  onClick={() => markAsRead(notification.id)}
                  aria-label={`${!notification.is_read ? 'Unread notification: ' : 'Notification: '} ${notification.title}`}
                  data-speech={`${!notification.is_read ? 'Unread notification: ' : 'Notification: '} ${notification.title}. ${notification.message}`}
                  data-speech-enabled="true"
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                  <button
                    className="delete-notification speech-enabled"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="Delete notification"
                    data-speech="Delete notification"
                    data-speech-enabled="true"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
