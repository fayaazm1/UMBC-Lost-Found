import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const firebaseConfig = {
    apiKey: "AIzaSyAK7qWyq2_pXqCEdxlJtaPMYkP5c1PcEeY",
    authDomain: "lnfproject.firebaseapp.com",
    projectId: "lnfproject",
    storageBucket: "lnfproject.firebasestorage.app",
    messagingSenderId: "616563789009",
    appId: "1:616563789009:web:382f5367d80816c42149f0",
    measurementId: "G-MEDV32FV6V"
  };

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

export const requestForToken = () => {
    return getToken(messaging, {
      vapidKey: "BEtAMnMvkn31cPVwzNaTJKlVu6UjUDpCEzz5VSgouo5rCsettJ5ghlFU5_P40YpDd8d75TXPaN7Z316b9sdZO04"
    })
      .then((token) => {
        if (token) {
          console.log("Firebase Token:", token);
          
          // 🔁 Replace user_id with actual authenticated ID
          const user_id = 1;
  
          // Save token to backend
          axios.post("http://localhost:8000/save_firebase_token/", {
            user_id,
            token,
          });
  
        } else {
          console.log("No registration token available.");
        }
      })
      .catch((err) => console.log("An error occurred: ", err));
  };

  
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
