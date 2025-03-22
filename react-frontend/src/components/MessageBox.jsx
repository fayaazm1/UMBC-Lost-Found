import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MessageBox.css";

const MessageBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [ws, setWs] = useState(null);

  const senderId = "user1"; // replace with dynamic user later
  const receiverId = "user2";

  useEffect(() => {
    axios
      .get(`http://localhost:8000/get_messages/${receiverId}`)
      .then((res) => setMessages(res.data.messages))
      .catch((err) => console.error("❌ Error loading messages", err));

    const websocket = new WebSocket("ws://localhost:8000/ws");
    websocket.onopen = () => console.log("✅ WebSocket connected");
    websocket.onmessage = (event) => {
      console.log("📨 WebSocket received:", event.data);
      setMessages((prev) => [...prev, { sender_id: "server", message: event.data }]);
    };
    websocket.onerror = (error) => console.error("❌ WebSocket error:", error);
    websocket.onclose = () => console.log("🔌 WebSocket closed");

    setWs(websocket);
    return () => websocket.close();
  }, []);

  const sendMessage = () => {
    if (newMsg.trim() === "") return;

    const msg = { sender_id: senderId, receiver_id: receiverId, message: newMsg };

    axios.post("http://localhost:8000/send_message/", msg)
      .then(() => {
        setMessages((prev) => [...prev, msg]);
        if (ws) ws.send(newMsg);
        setNewMsg("");
      })
      .catch((err) => console.error("❌ Error sending message:", err));
  };

  return (
    <div className="container py-5" style={{ backgroundColor: "#01303f", minHeight: "100vh" }}>
      <div className="text-center mb-4 text-light">
        <h4 className="text-info">💬 Live Chat</h4>
      </div>
      <div className="card bg-dark text-light border border-info shadow-lg mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <div className="mb-3" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className="mb-2">
                <strong style={{ color: "#89d6fb" }}>{msg.sender_id}</strong>: {msg.message}
              </div>
            ))}
          </div>
          <div className="d-flex">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              className="form-control form-control-sm me-2"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button className="btn btn-success btn-sm" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
