import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { getMessaging, onMessage, getToken } from "firebase/messaging";

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


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// export const messaging = getMessaging(app);


