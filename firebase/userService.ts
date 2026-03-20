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
  readerLevel: string,
  accuracyScore: number,
  fluencyScore: number,
  completenessScore: number,
  miscues: number
) {
  const userRef = doc(db, "users", uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        [`storyScores.${storyTitle}`]: {
          pronunciationScore,
          accuracyScore,
          fluencyScore,
          completenessScore,
          miscues,
          readerLevel,
          timestamp: new Date().toISOString(),
        },
        readerType: readerLevel,
        scores: arrayUnion(pronunciationScore),
      });
    } else {
      await setDoc(userRef, {
        storyScores: {
          [storyTitle]: {
            pronunciationScore,
            accuracyScore,
            fluencyScore,
            completenessScore,
            miscues,
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

// Add this function to authService.ts
export async function setUserType(uid: string, userType: 'student' | 'teacher') {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    userType,
    createdAt: new Date().toISOString(),
  }, { merge: true });
}

// Add this new function after saveStoryPronunciationResult
export async function updateStoryQuizResult(
  uid: string,
  storyTitle: string,
  quizPercent: number,
  incorrect: number
) {
  const userRef = doc(db, "users", uid);
  
  try {
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const existingStoryData = userData.storyScores?.[storyTitle] || {};
      
      // Merge quiz data with existing pronunciation data
      await updateDoc(userRef, {
        [`storyScores.${storyTitle}`]: {
          ...existingStoryData,
          quizPercent,
          incorrect,
          quizCompletedAt: new Date().toISOString(),
        },
      });
    }
    
    console.log('✅ Quiz result saved successfully to Firebase');
  } catch (error) {
    console.error('❌ Error saving quiz result to Firebase:', error);
    throw error;
  }
}
