import {
  createUserWithEmailAndPassword,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export function getCurrentUserId(): string | null {
  return auth.currentUser ? auth.currentUser.uid : null;
}

// Sign Up and store user profile
export async function signUp(
  email: string, 
  password: string, 
  name: string, 
  grade: string,
  userType: 'student' | 'teacher' = 'student' // Add this parameter with default
) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  
  // Save profile in Firestore with userType
  await setDoc(doc(db, "users", userCred.user.uid), {
    name,
    grade,
    email,
    userType, // Add this field
    scores: [],
    readerType: "Beginner",
    createdAt: new Date().toISOString(),
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

// Phone Authentication - Send OTP
export async function sendPhoneOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
  try {
    const phoneProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    return verificationId;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
}

// Phone Authentication - Verify OTP and Sign In
export async function verifyPhoneOTP(verificationId: string, code: string) {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, code);
    const userCred = await signInWithCredential(auth, credential);
    return userCred.user;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
}

// Create or Update User Profile for Phone Auth
// Update this function in authService.ts
export async function createPhoneUserProfile(
  uid: string, 
  phoneNumber: string, 
  name?: string, 
  grade?: string,
  userType?: 'student' | 'teacher'
) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Create new profile
    await setDoc(userRef, {
      name: name || "",
      grade: grade || "",
      phoneNumber,
      userType: userType || "student", // Default to student if not provided
      scores: [],
      readerType: "Beginner",
      createdAt: new Date().toISOString(),
    });
  } else {
    // Update existing profile with userType if provided
    if (userType) {
      await updateDoc(userRef, {
        userType,
      });
    }
  }
}
