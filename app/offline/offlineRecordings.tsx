// // import { MaterialCommunityIcons } from '@expo/vector-icons';
// // import AsyncStorage from '@react-native-async-storage/async-storage';
// // import NetInfo from '@react-native-community/netinfo';
// // import { decode as atob, encode as btoa } from 'base-64';
// // import { Audio } from 'expo-av';
// // import * as FileSystem from 'expo-file-system/legacy';
// // import { useRouter } from 'expo-router';
// // import React, { useEffect, useState } from 'react';
// // import {
// //     ActivityIndicator,
// //     Alert,
// //     Dimensions,
// //     FlatList,
// //     StyleSheet,
// //     Text,
// //     TouchableOpacity,
// //     View,
// // } from 'react-native';

// // type LocalRecording = {
// //   id: string;
// //   storyTitle: string;
// //   audioUri: string;
// //   timestamp: number;
// //   analyzed: boolean;
// //   result?: any;
// //   readerLevel?: string;
// // };

// // type AzureWord = {
// //   Word: string;
// //   PronScore: number;
// //   ErrorType: string;
// //   Offset: number;
// //   Duration: number;
// // };

// // type AzureBestResult = {
// //   PronScore: number;
// //   AccuracyScore: number;
// //   FluencyScore: number;
// //   CompletenessScore: number;
// //   Words?: AzureWord[];
// // };

// // type AzureAPIResponse = {
// //   NBest?: AzureBestResult[];
// // };

// // const { width, height } = Dimensions.get('window');
// // const scaleFontSize = (size: number) => (width / 375) * size;

// // const OfflineRecordingsScreen = () => {
// //   const router = useRouter();
// //   const [recordings, setRecordings] = useState<LocalRecording[]>([]);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [isOnline, setIsOnline] = useState(true);
// //   const [analyzingId, setAnalyzingId] = useState<string | null>(null);
// //   const [playingId, setPlayingId] = useState<string | null>(null);
// //   const [sound, setSound] = useState<Audio.Sound | null>(null);

// //   // Azure Speech Service Configuration
// //   const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
// //   const AZURE_REGION = 'eastus';
// //   const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

// //   const STORY_DATA: Record<string, string> = {
// //     'Counting The Hours': "When men decided to divide the day into twenty four hours, they used numbers one through twelve two times. As a result, there was one oclock during the day and another one oclock after midnight.",
// //     'Telling Time': "Humans have used different objects to tell time. In the beginning, they used an hourglass. This is a cylindrical glass with a narrow center which allows sand to flow from its upper to its lower portion.",
// //     'Nose Bleeds': "Having a nosebleed is a common occurrence. Children experience epistaxis when blood flows out from either or both nostrils, often for a short period of time. It may be caused by ones behavior like frequent nose picking or blowing too hard when one has a cold."
// //   };

// //   useEffect(() => {
// //     loadRecordings();

// //     const unsubscribe = NetInfo.addEventListener(state => {
// //       setIsOnline(state.isConnected ?? false);
// //     });

// //     return () => {
// //       unsubscribe();
// //       if (sound) {
// //         sound.unloadAsync();
// //       }
// //     };
// //   }, []);

// //   const loadRecordings = async () => {
// //     try {
// //       const data = await AsyncStorage.getItem('localRecordings');
// //       if (data) {
// //         const parsed = JSON.parse(data);
// //         setRecordings(parsed.reverse()); // Show newest first
// //       }
// //     } catch (error) {
// //       console.error('Error loading recordings:', error);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const convertAudioToBase64 = async (uri: string): Promise<string> => {
// //     const base64 = await FileSystem.readAsStringAsync(uri, {
// //       encoding: 'base64',
// //     });
// //     return base64;
// //   };

// //   const analyzeRecording = async (recording: LocalRecording) => {
// //     if (!isOnline) {
// //       Alert.alert('Offline', 'Analysis requires internet connection');
// //       return;
// //     }

// //     setAnalyzingId(recording.id);

// //     try {
// //       const audioBase64 = await convertAudioToBase64(recording.audioUri);
// //       const binaryString = atob(audioBase64);
// //       const bytes = new Uint8Array(binaryString.length);
// //       for (let i = 0; i < binaryString.length; i++) {
// //         bytes[i] = binaryString.charCodeAt(i);
// //       }

// //       const referenceText = STORY_DATA[recording.storyTitle] || '';
      
// //       const pronunciationConfig = {
// //         ReferenceText: referenceText,
// //         GradingSystem: 'HundredMark',
// //         Granularity: 'Word',
// //         Dimension: 'Comprehensive',
// //       };

// //       const headers = {
// //         'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
// //         'Content-Type': 'audio/mp4',
// //         'Accept': 'application/json',
// //         'Pronunciation-Assessment': btoa(JSON.stringify(pronunciationConfig)),
// //       };

// //       const url = `${AZURE_ENDPOINT}?language=en-US&format=detailed`;

// //       const response = await fetch(url, {
// //         method: 'POST',
// //         headers,
// //         body: bytes as any,
// //       });

// //       if (!response.ok) {
// //         throw new Error(`API Error ${response.status}`);
// //       }

// //       const result = await response.json() as AzureAPIResponse;
      
// //       if (result.NBest && result.NBest.length > 0) {
// //         const bestResult = result.NBest[0];
// //         const pronunciationScore = Math.round(bestResult.PronScore || 0);
        
// //         let readerLevel = 'Beginner Reader';
// //         if (pronunciationScore >= 55) readerLevel = 'Proficient Reader';
// //         else if (pronunciationScore >= 30) readerLevel = 'Emerging Reader';

// //         // Update recording with results
// //         const updatedRecordings = recordings.map(r => 
// //           r.id === recording.id 
// //             ? { ...r, analyzed: true, result: bestResult, readerLevel }
// //             : r
// //         );
        
// //         setRecordings(updatedRecordings);
// //         await AsyncStorage.setItem('localRecordings', JSON.stringify(updatedRecordings));
        
// //         Alert.alert('Success', `Analysis complete! Score: ${pronunciationScore}%`);
// //       }
// //     } catch (error) {
// //       console.error('Error analyzing:', error);
// //       Alert.alert('Error', 'Failed to analyze recording');
// //     } finally {
// //       setAnalyzingId(null);
// //     }
// //   };

// //   const playRecording = async (recording: LocalRecording) => {
// //     try {
// //       if (playingId === recording.id) {
// //         // Stop current playback
// //         if (sound) {
// //           await sound.stopAsync();
// //           await sound.unloadAsync();
// //           setSound(null);
// //         }
// //         setPlayingId(null);
// //         return;
// //       }

// //       // Stop any existing playback
// //       if (sound) {
// //         await sound.stopAsync();
// //         await sound.unloadAsync();
// //       }

// //       await Audio.setAudioModeAsync({
// //         allowsRecordingIOS: false,
// //         playsInSilentModeIOS: true,
// //       });

// //       const { sound: newSound } = await Audio.Sound.createAsync(
// //         { uri: recording.audioUri },
// //         { shouldPlay: true }
// //       );

// //       setSound(newSound);
// //       setPlayingId(recording.id);

// //       newSound.setOnPlaybackStatusUpdate((status) => {
// //         if (status.isLoaded && status.didJustFinish) {
// //           setPlayingId(null);
// //         }
// //       });
// //     } catch (error) {
// //       console.error('Error playing recording:', error);
// //       Alert.alert('Error', 'Failed to play recording');
// //     }
// //   };

// //   const deleteRecording = async (id: string) => {
// //     Alert.alert(
// //       'Delete Recording',
// //       'Are you sure you want to delete this recording?',
// //       [
// //         { text: 'Cancel', style: 'cancel' },
// //         {
// //           text: 'Delete',
// //           style: 'destructive',
// //           onPress: async () => {
// //             const updated = recordings.filter(r => r.id !== id);
// //             setRecordings(updated);
// //             await AsyncStorage.setItem('localRecordings', JSON.stringify(updated));
// //           }
// //         }
// //       ]
// //     );
// //   };

// //   const formatDate = (timestamp: number) => {
// //     const date = new Date(timestamp);
// //     return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// //   };

// //   const renderRecording = ({ item }: { item: LocalRecording }) => (
// //     <View style={styles.recordingCard}>
// //       <View style={styles.recordingHeader}>
// //         <View style={styles.recordingInfo}>
// //           <Text style={styles.storyTitle}>{item.storyTitle}</Text>
// //           <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
// //         </View>
        
// //         <TouchableOpacity
// //           style={styles.deleteButton}
// //           onPress={() => deleteRecording(item.id)}
// //         >
// //           <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
// //         </TouchableOpacity>
// //       </View>

// //       {item.analyzed && item.result && (
// //         <View style={styles.resultBadge}>
// //           <Text style={styles.resultText}>
// //             Score: {Math.round(item.result.PronScore || 0)}% • {item.readerLevel}
// //           </Text>
// //         </View>
// //       )}

// //       <View style={styles.actions}>
// //         <TouchableOpacity
// //           style={[styles.actionButton, styles.playButton]}
// //           onPress={() => playRecording(item)}
// //         >
// //           <MaterialCommunityIcons 
// //             name={playingId === item.id ? "stop" : "play"} 
// //             size={20} 
// //             color="#FFF" 
// //           />
// //           <Text style={styles.actionButtonText}>
// //             {playingId === item.id ? 'Stop' : 'Play'}
// //           </Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={[
// //             styles.actionButton, 
// //             styles.analyzeButton,
// //             (!isOnline || analyzingId === item.id) && styles.disabledButton
// //           ]}
// //           onPress={() => analyzeRecording(item)}
// //           disabled={!isOnline || analyzingId === item.id}
// //         >
// //           {analyzingId === item.id ? (
// //             <>
// //               <ActivityIndicator color="#FFF" size="small" />
// //               <Text style={styles.actionButtonText}>Analyzing...</Text>
// //             </>
// //           ) : (
// //             <>
// //               <MaterialCommunityIcons name="chart-line" size={20} color="#FFF" />
// //               <Text style={styles.actionButtonText}>
// //                 {item.analyzed ? 'Re-analyze' : 'Analyze'}
// //               </Text>
// //             </>
// //           )}
// //         </TouchableOpacity>
// //       </View>
// //     </View>
// //   );

// //   if (isLoading) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <ActivityIndicator size="large" color="#2196F3" />
// //       </View>
// //     );
// //   }

// //   return (
// //     <View style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
// //           <MaterialCommunityIcons name="arrow-left" size={29} color="#000" />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>My Recordings</Text>
// //         <View style={styles.placeholder} />
// //       </View>

// //       {!isOnline && (
// //         <View style={styles.offlineBanner}>
// //           <MaterialCommunityIcons name="wifi-off" size={20} color="#FFF" />
// //           <Text style={styles.offlineBannerText}>
// //             Offline - Connect to analyze recordings
// //           </Text>
// //         </View>
// //       )}

// //       {recordings.length === 0 ? (
// //         <View style={styles.emptyContainer}>
// //           <MaterialCommunityIcons name="microphone-off" size={80} color="#CCC" />
// //           <Text style={styles.emptyText}>No recordings yet</Text>
// //           <Text style={styles.emptySubtext}>
// //             Your recordings will appear here
// //           </Text>
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={recordings}
// //           renderItem={renderRecording}
// //           keyExtractor={item => item.id}
// //           contentContainerStyle={styles.listContainer}
// //         />
// //       )}
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#F5F5F5',
// //   },
// //   centerContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     paddingTop: height * 0.05,
// //     paddingHorizontal: width * 0.05,
// //     paddingBottom: height * 0.02,
// //     backgroundColor: '#FFF',
// //     elevation: 2,
// //   },
// //   backButton: {
// //     padding: 8,
// //   },
// //   headerTitle: {
// //     fontSize: scaleFontSize(20),
// //     fontWeight: 'bold',
// //     color: '#333',
// //   },
// //   placeholder: {
// //     width: 40,
// //   },
// //   offlineBanner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#FF9800',
// //     padding: height * 0.015,
// //     gap: 8,
// //   },
// //   offlineBannerText: {
// //     color: '#FFF',
// //     fontSize: scaleFontSize(14),
// //     fontWeight: '600',
// //   },
// //   listContainer: {
// //     padding: width * 0.04,
// //   },
// //   recordingCard: {
// //     backgroundColor: '#FFF',
// //     borderRadius: 12,
// //     padding: width * 0.04,
// //     marginBottom: height * 0.015,
// //     elevation: 2,
// //   },
// //   recordingHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //     marginBottom: height * 0.015,
// //   },
// //   recordingInfo: {
// //     flex: 1,
// //   },
// //   storyTitle: {
// //     fontSize: scaleFontSize(16),
// //     fontWeight: 'bold',
// //     color: '#333',
// //     marginBottom: 4,
// //   },
// //   timestamp: {
// //     fontSize: scaleFontSize(12),
// //     color: '#666',
// //   },
// //   deleteButton: {
// //     padding: 4,
// //   },
// //   resultBadge: {
// //     backgroundColor: '#E8F5E9',
// //     padding: width * 0.025,
// //     borderRadius: 8,
// //     marginBottom: height * 0.015,
// //   },
// //   resultText: {
// //     fontSize: scaleFontSize(14),
// //     color: '#4CAF50',
// //     fontWeight: '600',
// //     textAlign: 'center',
// //   },
// //   actions: {
// //     flexDirection: 'row',
// //     gap: width * 0.02,
// //   },
// //   actionButton: {
// //     flex: 1,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     padding: height * 0.015,
// //     borderRadius: 8,
// //     gap: 6,
// //   },
// //   playButton: {
// //     backgroundColor: '#2196F3',
// //   },
// //   analyzeButton: {
// //     backgroundColor: '#FF9800',
// //   },
// //   disabledButton: {
// //     backgroundColor: '#CCC',
// //   },
// //   actionButtonText: {
// //     color: '#FFF',
// //     fontSize: scaleFontSize(14),
// //     fontWeight: '600',
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     padding: width * 0.1,
// //   },
// //   emptyText: {
// //     fontSize: scaleFontSize(20),
// //     fontWeight: 'bold',
// //     color: '#999',
// //     marginTop: height * 0.02,
// //   },
// //   emptySubtext: {
// //     fontSize: scaleFontSize(14),
// //     color: '#BBB',
// //     marginTop: height * 0.01,
// //     textAlign: 'center',
// //   },
// // });

// // export default OfflineRecordingsScreen;
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
// import { decode as atob, encode as btoa } from 'base-64';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system/legacy';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Dimensions,
//     FlatList,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// // Azure API response types
// type AzureWord = {
//   Word: string;
//   PronScore: number;
//   AccuracyScore: number;
//   ErrorType: string;
//   Offset: number;
//   Duration: number;
// };

// type AzureBestResult = {
//   PronScore: number;
//   AccuracyScore: number;
//   FluencyScore: number;
//   CompletenessScore: number;
//   Display: string;
//   Words?: AzureWord[];
// };

// type AzureAPIResponse = {
//   NBest?: AzureBestResult[];
// };

// // Processed result type for storage
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
//   }>;
// };

// type LocalRecording = {
//   id: string;
//   storyTitle: string;
//   audioUri: string;
//   timestamp: number;
//   analyzed: boolean;
//   result?: ProcessedResult;
//   readerLevel?: string;
// };

// const { width, height } = Dimensions.get('window');
// const scaleFontSize = (size: number) => (width / 375) * size;

// const OfflineRecordingsScreen = () => {
//   const router = useRouter();
//   const [recordings, setRecordings] = useState<LocalRecording[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isOnline, setIsOnline] = useState(true);
//   const [analyzingId, setAnalyzingId] = useState<string | null>(null);
//   const [playingId, setPlayingId] = useState<string | null>(null);
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   // Azure Speech Service Configuration
//   const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
//   const AZURE_REGION = 'eastus';
//   const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

//   const STORY_DATA: Record<string, string> = {
//     'Counting The Hours': "When men decided to divide the day into twenty four hours, they used numbers one through twelve two times. As a result, there was one oclock during the day and another one oclock after midnight.",
//     'Telling Time': "Humans have used different objects to tell time. In the beginning, they used an hourglass. This is a cylindrical glass with a narrow center which allows sand to flow from its upper to its lower portion.",
//     'Nose Bleeds': "Having a nosebleed is a common occurrence. Children experience epistaxis when blood flows out from either or both nostrils, often for a short period of time. It may be caused by ones behavior like frequent nose picking or blowing too hard when one has a cold."
//   };

//   useEffect(() => {
//     loadRecordings();

//     const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
//       setIsOnline(state.isConnected ?? false);
//     });

//     return () => {
//       unsubscribe();
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, []);

//   const loadRecordings = async () => {
//     try {
//       const data = await AsyncStorage.getItem('localRecordings');
//       if (data) {
//         const parsed = JSON.parse(data);
//         setRecordings(parsed.reverse()); // Show newest first
//       }
//     } catch (error) {
//       console.error('Error loading recordings:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const convertAudioToBase64 = async (uri: string): Promise<string> => {
//     const base64 = await FileSystem.readAsStringAsync(uri, {
//       encoding: 'base64',
//     });
//     return base64;
//   };

//   const analyzeRecording = async (recording: LocalRecording) => {
//     if (!isOnline) {
//       Alert.alert('Offline', 'Analysis requires internet connection');
//       return;
//     }

//     setAnalyzingId(recording.id);

//     try {
//       const audioBase64 = await convertAudioToBase64(recording.audioUri);
//       const binaryString = atob(audioBase64);
//       const bytes = new Uint8Array(binaryString.length);
//       for (let i = 0; i < binaryString.length; i++) {
//         bytes[i] = binaryString.charCodeAt(i);
//       }

//       const referenceText = STORY_DATA[recording.storyTitle] || '';
      
//       const pronunciationConfig = {
//         ReferenceText: referenceText,
//         GradingSystem: 'HundredMark',
//         Granularity: 'Word',
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
//         throw new Error(`API Error ${response.status}`);
//       }

//       const result = await response.json() as AzureAPIResponse;
      
//       if (result.NBest && result.NBest.length > 0) {
//         const bestResult = result.NBest[0];
//         const pronunciationScore = Math.round(bestResult.PronScore || 0);
        
//         let readerLevel = 'Beginner Reader';
//         if (pronunciationScore >= 55) readerLevel = 'Proficient Reader';
//         else if (pronunciationScore >= 30) readerLevel = 'Emerging Reader';

//         // Process full result
//         const processedResult: ProcessedResult = {
//           accuracyScore: Math.round(bestResult.AccuracyScore || 0),
//           fluencyScore: Math.round(bestResult.FluencyScore || 0),
//           completenessScore: Math.round(bestResult.CompletenessScore || 0),
//           pronunciationScore: pronunciationScore,
//           recognizedText: bestResult.Display || '',
//           words: bestResult.Words?.map(word => ({
//             word: word.Word,
//             accuracyScore: Math.round(word.AccuracyScore || 0),
//             errorType: word.ErrorType || 'None',
//           })) || [],
//         };

//         // Update recording with results
//         const updatedRecordings = recordings.map(r => 
//           r.id === recording.id 
//             ? { ...r, analyzed: true, result: processedResult, readerLevel }
//             : r
//         );
        
//         setRecordings(updatedRecordings);
//         await AsyncStorage.setItem('localRecordings', JSON.stringify(updatedRecordings));
        
//         // Expand the recording to show results
//         setExpandedId(recording.id);
        
//         Alert.alert('Success', `Analysis complete! Score: ${pronunciationScore}%`);
//       }
//     } catch (error) {
//       console.error('Error analyzing:', error);
//       Alert.alert('Error', 'Failed to analyze recording');
//     } finally {
//       setAnalyzingId(null);
//     }
//   };

//   const playRecording = async (recording: LocalRecording) => {
//     try {
//       if (playingId === recording.id) {
//         // Stop current playback
//         if (sound) {
//           await sound.stopAsync();
//           await sound.unloadAsync();
//           setSound(null);
//         }
//         setPlayingId(null);
//         return;
//       }

//       // Stop any existing playback
//       if (sound) {
//         await sound.stopAsync();
//         await sound.unloadAsync();
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: false,
//         playsInSilentModeIOS: true,
//       });

//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: recording.audioUri },
//         { shouldPlay: true }
//       );

//       setSound(newSound);
//       setPlayingId(recording.id);

//       newSound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           setPlayingId(null);
//         }
//       });
//     } catch (error) {
//       console.error('Error playing recording:', error);
//       Alert.alert('Error', 'Failed to play recording');
//     }
//   };

//   const deleteRecording = async (id: string) => {
//     Alert.alert(
//       'Delete Recording',
//       'Are you sure you want to delete this recording?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             const updated = recordings.filter(r => r.id !== id);
//             setRecordings(updated);
//             await AsyncStorage.setItem('localRecordings', JSON.stringify(updated));
//           }
//         }
//       ]
//     );
//   };

//   const formatDate = (timestamp: number) => {
//     const date = new Date(timestamp);
//     return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const getScoreColor = (score: number) => {
//     if (score >= 55) return '#4CAF50';
//     if (score >= 30) return '#FF9800';
//     return '#F44336';
//   };

//   const getLevelColor = (level: string) => {
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

//   const toggleExpanded = (id: string) => {
//     setExpandedId(expandedId === id ? null : id);
//   };

//   const renderRecording = ({ item }: { item: LocalRecording }) => {
//     const isExpanded = expandedId === item.id;

//     return (
//       <View style={styles.recordingCard}>
//         <View style={styles.recordingHeader}>
//           <View style={styles.recordingInfo}>
//             <Text style={styles.storyTitle}>{item.storyTitle}</Text>
//             <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
//           </View>
          
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => deleteRecording(item.id)}
//           >
//             <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
//           </TouchableOpacity>
//         </View>

//         {item.analyzed && item.result && (
//           <TouchableOpacity 
//             style={styles.resultBadge}
//             onPress={() => toggleExpanded(item.id)}
//           >
//             <View style={styles.resultBadgeContent}>
//               <Text style={styles.resultText}>
//                 Score: {item.result.pronunciationScore}% • {item.readerLevel}
//               </Text>
//               <MaterialCommunityIcons 
//                 name={isExpanded ? "chevron-up" : "chevron-down"} 
//                 size={20} 
//                 color="#4CAF50" 
//               />
//             </View>
//           </TouchableOpacity>
//         )}

//         {/* Expanded Analysis Results */}
//         {item.analyzed && item.result && isExpanded && (
//           <View style={styles.analysisContainer}>
//             <Text style={styles.analysisTitle}>Detailed Analysis</Text>

//             {/* Reader Level */}
//             <View style={styles.levelContainer}>
//               <Text style={styles.levelLabel}>Reader Level:</Text>
//               <Text style={[styles.levelText, { color: getLevelColor(item.readerLevel || '') }]}>
//                 {item.readerLevel}
//               </Text>
//             </View>

//             {/* Recognized Text */}
//             <View style={styles.recognizedTextContainer}>
//               <Text style={styles.sectionLabel}>What we heard:</Text>
//               <Text style={styles.recognizedText}>"{item.result.recognizedText}"</Text>
//             </View>

//             {/* Score Grid */}
//             <View style={styles.scoresGrid}>
//               <View style={styles.scoreItem}>
//                 <Text style={styles.scoreLabel}>Overall</Text>
//                 <Text style={[styles.scoreValue, { color: getScoreColor(item.result.pronunciationScore) }]}>
//                   {item.result.pronunciationScore}%
//                 </Text>
//               </View>
//               <View style={styles.scoreItem}>
//                 <Text style={styles.scoreLabel}>Accuracy</Text>
//                 <Text style={[styles.scoreValue, { color: getScoreColor(item.result.accuracyScore) }]}>
//                   {item.result.accuracyScore}%
//                 </Text>
//               </View>
//               <View style={styles.scoreItem}>
//                 <Text style={styles.scoreLabel}>Fluency</Text>
//                 <Text style={[styles.scoreValue, { color: getScoreColor(item.result.fluencyScore) }]}>
//                   {item.result.fluencyScore}%
//                 </Text>
//               </View>
//               <View style={styles.scoreItem}>
//                 <Text style={styles.scoreLabel}>Completeness</Text>
//                 <Text style={[styles.scoreValue, { color: getScoreColor(item.result.completenessScore) }]}>
//                   {item.result.completenessScore}%
//                 </Text>
//               </View>
//             </View>

//             {/* Word-by-Word Analysis */}
//             {item.result.words.length > 0 && (
//               <View style={styles.wordAnalysisContainer}>
//                 <Text style={styles.wordAnalysisTitle}>Word-by-Word Analysis</Text>
//                 <View style={styles.wordsList}>
//                   {item.result.words.map((word, index) => (
//                     <View key={index} style={styles.wordItem}>
//                       <Text style={styles.wordText}>{word.word}</Text>
//                       <View style={styles.wordScoreContainer}>
//                         <Text style={[styles.wordScore, { color: getScoreColor(word.accuracyScore) }]}>
//                           {word.accuracyScore}%
//                         </Text>
//                         {word.errorType !== 'None' && (
//                           <Text style={styles.errorType}>{word.errorType}</Text>
//                         )}
//                       </View>
//                     </View>
//                   ))}
//                 </View>
//               </View>
//             )}
//           </View>
//         )}

//         <View style={styles.actions}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.playButton]}
//             onPress={() => playRecording(item)}
//           >
//             <MaterialCommunityIcons 
//               name={playingId === item.id ? "stop" : "play"} 
//               size={20} 
//               color="#FFF" 
//             />
//             <Text style={styles.actionButtonText}>
//               {playingId === item.id ? 'Stop' : 'Play'}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.actionButton, 
//               styles.analyzeButton,
//               (!isOnline || analyzingId === item.id) && styles.disabledButton
//             ]}
//             onPress={() => analyzeRecording(item)}
//             disabled={!isOnline || analyzingId === item.id}
//           >
//             {analyzingId === item.id ? (
//               <>
//                 <ActivityIndicator color="#FFF" size="small" />
//                 <Text style={styles.actionButtonText}>Analyzing...</Text>
//               </>
//             ) : (
//               <>
//                 <MaterialCommunityIcons name="chart-line" size={20} color="#FFF" />
//                 <Text style={styles.actionButtonText}>
//                   {item.analyzed ? 'Re-analyze' : 'Analyze'}
//                 </Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#2196F3" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <MaterialCommunityIcons name="arrow-left" size={29} color="#000" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Recordings</Text>
//         <View style={styles.placeholder} />
//       </View>

//       {!isOnline && (
//         <View style={styles.offlineBanner}>
//           <MaterialCommunityIcons name="wifi-off" size={20} color="#FFF" />
//           <Text style={styles.offlineBannerText}>
//             Offline - Connect to analyze recordings
//           </Text>
//         </View>
//       )}

//       {recordings.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <MaterialCommunityIcons name="microphone-off" size={80} color="#CCC" />
//           <Text style={styles.emptyText}>No recordings yet</Text>
//           <Text style={styles.emptySubtext}>
//             Your recordings will appear here
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={recordings}
//           renderItem={renderRecording}
//           keyExtractor={item => item.id}
//           contentContainerStyle={styles.listContainer}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F5F5',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: height * 0.05,
//     paddingHorizontal: width * 0.05,
//     paddingBottom: height * 0.02,
//     backgroundColor: '#FFF',
//     elevation: 2,
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: scaleFontSize(20),
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   placeholder: {
//     width: 40,
//   },
//   offlineBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FF9800',
//     padding: height * 0.015,
//     gap: 8,
//   },
//   offlineBannerText: {
//     color: '#FFF',
//     fontSize: scaleFontSize(14),
//     fontWeight: '600',
//   },
//   listContainer: {
//     padding: width * 0.04,
//   },
//   recordingCard: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: width * 0.04,
//     marginBottom: height * 0.015,
//     elevation: 2,
//   },
//   recordingHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: height * 0.015,
//   },
//   recordingInfo: {
//     flex: 1,
//   },
//   storyTitle: {
//     fontSize: scaleFontSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 4,
//   },
//   timestamp: {
//     fontSize: scaleFontSize(12),
//     color: '#666',
//   },
//   deleteButton: {
//     padding: 4,
//   },
//   resultBadge: {
//     backgroundColor: '#E8F5E9',
//     padding: width * 0.025,
//     borderRadius: 8,
//     marginBottom: height * 0.015,
//   },
//   resultBadgeContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   resultText: {
//     fontSize: scaleFontSize(14),
//     color: '#4CAF50',
//     fontWeight: '600',
//   },
//   analysisContainer: {
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//     padding: width * 0.04,
//     marginBottom: height * 0.015,
//   },
//   analysisTitle: {
//     fontSize: scaleFontSize(16),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: height * 0.015,
//   },
//   levelContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#FFF',
//     padding: width * 0.03,
//     borderRadius: 8,
//     marginBottom: height * 0.015,
//   },
//   levelLabel: {
//     fontSize: scaleFontSize(14),
//     color: '#666',
//   },
//   levelText: {
//     fontSize: scaleFontSize(16),
//     fontWeight: 'bold',
//   },
//   recognizedTextContainer: {
//     backgroundColor: '#FFF',
//     padding: width * 0.03,
//     borderRadius: 8,
//     marginBottom: height * 0.015,
//   },
//   sectionLabel: {
//     fontSize: scaleFontSize(12),
//     color: '#666',
//     marginBottom: 6,
//     textTransform: 'uppercase',
//   },
//   recognizedText: {
//     fontSize: scaleFontSize(14),
//     color: '#333',
//     fontStyle: 'italic',
//   },
//   scoresGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     marginBottom: height * 0.015,
//   },
//   scoreItem: {
//     width: '48%',
//     backgroundColor: '#FFF',
//     padding: width * 0.03,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: height * 0.01,
//   },
//   scoreLabel: {
//     fontSize: scaleFontSize(11),
//     color: '#666',
//     marginBottom: 4,
//     textTransform: 'uppercase',
//   },
//   scoreValue: {
//     fontSize: scaleFontSize(20),
//     fontWeight: 'bold',
//   },
//   wordAnalysisContainer: {
//     backgroundColor: '#FFF',
//     padding: width * 0.03,
//     borderRadius: 8,
//   },
//   wordAnalysisTitle: {
//     fontSize: scaleFontSize(14),
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: height * 0.01,
//   },
//   wordsList: {
//     maxHeight: height * 0.25,
//   },
//   wordItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: height * 0.008,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   wordText: {
//     fontSize: scaleFontSize(14),
//     color: '#333',
//     flex: 1,
//   },
//   wordScoreContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   wordScore: {
//     fontSize: scaleFontSize(14),
//     fontWeight: 'bold',
//   },
//   errorType: {
//     fontSize: scaleFontSize(11),
//     color: '#F44336',
//     fontStyle: 'italic',
//   },
//   actions: {
//     flexDirection: 'row',
//     gap: width * 0.02,
//   },
//   actionButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: height * 0.015,
//     borderRadius: 8,
//     gap: 6,
//   },
//   playButton: {
//     backgroundColor: '#2196F3',
//   },
//   analyzeButton: {
//     backgroundColor: '#FF9800',
//   },
//   disabledButton: {
//     backgroundColor: '#CCC',
//   },
//   actionButtonText: {
//     color: '#FFF',
//     fontSize: scaleFontSize(14),
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: width * 0.1,
//   },
//   emptyText: {
//     fontSize: scaleFontSize(20),
//     fontWeight: 'bold',
//     color: '#999',
//     marginTop: height * 0.02,
//   },
//   emptySubtext: {
//     fontSize: scaleFontSize(14),
//     color: '#BBB',
//     marginTop: height * 0.01,
//     textAlign: 'center',
//   },
// });
// export default OfflineRecordingsScreen;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { decode as atob, encode as btoa } from 'base-64';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Azure API response types
type AzureWord = {
  Word: string;
  PronScore: number;
  AccuracyScore: number;
  ErrorType: string;
  Offset: number;
  Duration: number;
};

type AzureBestResult = {
  PronScore: number;
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  Display: string;
  Words?: AzureWord[];
};

type AzureAPIResponse = {
  NBest?: AzureBestResult[];
};

// Processed result type for storage
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
  }>;
};

type LocalRecording = {
  id: string;
  storyTitle: string;
  audioUri: string;
  timestamp: number;
  analyzed: boolean;
  result?: ProcessedResult;
  readerLevel?: string;
};

const { width, height } = Dimensions.get('window');
const scaleFontSize = (size: number) => (width / 375) * size;

const OfflineRecordingsScreen = () => {
  const router = useRouter();
  const [recordings, setRecordings] = useState<LocalRecording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Azure Speech Service Configuration
  const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh';
  const AZURE_REGION = 'eastus';
  const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;

  const STORY_DATA: Record<string, string> = {
    'Counting The Hours': "When men decided to divide the day into twenty four hours, they used numbers one through twelve two times. As a result, there was one oclock during the day and another one oclock after midnight.",
    'Telling Time': "Humans have used different objects to tell time. In the beginning, they used an hourglass. This is a cylindrical glass with a narrow center which allows sand to flow from its upper to its lower portion.",
    'Nose Bleeds': "Having a nosebleed is a common occurrence. Children experience epistaxis when blood flows out from either or both nostrils, often for a short period of time. It may be caused by ones behavior like frequent nose picking or blowing too hard when one has a cold."
  };

  useEffect(() => {
    loadRecordings();

    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadRecordings = async () => {
    try {
      const data = await AsyncStorage.getItem('localRecordings');
      if (data) {
        const parsed = JSON.parse(data);
        setRecordings(parsed.reverse()); // Show newest first
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertAudioToBase64 = async (uri: string): Promise<string> => {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });
    return base64;
  };

  const analyzeRecording = async (recording: LocalRecording) => {
    if (!isOnline) {
      Alert.alert('Offline', 'Analysis requires internet connection');
      return;
    }

    setAnalyzingId(recording.id);

    try {
      const audioBase64 = await convertAudioToBase64(recording.audioUri);
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const referenceText = STORY_DATA[recording.storyTitle] || '';
      
      const pronunciationConfig = {
        ReferenceText: referenceText,
        GradingSystem: 'HundredMark',
        Granularity: 'Word',
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
        throw new Error(`API Error ${response.status}`);
      }

      const result = await response.json() as AzureAPIResponse;
      
      if (result.NBest && result.NBest.length > 0) {
        const bestResult = result.NBest[0];
        const pronunciationScore = Math.round(bestResult.PronScore || 0);
        
        let readerLevel = 'Beginner Reader';
        if (pronunciationScore >= 55) readerLevel = 'Proficient Reader';
        else if (pronunciationScore >= 30) readerLevel = 'Emerging Reader';

        // Process full result
        const processedResult: ProcessedResult = {
          accuracyScore: Math.round(bestResult.AccuracyScore || 0),
          fluencyScore: Math.round(bestResult.FluencyScore || 0),
          completenessScore: Math.round(bestResult.CompletenessScore || 0),
          pronunciationScore: pronunciationScore,
          recognizedText: bestResult.Display || '',
          words: bestResult.Words?.map(word => ({
            word: word.Word,
            accuracyScore: Math.round(word.AccuracyScore || 0),
            errorType: word.ErrorType || 'None',
          })) || [],
        };

        // Update recording with results
        const updatedRecordings = recordings.map(r => 
          r.id === recording.id 
            ? { ...r, analyzed: true, result: processedResult, readerLevel }
            : r
        );
        
        setRecordings(updatedRecordings);
        await AsyncStorage.setItem('localRecordings', JSON.stringify(updatedRecordings));
        
        // Expand the recording to show results
        setExpandedId(recording.id);
        
        Alert.alert('Success', `Analysis complete! Score: ${pronunciationScore}%`);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      Alert.alert('Error', 'Failed to analyze recording');
    } finally {
      setAnalyzingId(null);
    }
  };

  const playRecording = async (recording: LocalRecording) => {
    try {
      if (playingId === recording.id) {
        // Stop current playback
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
          setSound(null);
        }
        setPlayingId(null);
        return;
      }

      // Stop any existing playback
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recording.audioUri },
        { shouldPlay: true }
      );

      setSound(newSound);
      setPlayingId(recording.id);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const deleteRecording = async (id: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = recordings.filter(r => r.id !== id);
            setRecordings(updated);
            await AsyncStorage.setItem('localRecordings', JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getScoreColor = (score: number) => {
    if (score >= 55) return '#4CAF50';
    if (score >= 30) return '#FF9800';
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

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderRecording = ({ item }: { item: LocalRecording }) => {
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.recordingCard}>
        <View style={styles.recordingHeader}>
          <View style={styles.recordingInfo}>
            <Text style={styles.storyTitle}>{item.storyTitle}</Text>
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteRecording(item.id)}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        {item.analyzed && item.result && (
          <TouchableOpacity 
            style={styles.resultBadge}
            onPress={() => toggleExpanded(item.id)}
          >
            <View style={styles.resultBadgeContent}>
              <Text style={styles.resultText}>
                Score: {item.result.pronunciationScore}% • {item.readerLevel}
              </Text>
              <MaterialCommunityIcons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#4CAF50" 
              />
            </View>
          </TouchableOpacity>
        )}

        {/* Expanded Analysis Results */}
        {item.analyzed && item.result && isExpanded && (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>Detailed Analysis</Text>

            {/* Reader Level */}
            <View style={styles.levelContainer}>
              <Text style={styles.levelLabel}>Reader Level:</Text>
              <Text style={[styles.levelText, { color: getLevelColor(item.readerLevel || '') }]}>
                {item.readerLevel}
              </Text>
            </View>

            {/* Recognized Text */}
            <View style={styles.recognizedTextContainer}>
              <Text style={styles.sectionLabel}>What we heard:</Text>
              <Text style={styles.recognizedText}>"{item.result.recognizedText}"</Text>
            </View>

            {/* Score Grid */}
            <View style={styles.scoresGrid}>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Overall</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.result.pronunciationScore) }]}>
                  {item.result.pronunciationScore}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Accuracy</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.result.accuracyScore) }]}>
                  {item.result.accuracyScore}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Fluency</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.result.fluencyScore) }]}>
                  {item.result.fluencyScore}%
                </Text>
              </View>
              <View style={styles.scoreItem}>
                <Text style={styles.scoreLabel}>Completeness</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(item.result.completenessScore) }]}>
                  {item.result.completenessScore}%
                </Text>
              </View>
            </View>

            {/* Word-by-Word Analysis */}
            {item.result.words.length > 0 && (
              <View style={styles.wordAnalysisContainer}>
                <Text style={styles.wordAnalysisTitle}>
                  Word-by-Word Analysis ({item.result.words.length} words)
                </Text>
                <ScrollView 
                  style={styles.wordsList}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {item.result.words.map((word, index) => (
                    <View key={index} style={styles.wordItem}>
                      <Text style={styles.wordText}>{word.word}</Text>
                      <View style={styles.wordScoreContainer}>
                        <Text style={[styles.wordScore, { color: getScoreColor(word.accuracyScore) }]}>
                          {word.accuracyScore}%
                        </Text>
                        {word.errorType !== 'None' && (
                          <Text style={styles.errorType}>{word.errorType}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.playButton]}
            onPress={() => playRecording(item)}
          >
            <MaterialCommunityIcons 
              name={playingId === item.id ? "stop" : "play"} 
              size={20} 
              color="#FFF" 
            />
            <Text style={styles.actionButtonText}>
              {playingId === item.id ? 'Stop' : 'Play'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton, 
              styles.analyzeButton,
              (!isOnline || analyzingId === item.id) && styles.disabledButton
            ]}
            onPress={() => analyzeRecording(item)}
            disabled={!isOnline || analyzingId === item.id}
          >
            {analyzingId === item.id ? (
              <>
                <ActivityIndicator color="#FFF" size="small" />
                <Text style={styles.actionButtonText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="chart-line" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>
                  {item.analyzed ? 'Re-analyze' : 'Analyze'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={29} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Recordings</Text>
        <View style={styles.placeholder} />
      </View>

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <MaterialCommunityIcons name="wifi-off" size={20} color="#FFF" />
          <Text style={styles.offlineBannerText}>
            Offline - Connect to analyze recordings
          </Text>
        </View>
      )}

      {recordings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="microphone-off" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No recordings yet</Text>
          <Text style={styles.emptySubtext}>
            Your recordings will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recordings}
          renderItem={renderRecording}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.05,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    padding: height * 0.015,
    gap: 8,
  },
  offlineBannerText: {
    color: '#FFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  listContainer: {
    padding: width * 0.04,
  },
  recordingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    elevation: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 0.015,
  },
  recordingInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: scaleFontSize(12),
    color: '#666',
  },
  deleteButton: {
    padding: 4,
  },
  resultBadge: {
    backgroundColor: '#E8F5E9',
    padding: width * 0.025,
    borderRadius: 8,
    marginBottom: height * 0.015,
  },
  resultBadgeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultText: {
    fontSize: scaleFontSize(14),
    color: '#4CAF50',
    fontWeight: '600',
  },
  analysisContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.015,
  },
  analysisTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.015,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: width * 0.03,
    borderRadius: 8,
    marginBottom: height * 0.015,
  },
  levelLabel: {
    fontSize: scaleFontSize(14),
    color: '#666',
  },
  levelText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
  },
  recognizedTextContainer: {
    backgroundColor: '#FFF',
    padding: width * 0.03,
    borderRadius: 8,
    marginBottom: height * 0.015,
  },
  sectionLabel: {
    fontSize: scaleFontSize(12),
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  recognizedText: {
    fontSize: scaleFontSize(14),
    color: '#333',
    fontStyle: 'italic',
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: height * 0.015,
  },
  scoreItem: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: width * 0.03,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  scoreLabel: {
    fontSize: scaleFontSize(11),
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
  },
  wordAnalysisContainer: {
    backgroundColor: '#FFF',
    padding: width * 0.03,
    borderRadius: 8,
    marginBottom: height * 0.01,
  },
  wordAnalysisTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: height * 0.01,
  },
  wordsList: {
    maxHeight: height * 0.2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: width * 0.02,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.008,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  wordText: {
    fontSize: scaleFontSize(14),
    color: '#333',
    flex: 1,
  },
  wordScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordScore: {
    fontSize: scaleFontSize(14),
    fontWeight: 'bold',
  },
  errorType: {
    fontSize: scaleFontSize(11),
    color: '#F44336',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: width * 0.02,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: height * 0.015,
    borderRadius: 8,
    gap: 6,
  },
  playButton: {
    backgroundColor: '#2196F3',
  },
  analyzeButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.1,
  },
  emptyText: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: '#999',
    marginTop: height * 0.02,
  },
  emptySubtext: {
    fontSize: scaleFontSize(14),
    color: '#BBB',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
});
export default OfflineRecordingsScreen;