import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

interface QuizQuestion {
  word: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: 'A' | 'B' | 'C';
}

interface Quiz {
  id: string;
  bookId: string;
  bookTitle: string;
  numberOfQuestions: number;
  questions: QuizQuestion[];
  createdBy: string;
  createdAt: string;
}

interface QuizResult {
  id?: string;
  quizId: string;
  studentId: string;
  bookTitle: string;
  totalOralPoints: number;
  totalQuizPoints: number;
  questionsResults: {
    word: string;
    oralPoint: number;
    pronunciationAccuracy: number;
    readerLevel: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    quizPoint: number;
  }[];
  completedAt: string;
}

// Create a new quiz
export async function createQuiz(
  bookId: string,
  bookTitle: string,
  numberOfQuestions: number,
  questions: QuizQuestion[],
  teacherId: string
) {
  try {
    const quizData = {
      bookId,
      bookTitle,
      numberOfQuestions,
      questions,
      createdBy: teacherId,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'quizzes'), quizData);
    console.log('Quiz created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

// Get all quizzes
export async function getAllQuizzes(): Promise<Quiz[]> {
  try {
    const quizzesCollection = collection(db, 'quizzes');
    const quizzesSnapshot = await getDocs(quizzesCollection);
    
    const quizzes = quizzesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Quiz));
    
    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

// Get quizzes by book ID
export async function getQuizzesByBook(bookId: string): Promise<Quiz[]> {
  try {
    const quizzesCollection = collection(db, 'quizzes');
    const q = query(quizzesCollection, where('bookId', '==', bookId));
    const quizzesSnapshot = await getDocs(q);
    
    const quizzes = quizzesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Quiz));
    
    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes by book:', error);
    throw error;
  }
}

// Get a specific quiz by ID
export async function getQuizById(quizId: string): Promise<Quiz | null> {
  try {
    const quizRef = doc(db, 'quizzes', quizId);
    const quizSnap = await getDoc(quizRef);
    
    if (quizSnap.exists()) {
      return {
        id: quizSnap.id,
        ...quizSnap.data(),
      } as Quiz;
    }
    return null;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
}

// Save quiz result for a student
export async function saveQuizResult(
  quizId: string,
  studentId: string,
  bookTitle: string,
  totalOralPoints: number,
  totalQuizPoints: number,
  questionsResults: QuizResult['questionsResults']
) {
  try {
    const resultData = {
      quizId,
      studentId,
      bookTitle,
      totalOralPoints,
      totalQuizPoints,
      questionsResults,
      completedAt: new Date().toISOString(),
    };

    // Save to quiz results collection
    const docRef = await addDoc(collection(db, 'quizResults'), resultData);

    // Also update the student's user document
    const userRef = doc(db, 'users', studentId);
    await updateDoc(userRef, {
      [`quizScores.${bookTitle}`]: {
        totalOralPoints,
        totalQuizPoints,
        completedAt: resultData.completedAt,
      },
      // Add to general scores array
      scores: arrayUnion(totalOralPoints + totalQuizPoints),
    });

    console.log('Quiz result saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw error;
  }
}

// Get quiz results for a student
export async function getStudentQuizResults(
  studentId: string
): Promise<QuizResult[]> {
  try {
    const resultsCollection = collection(db, 'quizResults');
    const q = query(resultsCollection, where('studentId', '==', studentId));
    const resultsSnapshot = await getDocs(q);
    
    const results = resultsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as QuizResult));
    
    return results;
  } catch (error) {
    console.error('Error fetching student quiz results:', error);
    throw error;
  }
}

// Get all quiz results for a specific quiz
export async function getQuizResults(quizId: string): Promise<QuizResult[]> {
  try {
    const resultsCollection = collection(db, 'quizResults');
    const q = query(resultsCollection, where('quizId', '==', quizId));
    const resultsSnapshot = await getDocs(q);
    
    const results = resultsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as QuizResult));
    
    return results;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
}