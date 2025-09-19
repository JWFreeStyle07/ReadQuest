// authService.ts
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

// Sign Up and store user profile
export async function signUp(email: string, password: string, name: string, grade: string) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);

  // Save profile in Firestore
  await setDoc(doc(db, "users", userCred.user.uid), {
    name,
    grade,
    email,
    scores: [],
    readerType: "Beginner",
  });

  return userCred.user;
}

// Login
export async function login(email: string, password: string) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// Logout
export async function logout() {
  return await signOut(auth);
}

// Get User Profile
export async function getUserProfile(uid: string) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    throw new Error("No such user profile!");
  }
}
