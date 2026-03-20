import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive sizing helpers
const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const responsiveFontSize = (base: number) => {
  if (isSmallScreen) return base - 2;
  if (isMediumScreen) return base;
  return base + 2;
};

type DictionaryData = {
  word: string;
  phonetic: string;
  phonetics: Array<{ text?: string; audio?: string }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{ definition: string; example?: string }>;
  }>;
};

export default function VocabularySupport() {
  const { title, passage } = useLocalSearchParams<{ title: string; passage: string }>();
  const router = useRouter();

  const storyTitle = title ? decodeURIComponent(String(title)) : "Story";
  const storyText = passage ? decodeURIComponent(String(passage)) : "";

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [showPopup, setShowPopup] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(null);
  const [filipinoTranslation, setFilipinoTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isReading, setIsReading] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const words = storyText.split(" ");

  // Read text aloud
  const toggleReadText = async () => {
    if (isReading) {
      // Stop reading
      Speech.stop();
      setIsReading(false);
    } else {
      // Start reading
      setIsReading(true);
      const voiceOptions = {
        language: 'en-US',
        pitch: voiceGender === 'female' ? 1.2 : 0.8,
        rate: 0.9,
        onDone: () => setIsReading(false),
        onStopped: () => setIsReading(false),
        onError: () => {
          setIsReading(false);
          Alert.alert("Error", "Failed to read text");
        },
      };

      Speech.speak(storyText, voiceOptions);
    }
  };

  // Fetch dictionary data
  const fetchDictionaryData = async (word: string) => {
    setLoading(true);
    console.log('🔍 Fetching data for word:', word);
    
    try {
      // Fetch English definition
      const dictResponse = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );
      
      console.log('📖 Dictionary response status:', dictResponse.status);
      
      if (dictResponse.ok) {
        const dictData: any = await dictResponse.json();
        console.log('📖 Dictionary data:', JSON.stringify(dictData[0], null, 2));
        setDictionaryData(dictData[0]);
      } else {
        console.log('❌ Dictionary API failed');
        setDictionaryData(null);
      }

      // Fetch Filipino translation
      const translationResponse = await fetch(
        `https://api.mymemory.translated.net/get?q=${word}&langpair=en|fil`
      );
      
      console.log('🌏 Translation response status:', translationResponse.status);
      
      if (translationResponse.ok) {
        const translationData: any = await translationResponse.json();
        console.log('🌏 Translation data:', translationData);
        const translation = translationData?.responseData?.translatedText || "Walang salin";
        console.log('🌏 Final translation:', translation);
        setFilipinoTranslation(translation);
      } else {
        console.log('❌ Translation API failed');
        setFilipinoTranslation("Walang salin");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setDictionaryData(null);
      setFilipinoTranslation("Walang salin");
    } finally {
      setLoading(false);
    }
  };

  // Play pronunciation audio with TTS fallback
  const playPronunciation = async () => {
    if (!dictionaryData || !selectedWord) return;

    // Try to use API audio first
    const audioUrl = dictionaryData.phonetics.find((p) => p.audio)?.audio;
    
    if (audioUrl) {
      try {
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            newSound.unloadAsync();
          }
        });
        return;
      } catch (error) {
        console.error("Error playing API audio:", error);
      }
    }

    // Fallback to Text-to-Speech with gender selection
    try {
      const voiceOptions = {
        language: 'en-US',
        pitch: voiceGender === 'female' ? 1.2 : 0.8,
        rate: 0.9,
      };

      Speech.speak(selectedWord, voiceOptions);
    } catch (error) {
      console.error("Error with TTS:", error);
      Alert.alert("Error", "Failed to play pronunciation");
    }
  };

  // Handle word press with long press detection
  const handleWordPress = async (word: string, index: number) => {
    if (showPopup) return; // Prevent selecting while popup is open

    const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setHighlightedWordIndex(index);
    setShowPopup(true);

    // Animate popup slide up
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT * 0.25, // Start higher for more content visibility
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    // Fetch data after showing popup
    await fetchDictionaryData(cleanWord);
  };

  // Close popup
  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowPopup(false);
      setSelectedWord(null);
      setHighlightedWordIndex(-1);
      setDictionaryData(null);
      setFilipinoTranslation("");
    });
  };

  // Pan responder for dragging down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(SCREEN_HEIGHT * 0.25 + gestureState.dy); // Match the opening position
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closePopup();
        } else {
          Animated.spring(slideAnim, {
            toValue: SCREEN_HEIGHT * 0.25, // Match the opening position
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!storyText) {
    return (
      <View style={styles.container}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>No story content available</Text>
          <Text style={styles.errorText}>Title: {storyTitle}</Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={29} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
          style={styles.settingsButton}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Settings Dropdown with Overlay */}
      {showSettings && (
        <>
          {/* Invisible overlay to detect outside taps */}
          <TouchableOpacity
            style={styles.settingsOverlay}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          />
          <View style={styles.settingsDropdown}>
            <Text style={styles.settingsTitle}>Settings</Text>
            
            {/* Text Settings */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>Text Settings</Text>
              <View style={styles.fontSizeControl}>
                <Text style={styles.fontLabel}>Font Size: {fontSize}px</Text>
                <View style={styles.fontButtons}>
                  <TouchableOpacity
                    onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                    style={styles.fontBtn}
                  >
                    <Text style={styles.fontBtnText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFontSize(Math.min(32, fontSize + 2))}
                    style={styles.fontBtn}
                  >
                    <Text style={styles.fontBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Voice Settings */}
            <View style={styles.settingSection}>
              <Text style={styles.sectionTitle}>Voice Settings</Text>
              <View style={styles.voiceOptions}>
                <TouchableOpacity
                  style={[
                    styles.voiceBtn,
                    voiceGender === 'male' && styles.voiceBtnActive
                  ]}
                  onPress={() => setVoiceGender('male')}
                >
                  <MaterialCommunityIcons 
                    name="face-man" 
                    size={20} 
                    color={voiceGender === 'male' ? '#FFF' : '#315E34'} 
                  />
                  <Text style={[
                    styles.voiceBtnText,
                    voiceGender === 'male' && styles.voiceBtnTextActive
                  ]}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.voiceBtn,
                    voiceGender === 'female' && styles.voiceBtnActive
                  ]}
                  onPress={() => setVoiceGender('female')}
                >
                  <MaterialCommunityIcons 
                    name="face-woman" 
                    size={20} 
                    color={voiceGender === 'female' ? '#FFF' : '#315E34'} 
                  />
                  <Text style={[
                    styles.voiceBtnText,
                    voiceGender === 'female' && styles.voiceBtnTextActive
                  ]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Story Passage */}
      <ScrollView
        style={styles.passageContainer}
        contentContainerStyle={styles.passageContent}
      >
        <Text style={[styles.passage, { fontSize }]}>
          {words.map((word, index) => (
            <Text
              key={index}
              onPress={() => handleWordPress(word, index)}
              style={[
                styles.word,
                highlightedWordIndex === index && styles.highlightedWord,
              ]}
            >
              {word}{" "}
            </Text>
          ))}
        </Text>
      </ScrollView>

      {/* Read/Stop Button */}
      <View style={styles.readButtonContainer}>
        <TouchableOpacity
          style={[
            styles.readButton,
            isReading && styles.readButtonActive
          ]}
          onPress={toggleReadText}
          activeOpacity={0.8}
        >
          <Text style={styles.readButtonText}>
            {isReading ? "Stop" : "Read"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Popup Modal */}
      {showPopup && (
        <Modal transparent visible={showPopup} animationType="none">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closePopup}
          >
            <Animated.View
              style={[styles.popupContainer, { top: slideAnim }]}
              {...panResponder.panHandlers}
            >
              {/* Background Gradient Effect */}
              <View style={styles.gradientBackground} />
              
              <TouchableOpacity activeOpacity={1} style={styles.popupContent}>
                {/* Handle Bar */}
                <View style={styles.handleBar} />

                <ScrollView
                  style={styles.popupScroll}
                  contentContainerStyle={styles.popupScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Title */}
                  <Text style={styles.popupTitle}>Definitions</Text>

                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#94D231" />
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  ) : dictionaryData ? (
                    <>
                      {/* Word Card */}
                      <View style={styles.wordCard}>
                        <View style={styles.wordInfo}>
                          <Text style={styles.wordText}>
                            {selectedWord?.toUpperCase()}
                          </Text>
                          <Text style={styles.phoneticText}>
                            {dictionaryData.phonetic || 
                             dictionaryData.phonetics?.[0]?.text || 
                             "No pronunciation"}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.soundButton}
                          onPress={playPronunciation}
                        >
                          <MaterialCommunityIcons
                            name="volume-high"
                            size={24}
                            color="#28242C"
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Part of Speech */}
                      {dictionaryData.meanings?.[0]?.partOfSpeech && (
                        <Text style={styles.partOfSpeech}>
                          {dictionaryData.meanings[0].partOfSpeech}
                        </Text>
                      )}

                      {/* Definition */}
                      {dictionaryData.meanings?.[0]?.definitions?.[0]?.definition && (
                        <Text style={styles.definition}>
                          {dictionaryData.meanings[0].definitions[0].definition}
                        </Text>
                      )}

                      {/* Example (if available) */}
                      {dictionaryData.meanings?.[0]?.definitions?.[0]?.example && (
                        <View style={styles.exampleContainer}>
                          <Text style={styles.exampleLabel}>Example:</Text>
                          <Text style={styles.exampleText}>
                            "{dictionaryData.meanings[0].definitions[0].example}"
                          </Text>
                        </View>
                      )}

                      {/* Filipino Translation */}
                      <Text style={styles.kahuluganTitle}>Kahulugan</Text>
                      <Text style={styles.kahuluganText}>
                        {filipinoTranslation || "Loading translation..."}
                      </Text>
                    </>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>
                        No definition found for "{selectedWord}"
                      </Text>
                      <Text style={styles.noDataSubtext}>
                        Try selecting another word
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: isSmallScreen ? 35 : 38,
    paddingHorizontal: isSmallScreen ? 16 : 22,
    paddingBottom: isSmallScreen ? 15 : 20,
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  settingsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  settingsDropdown: {
    position: "absolute",
    top: isSmallScreen ? 75 : 80,
    right: isSmallScreen ? 16 : 22,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
    minWidth: isSmallScreen ? 180 : 200,
    maxWidth: SCREEN_WIDTH - (isSmallScreen ? 32 : 44),
  },
  settingsTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "700",
    marginBottom: isSmallScreen ? 12 : 16,
    color: "#315E34",
  },
  settingSection: {
    marginBottom: isSmallScreen ? 16 : 20,
  },
  sectionTitle: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    marginBottom: isSmallScreen ? 10 : 12,
    color: "#315E34",
  },
  fontSizeControl: {
    gap: 8,
  },
  fontLabel: {
    fontSize: 14,
    color: "#666",
  },
  fontButtons: {
    flexDirection: "row",
    gap: 12,
  },
  fontBtn: {
    backgroundColor: "#315E34",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  fontBtnText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  passageContainer: {
    flex: 1,
    marginHorizontal: isSmallScreen ? 16 : 22,
    marginTop: 10,
  },
  passageContent: {
    paddingBottom: isSmallScreen ? 100 : 120,
  },
  passage: {
    fontFamily: "Poppins",
    fontWeight: "500",
    lineHeight: isSmallScreen ? 28 : 32,
    letterSpacing: 0.2,
    color: "#28242CCC",
  },
  word: {
    color: "#28242C",
  },
  highlightedWord: {
    backgroundColor: "#F8CB5E5C",
    borderWidth: 1,
    borderColor: "#F8CB5E",
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  readButtonContainer: {
    position: "absolute",
    bottom: isSmallScreen ? 30 : 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  readButton: {
    width: isSmallScreen ? 110 : 132,
    height: isSmallScreen ? 50 : 57,
    backgroundColor: "#94D231",
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  readButtonActive: {
    backgroundColor: "#E62A2A",
  },
  readButtonText: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(20),
    fontWeight: "700",
    color: "#FFF",
    lineHeight: responsiveFontSize(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0)",
  },
  popupContainer: {
    position: "absolute",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    borderTopLeftRadius: isSmallScreen ? 40 : 60,
    borderTopRightRadius: isSmallScreen ? 40 : 60,
    paddingTop: 20,
    overflow: "hidden",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#315E34",
    zIndex: 0,
  },
  popupContent: {
    flex: 1,
    zIndex: 1,
  },
  handleBar: {
    width: isSmallScreen ? 60 : 75,
    height: isSmallScreen ? 6 : 8,
    backgroundColor: "#94D231",
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: isSmallScreen ? 15 : 20,
    zIndex: 2,
  },
  popupScroll: {
    flex: 1,
    paddingHorizontal: isSmallScreen ? 20 : 29,
    zIndex: 2,
  },
  popupScrollContent: {
    paddingBottom: isSmallScreen ? 60 : 80,
  },
  popupTitle: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(20),
    fontWeight: "500",
    color: "#FFF",
    marginBottom: isSmallScreen ? 20 : 26,
    zIndex: 3,
  },
  wordCard: {
    backgroundColor: "#94D231",
    borderRadius: isSmallScreen ? 12 : 15,
    padding: isSmallScreen ? 12 : 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: isSmallScreen ? 16 : 20,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(24),
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 4,
    flexShrink: 1,
  },
  phoneticText: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(16),
    fontWeight: "500",
    color: "#FFF",
    flexShrink: 1,
  },
  soundButton: {
    width: isSmallScreen ? 44 : 49,
    height: isSmallScreen ? 44 : 49,
    backgroundColor: "#FFCD6F",
    borderRadius: isSmallScreen ? 22 : 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 8,
  },
  partOfSpeech: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(20),
    fontWeight: "500",
    color: "#FFF",
    marginBottom: 8,
  },
  definition: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(14),
    fontWeight: "400",
    color: "#FFF",
    lineHeight: responsiveFontSize(20),
    marginBottom: isSmallScreen ? 16 : 20,
  },
  kahuluganTitle: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(20),
    fontWeight: "500",
    color: "#FFF",
    marginBottom: 8,
    marginTop: isSmallScreen ? 12 : 16,
  },
  kahuluganText: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(16),
    fontWeight: "400",
    color: "#FFF",
    marginBottom: isSmallScreen ? 20 : 30,
  },
  errorCard: {
    backgroundColor: "#FFF",
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#666",
  },
  backBtn: {
    backgroundColor: "#2196F3",
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  backBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noDataContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: isSmallScreen ? 40 : 50,
    paddingHorizontal: 20,
  },
  noDataText: {
    color: "#FFF",
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  noDataSubtext: {
    color: "#FFF",
    fontSize: responsiveFontSize(14),
    opacity: 0.7,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: isSmallScreen ? 40 : 50,
  },
  loadingText: {
    color: "#FFF",
    fontSize: responsiveFontSize(16),
    marginTop: 12,
  },
  exampleContainer: {
    marginTop: isSmallScreen ? 8 : 12,
    marginBottom: isSmallScreen ? 16 : 20,
  },
  exampleLabel: {
    color: "#94D231",
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    marginBottom: 4,
  },
  exampleText: {
    color: "#FFF",
    fontSize: responsiveFontSize(14),
    fontStyle: "italic",
    lineHeight: responsiveFontSize(20),
  },
  voiceOptions: {
    flexDirection: "column",
    gap: 10,
  },
  voiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E8F5E9",
    gap: 8,
  },
  voiceBtnActive: {
    backgroundColor: "#315E34",
    borderColor: "#94D231",
  },
  voiceBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#315E34",
  },
  voiceBtnTextActive: {
    color: "#FFF",
  },
});