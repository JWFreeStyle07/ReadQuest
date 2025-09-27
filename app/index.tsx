import { Picker } from '@react-native-picker/picker';
import { decode as atob, encode as btoa } from 'base-64';
import { Audio, } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { referenceTexts } from './algorithm/referenceTexts';

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
    phonemes: Array<{
      phoneme: string;
      accuracyScore: number;
    }>;
  }>;
};

const ExpoPronunciationApp = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [pronunciationResult, setPronunciationResult] = useState<ProcessedResult | null>(null);
  const [readerLevel, setReaderLevel] = useState('');
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Azure Speech Service Configuration
  const AZURE_SPEECH_KEY = '5R5LOhC456Vc4inIg3GSEkwXh6xnUt7aLJ8rcaGny1kfuBXc0Yq7JQQJ99BIACYeBjFXJ3w3AAAYACOGCbMh'; // Replace with your key
  const AZURE_REGION = 'eastus'; // e.g., 'eastus'
  //const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US&format=detailed`;
  const AZURE_ENDPOINT = `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`;
  const url = `${AZURE_ENDPOINT}?language=en-US&format=detailed&profanity=raw`;

  // Reference text for pronunciation assessment
  const REFERENCE_TEXT = referenceTexts[selectedIndex].text;

  // Request audio permissions
  useEffect(() => {
    if (permissionResponse?.status !== 'granted') {
      requestPermission();
    }
  }, []);

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
      Alert.alert('Error', 'Failed to stop recording' + message);
    }
  };

  // ✅ Helper: Convert base64 → Uint8Array
    function base64ToBytes(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
    }

  

  // Convert audio file to base64 for API
  const convertAudioToBase64 = async (uri: string): Promise<string> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return base64;
    } catch (error : unknown) {
      console.error('Error converting audio to base64:', error);
      throw error;
    }
  };

  // ✅ Read audio file as raw bytes (works with expo-file-system legacy)
const getAudioBytes = async (uri: string): Promise<Uint8Array> => {
  try {
    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 -> Uint8Array
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  } catch (error) {
    console.error("Error reading audio bytes:", error);
    throw error;
  }
};


  // Analyze pronunciation using Azure Speech API
  const analyzePronunciation = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio recorded');
      return;
    }

    setIsAnalyzing(true);
    setPronunciationResult(null);

    try {
      // Convert audio to base64
      const audioBase64 = await convertAudioToBase64(audioUri);
      const audioBytes = base64ToBytes(audioBase64);
      


      // Convert base64 to binary
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Pronunciation assessment configuration
      const pronunciationConfig = {
        ReferenceText: REFERENCE_TEXT,
        GradingSystem: "HundredMark",
        Granularity: "Phoneme",
        Dimension: "Comprehensive"
      };

      // Azure API headers
      const headers = {
        'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
        'Content-Type': 'audio/mp4',
        'Accept': 'application/json',
        'Pronunciation-Assessment': btoa(JSON.stringify(pronunciationConfig)),
      };

      // API call
      const url = `${AZURE_ENDPOINT}?language=en-US&format=detailed`;

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: audioBytes as any,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Azure Response:', JSON.stringify(result, null, 2));

      // Process results
      processPronunciationResult(result);

    } catch (error) {
      console.error('Error analyzing pronunciation:', error);
      Alert.alert('Error', 'Failed to analyze pronunciation. Please check your Azure credentials and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Process pronunciation assessment results
  const processPronunciationResult = (result: any) => {
    if (result.NBest && result.NBest.length > 0) {
      const bestResult = result.NBest[0];

      const processedResult = {
        accuracyScore: Math.round(bestResult.AccuracyScore || 0),
        fluencyScore: Math.round(bestResult.FluencyScore || 0),
        completenessScore: Math.round(bestResult.CompletenessScore || 0),
        pronunciationScore: Math.round(bestResult.PronScore || 0),
        recognizedText: bestResult.Display || '',
        words: bestResult.Words?.map((word: any) => ({
          word: word.Word,
          accuracyScore: Math.round(word.AccuracyScore || 0),
          errorType: word.ErrorType || 'None',
          phonemes: word.Phonemes?.map((phoneme: any) => ({
            phoneme: phoneme.Phoneme,
            accuracyScore: Math.round(phoneme.AccuracyScore || 0)
          })) || []
        })) || []
      };

      console.log("Processed Result:", processedResult);
      setPronunciationResult(processedResult);
      determineReaderLevel(processedResult.pronunciationScore);
    } else {
      Alert.alert('No Results', 'Could not analyze pronunciation. Try speaking more clearly.');
    }
  };

  // Determine reader level based on score
  const determineReaderLevel = (score : any) => {
    if (score >= 80) {
      setReaderLevel('Proficient Reader');
    } else if (score >= 60) {
      setReaderLevel('Emerging Reader');
    } else {
      setReaderLevel('Beginner Reader');
    }
  };

  // Helper functions for styling
  const getScoreColor = (score : any) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getLevelColor = (level : any) => {
    switch (level) {
      case 'Proficient Reader': return '#4CAF50';
      case 'Emerging Reader': return '#FF9800';
      case 'Beginner Reader': return '#F44336';
      default: return '#666';
    }
  };

  // Show permission request if needed
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Assessment</Text>
        <Text style={styles.subtitle}>Read the text below clearly:</Text>
      </View>

      {/* ✅ NEW: Passage Picker */}
      <View style={{ marginHorizontal: 20, marginTop: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Select Passage:
        </Text>
        <Picker
          selectedValue={selectedIndex}
          onValueChange={(itemValue) => setSelectedIndex(itemValue)}
        >
          {referenceTexts.map((item, idx) => (
            <Picker.Item key={idx} label={item.title} value={idx} />
          ))}
      </Picker>
      </View>

      <View style={styles.textContainer}>
        {/* ✅ This now shows whichever passage is selected */}
        <Text style={styles.referenceText}>{REFERENCE_TEXT}</Text>
      </View>

      <View style={styles.controlsContainer}>
        {!isRecording ? (
          <TouchableOpacity 
            style={[styles.button, styles.recordButton]} 
            onPress={startRecording}
          >
            <Text style={styles.buttonText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={stopRecording}
          >
            <Text style={styles.buttonText}>⏹️ Stop Recording</Text>
          </TouchableOpacity>
        )}

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
      </View>

      {/* Setup Instructions */}
      {!AZURE_SPEECH_KEY.includes('YOUR_') ? null : (
        <View style={styles.setupContainer}>
          <Text style={styles.setupTitle}>⚠️ Setup Required</Text>
          <Text style={styles.setupText}>
            Please replace AZURE_SPEECH_KEY and AZURE_REGION in the code with your Azure credentials.
          </Text>
        </View>
      )}

      {pronunciationResult && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Assessment Results</Text>
          
          {/* Reader Level */}
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Reader Level:</Text>
            <Text style={[styles.levelText, { color: getLevelColor(readerLevel) }]}>
              {readerLevel}
            </Text>
          </View>

          {/* Recognized Text */}
          <View style={styles.recognizedTextContainer}>
            <Text style={styles.label}>What we heard:</Text>
            <Text style={styles.recognizedText}>"{pronunciationResult.recognizedText}"</Text>
          </View>

          {/* Overall Scores */}
          <View style={styles.scoresGrid}>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Overall</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.pronunciationScore) }]}>
                {pronunciationResult.pronunciationScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Accuracy</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.accuracyScore) }]}>
                {pronunciationResult.accuracyScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Fluency</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.fluencyScore) }]}>
                {pronunciationResult.fluencyScore}%
              </Text>
            </View>
            <View style={styles.scoreItem}>
              <Text style={styles.scoreLabel}>Completeness</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(pronunciationResult.completenessScore) }]}>
                {pronunciationResult.completenessScore}%
              </Text>
            </View>
          </View>

          {/* Word Analysis */}
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
    textAlign: 'center',
    color: '#333',
    lineHeight: 26,
    fontWeight: '500',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setupContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  setupText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
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