
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3VHlQM_YRnOz7q6gMg0xgaDHJLOk5E6g",
  authDomain: "test-67659.firebaseapp.com",
  projectId: "test-67659",
  storageBucket: "test-67659.firebasestorage.app",
  messagingSenderId: "673537775573",
  appId: "1:673537775573:web:26373913cc60a707f00f5c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
