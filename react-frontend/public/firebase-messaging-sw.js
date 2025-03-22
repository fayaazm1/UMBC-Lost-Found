/* public/firebase-messaging-sw.js */
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAK7qWyq2_pXqCEdxlJtaPMYkP5c1PcEeY",
    authDomain: "lnfproject.firebaseapp.com",
    projectId: "lnfproject",
    storageBucket: "lnfproject.firebasestorage.app",
    messagingSenderId: "616563789009",
    appId: "1:616563789009:web:382f5367d80816c42149f0",
    measurementId: "G-MEDV32FV6V"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message: ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
