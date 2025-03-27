import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./MessageBox.css";
import { UserContext } from "../UserContext";

const MessageBox = () => {
  const { receiverId } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const senderId = user?.id || "user1";

  const [receiverName, setReceiverName] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [ws, setWs] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/users/")
      .then((res) => {
        setUsers(res.data.users);
        const found = res.data.users.find((u) => u._id === receiverId);
        setReceiverName(found?.username || receiverId);
      })
      .catch((err) => console.error("Failed to fetch username", err));
  }, [receiverId]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/get_messages/${senderId}`)
      .then((res) => {
        const filtered = res.data.messages.filter(
          msg => msg.senderId === receiverId || msg.receiverId === receiverId
        );
        setMessages(filtered);
      })
      .catch((err) => console.error("Error loading messages", err));

    const socket = new WebSocket(`ws://localhost:8000/ws/${senderId}_${receiverId}`);
    setWs(socket);

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        setMessages((prev) => [...prev, { senderId: "server", message: event.data }]);
      }
    };

    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => console.log("WebSocket closed");

    return () => socket.close();
  }, [receiverId, senderId]);

  const handleSend = () => {
    if (ws && newMsg.trim() !== "") {
      const msgData = {
        senderId,
        receiverId,
        message: newMsg.trim(),
      };
      ws.send(JSON.stringify(msgData));
      setMessages((prev) => [...prev, msgData]);
      setNewMsg("");
    }
  };

  const handleUserChange = (e) => {
    navigate(`/message/${e.target.value}`);
  };

  return (
    <div className="chat-container">
      <div className="chat-header-row">
        <h2 className="chat-header">💬 Chat with {receiverName}</h2>
        <select
          className="user-select-dropdown"
          onChange={handleUserChange}
          value={receiverId}
        >
          <option disabled>Select user to chat</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.username}
            </option>
          ))}
        </select>
      </div>

      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.senderId === senderId ? "sent" : "received"}`}
            >
              <strong>{msg.senderId === senderId ? "You" : receiverName}:</strong> {msg.message}
            </div>
          ))}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
