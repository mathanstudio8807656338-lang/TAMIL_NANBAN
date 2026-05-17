// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase Config (நீங்கள் copy செய்தது)
const firebaseConfig = {
  apiKey: "AIzaSyAE3Ks7tQMThXIeY9AQclSF7aTdITHvm7k",
  authDomain: "tamil-nanban.firebaseapp.com",
  projectId: "tamil-nanban",
  storageBucket: "tamil-nanban.firebasestorage.app",
  messagingSenderId: "929268992673",
  appId: "1:929268992673:web:fafdd77280e5e10aa1fee0",
  measurementId: "G-L17B72Y9W5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };