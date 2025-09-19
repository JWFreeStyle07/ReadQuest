// firebase/userService.ts
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function saveUserResult(uid: string, score: number, readerType: string) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    scores: arrayUnion(score),
    readerType,
  });
}
