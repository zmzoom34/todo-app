import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const messaging = getMessaging(app);

// // Kullanıcıdan bildirim izni iste
// export const requestNotificationPermission = async () => {
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       console.log("İzin verildi.");
//       return getToken(messaging, {
//         vapidKey: "BFsjzg5qNnI1C1Y-Rzo2R6sKmho6rvf1-d7zIP-oH5mUoglKYInZyI4aIsU1f16bQtN-aw9o1ytLlsUo7n0YhY0",
//       });
//     } else {
//       console.log("İzin reddedildi.");
//       return null;
//     }
//   };

//   export const requestForToken = async () => {
//     try {
//       const currentToken = await getToken(messaging, { vapidKey: "BFsjzg5qNnI1C1Y-Rzo2R6sKmho6rvf1-d7zIP-oH5mUoglKYInZyI4aIsU1f16bQtN-aw9o1ytLlsUo7n0YhY0" });
//       if (currentToken) {
//         console.log("current token for client: ", currentToken);
//       } else {
//         // Show permission request UI
//         console.log("No registration token available. Request permission to generate one.");
//       }
//     } catch (err) {
//       console.log("An error occurred while retrieving token. ", err);
//     }
//   };

//   export const onMessageListener = () =>
//     new Promise((resolve) => {
//       onMessage(messaging, (payload) => {
//         console.log("payload", payload);
//         resolve(payload);
//       });
//     });
  
//   // Bildirimleri dinle
//   onMessage(messaging, (payload) => {
//     console.log("Bildirim alındı:", payload);
//     new Notification(payload.notification.title, {
//       body: payload.notification.body,
//       icon: "/icon.png",
//     });
//   });
