import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Profile from "./pages/Profile";
import Message from "./pages/Message";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lost" element={<Lost />} />
        <Route path="/found" element={<Found />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/message" element={<Message />} />
      </Routes>
    </div>
  );
}

export default App;
