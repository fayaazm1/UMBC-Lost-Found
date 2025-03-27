import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserList.css";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/users/")

      .then((res) => setUsers(res.data.users))
      .catch((err) => console.error("Error fetching users", err));
  }, []);

  const handleSelect = (e) => {
    const receiverId = e.target.value;
    if (receiverId) {
      navigate(`/chat/${receiverId}`);
    }
  };

  return (
    <div className="dropdown-container">
      <select className="user-dropdown" onChange={handleSelect} defaultValue="">
        <option value="" disabled hidden>
          Select user to chat
        </option>
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
