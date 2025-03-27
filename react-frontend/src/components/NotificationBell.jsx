import React, { useEffect, useState } from "react";
import axios from "axios";
import { requestForToken, onMessageListener } from "../firebaseConfig";
import { FaBell } from "react-icons/fa";
import "./navbar.css";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const userId = 1;

  useEffect(() => {
    requestForToken();
  
    axios.get(`http://localhost:8000/api/get_notifications/${userId}`)


 // ✅ `/chat` prefix
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.notifications.length);
      });
  
    onMessageListener().then((payload) => {
      const msg = payload?.notification?.body || "New notification";
      setNotifications((prev) => [{ message: msg }, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
  }, [userId]);
  

    

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    setUnreadCount(0);
  };

  return (
    <div className="position-relative" style={{ cursor: "pointer" }}>
      <FaBell size={24} onClick={toggleDropdown} color="gold" />
      {unreadCount > 0 && (
        <span className="badge bg-success position-absolute top-0 start-100 translate-middle">
          {unreadCount}
        </span>
      )}
      {showDropdown && (
        <div
          className="position-absolute bg-dark text-light p-2 rounded shadow"
          style={{
            width: "300px",
            maxHeight: "300px",
            right: 0,
            top: "120%",
            overflowY: "auto",
            zIndex: 999,
          }}
        >
          <h6 className="border-bottom pb-2">🔔 Notifications</h6>
          {notifications.length === 0 ? (
            <div className="text-muted">No notifications yet.</div>
          ) : (
            notifications.map((note, idx) => (
              <div key={idx} className="border-bottom py-2">
                📨 {note.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
