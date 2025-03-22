import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import CustomNavbar from "./components/Navbar";

const App = () => {
  return (
    <>
      <CustomNavbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/found" element={<Found />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/message" element={<Messages />} />
        </Routes>
      </div>
    </>
  );
};

export default App;
