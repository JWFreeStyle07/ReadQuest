import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { referenceTexts } from "../algorithm/referenceTexts";
import { vocabularies } from "../vocabSupport/vocabularies";

export default function VocabularySupport() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const router = useRouter();
  const story = referenceTexts.find(
    (item) => decodeURIComponent(item.title).toLowerCase() === String(title).toLowerCase()
  );
  const storyVocab = vocabularies[title] || {};

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  if (!story) return <Text>Story not found.</Text>;

  const handleWordPress = (word: string, event: any) => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (!cleanWord) return;

  const { pageX, pageY } = event.nativeEvent;
  const screen = Dimensions.get("window");
  const popupWidth = 240; // matches your styles
  const popupHeight = 150; // estimate for average popup size
  const margin = 10;

  // Calculate safe position
  let x = pageX - popupWidth / 2;
  let y = pageY - 100; // place slightly above tap

  // Prevent offscreen horizontally
  if (x < margin) x = margin;
  if (x + popupWidth > screen.width - margin)
    x = screen.width - popupWidth - margin;

  // Prevent offscreen vertically
  if (y < margin) y = pageY + 20; // move below if too high
  if (y + popupHeight > screen.height - margin)
    y = screen.height - popupHeight - margin;

  setSelectedWord(cleanWord);
  setPopupPosition({ x, y });
};

  const vocab = storyVocab[selectedWord || ""];

  const handleClosePopup = () => {
    setSelectedWord(null);
    setPopupPosition(null);
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <Text
          style={[
            styles.title,
            { fontSize: screenWidth < 380 ? 22 : 26 },
          ]}
        >
          {story.title}
        </Text>

        <Text
          style={[
            styles.paragraph,
            {
              fontSize: screenWidth < 380 ? 16 : 18,
              textAlign: "justify",
            },
          ]}
        >
          {story.text.split(" ").map((word, index) => (
            <TouchableOpacity
              key={index}
              onPress={(e) => handleWordPress(word, e)}
              activeOpacity={0.6}
            >
              <Text style={styles.word}>{word} </Text>
            </TouchableOpacity>
          ))}
        </Text>
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.getStartedBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.getStartedText}>Back</Text>
      </TouchableOpacity>

      {/* Floating popup like Messenger reactions */}
      {popupPosition && (
        <View
            style={[
                styles.popup,
                    {
                        top: popupPosition.y,
                        left: popupPosition.x,
                    },
            ]}
        >
          <View style={styles.popupContent}>
            {vocab ? (
              <>
                <Text style={styles.popupWord}>{selectedWord}</Text>
                <Text style={styles.popupDefinition}>{vocab.definition}</Text>
                <Text style={styles.popupTranslation}>
                  Translation: {vocab.translation}
                </Text>
              </>
            ) : (
              <Text>No definition found.</Text>
            )}
            <TouchableOpacity onPress={handleClosePopup}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "95%",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 15,
  },
  paragraph: {
    lineHeight: 28,
    textAlign: "justify",
  },
  word: {
    color: "#000", // black instead of blue
  },
  popup: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 10,
  },
  popupContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    width: 240,
    elevation: 6,
  },
  popupWord: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  popupDefinition: {
    fontSize: 16,
    marginBottom: 4,
  },
  popupTranslation: {
    fontSize: 14,
    fontStyle: "italic",
  },
  closeText: {
    textAlign: "right",
    color: "#007AFF",
    marginTop: 6,
  },
  getStartedBtn: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    elevation: 3,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

