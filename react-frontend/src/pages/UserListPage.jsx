import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch users from MongoDB
  useEffect(() => {
    axios.get("http://localhost:8000/api/users/")
      .then((res) => {
        console.log("✅ MongoDB Users:", res.data.users);
        setUsers(res.data.users);
      })
      .catch((err) => console.error("❌ Failed to fetch users:", err));
  }, []);

  // ✅ When user is selected
  const handleSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      console.log("➡️ Navigating to /message/" + selectedId);
      navigate(`/message/${selectedId}`);
    }
  };

  return (
    <div className="container mt-4">
      <select
        className="form-select"
        onChange={handleSelect}
        defaultValue=""
        style={{
          width: "250px",
          float: "right",
          backgroundColor: "#010B12",
          color: "#9CFF00",
          border: "2px solid #2BC20E",
          padding: "8px",
          borderRadius: "6px",
          fontWeight: "bold",
          boxShadow: "0 0 6px #2BC20E"
        }}
      >
        <option value="" disabled>Select user to chat</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserListPage;
