import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrash } from 'react-icons/fa';
import '../assets/notification.css';
import api from '../utils/apiConfig';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { currentUser } = useAuth();

  const fetchNotifications = async () => {
    if (!currentUser?.uid) return;

    try {
      const response = await api.get(`/api/notifications/user/${currentUser.uid}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser?.uid]);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      await fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (!currentUser?.uid) {
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