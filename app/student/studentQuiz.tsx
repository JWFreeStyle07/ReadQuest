// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { decode as atob, encode as btoa } from 'base-64';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system/legacy';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { db } from '../../firebase/firebaseConfig';

// const { width, height } = Dimensions.get('window');

// type QuizQuestion = {
//   word: string;
//   choices: string[];
//   correctAnswer: string;
// };

// type Quiz = {
//   id: string;
//   bookTitle: string;
//   numberOfQuestions: number;
//   questions: QuizQuestion[];
// };

// const StudentQuiz = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const bookTitle = params.bookTitle as string;
//   const initialQuestionIndex = params.currentQuestionIndex 
//   ? parseInt(params.currentQuestionIndex as string) 
//   : 0;

//   const [quiz, setQuiz] = useState<Quiz | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
//   const initialOralPoints = params.oralPoints 
//   ? parseInt(params.oralPoints as string) 
//   : 0;
//   const initialQuizPoints = params.quizPoints 
//   ? parseInt(params.quizPoints as string) 
//   : 0;
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [audioUri, setAudioUri] = useState<string | null>(null);
//   const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
//   const [readerLevel, setReaderLevel] = useState<string>('');
//   const [oralPoints, setOralPoints] = useState(initialOralPoints);
//   const [permissionResponse, requestPermission] = Audio.usePermissions();

//   // Azure Speech Service Configuration
//   const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
//   const AZURE_REGION = 'eastus';
//   const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

//   useEffect(() => {
//     fetchQuiz();
//     if (permissionResponse?.status !== 'granted') {
//       requestPermission();
//     }
//   }, []);

//   const fetchQuiz = async () => {
//     try {
//       setLoading(true);
//       const quizzesRef = collection(db, 'quizzes');
//       const q = query(quizzesRef, where('bookTitle', '==', bookTitle));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         Alert.alert('No Quiz', 'No quiz available for this book yet.');
//         router.back();
//         return;
//       }

//       const quizData = querySnapshot.docs[0];
//       const data = quizData.data();
      
//       setQuiz({
//         id: quizData.id,
//         bookTitle: data.bookTitle || '',
//         numberOfQuestions: data.numberOfQuestions || 0,
//         questions: data.questions || [],
//       });

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching quiz:', error);
//       Alert.alert('Error', 'Failed to load quiz');
//       setLoading(false);
//     }
//   };

//   const recordingOptions = {
//     android: {
//       extension: '.m4a',
//       outputFormat: Audio.AndroidOutputFormat.MPEG_4,
//       audioEncoder: Audio.AndroidAudioEncoder.AAC,
//       sampleRate: 16000,
//       numberOfChannels: 1,
//       bitRate: 128000,
//     },
//     ios: {
//       extension: '.m4a',
//       outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
//       audioQuality: Audio.IOSAudioQuality.HIGH,
//       sampleRate: 16000,
//       numberOfChannels: 1,
//       bitRate: 128000,
//     },
//     web: {
//       mimeType: 'audio/webm',
//       bitsPerSecond: 128000,
//     },
//   };

//   const startRecording = async () => {
//     try {
//       if (!permissionResponse?.granted) {
//         const res = await requestPermission();
//         if (!res?.granted) {
//           Alert.alert('Permission Required', 'Please grant microphone permission');
//           return;
//         }
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
//       setRecording(newRecording);
//       setIsRecording(true);
//       console.log('Recording started');
//     } catch (error: any) {
//       console.error('Failed to start recording:', error);
//       Alert.alert('Error', 'Failed to start recording: ' + error.message);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       if (!recording) return;

//       console.log('Stopping recording...');
//       setIsRecording(false);
//       await recording.stopAndUnloadAsync();
      
//       const uri = recording.getURI();
//       setAudioUri(uri ?? null);
//       setRecording(null);
      
//       console.log('Recording stopped and stored at', uri);
      
//       // Automatically analyze after recording
//       if (uri) {
//         analyzePronunciation(uri);
//       }
//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : String(error);
//       console.error('Failed to stop recording:', message);
//       Alert.alert('Error', 'Failed to stop recording: ' + message);
//     }
//   };

//   const toggleRecording = () => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   const convertAudioToBase64 = async (uri: string): Promise<string> => {
//     try {
//       const base64 = await FileSystem.readAsStringAsync(uri, {
//         encoding: 'base64',
//       });
//       return base64;
//     } catch (error: unknown) {
//       console.error('Error converting audio to base64:', error);
//       throw error;
//     }
//   };

//   const analyzePronunciation = async (uri: string) => {
//     if (!quiz) return;

//     const currentWord = quiz.questions[currentQuestionIndex].word;

//     setIsAnalyzing(true);

//     try {
//       const audioBase64 = await convertAudioToBase64(uri);
      
//       const binaryString = atob(audioBase64);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       const pronunciationConfig = {
//         ReferenceText: currentWord,
//         GradingSystem: 'HundredMark',
//         Granularity: 'Phoneme',
//         Dimension: 'Comprehensive',
//         EnableMiscue: false,
//       };

//       const headers = {
//         'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
//         'Content-Type': 'audio/mp4',
//         'Accept': 'application/json',
//         'Pronunciation-Assessment': btoa(JSON.stringify(pronunciationConfig)),
//       };

//       const url = `${AZURE_ENDPOINT}?language=en-US&format=detailed`;

//       const response = await fetch(url, {
//         method: 'POST',
//         headers,
//         body: bytes as any,
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API Error ${response.status}: ${errorText}`);
//       }

//       const result = await response.json();
//       console.log('Azure Response:', JSON.stringify(result, null, 2));

//       processResult(result);
//     } catch (error) {
//       console.error('Error analyzing pronunciation:', error);
//       Alert.alert('Error', 'Failed to analyze pronunciation. Please try again.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   const processResult = (result: any) => {
//     if (result.NBest && result.NBest.length > 0) {
//       const bestResult = result.NBest[0];

//       const boostFactor = 1.08;
//       const minBoost = 5;

//       const adjustScore = (score: number) => {
//         const boosted = Math.round(score * boostFactor);
//         const withMinBoost = Math.round(score + minBoost);
//         return Math.min(100, Math.max(boosted, withMinBoost));
//       };

//       const accuracy = adjustScore(bestResult.AccuracyScore || 0);
//       const pronScore = adjustScore(bestResult.PronScore || 0);

//       setAccuracyScore(accuracy);

//       const level = determineReaderLevel(pronScore);
//       setReaderLevel(level);

//       // Award oral points based on level
//       let points = 0;
//       if (level === 'Proficient Reader') points = 15;
//       else if (level === 'Emerging Reader') points = 10;
//       else if (level === 'Beginner Reader') points = 5;

//       setOralPoints(prev => prev + points);
//     }
//   };

//   const determineReaderLevel = (score: number): string => {
//     if (score >= 50) return 'Proficient Reader';
//     else if (score >= 25) return 'Emerging Reader';
//     else return 'Beginner Reader';
//   };

//   const handleNext = () => {
//     if (!quiz) return;

//     // Navigate to word definition quiz
//     router.push({
//       pathname: './wordQuiz',
//       params: {
//         bookTitle: bookTitle,
//         questionIndex: currentQuestionIndex.toString(),
//         oralPoints: oralPoints.toString(),
//         totalQuestions: quiz.numberOfQuestions.toString(),
//       },
//     });
//   };

//   if (loading) {
//     return (
//       <LinearGradient
//         colors={['#0d4949', '#315e35']}
//         locations={[0.1538, 0.5913]}
//         style={styles.container}
//       >
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#94D231" />
//           <Text style={styles.loadingText}>Loading Quiz...</Text>
//         </View>
//       </LinearGradient>
//     );
//   }

//   if (!quiz) {
//     return null;
//   }

//   const currentQuestion = quiz.questions[currentQuestionIndex];
//   const progress = currentQuestionIndex / quiz.numberOfQuestions;

//   return (
//     <LinearGradient
//       colors={['#0d4949', '#315e35']}
//       locations={[0.1538, 0.5913]}
//       style={styles.container}
//     >
//       {/* Back Button */}
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <MaterialCommunityIcons name="arrow-left" size={30} color="#ffffff" />
//       </TouchableOpacity>

//       {/* Progress Indicator */}
//       <View style={styles.progressContainer}>
//         <View style={styles.progressBarBackground}>
//           <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
//         </View>
//         <Text style={styles.progressText}>
//           {currentQuestionIndex + 1}/{quiz.numberOfQuestions}
//         </Text>
//       </View>

//       {/* Instruction Text */}
//       <Text style={styles.instructionText}>Read the word aloud</Text>

//       {/* Bird Image and Word Box */}
//       <View style={styles.contentContainer}>
//         <Image
//           source={require('../../assets/images/quiz/birdHi.png')}
//           style={styles.birdImage}
//           resizeMode="contain"
//         />
        
//         <View style={styles.wordBox}>
//           <MaterialCommunityIcons name="volume-high" size={20} color="#94D231" />
//           <Text style={styles.wordText}>{currentQuestion.word}</Text>
//         </View>
//       </View>

//       {/* Recording Button */}
//       <TouchableOpacity
//         style={styles.recordButton}
//         onPress={toggleRecording}
//         disabled={isAnalyzing}
//       >
//         <MaterialCommunityIcons
//           name={isRecording ? 'microphone' : 'microphone-off'}
//           size={27}
//           color="#94D231"
//         />
//         <Image
//           source={require('../../assets/images/quiz/audioWave.png')}
//           style={styles.audioWave}
//           resizeMode="contain"
//         />
//       </TouchableOpacity>

//       {/* Results Display */}
//       {accuracyScore !== null && !isAnalyzing && (
//         <View style={styles.resultsContainer}>
//           <View style={styles.resultItem}>
//             <Text style={styles.resultLabel}>Accuracy</Text>
//             <Text style={[styles.resultValue, { color: getScoreColor(accuracyScore) }]}>
//               {accuracyScore}%
//             </Text>
//           </View>
//           <View style={styles.resultItem}>
//             <Text style={styles.resultLabel}>Level</Text>
//             <Text style={[styles.resultValue, { color: getLevelColor(readerLevel) }]}>
//               {readerLevel}
//             </Text>
//           </View>
//         </View>
//       )}

//       {/* Analyzing Indicator */}
//       {isAnalyzing && (
//         <View style={styles.analyzingContainer}>
//           <ActivityIndicator size="small" color="#94D231" />
//           <Text style={styles.analyzingText}>Analyzing...</Text>
//         </View>
//       )}

//       {/* Next Button */}
//       {accuracyScore !== null && !isAnalyzing && (
//         <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
//           <Text style={styles.nextButtonText}>NEXT</Text>
//         </TouchableOpacity>
//       )}
//     </LinearGradient>
//   );
// };

// const getScoreColor = (score: number) => {
//   if (score >= 50) return '#4CAF50';
//   if (score >= 25) return '#FF9800';
//   return '#F44336';
// };

// const getLevelColor = (level: string) => {
//   switch (level) {
//     case 'Proficient Reader':
//       return '#4CAF50';
//     case 'Emerging Reader':
//       return '#FF9800';
//     case 'Beginner Reader':
//       return '#F44336';
//     default:
//       return '#666';
//   }
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     marginTop: 10,
//     fontFamily: 'Poppins',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 46,
//     left: 21,
//     zIndex: 10,
//     padding: 8,
//   },
//   progressContainer: {
//     position: 'absolute',
//     top: 103,
//     left: 63,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   progressBarBackground: {
//     width: 250,
//     height: 24,
//     backgroundColor: '#606261',
//     borderRadius: 100,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     backgroundColor: '#94D231',
//     borderRadius: 100,
//   },
//   progressText: {
//     marginLeft: 11,
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//   },
//   instructionText: {
//     position: 'absolute',
//     top: 186,
//     left: 36,
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//   },
//   contentContainer: {
//     position: 'absolute',
//     top: 225,
//     left: 36,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   birdImage: {
//     width: 102,
//     height: 225,
//   },
//   wordBox: {
//     marginLeft: 20,
//     marginTop: 59,
//     width: 195,
//     height: 92,
//     backgroundColor: '#94D2311C',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#94D231',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   wordText: {
//     color: '#FFFFFF',
//     fontSize: 20,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     marginLeft: 10,
//   },
//   recordButton: {
//     position: 'absolute',
//     top: 450,
//     left: 48,
//     width: 302,
//     height: 77,
//     backgroundColor: '#94D2311C',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#94D231',
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingLeft: 19,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   audioWave: {
//     width: 233,
//     height: 66,
//     marginLeft: 9,
//   },
//   resultsContainer: {
//     position: 'absolute',
//     top: 580,
//     left: 48,
//     right: 48,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: '#FFFFFF20',
//     borderRadius: 10,
//     padding: 15,
//   },
//   resultItem: {
//     alignItems: 'center',
//   },
//   resultLabel: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontFamily: 'Poppins',
//     marginBottom: 5,
//   },
//   resultValue: {
//     fontSize: 20,
//     fontFamily: 'Poppins',
//     fontWeight: 'bold',
//   },
//   analyzingContainer: {
//     position: 'absolute',
//     top: 580,
//     left: 48,
//     right: 48,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF20',
//     borderRadius: 10,
//     padding: 15,
//   },
//   analyzingText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontFamily: 'Poppins',
//     marginLeft: 10,
//   },
//   nextButton: {
//     position: 'absolute',
//     top: 754,
//     left: 28,
//     width: 346,
//     height: 50,
//     backgroundColor: '#94D231',
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   nextButtonText: {
//     color: '#28242C',
//     fontSize: 18,
//     fontFamily: 'Poppins',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default StudentQuiz;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { decode as atob, encode as btoa } from 'base-64';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';

const { width, height } = Dimensions.get('window');

type QuizQuestion = {
  word: string;
  choices: string[];
  correctAnswer: string;
};

type Quiz = {
  id: string;
  bookTitle: string;
  numberOfQuestions: number;
  questions: QuizQuestion[];
};

const StudentQuiz = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookTitle = params.bookTitle as string;
  const initialQuestionIndex = params.currentQuestionIndex 
  ? parseInt(params.currentQuestionIndex as string) 
  : 0;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialQuestionIndex);
  const initialOralPoints = params.oralPoints 
  ? parseInt(params.oralPoints as string) 
  : 0;
  const initialQuizPoints = params.quizPoints 
  ? parseInt(params.quizPoints as string) 
  : 0;
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [readerLevel, setReaderLevel] = useState<string>('');
  const [oralPoints, setOralPoints] = useState(initialOralPoints);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Azure Speech Service Configuration
  const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
  const AZURE_REGION = 'eastus';
  const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

  useEffect(() => {
    fetchQuiz();
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const quizzesRef = collection(db, 'quizzes');
      const q = query(quizzesRef, where('bookTitle', '==', bookTitle));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('No Quiz', 'No quiz available for this book yet.');
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

  const recordingOptions = {
    android: {
      extension: '.m4a',
      outputFormat: Audio.AndroidOutputFormat.MPEG_4,
      audioEncoder: Audio.AndroidAudioEncoder.AAC,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  };

  const startRecording = async () => {
    try {
      if (!permissionResponse?.granted) {
        const res = await requestPermission();
        if (!res?.granted) {
          Alert.alert('Permission Required', 'Please grant microphone permission');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(newRecording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error: any) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording: ' + error.message);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      console.log('Stopping recording...');
      setIsRecording(false);
      setHasRecorded(true);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setAudioUri(uri ?? null);
      setRecording(null);
      
      console.log('Recording stopped and stored at', uri);
      
      // Automatically analyze after recording
      if (uri) {
        analyzePronunciation(uri);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to stop recording:', message);
      Alert.alert('Error', 'Failed to stop recording: ' + message);
    }
  };

  const toggleRecording = () => {
    if (hasRecorded) return; // Button is disabled after first recording
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const convertAudioToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error: unknown) {
      console.error('Error converting audio to base64:', error);
      throw error;
    }
  };

  const analyzePronunciation = async (uri: string) => {
    if (!quiz) return;

    const currentWord = quiz.questions[currentQuestionIndex].word;

    setIsAnalyzing(true);

    try {
      const audioBase64 = await convertAudioToBase64(uri);
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const pronunciationConfig = {
        ReferenceText: currentWord,
        GradingSystem: 'HundredMark',
        Granularity: 'Phoneme',
        Dimension: 'Comprehensive',
        EnableMiscue: false,
      };

      const headers = {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        'Content-Type': 'audio/mp4',
        'Accept': 'application/json',
        'Pronunciation-Assessment': btoa(JSON.stringify(pronunciationConfig)),
      };

      const url = `${AZURE_ENDPOINT}?language=en-US&format=detailed`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: bytes as any,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Azure Response:', JSON.stringify(result, null, 2));

      processResult(result);
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      Alert.alert('Error', 'Failed to analyze pronunciation. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processResult = (result: any) => {
    if (result.NBest && result.NBest.length > 0) {
      const bestResult = result.NBest[0];

      // More lenient scoring with higher boost
      const boostFactor = 1.5; // Increased from 1.08
      const minBoost = 15; // Increased from 5

      const adjustScore = (score: number) => {
        const boosted = Math.round(score * boostFactor);
        const withMinBoost = Math.round(score + minBoost);
        return Math.min(100, Math.max(boosted, withMinBoost));
      };

      const accuracy = adjustScore(bestResult.AccuracyScore || 0);
      const pronScore = adjustScore(bestResult.PronScore || 0);

      setAccuracyScore(accuracy);

      const level = determineReaderLevel(pronScore);
      setReaderLevel(level);

      // Award oral points based on level
      let points = 0;
      if (level === 'Proficient Reader') points = 15;
      else if (level === 'Emerging Reader') points = 10;
      else if (level === 'Beginner Reader') points = 5;

      setOralPoints(prev => prev + points);
    }
  };

  const determineReaderLevel = (score: number): string => {
    // More lenient thresholds
    if (score >= 40) return 'Proficient Reader'; // Changed from 50
    else if (score >= 20) return 'Emerging Reader'; // Changed from 25
    else return 'Beginner Reader';
  };

  const handleNext = () => {
    if (!quiz) return;

    // Navigate to word definition quiz
    router.push({
      pathname: './wordQuiz',
      params: {
        bookTitle: bookTitle,
        questionIndex: currentQuestionIndex.toString(),
        oralPoints: oralPoints.toString(),
        totalQuestions: quiz.numberOfQuestions.toString(),
      },
    });
  };

  const getButtonStyle = () => {
    if (hasRecorded) {
      return [styles.recordButton, styles.recordButtonDisabled];
    } else if (isRecording) {
      return [styles.recordButton, styles.recordButtonRecording];
    }
    return styles.recordButton;
  };

  const getButtonBorderColor = () => {
    if (hasRecorded) return '#808080';
    if (isRecording) return '#F4C62D';
    return '#94D231';
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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = currentQuestionIndex / quiz.numberOfQuestions;

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
          {currentQuestionIndex + 1}/{quiz.numberOfQuestions}
        </Text>
      </View>

      {/* Instruction Text */}
      <Text style={styles.instructionText}>Read the word aloud</Text>

      {/* Bird Image and Word Box */}
      <View style={styles.contentContainer}>
        <Image
          source={require('../../assets/images/quiz/birdHi.png')}
          style={styles.birdImage}
          resizeMode="contain"
        />
        
        <View style={styles.wordBox}>
          <MaterialCommunityIcons name="volume-high" size={width * 0.05} color="#94D231" />
          <Text style={styles.wordText}>{currentQuestion.word}</Text>
        </View>
      </View>

      {/* Recording Button */}
      <TouchableOpacity
        style={[getButtonStyle(), { borderColor: getButtonBorderColor() }]}
        onPress={toggleRecording}
        disabled={isAnalyzing || hasRecorded}
      >
        <MaterialCommunityIcons
          name={isRecording ? 'microphone' : 'microphone-off'}
          size={width * 0.1}
          color={hasRecorded ? '#808080' : isRecording ? '#F4C62D' : '#94D231'}
        />
        <Image
          source={require('../../assets/images/quiz/audioWave.png')}
          style={styles.audioWave}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Results Display */}
      {accuracyScore !== null && !isAnalyzing && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Accuracy</Text>
            <Text style={[styles.resultValue, { color: getScoreColor(accuracyScore) }]}>
              {accuracyScore}%
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Level</Text>
            <Text style={[styles.resultValue, { color: getLevelColor(readerLevel) }]}>
              {readerLevel}
            </Text>
          </View>
        </View>
      )}

      {/* Analyzing Indicator */}
      {isAnalyzing && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="small" color="#94D231" />
          <Text style={styles.analyzingText}>Analyzing...</Text>
        </View>
      )}

      {/* Next Button */}
      {accuracyScore !== null && !isAnalyzing && (
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 40) return '#4CAF50';
  if (score >= 20) return '#FF9800';
  return '#F44336';
};

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Proficient Reader':
      return '#4CAF50';
    case 'Emerging Reader':
      return '#FF9800';
    case 'Beginner Reader':
      return '#F44336';
    default:
      return '#666';
  }
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
  },
  progressContainer: {
    position: 'absolute',
    top: height * 0.128,
    alignSelf: 'center',
    width: width * 0.84,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBackground: {
    flex: 1,
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
  },
  instructionText: {
    position: 'absolute',
    top: height * 0.231,
    width: width * 0.9,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
  },
  contentContainer: {
    position: 'absolute',
    top: height * 0.28,
    alignSelf: 'center',
    width: width * 0.84,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  birdImage: {
    width: width * 0.255,
    height: height * 0.28,
  },
  wordBox: {
    marginTop: height * 0.073,
    width: width * 0.49,
    height: height * 0.114,
    backgroundColor: '#94D2311C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#94D231',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.038,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  wordText: {
    color: '#FFFFFF',
    fontSize: width * 0.05,
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginLeft: width * 0.025,
  },
  recordButton: {
    position: 'absolute',
    top: height * 0.559,
    alignSelf: 'center',
    width: width * 0.755,
    height: height * 0.096,
    backgroundColor: '#94D2311C',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#94D231',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: width * 0.048,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  recordButtonRecording: {
    backgroundColor: '#F4C62D1C',
    borderColor: '#F4C62D',
  },
  recordButtonDisabled: {
    backgroundColor: '#8080801C',
    borderColor: '#808080',
  },
  audioWave: {
    width: width * 0.783,
    height: height * 0.782,
    marginLeft: width * -0.1,
    marginTop: height * -0.082,
    //marginRight: width * 0.003,
  },
  resultsContainer: {
    position: 'absolute',
    top: height * 0.72,
    alignSelf: 'center',
    width: width * 0.84,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF20',
    borderRadius: 10,
    padding: width * 0.038,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultLabel: {
    color: '#FFFFFF',
    fontSize: width * 0.035,
    fontFamily: 'Poppins',
    marginBottom: height * 0.006,
  },
  resultValue: {
    fontSize: width * 0.05,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
  analyzingContainer: {
    position: 'absolute',
    top: height * 0.72,
    alignSelf: 'center',
    width: width * 0.84,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    borderRadius: 10,
    padding: width * 0.038,
  },
  analyzingText: {
    color: '#FFFFFF',
    fontSize: width * 0.04,
    fontFamily: 'Poppins',
    marginLeft: width * 0.025,
  },
  nextButton: {
    position: 'absolute',
    top: height * 0.83,
    alignSelf: 'center',
    width: width * 0.84,
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
  },
});

export default StudentQuiz;