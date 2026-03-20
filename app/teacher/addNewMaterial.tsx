import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

const AddNewMaterial = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Check if we're in edit mode
  const isEditMode = params.editMode === "true";
  const bookId = params.bookId as string;
  const existingImageURL = params.imageURL as string;

  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [passage, setPassage] = useState("");
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalPassage, setOriginalPassage] = useState("");

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  // Load existing data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setTitle(params.title as string || "");
      setPassage(params.passage as string || "");
      setDifficulty(params.difficulty as string || "");
      setImage(params.imageURL as string || null);
      setOriginalTitle(params.title as string || "");
      setOriginalPassage(params.passage as string || "");
    }
  }, [isEditMode, params]);

  // Cancel/Reset function
  const handleCancel = () => {
    if (isEditMode) {
      router.back();
    } else {
      setImage(null);
      setTitle("");
      setDifficulty("");
      setPassage("");
      setShowDifficultyDropdown(false);
    }
  };

  // Calculate word count
  const wordCount = passage.trim() ? passage.trim().split(/\s+/).length : 0;
  const minWords = 10;
  const maxWords = 150;
  const isWordLimitExceeded = wordCount > maxWords;
  const isWordCountTooLow = wordCount > 0 && wordCount < minWords;
  const isWordCountInvalid = isWordLimitExceeded || isWordCountTooLow;

  // Get randomized points based on difficulty
  const getRandomPoints = (diff: string): number => {
    const pointOptions: { [key: string]: number[] } = {
      "Beginner": [50, 55, 60, 65],
      "Intermediate": [70, 75, 80, 85],
      "Advanced": [90, 95, 100],
    };
    const options = pointOptions[diff];
    if (!options) return 0;
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  };

  // Check if title already exists in database (excluding current book in edit mode)
  const checkTitleExists = async (bookTitle: string): Promise<boolean> => {
    try {
      // Skip check if title hasn't changed in edit mode
      if (isEditMode && bookTitle.trim() === originalTitle.trim()) {
        return false;
      }
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("title", "==", bookTitle.trim()));
      const querySnapshot = await getDocs(q);
      
      if (isEditMode) {
        // In edit mode, exclude current book from check
        return querySnapshot.docs.some((doc) => doc.id !== bookId);
      }
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking title:", error);
      throw error;
    }
  };

  // Check if passage already exists in database (excluding current book in edit mode)
  const checkPassageExists = async (bookPassage: string): Promise<boolean> => {
    try {
      // Skip check if passage hasn't changed in edit mode
      if (isEditMode && bookPassage.trim() === originalPassage.trim()) {
        return false;
      }
      const booksRef = collection(db, "books");
      const q = query(booksRef, where("passage", "==", bookPassage.trim()));
      const querySnapshot = await getDocs(q);
      
      if (isEditMode) {
        // In edit mode, exclude current book from check
        return querySnapshot.docs.some((doc) => doc.id !== bookId);
      }
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking passage:", error);
      throw error;
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  // Upload image to Firebase Storage
  const uploadImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const filename = `books/${Date.now()}_${title.replace(/\s+/g, "_")}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  // Delete old image from Storage
  const deleteOldImage = async (imageURL: string) => {
    try {
      const storage = getStorage();
      const imageRef = ref(storage, imageURL);
      await deleteObject(imageRef);
    } catch (error) {
      console.log("Could not delete old image:", error);
    }
  };

  // Save or Update book to Firebase
  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Missing Information", "Please enter a title for the book.");
      return;
    }
    if (!difficulty) {
      Alert.alert("Missing Information", "Please select a difficulty level.");
      return;
    }
    if (!passage.trim()) {
      Alert.alert("Missing Information", "Please enter the passage text.");
      return;
    }
    if (isWordCountTooLow) {
      Alert.alert("Word Limit Not Met", "The passage must contain at least 10 words.");
      return;
    }
    if (isWordLimitExceeded) {
      Alert.alert("Word Limit Exceeded", "The number of words in the passage shouldn't exceed 150.");
      return;
    }
    if (!image) {
      Alert.alert("Missing Information", "Please select a cover image.");
      return;
    }

    setLoading(true);

    try {
      // Check if title already exists
      const titleExists = await checkTitleExists(title);
      if (titleExists) {
        setLoading(false);
        Alert.alert("Duplicate Title", "A book with this title already exists. Please use a different title.");
        return;
      }

      // Check if passage already exists
      const passageExists = await checkPassageExists(passage);
      if (passageExists) {
        setLoading(false);
        Alert.alert("Duplicate Passage", "A book with this exact passage already exists. Please use a different passage.");
        return;
      }

      if (isEditMode) {
        // UPDATE EXISTING BOOK
        let imageURL = existingImageURL;
        
        // Check if image was changed (new image is a local URI, not a Firebase URL)
        const imageChanged = image && !image.startsWith("https://firebasestorage");
        
        if (imageChanged) {
          // Upload new image
          imageURL = await uploadImage(image);
          // Delete old image
          if (existingImageURL) {
            await deleteOldImage(existingImageURL);
          }
        }

        // Update book in Firestore
        const bookRef = doc(db, "books", bookId);
        await updateDoc(bookRef, {
          title: title.trim(),
          passage: passage.trim(),
          wordCount: wordCount,
          difficulty: difficulty,
          imageURL: imageURL,
          updatedAt: new Date().toISOString(),
        });

        setLoading(false);
        Alert.alert("Success", "Reading material updated successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        // CREATE NEW BOOK
        const imageURL = await uploadImage(image);
        const points = getRandomPoints(difficulty);

        const booksRef = collection(db, "books");
        await addDoc(booksRef, {
          title: title.trim(),
          passage: passage.trim(),
          wordCount: wordCount,
          difficulty: difficulty,
          points: points,
          imageURL: imageURL,
          createdAt: new Date().toISOString(),
          accessible: true,
        });

        setLoading(false);
        Alert.alert("Success", `Reading material added successfully! Points: ${points}`, [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error saving book:", error);
      Alert.alert("Error", "Failed to save the reading material. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditMode ? "Edit Material" : "Add New Materials"}
          </Text>
        </View>

        {/* Green Box Container */}
        <View style={styles.greenBox}>
          {/* White Box */}
          <View style={styles.whiteBox}>
            {/* Top Section - Image and Inputs */}
            <View style={styles.topSection}>
              {/* Image Upload Button */}
              <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                ) : (
                  <View style={styles.plusIconContainer}>
                    <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Input Fields */}
              <View style={styles.inputFieldsContainer}>
                {/* Title Input */}
                <TextInput
                  style={styles.titleInput}
                  placeholder="Title"
                  placeholderTextColor="#0000006E"
                  value={title}
                  onChangeText={setTitle}
                />
                <View style={styles.titleDivider} />

                {/* Difficulty Dropdown */}
                <TouchableOpacity
                  style={styles.difficultyInput}
                  onPress={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: difficulty ? "#000000" : "#0000006E" },
                    ]}
                  >
                    {difficulty || "Difficulty"}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color="#0000006E"
                  />
                </TouchableOpacity>
                <View style={styles.difficultyDivider} />

                {/* Difficulty Dropdown Menu */}
                {showDifficultyDropdown && (
                  <View style={styles.dropdownMenu}>
                    {difficulties.map((diff) => (
                      <TouchableOpacity
                        key={diff}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setDifficulty(diff);
                          setShowDifficultyDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{diff}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Passage Input */}
            <View style={styles.passageContainer}>
              <TextInput
                style={styles.passageInput}
                placeholder="Enter passage text here..."
                placeholderTextColor="#0000006E"
                value={passage}
                onChangeText={setPassage}
                multiline
                textAlignVertical="top"
              />
              {/* Word Count */}
              <Text style={[
                styles.wordCountText,
                isWordCountInvalid && styles.wordCountExceeded
              ]}>
                Number of words: {wordCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons Container - SAVE and CANCEL */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditMode ? "UPDATE" : "SAVE"}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: height * 0.05 },
  header: { flexDirection: "row", alignItems: "center", paddingTop: height * 0.08, paddingHorizontal: width * 0.05 },
  backButton: { padding: width * 0.02 },
  headerTitle: { flex: 1, fontFamily: "Poppins", fontWeight: "700", fontSize: width * 0.05, color: "#000000", textAlign: "center", marginRight: width * 0.08 },
  greenBox: { marginTop: height * 0.03, marginHorizontal: width * 0.06, backgroundColor: "#315E34", borderRadius: 10, padding: width * 0.025, paddingBottom: height * 0.015 },
  whiteBox: { backgroundColor: "#FFFFFF", borderRadius: 10, padding: width * 0.04, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  topSection: { flexDirection: "row", marginBottom: height * 0.02 },
  imageUploadButton: { width: width * 0.17, height: width * 0.22, backgroundColor: "#555555", borderRadius: 8, borderWidth: 2, borderColor: "#FFFFFF", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  plusIconContainer: { justifyContent: "center", alignItems: "center" },
  uploadedImage: { width: "100%", height: "100%", borderRadius: 6 },
  inputFieldsContainer: { flex: 1, marginLeft: width * 0.04, justifyContent: "center" },
  titleInput: { fontFamily: "Poppins", fontWeight: "500", fontSize: width * 0.035, color: "#000000", paddingVertical: height * 0.005 },
  titleDivider: { height: 1, backgroundColor: "#000000", marginTop: height * 0.005 },
  difficultyInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: height * 0.015, paddingVertical: height * 0.005 },
  difficultyText: { fontFamily: "Poppins", fontWeight: "500", fontSize: width * 0.035 },
  difficultyDivider: { height: 1, backgroundColor: "#000000", width: width * 0.3, marginTop: height * 0.005 },
  dropdownMenu: { position: "absolute", top: height * 0.09, left: 0, backgroundColor: "#FFFFFF", borderRadius: 5, borderWidth: 1, borderColor: "#000000", zIndex: 100, elevation: 5, width: width * 0.35 },
  dropdownItem: { paddingVertical: height * 0.01, paddingHorizontal: width * 0.03 },
  dropdownItemText: { fontFamily: "Poppins", fontWeight: "500", fontSize: width * 0.032, color: "#000000" },
  passageContainer: { marginTop: height * 0.01 },
  passageInput: { width: "100%", height: height * 0.28, borderWidth: 1, borderColor: "#000000", borderRadius: 5, backgroundColor: "#FFFFFF", padding: width * 0.03, fontFamily: "Poppins", fontWeight: "400", fontSize: width * 0.035, color: "#000000" },
  wordCountText: { fontFamily: "Poppins", fontWeight: "500", fontSize: width * 0.03, color: "#000000", textAlign: "right", marginTop: height * 0.01 },
  wordCountExceeded: { color: "#FF0000" },
  saveButton: { flex: 1, backgroundColor: "#94D231", borderRadius: 10, paddingVertical: height * 0.018, alignItems: "center", justifyContent: "center", marginRight: width * 0.02, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { fontFamily: "Poppins", fontWeight: "700", fontSize: width * 0.045, color: "#FFFFFF" },
  buttonsContainer: { flexDirection: "row", marginHorizontal: width * 0.06, marginTop: height * 0.025 },
  cancelButton: { flex: 1, backgroundColor: "#94D231", borderRadius: 10, paddingVertical: height * 0.018, alignItems: "center", justifyContent: "center", marginLeft: width * 0.02, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 4 },
  cancelButtonText: { fontFamily: "Poppins", fontWeight: "700", fontSize: width * 0.045, color: "#FFFFFF" },
});

export default AddNewMaterial;