import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDE4Qnu_ki5QlGyScePySmFtfE_zAyHk3Q",
  authDomain: "readquest-1801e.firebaseapp.com",
  projectId: "readquest-1801e",
  storageBucket: "readquest-1801e.firebasestorage.app",
  messagingSenderId: "88958724983",
  appId: "1:88958724983:web:1b1562da118b83bf0b4f72",
  measurementId: "G-706TVTD0B5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };

