import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyAx7qWlyq2_pXqCEdxU1taPMYKPsC1PcEr",
  authDomain: "lnfproject.firebaseapp.com",
  projectId: "lnfproject",
  storageBucket: "lnfproject.appspot.com",
  messagingSenderId: "616563789009",
  appId: "1:616563789009:web:3b8215367d08881c642149f",
  measurementId: "G-MED32VF6VW"
};

// ✅ Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

let messaging = null;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(firebaseApp);
    console.log("✅ Firebase Messaging is supported");
    requestForToken(); // optional: request token immediately
  } else {
    console.warn("⚠️ Firebase Messaging is NOT supported in this browser");
  }
});

// ✅ Export: Request Notification Token
export const requestForToken = () => {
  if (!messaging) return;

  getToken(messaging, {
    vapidKey: "BEtAmNVk31cPiwzNaNTJlKVu6jUDPcEzz5Vsgouo5rcSettJ5ghIFU5_P40yPDd87STXpAN7Z316b9sdZ084"
  })
    .then((token) => {
      if (token) {
        console.log("Firebase Token:", token);
        const user_id = 1; // 🔁 Replace with actual user ID
        axios.post("http://localhost:8000/save_firebase_token/", {
          user_id,
          token,
        });
      }
    })
    .catch((err) => {
      console.error("Token Error:", err);
    });
};

// ✅ Export: onMessage listener for foreground notifications
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    } else {
      console.warn("⚠️ Messaging is not available for onMessageListener");
    }
  });
