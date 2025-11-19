// // firebase/userService.ts
// import { arrayUnion, doc, updateDoc } from "firebase/firestore";
// import { db } from "./firebaseConfig";

// export async function saveUserResult(uid: string, score: number, readerType: string) {
//   const userRef = doc(db, "users", uid);

//   await updateDoc(userRef, {
//     scores: arrayUnion(score),
//     readerType,
//   });
// }

import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function saveUserResult(uid: string, score: number, readerType: string) {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    scores: arrayUnion(score),
    readerType,
  });
}

// Save story-specific pronunciation results
export async function saveStoryPronunciationResult(
  uid: string,
  storyTitle: string,
  pronunciationScore: number,
  readerLevel: string
) {
  const userRef = doc(db, "users", uid);
  
  try {
    // Get current user data
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Update with story-specific scores
      await updateDoc(userRef, {
        [`storyScores.${storyTitle}`]: {
          pronunciationScore,
          readerLevel,
          timestamp: new Date().toISOString(),
        },
        // Also update the general readerType field
        readerType: readerLevel,
        // Add to scores array
        scores: arrayUnion(pronunciationScore),
      });
    } else {
      // Create new document if it doesn't exist
      await setDoc(userRef, {
        storyScores: {
          [storyTitle]: {
            pronunciationScore,
            readerLevel,
            timestamp: new Date().toISOString(),
          },
        },
        readerType: readerLevel,
        scores: [pronunciationScore],
      }, { merge: true });
    }
    
    console.log('✅ Story result saved successfully to Firebase');
  } catch (error) {
    console.error('❌ Error saving story result to Firebase:', error);
    throw error;
  }
}

// Get story-specific pronunciation result
export async function getStoryPronunciationResult(uid: string, storyTitle: string) {
  const userRef = doc(db, "users", uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.storyScores?.[storyTitle] || null;
    }
    return null;
  } catch (error) {
    console.error('❌ Error getting story result from Firebase:', error);
    throw error;
  }
}
