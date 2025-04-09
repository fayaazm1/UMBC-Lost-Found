import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../assets/notification.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { dbUser } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  console.log('NotificationBell rendering, dbUser:', dbUser);

  const fetchNotifications = async () => {
    if (!dbUser?.id) {
      console.log('No valid user ID available');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${dbUser.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
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
    if (dbUser?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [dbUser?.id]);

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
    if (!dbUser?.id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!dbUser?.id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleBellClick = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);
  };

  const handleViewAll = () => {
    setShowNotifications(false);
    navigate('/notifications');
  };

  // Return null if no user is logged in
  if (!dbUser?.id) return null;

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button 
        className="nav-icon notification-bell"
        onClick={handleBellClick}
        aria-label="Toggle notifications"
      >
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 3 && (
              <button 
                className="view-all"
                onClick={handleViewAll}
              >
                View All ({notifications.length})
              </button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.slice(0, 3).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div 
                    className="notification-content"
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                  >
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>
                  </div>
                  <button
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    aria-label="Delete notification"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          {notifications.length > 3 && (
            <div className="notification-footer">
              <button 
                className="view-all-footer"
                onClick={handleViewAll}
              >
                View {notifications.length - 3} more notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
