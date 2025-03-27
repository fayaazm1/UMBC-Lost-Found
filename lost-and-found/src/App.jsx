import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Post from "./components/Post";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Welcome from "./pages/Welcome";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import NotificationsPage from "./pages/NotificationsPage";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const { currentUser } = useAuth();

  return (
    <AuthProvider>
      <div>
        {currentUser && currentUser.emailVerified && <Navbar />}
        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/lost" element={
              <ProtectedRoute>
                <Lost />
              </ProtectedRoute>
            } />
            <Route path="/found" element={
              <ProtectedRoute>
                <Found />
              </ProtectedRoute>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } />
            <Route path="/post" element={
              <ProtectedRoute>
                <Post />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            {/* Redirect unmatched routes to Welcome page */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
