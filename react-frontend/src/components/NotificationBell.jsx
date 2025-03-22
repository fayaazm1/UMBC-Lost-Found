import React, { useEffect, useState } from "react";
import axios from "axios";
import { requestForToken, onMessageListener } from "../firebaseConfig";
import { useUser } from "../UserContext";

const NotificationBell = () => {
  const { userId } = useUser();

  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showList, setShowList] = useState(false);

 
  const handleClick = () => {
    setShowList(!showList);
    setUnread(0);
  };

  useEffect(() => {
     // ✅ Fetch notifications from FastAPI backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/get_notifications/${userId}`);
      const data = res.data.notifications || [];
      setNotifications(data);
      setUnread(data.length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

    requestForToken();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);

    onMessageListener()
      .then(() => {
        fetchNotifications();
      })
      .catch((err) => console.log("Firebase message error:", err));

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="position-relative d-inline-block ms-3">
      {/* 🔔 Bell Button with Bootstrap */}
      <span
        className="btn btn-outline-info rounded-circle position-relative"
        style={{ fontSize: "24px", transition: "0.3s ease", boxShadow: "0 0 8px #02a9f7" }}
        onClick={handleClick}
      >
        🔔
        {unread > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
            {unread}
          </span>
        )}
      </span>

      {/* 🔔 Notification Dropdown List */}
      {showList && (
        <div
          className="shadow-lg mt-2 p-3 rounded"
          style={{
            backgroundColor: "#02577a",
            color: "#d4f0fc",
            position: "absolute",
            top: "40px",
            right: "0",
            zIndex: 999,
            width: "280px",
            border: "1px solid #02a9f7",
            transition: "all 0.3s ease-in-out",
          }}
        >
          <h6 className="text-info mb-2">🔔 Notifications</h6>
          {notifications.length === 0 ? (
            <p className="text-light">No notifications yet.</p>
          ) : (
            notifications.map((n, index) => (
              <div
                key={index}
                className="bg-dark p-2 mb-2 rounded"
                style={{
                  backgroundColor: "#01303f",
                  border: "1px solid #02a9f7",
                  transition: "0.3s",
                  fontSize: "14px",
                }}
              >
                📣 {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
