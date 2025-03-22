import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from './UserContext';
import 'bootstrap/dist/css/bootstrap.min.css';

// 🔐 Simulated dynamic user ID (later from login/auth)
const userId = 1;

// ✅ Mount React App to root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserContext.Provider value={{ userId }}>
        <App />
      </UserContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Register Firebase Messaging Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered:', registration);
    })
    .catch((err) => {
      console.log('❌ Service Worker registration failed:', err);
    });
}
