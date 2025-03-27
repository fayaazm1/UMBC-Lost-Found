import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash } from 'react-icons/fa';
import '../assets/notification.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { dbUser } = useAuth();

  const fetchNotifications = async () => {
    if (!dbUser?.id) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${dbUser.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [dbUser?.id]);

  const markAsRead = async (notificationId) => {
    if (!dbUser?.id) return;

    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
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
      const response = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
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

  if (!dbUser?.id) {
    return (
      <div className="notifications-page">
        <h1>Notifications</h1>
        <p>Please log in to view notifications</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <h1>All Notifications</h1>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
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
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
