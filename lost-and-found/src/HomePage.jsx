import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import PostForm from "./components/Post";

// ✅ Use the correct filenames for your pages
import LostPage from "./pages/Lost";
import FoundPage from "./pages/Found";
import AboutPage from "./pages/About";
import ContactPage from "./pages/Contact";
import HomePageContent from "./pages/Home"; // ✅ Using Home.jsx
import NotFoundPage from "./pages/NotFound";

import PostList from "./components/PostList";

<PostList />


const HomePage = () => {
  return (
    <>
      <Navbar />
      <FakeLogin />

      <Routes>
        <Route path="/" element={<HomePageContent />} />
        <Route path="/lost" element={<LostPage />} />
        <Route path="/found" element={<FoundPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/post" element={<PostForm />} />
        <Route path="*" element={<NotFoundPage />} /> {/* ✅ Handles unknown routes */}
      </Routes>
    </>
  );
};

export default HomePage;
