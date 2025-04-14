import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../assets/notification.css';

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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/user/${currentUser.uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
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
    if (!currentUser?.uid) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${notificationId}`, {
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

  const handleViewAll = (e) => {
    e.preventDefault();
    navigate('/notifications');
    setShowNotifications(false);
  };

  return (
    <div className="notification-container" ref={dropdownRef}>
      <button className="nav-icon notification-bell" onClick={handleBellClick}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showNotifications && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button className="view-all" onClick={handleViewAll}>
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
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
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
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
