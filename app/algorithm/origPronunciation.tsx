////checkpoint! Highlighting works here but not in sync.
// import { Picker } from '@react-native-picker/picker';
// import { decode as atob, encode as btoa } from 'base-64';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system/legacy';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { referenceTexts } from './referenceTexts';

// type ProcessedResult = {
//   accuracyScore: number;
//   fluencyScore: number;
//   completenessScore: number;
//   pronunciationScore: number;
//   recognizedText: string;
//   words: Array<{
//     word: string;
//     accuracyScore: number;
//     errorType: string;
//     offset: number;
//     duration: number;
//     phonemes: Array<{
//       phoneme: string;
//       accuracyScore: number;
//     }>;
//   }>;
// };

// type WordHighlight = {
//   word: string;
//   index: number;
//   offset: number;
//   duration: number;
// };

// const ExpoPronunciationApp = () => {
//   const router = useRouter();
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [audioUri, setAudioUri] = useState<string | null>(null);
//   const [pronunciationResult, setPronunciationResult] = useState<ProcessedResult | null>(null);
//   const [readerLevel, setReaderLevel] = useState('');
//   const [permissionResponse, requestPermission] = Audio.usePermissions();
//   const [selectedIndex, setSelectedIndex] = useState(0);
  
//   // Playback states
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
//   const [wordsWithTimestamps, setWordsWithTimestamps] = useState<WordHighlight[]>([]);
//   const playbackIntervalRef = useRef<any>(null);
//   const playbackStartTimeRef = useRef<number>(0);

//   // Azure Speech Service Configuration
//   const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
//   const AZURE_REGION = 'eastus';
//   const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

//   const REFERENCE_TEXT = referenceTexts[selectedIndex].text;

//   useEffect(() => {
//     if (permissionResponse?.status !== 'granted') {
//       requestPermission();
//     }
    
//     // Cleanup on unmount
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//       if (playbackIntervalRef.current) {
//         clearInterval(playbackIntervalRef.current);
//       }
//     };
//   }, []);

//   // Reset when passage changes
//   useEffect(() => {
//     setAudioUri(null);
//     setPronunciationResult(null);
//     setWordsWithTimestamps([]);
//     setHighlightedWordIndex(-1);
//     if (sound) {
//       sound.unloadAsync();
//       setSound(null);
//     }
//   }, [selectedIndex]);

//   const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

//   // Start recording
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

//   // Stop recording
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
//     } catch (error: unknown) {
//       const message = error instanceof Error ? error.message : String(error);
//       console.error('Failed to stop recording:', message);
//       Alert.alert('Error', 'Failed to stop recording: ' + message);
//     }
//   };

//   // Convert audio to base64
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

//   // Analyze pronunciation with word timestamps
//   const analyzePronunciation = async () => {
//     if (!audioUri) {
//       Alert.alert('Error', 'No audio recorded');
//       return;
//     }

//     setIsAnalyzing(true);
//     setPronunciationResult(null);
//     setWordsWithTimestamps([]);

//     try {
//       const audioBase64 = await convertAudioToBase64(audioUri);
      
//       const binaryString = atob(audioBase64);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       // Request word-level timestamps
//       const pronunciationConfig = {
//         ReferenceText: REFERENCE_TEXT,
//         GradingSystem: 'HundredMark',
//         Granularity: 'Word', // Changed to Word for better timestamps
//         Dimension: 'Comprehensive',
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

//       processPronunciationResult(result);
//     } catch (error) {
//       console.error('Error analyzing pronunciation:', error);
//       Alert.alert('Error', 'Failed to analyze pronunciation. Please check your Azure credentials and try again.');
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };

//   // Process results and extract word timestamps
//   const processPronunciationResult = (result: any) => {
//     if (result.NBest && result.NBest.length > 0) {
//       const bestResult = result.NBest[0];

//       const processedResult = {
//         accuracyScore: Math.round(bestResult.AccuracyScore || 0),
//         fluencyScore: Math.round(bestResult.FluencyScore || 0),
//         completenessScore: Math.round(bestResult.CompletenessScore || 0),
//         pronunciationScore: Math.round(bestResult.PronScore || 0),
//         recognizedText: bestResult.Display || '',
//         words:
//           bestResult.Words?.map((word: any) => ({
//             word: word.Word,
//             accuracyScore: Math.round(word.AccuracyScore || 0),
//             errorType: word.ErrorType || 'None',
//             offset: word.Offset || 0,
//             duration: word.Duration || 0,
//             phonemes:
//               word.Phonemes?.map((phoneme: any) => ({
//                 phoneme: phoneme.Phoneme,
//                 accuracyScore: Math.round(phoneme.AccuracyScore || 0),
//               })) || [],
//           })) || [],
//       };

//       console.log('Processed Result:', processedResult);
//       setPronunciationResult(processedResult);
//       determineReaderLevel(processedResult.pronunciationScore);

//       // Extract words with timestamps for playback highlighting
//       if (processedResult.words.length > 0) {
//         const wordsWithTime = processedResult.words.map((word: any, index: number) => ({
//           word: word.word,
//           index,
//           offset: word.offset / 10000, // Convert from 100-nanosecond units to milliseconds
//           duration: word.duration / 10000,
//         }));
//         setWordsWithTimestamps(wordsWithTime);
//         console.log('Words with timestamps:', wordsWithTime);
//       }
//     } else {
//       Alert.alert('No Results', 'Could not analyze pronunciation. Try speaking more clearly.');
//     }
//   };

//   const determineReaderLevel = (score: any) => {
//     if (score >= 80) {
//       setReaderLevel('Proficient Reader');
//     } else if (score >= 60) {
//       setReaderLevel('Emerging Reader');
//     } else {
//       setReaderLevel('Beginner Reader');
//     }
//   };

//   // Play audio with synchronized highlighting
//   const playWithHighlighting = async () => {
//     if (!audioUri || wordsWithTimestamps.length === 0) {
//       Alert.alert('Error', 'Please analyze pronunciation first');
//       console.log('⚠️ Missing audioUri or timestamps');
//       return;
//     }

//     console.log('🎬 Starting playback...');
//     console.log('🎬 Audio URI:', audioUri);
//     console.log('🎬 Words with timestamps:', wordsWithTimestamps.length);

//     try {
//       // Stop any existing playback
//       if (sound) {
//         console.log('🛑 Stopping existing sound...');
//         await sound.stopAsync();
//         await sound.unloadAsync();
//         setSound(null);
//       }

//       // Set audio mode for playback
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: false,
//       });

//       console.log('📁 Loading audio from:', audioUri);

//       // Load the audio
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: audioUri },
//         { shouldPlay: true },
//         (status) => {
//           if (status.isLoaded) {
//             console.log('📊 Audio status - Position:', status.positionMillis, 'Duration:', status.durationMillis);
//           }
//         }
//       );
      
//       console.log('✅ Sound created successfully!');
      
//       setSound(newSound);
//       setIsPlaying(true);
//       setHighlightedWordIndex(-1);
//       playbackStartTimeRef.current = Date.now();

//       // IMPORTANT: Pass the sound object directly
//       setTimeout(() => {
//         console.log('🎯 Starting highlight sync after delay...');
//         startHighlightSync(newSound);
//       }, 100);

//       // Handle playback completion
//       newSound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           console.log('🏁 Playback finished');
//           setIsPlaying(false);
//           setHighlightedWordIndex(-1);
//           if (playbackIntervalRef.current) {
//             clearInterval(playbackIntervalRef.current);
//           }
//         }
//       });

//       console.log('✅ Playback started with highlighting');
//     } catch (error) {
//       console.error('❌ Error playing audio:', error);
//       Alert.alert('Error', 'Failed to play audio: ' + error);
//       setIsPlaying(false);
//     }
//   };

//   // Sync highlighting with audio playback
//   const startHighlightSync = (soundObject: Audio.Sound) => {
//     if (playbackIntervalRef.current) {
//       clearInterval(playbackIntervalRef.current);
//     }

//     console.log('🎵 Starting highlight sync...');
//     console.log('🎵 Total words to highlight:', wordsWithTimestamps.length);

//     // Adjust this value if highlighting is still off-sync
//     // Positive = delay highlighting, Negative = speed up highlighting
//     const SYNC_OFFSET = 450; // Try values like 100, 200, 300 if needed

//     playbackIntervalRef.current = setInterval(async () => {
//       if (!soundObject) {
//         console.log('⚠️ No sound object!');
//         return;
//       }

//       try {
//         const status = await soundObject.getStatusAsync();
        
//         if (status.isLoaded && status.isPlaying) {
//           const currentPosition = status.positionMillis + SYNC_OFFSET;
          
//           console.log('⏱️ Current position:', currentPosition, 'ms');

//           // Find which word should be highlighted based on audio position
//           const currentWordIndex = wordsWithTimestamps.findIndex((word: any, index: number) => {
//             const nextWord = wordsWithTimestamps[index + 1];
            
//             if (nextWord) {
//               const inRange = currentPosition >= word.offset && currentPosition < nextWord.offset;
//               if (inRange) {
//                 console.log(`✅ Highlighting word ${index}: "${word.word}" (offset: ${word.offset}ms)`);
//               }
//               return inRange;
//             } else {
//               const inRange = currentPosition >= word.offset;
//               if (inRange) {
//                 console.log(`✅ Highlighting last word ${index}: "${word.word}" (offset: ${word.offset}ms)`);
//               }
//               return inRange;
//             }
//           });

//           if (currentWordIndex !== -1 && currentWordIndex !== highlightedWordIndex) {
//             console.log(`🎯 Setting highlighted index to: ${currentWordIndex}`);
//             setHighlightedWordIndex(currentWordIndex);
//           }
//         } else {
//           console.log('⚠️ Audio not loaded or not playing');
//         }
//       } catch (error) {
//         console.error('❌ Error syncing highlight:', error);
//       }
//     }, 100); // Check every 100ms
//   };

//   // Stop playback
//   const stopPlayback = async () => {
//     try {
//       if (sound) {
//         await sound.stopAsync();
//         setIsPlaying(false);
//         setHighlightedWordIndex(-1);
        
//         if (playbackIntervalRef.current) {
//           clearInterval(playbackIntervalRef.current);
//         }
//       }
//     } catch (error) {
//       console.error('Error stopping playback:', error);
//     }
//   };

//   const getScoreColor = (score: any) => {
//     if (score >= 80) return '#4CAF50';
//     if (score >= 60) return '#FF9800';
//     return '#F44336';
//   };

//   const getLevelColor = (level: any) => {
//     switch (level) {
//       case 'Proficient Reader':
//         return '#4CAF50';
//       case 'Emerging Reader':
//         return '#FF9800';
//       case 'Beginner Reader':
//         return '#F44336';
//       default:
//         return '#666';
//     }
//   };

//   if (permissionResponse?.status !== 'granted') {
//     return (
//       <View style={styles.permissionContainer}>
//         <Text style={styles.permissionText}>
//           This app needs microphone permission to record your pronunciation.
//         </Text>
//         <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
//           <Text style={styles.buttonText}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // Render highlighted text
//   const renderHighlightedText = () => {
//     if (wordsWithTimestamps.length === 0) {
//       // Show reference text normally
//       return <Text style={styles.referenceText}>{REFERENCE_TEXT}</Text>;
//     }

//     // Show text with highlighting during playback
//     return (
//       <Text style={styles.referenceText}>
//         {wordsWithTimestamps.map((wordObj, index) => (
//           <Text
//             key={index}
//             style={[
//               styles.word,
//               index === highlightedWordIndex && styles.highlightedWord,
//               index < highlightedWordIndex && styles.passedWord,
//             ]}
//           >
//             {wordObj.word}{' '}
//           </Text>
//         ))}
//       </Text>
//     );
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Pronunciation Assessment</Text>
//         <Text style={styles.subtitle}>Read the text below clearly:</Text>
//       </View>

//       <View style={{ marginHorizontal: 20, marginTop: 10 }}>
//         <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Select Passage:</Text>
//         <Picker
//           selectedValue={selectedIndex}
//           onValueChange={(itemValue) => setSelectedIndex(itemValue)}
//         >
//           {referenceTexts.map((item, idx) => (
//             <Picker.Item key={idx} label={item.title} value={idx} />
//           ))}
//         </Picker>
//       </View>

//       {/* Text with highlighting */}
//       <View style={styles.textContainer}>
//         {renderHighlightedText()}
//       </View>

//       <View style={styles.controlsContainer}>
//         {/* Recording Controls */}
//         {!isRecording ? (
//           <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={startRecording}>
//             <Text style={styles.buttonText}>🎤 Start Recording</Text>
//           </TouchableOpacity>
//         ) : (
//           <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecording}>
//             <Text style={styles.buttonText}>⏹️ Stop Recording</Text>
//           </TouchableOpacity>
//         )}

//         {/* Analyze Button */}
//         {audioUri && !isRecording && (
//           <TouchableOpacity
//             style={[styles.button, styles.analyzeButton]}
//             onPress={analyzePronunciation}
//             disabled={isAnalyzing}
//           >
//             {isAnalyzing ? (
//               <View style={styles.loadingContainer}>
//                 <ActivityIndicator color="white" />
//                 <Text style={[styles.buttonText, { marginLeft: 10 }]}>Analyzing...</Text>
//               </View>
//             ) : (
//               <Text style={styles.buttonText}>📊 Analyze Pronunciation</Text>
//             )}
//           </TouchableOpacity>
//         )}

//         {/* Watch Playback Button (NEW!) */}
//         {pronunciationResult && wordsWithTimestamps.length > 0 && !isRecording && (
//           <>
//             {!isPlaying ? (
//               <TouchableOpacity
//                 style={[styles.button, styles.playbackButton]}
//                 onPress={playWithHighlighting}
//               >
//                 <Text style={styles.buttonText}>▶️ Watch Playback</Text>
//               </TouchableOpacity>
//             ) : (
//               <TouchableOpacity
//                 style={[styles.button, styles.stopPlaybackButton]}
//                 onPress={stopPlayback}
//               >
//                 <Text style={styles.buttonText}>⏹️ Stop Playback</Text>
//               </TouchableOpacity>
//             )}
//           </>
//         )}

//         {/* Vocabulary Support */}
//         <TouchableOpacity
//           style={[styles.button, styles.vocabButton]}
//           onPress={() => router.push('../../vocabSupport/vocabSupport')}
//         >
//           <Text style={styles.buttonText}>📚 Vocabulary Support</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Results Display */}
//       {pronunciationResult && (
//         <View style={styles.resultsContainer}>
//           <Text style={styles.resultsTitle}>Assessment Results</Text>

//           <View style={styles.levelContainer}>
//             <Text style={styles.levelLabel}>Reader Level:</Text>
//             <Text style={[styles.levelText, { color: getLevelColor(readerLevel) }]}>
//               {readerLevel}
//             </Text>
//           </View>

//           <View style={styles.recognizedTextContainer}>
//             <Text style={styles.label}>What we heard:</Text>
//             <Text style={styles.recognizedText}>"{pronunciationResult.recognizedText}"</Text>
//           </View>

//           <View style={styles.scoresGrid}>
//             <View style={styles.scoreItem}>
//               <Text style={styles.scoreLabel}>Overall</Text>
//               <Text
//                 style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.pronunciationScore) }]}
//               >
//                 {pronunciationResult.pronunciationScore}%
//               </Text>
//             </View>
//             <View style={styles.scoreItem}>
//               <Text style={styles.scoreLabel}>Accuracy</Text>
//               <Text
//                 style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.accuracyScore) }]}
//               >
//                 {pronunciationResult.accuracyScore}%
//               </Text>
//             </View>
//             <View style={styles.scoreItem}>
//               <Text style={styles.scoreLabel}>Fluency</Text>
//               <Text
//                 style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.fluencyScore) }]}
//               >
//                 {pronunciationResult.fluencyScore}%
//               </Text>
//             </View>
//             <View style={styles.scoreItem}>
//               <Text style={styles.scoreLabel}>Completeness</Text>
//               <Text
//                 style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.completenessScore) }]}
//               >
//                 {pronunciationResult.completenessScore}%
//               </Text>
//             </View>
//           </View>

//           {pronunciationResult.words.length > 0 && (
//             <View style={styles.wordAnalysisContainer}>
//               <Text style={styles.wordAnalysisTitle}>Word-by-Word Analysis</Text>
//               {pronunciationResult.words.map((word, index) => (
//                 <View key={index} style={styles.wordItem}>
//                   <Text style={styles.wordText}>{word.word}</Text>
//                   <Text style={[styles.wordScore, { color: getScoreColor(word.accuracyScore) }]}>
//                     {word.accuracyScore}%
//                   </Text>
//                   {word.errorType !== 'None' && (
//                     <Text style={styles.errorType}>{word.errorType}</Text>
//                   )}
//                 </View>
//               ))}
//             </View>
//           )}
//         </View>
//       )}
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   permissionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   permissionText: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#666',
//     lineHeight: 24,
//   },
//   permissionButton: {
//     backgroundColor: '#2196F3',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//   },
//   header: {
//     padding: 20,
//     paddingTop: 50,
//     backgroundColor: '#2196F3',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: 'white',
//     opacity: 0.9,
//   },
//   textContainer: {
//     margin: 20,
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   referenceText: {
//     fontSize: 18,
//     color: '#333',
//     lineHeight: 32,
//     fontWeight: '500',
//   },
//   word: {
//     fontSize: 18,
//     color: '#333',
//   },
//   highlightedWord: {
//     backgroundColor: '#00FFFF', // Cyan color
//     fontWeight: 'bold',
//     color: '#000',
//     paddingHorizontal: 4,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   passedWord: {
//     color: '#BDBDBD', // Light gray for passed words
//     opacity: 0.6,
//   },
//   controlsContainer: {
//     padding: 20,
//     alignItems: 'center',
//   },
//   button: {
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 25,
//     marginVertical: 8,
//     minWidth: 200,
//     alignItems: 'center',
//     elevation: 2,
//   },
//   recordButton: {
//     backgroundColor: '#4CAF50',
//   },
//   stopButton: {
//     backgroundColor: '#F44336',
//   },
//   analyzeButton: {
//     backgroundColor: '#FF9800',
//   },
//   playbackButton: {
//     backgroundColor: '#2196F3',
//   },
//   stopPlaybackButton: {
//     backgroundColor: '#F44336',
//   },
//   vocabButton: {
//     backgroundColor: '#9C27B0',
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   resultsContainer: {
//     margin: 20,
//     padding: 20,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     elevation: 3,
//   },
//   resultsTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   levelContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//   },
//   levelLabel: {
//     fontSize: 16,
//     color: '#666',
//     marginRight: 10,
//   },
//   levelText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   recognizedTextContainer: {
//     marginBottom: 20,
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//   },
//   label: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   recognizedText: {
//     fontSize: 16,
//     color: '#333',
//     fontStyle: 'italic',
//   },
//   scoresGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   scoreItem: {
//     width: '48%',
//     padding: 15,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   scoreLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 5,
//     textTransform: 'uppercase',
//   },
//   scoreValue: {
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   wordAnalysisContainer: {
//     marginTop: 10,
//   },
//   wordAnalysisTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 12,
//   },
//   wordItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   wordText: {
//     fontSize: 16,
//     color: '#333',
//     flex: 1,
//   },
//   wordScore: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginRight: 10,
//   },
//   errorType: {
//     fontSize: 12,
//     color: '#F44336',
//     fontStyle: 'italic',
//   },
// });

// export default ExpoPronunciationApp;

//checkpoint: the words get highlighted more sync than the previous. This is based on percentage.
import { Picker } from '@react-native-picker/picker';
import { decode as atob, encode as btoa } from 'base-64';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { referenceTexts } from './referenceTexts';

type ProcessedResult = {
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  pronunciationScore: number;
  recognizedText: string;
  words: Array<{
    word: string;
    accuracyScore: number;
    errorType: string;
    offset: number;
    duration: number;
    phonemes: Array<{
      phoneme: string;
      accuracyScore: number;
    }>;
  }>;
};

type WordHighlight = {
  word: string;
  index: number;
  offset: number;
  duration: number;
};

const ExpoPronunciationApp = () => {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<ProcessedResult | null>(null);
  const [readerLevel, setReaderLevel] = useState('');
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Playback states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [wordsWithTimestamps, setWordsWithTimestamps] = useState<WordHighlight[]>([]);
  const playbackIntervalRef = useRef<any>(null);
  const playbackStartTimeRef = useRef<number>(0);

  // Azure Speech Service Configuration
  const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
  const AZURE_REGION = 'eastus';
  const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

  const REFERENCE_TEXT = referenceTexts[selectedIndex].text;

  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
    
    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  // Reset when passage changes
  useEffect(() => {
    setAudioUri(null);
    setPronunciationResult(null);
    setWordsWithTimestamps([]);
    setHighlightedWordIndex(-1);
    if (sound) {
      sound.unloadAsync();
      setSound(null);
    }
  }, [selectedIndex]);

  const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

  // Start recording
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

  // Stop recording
  const stopRecording = async () => {
    try {
      if (!recording) return;

      console.log('Stopping recording...');
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      setAudioUri(uri ?? null);
      setRecording(null);
      
      console.log('Recording stopped and stored at', uri);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Failed to stop recording:', message);
      Alert.alert('Error', 'Failed to stop recording: ' + message);
    }
  };

  // Convert audio to base64
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

  // Analyze pronunciation with word timestamps
  const analyzePronunciation = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio recorded');
      return;
    }

    setIsAnalyzing(true);
    setPronunciationResult(null);
    setWordsWithTimestamps([]);

    try {
      const audioBase64 = await convertAudioToBase64(audioUri);
      
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Request word-level timestamps
      const pronunciationConfig = {
        ReferenceText: REFERENCE_TEXT,
        GradingSystem: 'HundredMark',
        Granularity: 'Word', // Changed to Word for better timestamps
        Dimension: 'Comprehensive',
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

      processPronunciationResult(result);
    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      Alert.alert('Error', 'Failed to analyze pronunciation. Please check your Azure credentials and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process results and extract word timestamps
  const processPronunciationResult = (result: any) => {
    if (result.NBest && result.NBest.length > 0) {
      const bestResult = result.NBest[0];

      const processedResult = {
        accuracyScore: Math.round(bestResult.AccuracyScore || 0),
        fluencyScore: Math.round(bestResult.FluencyScore || 0),
        completenessScore: Math.round(bestResult.CompletenessScore || 0),
        pronunciationScore: Math.round(bestResult.PronScore || 0),
        recognizedText: bestResult.Display || '',
        words:
          bestResult.Words?.map((word: any) => ({
            word: word.Word,
            accuracyScore: Math.round(word.AccuracyScore || 0),
            errorType: word.ErrorType || 'None',
            offset: word.Offset || 0,
            duration: word.Duration || 0,
            phonemes:
              word.Phonemes?.map((phoneme: any) => ({
                phoneme: phoneme.Phoneme,
                accuracyScore: Math.round(phoneme.AccuracyScore || 0),
              })) || [],
          })) || [],
      };

      console.log('Processed Result:', processedResult);
      setPronunciationResult(processedResult);
      determineReaderLevel(processedResult.pronunciationScore);

      // Extract words with timestamps for playback highlighting
      if (processedResult.words.length > 0) {
        const wordsWithTime = processedResult.words.map((word: any, index: number) => ({
          word: word.word,
          index,
          offset: word.offset / 10000, // Convert from 100-nanosecond units to milliseconds
          duration: word.duration / 10000,
        }));
        setWordsWithTimestamps(wordsWithTime);
        console.log('Words with timestamps:', wordsWithTime);
      }
    } else {
      Alert.alert('No Results', 'Could not analyze pronunciation. Try speaking more clearly.');
    }
  };

  const determineReaderLevel = (score: any) => {
    if (score >= 55) {
      setReaderLevel('Proficient Reader');
    } else if (score >= 30) {
      setReaderLevel('Emerging Reader');
    } else {
      setReaderLevel('Beginner Reader');
    }
  };

  // Play audio with synchronized highlighting
  const playWithHighlighting = async () => {
    if (!audioUri || wordsWithTimestamps.length === 0) {
      Alert.alert('Error', 'Please analyze pronunciation first');
      console.log('⚠️ Missing audioUri or timestamps');
      return;
    }

    console.log('🎬 Starting playback...');
    console.log('🎬 Audio URI:', audioUri);
    console.log('🎬 Words with timestamps:', wordsWithTimestamps.length);

    try {
      // Stop any existing playback
      if (sound) {
        console.log('🛑 Stopping existing sound...');
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      console.log('📁 Loading audio from:', audioUri);

      // Load the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            console.log('📊 Audio status - Position:', status.positionMillis, 'Duration:', status.durationMillis);
          }
        }
      );
      
      console.log('✅ Sound created successfully!');
      
      setSound(newSound);
      setIsPlaying(true);
      setHighlightedWordIndex(-1);
      playbackStartTimeRef.current = Date.now();

      // IMPORTANT: Pass the sound object directly
      setTimeout(() => {
        console.log('🎯 Starting highlight sync after delay...');
        startHighlightSync(newSound);
      }, 100);

      // Handle playback completion
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('🏁 Playback finished');
          setIsPlaying(false);
          setHighlightedWordIndex(-1);
          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
          }
        }
      });

      console.log('✅ Playback started with highlighting');
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio: ' + error);
      setIsPlaying(false);
    }
  };

  // Sync highlighting with audio playback
  const startHighlightSync = (soundObject: Audio.Sound) => {
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
    }

    console.log('🎵 Starting highlight sync...');
    console.log('🎵 Total words to highlight:', wordsWithTimestamps.length);

    // Different sync strategies - change the value to try each one!
    // Options: 'OFFSET', 'PROPORTIONAL', 'WORD_DURATION'
    const SYNC_STRATEGY = 'PROPORTIONAL' as string;
    const SYNC_OFFSET = 0; // Only used for 'OFFSET' strategy

    playbackIntervalRef.current = setInterval(async () => {
      if (!soundObject) {
        console.log('⚠️ No sound object!');
        return;
      }

      try {
        const status = await soundObject.getStatusAsync();
        
        if (status.isLoaded && status.isPlaying) {
          const currentPosition = status.positionMillis;
          const totalDuration = status.durationMillis || 1;
          
          let adjustedPosition = currentPosition;

          // Strategy 1: Simple offset (what we had before)
          if (SYNC_STRATEGY === 'OFFSET') {
            adjustedPosition = currentPosition + SYNC_OFFSET;
          }
          
          // Strategy 2: Proportional scaling based on total duration
          else if (SYNC_STRATEGY === 'PROPORTIONAL') {
            // Calculate progress through audio (0 to 1)
            const audioProgress = currentPosition / totalDuration;
            
            // Get timestamp range from Azure
            const firstWordOffset = wordsWithTimestamps[0]?.offset || 0;
            const lastWordOffset = wordsWithTimestamps[wordsWithTimestamps.length - 1]?.offset || totalDuration;
            const timestampRange = lastWordOffset - firstWordOffset;
            
            // Map audio position to timestamp range
            adjustedPosition = firstWordOffset + (audioProgress * timestampRange);
            
            console.log(`⏱️ Audio: ${currentPosition}ms | Progress: ${(audioProgress * 100).toFixed(1)}% | Adjusted: ${adjustedPosition.toFixed(0)}ms`);
          }
          
          // Strategy 3: Word duration based (best for longer pauses)
          else if (SYNC_STRATEGY === 'WORD_DURATION') {
            // Calculate which word we SHOULD be on based on audio progress
            const audioProgress = currentPosition / totalDuration;
            const estimatedWordIndex = Math.floor(audioProgress * wordsWithTimestamps.length);
            
            if (estimatedWordIndex >= 0 && estimatedWordIndex < wordsWithTimestamps.length && 
                estimatedWordIndex !== highlightedWordIndex) {
              console.log(`🎯 Setting highlighted index to: ${estimatedWordIndex} (word: "${wordsWithTimestamps[estimatedWordIndex].word}")`);
              setHighlightedWordIndex(estimatedWordIndex);
            }
            return; // Skip normal timestamp matching
          }

          // Find which word should be highlighted based on adjusted position
          const currentWordIndex = wordsWithTimestamps.findIndex((word: any, index: number) => {
            const nextWord = wordsWithTimestamps[index + 1];
            
            if (nextWord) {
              const inRange = adjustedPosition >= word.offset && adjustedPosition < nextWord.offset;
              if (inRange) {
                console.log(`✅ Word ${index}: "${word.word}" (offset: ${word.offset}ms, duration: ${word.duration}ms)`);
              }
              return inRange;
            } else {
              const inRange = adjustedPosition >= word.offset;
              if (inRange) {
                console.log(`✅ Last word ${index}: "${word.word}" (offset: ${word.offset}ms)`);
              }
              return inRange;
            }
          });

          if (currentWordIndex !== -1 && currentWordIndex !== highlightedWordIndex) {
            console.log(`🎯 Setting highlighted index to: ${currentWordIndex}`);
            setHighlightedWordIndex(currentWordIndex);
          }
        } else {
          console.log('⚠️ Audio not loaded or not playing');
        }
      } catch (error) {
        console.error('❌ Error syncing highlight:', error);
      }
    }, 100); // Check every 100ms
  };

  // Stop playback
  const stopPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
        setHighlightedWordIndex(-1);
        
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error stopping playback:', error);
    }
  };

  const getScoreColor = (score: any) => {
    if (score >= 55) return '#4CAF50';
    if (score >= 30) return '#FF9800';
    if (score >= 0) return '#F44336';
  };

  const getLevelColor = (level: any) => {
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

  if (permissionResponse?.status !== 'granted') {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          This app needs microphone permission to record your pronunciation.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render highlighted text
  const renderHighlightedText = () => {
    if (wordsWithTimestamps.length === 0) {
      // Show reference text normally
      return <Text style={styles.referenceText}>{REFERENCE_TEXT}</Text>;
    }

    // Show text with highlighting during playback
    return (
      <Text style={styles.referenceText}>
        {wordsWithTimestamps.map((wordObj, index) => (
          <Text
            key={index}
            style={[
              styles.word,
              index === highlightedWordIndex && styles.highlightedWord,
              index < highlightedWordIndex && styles.passedWord,
            ]}
          >
            {wordObj.word}{' '}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Assessment</Text>
        <Text style={styles.subtitle}>Read the text below clearly:</Text>
      </View>

      <View style={{ marginHorizontal: 20, marginTop: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Select Passage:</Text>
        <Picker
          selectedValue={selectedIndex}
          onValueChange={(itemValue) => setSelectedIndex(itemValue)}
        >
          {referenceTexts.map((item, idx) => (
            <Picker.Item key={idx} label={item.title} value={idx} />
          ))}
        </Picker>
      </View>

      {/* Text with highlighting */}
      <View style={styles.textContainer}>
        {renderHighlightedText()}
      </View>

      <View style={styles.controlsContainer}>
        {/* Recording Controls */}
        {!isRecording ? (
          <TouchableOpacity style={[styles.button, styles.recordButton]} onPress={startRecording}>
            <Text style={styles.buttonText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRecording}>
            <Text style={styles.buttonText}>⏹️ Stop Recording</Text>
          </TouchableOpacity>
        )}

        {/* Analyze Button */}
        {audioUri && !isRecording && (
          <TouchableOpacity
            style={[styles.button, styles.analyzeButton]}
            onPress={analyzePronunciation}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" />
                <Text style={[styles.buttonText, { marginLeft: 10 }]}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>📊 Analyze Pronunciation</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Watch Playback Button (NEW!) */}
        {pronunciationResult && wordsWithTimestamps.length > 0 && !isRecording && (
          <>
            {!isPlaying ? (
              <TouchableOpacity
                style={[styles.button, styles.playbackButton]}
                onPress={playWithHighlighting}
              >
                <Text style={styles.buttonText}>▶️ Watch Playback</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.stopPlaybackButton]}
                onPress={stopPlayback}
              >
                <Text style={styles.buttonText}>⏹️ Stop Playback</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Vocabulary Support */}
        <TouchableOpacity
          style={[styles.button, styles.vocabButton]}
          onPress={() => router.push('../../vocabSupport/vocabSupport')}
        >
          <Text style={styles.buttonText}>📚 Vocabulary Support</Text>
        </TouchableOpacity>
      </View>

      {/* Results Display */}
      {pronunciationResult && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Assessment Results</Text>

          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Reader Level:</Text>
            <Text style={[styles.levelText, { color: getLevelColor(readerLevel) }]}>
              {readerLevel}
            </Text>
          </View>

          <View style={styles.recognizedTextContainer}>
            <Text style={styles.label}>What we heard:</Text>
            <Text style={styles.recognizedText}>"{pronunciationResult.recognizedText}"</Text>
          </View>

          <View style={styles.scoresGrid}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Overall</Text>
              <Text
                style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.pronunciationScore) }]}
              >
                {pronunciationResult.pronunciationScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Accuracy</Text>
              <Text
                style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.accuracyScore) }]}
              >
                {pronunciationResult.accuracyScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Fluency</Text>
              <Text
                style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.fluencyScore) }]}
              >
                {pronunciationResult.fluencyScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Completeness</Text>
              <Text
                style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.completenessScore) }]}
              >
                {pronunciationResult.completenessScore}%
              </Text>
            </View>
          </View>

          {pronunciationResult.words.length > 0 && (
            <View style={styles.wordAnalysisContainer}>
              <Text style={styles.wordAnalysisTitle}>Word-by-Word Analysis</Text>
              {pronunciationResult.words.map((word, index) => (
                <View key={index} style={styles.wordItem}>
                  <Text style={styles.wordText}>{word.word}</Text>
                  <Text style={[styles.wordScore, { color: getScoreColor(word.accuracyScore) }]}>
                    {word.accuracyScore}%
                  </Text>
                  {word.errorType !== 'None' && (
                    <Text style={styles.errorType}>{word.errorType}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  textContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  referenceText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 32,
    fontWeight: '500',
  },
  word: {
    fontSize: 18,
    color: '#333',
  },
  highlightedWord: {
    backgroundColor: '#00FFFF', // Cyan color
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  passedWord: {
    color: '#BDBDBD', // Light gray for passed words
    opacity: 0.6,
  },
  controlsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginVertical: 8,
    minWidth: 200,
    alignItems: 'center',
    elevation: 2,
  },
  recordButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  analyzeButton: {
    backgroundColor: '#FF9800',
  },
  playbackButton: {
    backgroundColor: '#2196F3',
  },
  stopPlaybackButton: {
    backgroundColor: '#F44336',
  },
  vocabButton: {
    backgroundColor: '#9C27B0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  levelLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recognizedTextContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recognizedText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scoreItem: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  wordAnalysisContainer: {
    marginTop: 10,
  },
  wordAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  wordText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  wordScore: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  errorType: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
  },
});

export default ExpoPronunciationApp;

