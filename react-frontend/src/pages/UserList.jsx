import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MessageBox.css";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8000/users")
      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Error fetching users", err));
  }, []);

  const handleSelect = (e) => {
    const receiverId = e.target.value;
    if (receiverId) navigate(`/chat/${receiverId}`);
  };

  return (
    <div className="container mt-5">
      <h4 className="text-light mb-3">💬 Select a user to chat</h4>
      <select
        className="form-select"
        value={selectedUser}
        onChange={handleSelect}
      >
        <option value="">-- Choose a user --</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.username}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserList;
