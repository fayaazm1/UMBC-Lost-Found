// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import TwoFactorPage from './components/TwoFactorPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/two-factor" element={<TwoFactorPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
