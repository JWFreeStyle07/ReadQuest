// // firebaseConfig.ts
// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDE4Qnu_ki5QlGyScePySmFtfE_zAyHk3Q",
//   authDomain: "readquest-1801e.firebaseapp.com",
//   projectId: "readquest-1801e",
//   storageBucket: "readquest-1801e.firebasestorage.app",
//   messagingSenderId: "88958724983",
//   appId: "1:88958724983:web:1b1562da118b83bf0b4f72",
//   measurementId: "G-706TVTD0B5"
// };

// const app = initializeApp(firebaseConfig);

// //const analytics = getAnalytics(app);

// export const auth = getAuth(app);
// export const db = getFirestore(app);

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { initializeApp } from "firebase/app";
// import { getReactNativePersistence, initializeAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDOz_HE_C-Cd4Ww-P56ZaEsrKxcKGGWMl0",
//   authDomain: "readquest-87606.firebaseapp.com",
//   projectId: "readquest-87606",
//   storageBucket: "readquest-87606.firebasestorage.app",
//   messagingSenderId: "244763587086",
//   appId: "1:244763587086:web:f3cb8cde9a1c1df4f3cbb5",
//   measurementId: "G-FXXVS9ZRXZ",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Auth with AsyncStorage persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// // Initialize Firestore
// const db = getFirestore(app);

// export { auth, db };

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getReactNativePersistence, initializeAuth } from "firebase/auth/react-native";

// const firebaseConfig = {
//   apiKey: "AIzaSyDOz_HE_C-Cd4Ww-P56ZaEsrKxcKGGWMl0",
//   authDomain: "readquest-87606.firebaseapp.com",
//   projectId: "readquest-87606",
//   storageBucket: "readquest-87606.firebasestorage.app",
//   messagingSenderId: "244763587086",
//   appId: "1:244763587086:web:f3cb8cde9a1c1df4f3cbb5",
//   measurementId: "G-FXXVS9ZRXZ",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Auth with AsyncStorage persistence
// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// // Initialize Firestore
// const db = getFirestore(app);

// export { auth, db };

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyDOz_HE_C-Cd4Ww-P56ZaEsrKxcKGGWMl0",
//   authDomain: "readquest-87606.firebaseapp.com",
//   projectId: "readquest-87606",
//   storageBucket: "readquest-87606.firebasestorage.app",
//   messagingSenderId: "244763587086",
//   appId: "1:244763587086:web:f3cb8cde9a1c1df4f3cbb5",
//   measurementId: "G-FXXVS9ZRXZ",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Initialize Auth
// const auth = getAuth(app);

// // Initialize Firestore
// const db = getFirestore(app);

// export { auth, db };
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
