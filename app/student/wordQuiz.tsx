import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';

const { width, height } = Dimensions.get('window');

type QuizQuestion = {
  word: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
};

type Quiz = {
  id: string;
  bookTitle: string;
  numberOfQuestions: number;
  questions: QuizQuestion[];
};

const WordQuiz = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bookTitle = params.bookTitle as string;
  const questionIndex = parseInt(params.questionIndex as string);
  const oralPoints = parseInt(params.oralPoints as string);
  const totalQuestions = parseInt(params.totalQuestions as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizPoints, setQuizPoints] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, where('bookTitle', '==', bookTitle));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('No Quiz', 'No quiz available for this book.');
        router.back();
        return;
      }

      const quizData = querySnapshot.docs[0];
      const data = quizData.data();
      
      setQuiz({
        id: quizData.id,
        bookTitle: data.bookTitle || '',
        numberOfQuestions: data.numberOfQuestions || 0,
        questions: data.questions || [],
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (isAnswered) return;

    setSelectedChoice(choice);
    setIsAnswered(true);

    // Check if answer is correct
    if (quiz && choice === quiz.questions[questionIndex].correctAnswer) {
      setQuizPoints(prev => prev + 10);
    }
  };

  const handleNext = () => {
    if (!quiz) return;

    const nextQuestionIndex = questionIndex + 1;

    // Check if there are more questions
    if (nextQuestionIndex < quiz.numberOfQuestions) {
      // Go to next studentQuiz screen
      router.push({
        pathname: './studentQuiz',
        params: {
          bookTitle: bookTitle,
          currentQuestionIndex: nextQuestionIndex.toString(),
          oralPoints: oralPoints.toString(),
          quizPoints: quizPoints.toString(),
        },
      });
    } else {
      // Quiz completed - go to rewards page
      router.push({
        pathname: './quizRewards',
        params: {
          bookTitle: bookTitle,
          oralPoints: oralPoints.toString(),
          quizPoints: quizPoints.toString(),
          totalQuestions: totalQuestions.toString(),
        },
      });
    }
  };

  const getChoiceIcon = (choice: string) => {
    if (!isAnswered) {
      return 'checkbox-blank-circle-outline';
    }

    const correctAnswer = quiz?.questions[questionIndex].correctAnswer;
    
    if (choice === selectedChoice) {
      if (choice === correctAnswer) {
        return 'check-circle-outline';
      } else {
        return 'alpha-x-circle-outline';
      }
    } else if (choice === correctAnswer) {
      return 'check-circle-outline';
    }

    return 'checkbox-blank-circle-outline';
  };

  const getChoiceColor = (choice: string) => {
    if (!isAnswered) {
      return '#FFFFFF';
    }

    const correctAnswer = quiz?.questions[questionIndex].correctAnswer;

    if (choice === correctAnswer) {
      return '#4CAF50'; // Green for correct
    } else if (choice === selectedChoice) {
      return '#F44336'; // Red for wrong selection
    }

    return '#FFFFFF';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#0d4949', '#315e35']}
        locations={[0.1538, 0.5913]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#94D231" />
          <Text style={styles.loadingText}>Loading Quiz...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[questionIndex];
  const progress = (questionIndex + 1) / quiz.numberOfQuestions;

  return (
    <LinearGradient
      colors={['#0d4949', '#315e35']}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons name="arrow-left" size={width * 0.075} color="#ffffff" />
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {questionIndex + 1}/{quiz.numberOfQuestions}
        </Text>
      </View>

      {/* Instruction Text */}
      <Text style={styles.instructionText}>Choose the correct meaning of this word</Text>

      {/* Word Display */}
      <Text style={styles.wordDisplay}>{currentQuestion.word}</Text>

      {/* Choice A */}
      <TouchableOpacity
        style={[
          styles.choiceBox,
          styles.choiceA,
          { borderColor: getChoiceColor('A') }
        ]}
        onPress={() => handleChoiceSelect('A')}
        disabled={isAnswered}
      >
        <Text style={[styles.choiceText, { color: getChoiceColor('A') }]}>
          {currentQuestion.choices.A}
        </Text>
        <MaterialCommunityIcons
          name={getChoiceIcon('A')}
          size={width * 0.065}
          color={getChoiceColor('A')}
          style={styles.choiceIcon}
        />
      </TouchableOpacity>

      {/* Choice B */}
      <TouchableOpacity
        style={[
          styles.choiceBox,
          styles.choiceB,
          { borderColor: getChoiceColor('B') }
        ]}
        onPress={() => handleChoiceSelect('B')}
        disabled={isAnswered}
      >
        <Text style={[styles.choiceText, { color: getChoiceColor('B') }]}>
          {currentQuestion.choices.B}
        </Text>
        <MaterialCommunityIcons
          name={getChoiceIcon('B')}
          size={width * 0.065}
          color={getChoiceColor('B')}
          style={styles.choiceIcon}
        />
      </TouchableOpacity>

      {/* Choice C */}
      <TouchableOpacity
        style={[
          styles.choiceBox,
          styles.choiceC,
          { borderColor: getChoiceColor('C') }
        ]}
        onPress={() => handleChoiceSelect('C')}
        disabled={isAnswered}
      >
        <Text style={[styles.choiceText, { color: getChoiceColor('C') }]}>
          {currentQuestion.choices.C}
        </Text>
        <MaterialCommunityIcons
          name={getChoiceIcon('C')}
          size={width * 0.065}
          color={getChoiceColor('C')}
          style={styles.choiceIcon}
        />
      </TouchableOpacity>

      {/* Next Button */}
      {isAnswered && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    marginTop: height * 0.01,
    fontFamily: 'Poppins',
  },
  backButton: {
    position: 'absolute',
    top: height * 0.057,
    left: width * 0.053,
    zIndex: 10,
    padding: width * 0.02,
    transform: [{ rotate: '90.36deg' }],
  },
  progressContainer: {
    position: 'absolute',
    top: height * 0.128,
    left: width * 0.158,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: width * 0.625,
    height: height * 0.03,
    backgroundColor: '#606261',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#94D231',
    borderRadius: 100,
  },
  progressText: {
    marginLeft: width * 0.028,
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontFamily: 'Poppins',
    fontWeight: '500',
    lineHeight: width * 0.05,
  },
  instructionText: {
    position: 'absolute',
    top: height * 0.226,
    left: width * 0.09,
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontFamily: 'Poppins',
    fontWeight: '500',
    lineHeight: width * 0.05,
  },
  wordDisplay: {
    position: 'absolute',
    top: height * 0.338,
    left: width * 0.338,
    color: '#FFFFFF',
    fontSize: width * 0.08,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: width * 0.08,
  },
  choiceBox: {
    position: 'absolute',
    left: width * 0.09,
    width: width * 0.795,
    height: height * 0.096,
    backgroundColor: '#94D2311C',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.048,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  choiceA: {
    top: height * 0.429,
  },
  choiceB: {
    top: height * 0.546,
  },
  choiceC: {
    top: height * 0.663,
  },
  choiceText: {
    flex: 1,
    fontSize: width * 0.04,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: width * 0.04,
  },
  choiceIcon: {
    marginLeft: width * 0.025,
  },
  nextButton: {
    position: 'absolute',
    top: height * 0.938,
    left: width * 0.07,
    width: width * 0.865,
    height: height * 0.062,
    backgroundColor: '#94D231',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: '#28242C',
    fontSize: width * 0.045,
    fontFamily: 'Poppins',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: width * 0.045,
  },
});

export default WordQuiz;