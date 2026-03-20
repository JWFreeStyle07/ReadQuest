import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { getCurrentUserId } from '../../firebase/authService';
import { db } from '../../firebase/firebaseConfig';

const { width, height } = Dimensions.get('window');

interface Question {
  word: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: 'A' | 'B' | 'C';
}

export default function QuestionMaker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const numberOfQuestions = parseInt(params.numberOfQuestions as string) || 0;
  const bookId = params.bookId as string;
  const bookTitle = params.bookTitle as string;
  const bookPassage = params.bookPassage as string;

  const [questions, setQuestions] = useState<Question[]>(
    Array(numberOfQuestions).fill(null).map(() => ({
      word: '',
      choices: { A: '', B: '', C: '' },
      correctAnswer: 'A' as 'A' | 'B' | 'C',
    }))
  );
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  const showSuccessAnimation = (callback: () => void) => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(callback, 1000);
      });
    });
  };

  const isWordInPassage = (word: string): boolean => {
    if (!bookPassage || !word) return false;
    const normalizedPassage = bookPassage.toLowerCase();
    const normalizedWord = word.toLowerCase();
    return normalizedPassage.includes(normalizedWord);
  };

  const isValidWord = (word: string): boolean => {
    if (!word) return false;
    const wordArray = word.trim().split(/\s+/);
    if (wordArray.length > 1) return false;
    const validPattern = /^[a-zA-Z-]+$/;
    return validPattern.test(word);
  };

  const updateQuestion = (
    index: number,
    field: keyof Question | string,
    value: any
  ) => {
    const newQuestions = [...questions];
    if (field === 'word') {
      newQuestions[index].word = value.toUpperCase();
    } else if (field.startsWith('choice')) {
      const choice = field.split('-')[1] as 'A' | 'B' | 'C';
      newQuestions[index].choices[choice] = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
    }
    setQuestions(newQuestions);
  };

  const getWordInputBorderColor = (word: string): string => {
    if (!word) return '#000';
    if (!isValidWord(word) || !isWordInPassage(word)) return '#FF0000';
    return '#000';
  };

  const handleSubmit = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      if (!q.word) {
        Alert.alert('Error', `Question ${i + 1}: Word is required`);
        return;
      }
      
      if (!isValidWord(q.word)) {
        Alert.alert('Error', `Question ${i + 1}: Invalid word format. Use only letters and hyphens for compound words.`);
        return;
      }
      
      if (!isWordInPassage(q.word)) {
        Alert.alert('Error', `Question ${i + 1}: The word "${q.word}" is not found in the selected book passage.`);
        return;
      }
      
      if (!q.choices.A || !q.choices.B || !q.choices.C) {
        Alert.alert('Error', `Question ${i + 1}: All choices (A, B, C) must be filled`);
        return;
      }
      
      if (q.choices.A.trim() === '' || q.choices.B.trim() === '' || q.choices.C.trim() === '') {
        Alert.alert('Error', `Question ${i + 1}: All definitions must contain text, not just spaces`);
        return;
      }
    }

    try {
      const teacherId = getCurrentUserId();
      if (!teacherId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const quizData = {
        bookId,
        bookTitle,
        numberOfQuestions,
        questions: questions.map(q => ({
          word: q.word,
          choices: q.choices,
          correctAnswer: q.correctAnswer,
        })),
        createdBy: teacherId,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'quizzes'), quizData);
      
      // Show success animation
      showSuccessAnimation(() => {
        router.back();
      });

    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', 'Failed to save quiz. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Success Animation Overlay */}
          {showSuccess && (
            <View style={styles.successOverlay}>
              <Animated.View
                style={[
                  styles.successCircle,
                  {
                    transform: [{ scale: successScale }],
                    opacity: successOpacity,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.checkmarkContainer,
                    {
                      transform: [{ scale: checkmarkScale }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={width * 0.2}
                    color="#ffffff"
                  />
                </Animated.View>
              </Animated.View>
              <Animated.Text
                style={[
                  styles.successText,
                  {
                    opacity: successOpacity,
                  },
                ]}
              >
                Quiz Added Successfully!
              </Animated.Text>
            </View>
          )}

          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={32}
                  color="#000"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Start typing the word{'\n'}and its definition
              </Text>
            </View>

            {/* Questions */}
            {questions.map((question, index) => (
              <View key={index} style={styles.questionContainer}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                
                {/* Word Input */}
                <TextInput
                  style={[
                    styles.wordInput,
                    { borderColor: getWordInputBorderColor(question.word) },
                  ]}
                  placeholder="Type a single word from the passage"
                  placeholderTextColor="#999"
                  value={question.word}
                  onChangeText={(text) => updateQuestion(index, 'word', text)}
                  autoCapitalize="characters"
                />

                {/* Choice A */}
                <View
                  style={[
                    styles.choiceContainer,
                    question.correctAnswer === 'A' && styles.selectedChoice,
                  ]}
                >
                  <Text style={styles.choiceLabel}>A.</Text>
                  <TextInput
                    style={styles.choiceInput}
                    placeholder="Type definition"
                    placeholderTextColor="#999"
                    value={question.choices.A}
                    onChangeText={(text) =>
                      updateQuestion(index, 'choice-A', text)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => updateQuestion(index, 'correctAnswer', 'A')}
                  >
                    <MaterialCommunityIcons
                      name={
                        question.correctAnswer === 'A'
                          ? 'check-circle-outline'
                          : 'checkbox-blank-circle-outline'
                      }
                      size={width * 0.073}
                      color={question.correctAnswer === 'A' ? '#00FF00' : '#000'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Choice B */}
                <View
                  style={[
                    styles.choiceContainer,
                    question.correctAnswer === 'B' && styles.selectedChoice,
                  ]}
                >
                  <Text style={styles.choiceLabel}>B.</Text>
                  <TextInput
                    style={styles.choiceInput}
                    placeholder="Type definition"
                    placeholderTextColor="#999"
                    value={question.choices.B}
                    onChangeText={(text) =>
                      updateQuestion(index, 'choice-B', text)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => updateQuestion(index, 'correctAnswer', 'B')}
                  >
                    <MaterialCommunityIcons
                      name={
                        question.correctAnswer === 'B'
                          ? 'check-circle-outline'
                          : 'checkbox-blank-circle-outline'
                      }
                      size={width * 0.073}
                      color={question.correctAnswer === 'B' ? '#00FF00' : '#000'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Choice C */}
                <View
                  style={[
                    styles.choiceContainer,
                    question.correctAnswer === 'C' && styles.selectedChoice,
                  ]}
                >
                  <Text style={styles.choiceLabel}>C.</Text>
                  <TextInput
                    style={styles.choiceInput}
                    placeholder="Type definition"
                    placeholderTextColor="#999"
                    value={question.choices.C}
                    onChangeText={(text) =>
                      updateQuestion(index, 'choice-C', text)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => updateQuestion(index, 'correctAnswer', 'C')}
                  >
                    <MaterialCommunityIcons
                      name={
                        question.correctAnswer === 'C'
                          ? 'check-circle-outline'
                          : 'checkbox-blank-circle-outline'
                      }
                      size={width * 0.073}
                      color={question.correctAnswer === 'C' ? '#00FF00' : '#000'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={showSuccess}
            >
              <Text style={styles.submitButtonText}>SUBMIT QUIZ QUESTIONS</Text>
            </TouchableOpacity>

            {/* Extra padding at bottom for keyboard */}
            <View style={{ height: height * 0.3 }} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: height * 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.11,
    marginBottom: height * 0.04,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 48,
  },
  headerTitle: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
  },
  questionContainer: {
    marginBottom: height * 0.03,
  },
  questionNumber: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: width * 0.045,
    color: '#000',
    marginLeft: width * 0.075,
    marginBottom: height * 0.015,
  },
  wordInput: {
    width: width * 0.853,
    height: height * 0.079,
    marginHorizontal: width * 0.075,
    marginBottom: height * 0.02,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: width * 0.04,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: width * 0.05,
    textAlign: 'center',
    color: '#000',
  },
  choiceContainer: {
    width: width * 0.853,
    height: height * 0.079,
    marginHorizontal: width * 0.075,
    marginBottom: height * 0.015,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.06,
  },
  selectedChoice: {
    borderColor: '#00FF00',
    borderWidth: 2,
  },
  choiceLabel: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: width * 0.05,
    color: '#000',
    marginRight: width * 0.03,
  },
  choiceInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontSize: width * 0.04,
    color: '#000',
  },
  submitButton: {
    width: width * 0.853,
    height: height * 0.065,
    marginTop: height * 0.03,
    marginHorizontal: width * 0.075,
    borderRadius: 10,
    backgroundColor: '#94D231',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  submitButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: width * 0.053,
    color: '#FFF',
    textAlign: 'center',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: '#94D231',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    marginTop: height * 0.03,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: width * 0.05,
    color: '#FFF',
    textAlign: 'center',
  },
});