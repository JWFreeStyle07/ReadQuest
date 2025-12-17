import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from 'expo-speech';
import React, { useRef, useState } from "react";
import {
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
import { getWordDefinition, hasDefinition } from '../offline/vocabBucket';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const isSmallScreen = SCREEN_WIDTH < 375;
const isMediumScreen = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
const responsiveFontSize = (base: number) => {
  if (isSmallScreen) return base - 2;
  if (isMediumScreen) return base;
  return base + 2;
};

const STORY_DATA: Record<string, { title: string; passage: string }> = {
  'Counting The Hours': {
    title: 'Counting The Hours',
    passage: "When men decided to divide the day into twenty four hours, they used numbers one through twelve two times. As a result, there was one oclock during the day and another one oclock after midnight."
  },
  'Telling Time': {
    title: 'Telling Time',
    passage: "Humans have used different objects to tell time. In the beginning, they used an hourglass. This is a cylindrical glass with a narrow center which allows sand to flow from its upper to its lower portion."
  },
  'Nose Bleeds': {
    title: 'Nose Bleeds',
    passage: "Having a nosebleed is a common occurrence. Children experience epistaxis when blood flows out from either or both nostrils, often for a short period of time. It may be caused by ones behavior like frequent nose picking or blowing too hard when one has a cold."
  }
};

export default function OfflineVocabularySupport() {
  const params = useLocalSearchParams<{ title?: string; passage?: string }>();
  const router = useRouter();

  let storyTitle = "Story";
  let storyText = "";

  if (params.title) {
    const decodedTitle = decodeURIComponent(String(params.title));
    storyTitle = decodedTitle;
    
    if (params.passage) {
      storyText = decodeURIComponent(String(params.passage));
    } else if (STORY_DATA[decodedTitle]) {
      storyText = STORY_DATA[decodedTitle].passage;
    }
  }

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordData, setWordData] = useState<any>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const [showPopup, setShowPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('female');
  const [isReading, setIsReading] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const words = storyText.split(" ");

  const toggleReadText = async () => {
    if (isReading) {
      Speech.stop();
      setIsReading(false);
    } else {
      setIsReading(true);
      const voiceOptions = {
        language: 'en-US',
        pitch: voiceGender === 'female' ? 1.2 : 0.8,
        rate: 0.9,
        onDone: () => setIsReading(false),
        onStopped: () => setIsReading(false),
        onError: () => {
          setIsReading(false);
        },
      };

      Speech.speak(storyText, voiceOptions);
    }
  };

  const playPronunciation = () => {
    if (!selectedWord) return;

    try {
      const voiceOptions = {
        language: 'en-US',
        pitch: voiceGender === 'female' ? 1.2 : 0.8,
        rate: 0.9,
      };

      Speech.speak(selectedWord, voiceOptions);
    } catch (error) {
      console.error("Error with TTS:", error);
    }
  };

  const handleWordPress = (word: string, index: number) => {
    if (showPopup) return;

    const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!cleanWord) return;

    const definition = getWordDefinition(cleanWord);
    
    setSelectedWord(cleanWord);
    setWordData(definition);
    setHighlightedWordIndex(index);
    setShowPopup(true);

    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT * 0.35,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closePopup = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowPopup(false);
      setSelectedWord(null);
      setWordData(null);
      setHighlightedWordIndex(-1);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(SCREEN_HEIGHT * 0.35 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closePopup();
        } else {
          Animated.spring(slideAnim, {
            toValue: SCREEN_HEIGHT * 0.35,
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
          <Text style={styles.errorText}>
            Please navigate from a story screen to access vocabulary support.
          </Text>
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={29} color="#000" />
        </TouchableOpacity>

        <View style={styles.offlineBadge}>
          <MaterialCommunityIcons name="book-open-variant" size={16} color="#666" />
          <Text style={styles.offlineBadgeText}>Local Dictionary</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setShowSettings(!showSettings)}
          style={styles.settingsButton}
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {showSettings && (
        <>
          <TouchableOpacity
            style={styles.settingsOverlay}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          />
          <View style={styles.settingsDropdown}>
            <Text style={styles.settingsTitle}>Settings</Text>
            
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

      <ScrollView
        style={styles.passageContainer}
        contentContainerStyle={styles.passageContent}
      >
        <Text style={styles.storyTitle}>{storyTitle}</Text>
        <Text style={[styles.passage, { fontSize }]}>
          {words.map((word, index) => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
            const hasLocalDef = hasDefinition(cleanWord);
            
            return (
              <Text
                key={index}
                onPress={() => handleWordPress(word, index)}
                style={[
                  styles.word,
                  highlightedWordIndex === index && styles.highlightedWord,
                  hasLocalDef && styles.wordWithDefinition
                ]}
              >
                {word}{" "}
              </Text>
            );
          })}
        </Text>
      </ScrollView>

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
              <View style={styles.gradientBackground} />
              
              <TouchableOpacity activeOpacity={1} style={styles.popupContent}>
                <View style={styles.handleBar} />

                <ScrollView
                  style={styles.popupScroll}
                  contentContainerStyle={styles.popupScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.popupTitle}>Word Definition</Text>

                  <View style={styles.wordCard}>
                    <View style={styles.wordInfo}>
                      <Text style={styles.wordText}>
                        {selectedWord?.toUpperCase()}
                      </Text>
                      {wordData && (
                        <Text style={styles.partOfSpeech}>
                          {wordData.partOfSpeech}
                        </Text>
                      )}
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

                  {wordData ? (
                    <>
                      <View style={styles.definitionCard}>
                        <View style={styles.definitionHeader}>
                          <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#315E34" />
                          <Text style={styles.definitionTitle}>Definition</Text>
                        </View>
                        <Text style={styles.definitionText}>
                          {wordData.definition}
                        </Text>
                      </View>

                      <View style={styles.translationCard}>
                        <View style={styles.translationHeader}>
                          <MaterialCommunityIcons name="translate" size={20} color="#315E34" />
                          <Text style={styles.translationTitle}>Filipino Translation</Text>
                        </View>
                        <Text style={styles.translationText}>
                          {wordData.translation}
                        </Text>
                      </View>

                      {wordData.example && (
                        <View style={styles.exampleCard}>
                          <View style={styles.exampleHeader}>
                            <MaterialCommunityIcons name="lightbulb-on" size={20} color="#315E34" />
                            <Text style={styles.exampleTitle}>Example</Text>
                          </View>
                          <Text style={styles.exampleText}>
                            "{wordData.example}"
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <View style={styles.noDefinitionCard}>
                      <MaterialCommunityIcons name="book-off" size={40} color="#999" />
                      <Text style={styles.noDefinitionTitle}>
                        Definition Not Available
                      </Text>
                      <Text style={styles.noDefinitionText}>
                        This word is not in the local dictionary. You can still hear its pronunciation above.
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
  offlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  offlineBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
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
  storyTitle: {
    fontSize: responsiveFontSize(22),
    fontWeight: "700",
    color: "#315E34",
    marginBottom: 16,
    textAlign: "center",
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
  wordWithDefinition: {
    borderBottomWidth: 1,
    borderBottomColor: "#94D231",
    borderStyle: "dotted",
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
    height: SCREEN_HEIGHT * 0.65,
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
  },
  partOfSpeech: {
    fontFamily: "Poppins",
    fontSize: responsiveFontSize(12),
    fontWeight: "400",
    color: "#FFF",
    opacity: 0.9,
    fontStyle: "italic",
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
  definitionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: isSmallScreen ? 14 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
  },
  definitionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  definitionTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    color: "#315E34",
  },
  definitionText: {
    fontSize: responsiveFontSize(15),
    color: "#333",
    lineHeight: responsiveFontSize(22),
  },
  translationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: isSmallScreen ? 14 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
  },
  translationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  translationTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    color: "#315E34",
  },
  translationText: {
    fontSize: responsiveFontSize(15),
    color: "#333",
    lineHeight: responsiveFontSize(22),
    fontWeight: "500",
  },
  exampleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: isSmallScreen ? 14 : 16,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  exampleTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    color: "#315E34",
  },
  exampleText: {
    fontSize: responsiveFontSize(14),
    color: "#555",
    lineHeight: responsiveFontSize(20),
    fontStyle: "italic",
  },
  noDefinitionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 12,
    padding: isSmallScreen ? 20 : 24,
    alignItems: "center",
  },
  noDefinitionTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 8,
  },
  noDefinitionText: {
    fontSize: responsiveFontSize(14),
    color: "#888",
    textAlign: "center",
    lineHeight: responsiveFontSize(20),
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
    marginBottom: 8,
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