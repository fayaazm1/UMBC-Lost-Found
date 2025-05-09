import React, { useEffect } from "react";
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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import Messages from "./pages/Messages";
import Search from "./pages/Search";
import FilterResults from "./pages/FilterResults"; 
import QRCodeGenerator from "./pages/QRCodeGenerator";
import { useAuth } from "./contexts/AuthContext";
import { SkipToContent } from "./utils/accessibility.jsx";
import AccessibilityPanel from "./components/AccessibilityPanel";
import { initializeSpeech } from "./utils/speechSynthesis.jsx";

function App() {
  const { currentUser } = useAuth();

  // Initialize speech functionality if screen reader is active
  useEffect(() => {
    const isScreenReaderActive = localStorage.getItem('screen-reader-active') === 'true';
    if (isScreenReaderActive) {
      document.body.classList.add('screen-reader-active');
      // Initialize speech on interactive elements
      const observer = initializeSpeech();
      
      // Clean up observer on unmount
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, []);

  return (
    <div>
      <SkipToContent />
      {currentUser && !window.location.pathname.startsWith('/admin') && <Navbar />}
      <div className="content" id="main-content" tabIndex="-1">
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

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
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            <ProtectedRoute>
              <Contact />
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
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/post" element={
            <ProtectedRoute>
              <Post />
            </ProtectedRoute>
          } />
          <Route path="/post/:id" element={
            <ProtectedRoute>
              <Post />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          } />
          <Route path="/filter-results" element={
            <ProtectedRoute>
              <FilterResults />
            </ProtectedRoute>
          } />
          <Route path="/qr-generator" element={
            <ProtectedRoute>
              <QRCodeGenerator />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <AccessibilityPanel />
    </div>
  );
}

export default App;
