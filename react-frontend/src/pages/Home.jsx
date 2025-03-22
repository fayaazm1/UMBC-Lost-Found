import React from "react";
import Navbar from "../components/Navbar";

const HomePage = () => {
  return (
    <div style={{ backgroundColor: "#01303f", minHeight: "100vh", color: "#d4f0fc" }}>
      <div className="container py-5 text-center">
        <h1 className="display-5 fw-bold">🏠 Welcome to the Lost and Found System</h1>
        <p className="lead">Helping you find what's lost and return what's found.</p>
      </div>
    </div>
  );
};

export default HomePage;
