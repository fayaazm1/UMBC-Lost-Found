import React from "react";
import Navbar from "../components/Navbar";

const ProfilePage = () => {
  return (
    <div style={{ backgroundColor: "#01303f", minHeight: "100vh", color: "#d4f0fc" }}>
      <div className="container py-5">
        <h2 className="text-center mb-4" style={{ color: "#02a9f7" }}>👤 User Profile</h2>
        <div className="card bg-dark text-light shadow p-4 border border-info">
          <div className="card-body">
            <h5 className="card-title">Name: Jane Doe</h5>
            <p className="card-text">Email: jane.doe@example.com</p>
            <p className="card-text">Role: Student</p>
            <button className="btn btn-outline-light btn-sm">Edit Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
