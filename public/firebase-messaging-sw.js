// Firebase SDK'yı tarayıcıda çalıştırmak için importScripts kullan
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js");

// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAPjYOiuFetvMKExkehY6GtkimG-PsW3zU",
    authDomain: "apartman-takip.firebaseapp.com",
    databaseURL: "https://apartman-takip-default-rtdb.firebaseio.com",
    projectId: "apartman-takip",
    storageBucket: "apartman-takip.firebasestorage.app",
    messagingSenderId: "1018320203975",
    appId: "1:1018320203975:web:a320b649d0b7e2d60d4ee2",
    measurementId: "G-NXR62T6MCV"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Arka planda gelen mesajları dinle
messaging.onBackgroundMessage((payload) => {
  console.log("Arka planda bildirim alındı:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/todo-app-jpeg.png",
  });
});

