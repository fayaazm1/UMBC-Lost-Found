import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import NotificationBell from "./components/NotificationBell";
import MessageBox from "./components/MessageBox"; // This is your main chat component
import LostPage from "./pages/Lost";
import UserListPage from "./pages/UserListPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <NotificationBell />

      <Routes>
        <Route path="/" element={<UserListPage />} />
        <Route path="/messages" element={<UserListPage />} />
        <Route path="/message/:receiverId" element={<MessageBox />} />
        <Route path="/lost" element={<LostPage />} />
      </Routes>
    </Router>
  );
};

export default App;
