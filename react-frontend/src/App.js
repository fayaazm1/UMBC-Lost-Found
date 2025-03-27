import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserList from "./components/UserList";
import MessageBox from "./components/MessageBox";
import { UserProvider } from "./UserContext";

const App = () => {
  return (
    <UserProvider>
      <Navbar />

      <div style={{ padding: "20px", position: "relative" }}>
        <Routes>
          <Route
            path="/"
            element={
              <h2 className="text-dark">Welcome to Lost & Found</h2>
            }
          />

          <Route
            path="/messages"
            element={
              <div style={{ position: "relative", minHeight: "200px" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "30px",
                    zIndex: 1000,
                  }}
                >
                  <UserList />
                </div>
              </div>
            }
          />

          <Route
            path="/chat/:receiverId"
            element={
              <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ width: "25%", minWidth: "200px" }}>
                  <UserList />
                </div>
                <div style={{ flex: 1 }}>
                  <MessageBox />
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </UserProvider>
  );
};

export default App;
