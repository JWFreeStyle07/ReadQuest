import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { deleteObject, getStorage, ref } from "firebase/storage";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

interface Book {
  id: string;
  title: string;
  passage: string;
  wordCount: number;
  difficulty: string;
  points: number;
  imageURL: string;
  createdAt: string;
  accessible: boolean;
}

type FilterOption = "Alphabetical" | "Creation Time" | "Difficulty" | "Number of Words" | "Increasing Points";

const ReadingMaterials = () => {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Creation Time");
  const [loading, setLoading] = useState(true);

  const filterOptions: FilterOption[] = [
    "Alphabetical",
    "Creation Time",
    "Difficulty",
    "Number of Words",
    "Increasing Points",
  ];

  // Fetch books from Firebase
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const booksRef = collection(db, "books");
      const querySnapshot = await getDocs(booksRef);
      const booksData: Book[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        booksData.push({
          id: doc.id,
          title: data.title || "",
          passage: data.passage || "",
          wordCount: data.wordCount || 0,
          difficulty: data.difficulty || "",
          points: data.points || 0,
          imageURL: data.imageURL || "",
          createdAt: data.createdAt || "",
          accessible: data.accessible !== undefined ? data.accessible : true,
        });
      });
      
      setBooks(booksData);
      setFilteredBooks(booksData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load reading materials.");
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Apply search filter
  useEffect(() => {
    let result = [...books];
    
    // Apply search
    if (searchQuery.trim()) {
      result = result.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result = sortBooks(result, selectedFilter);
    setFilteredBooks(result);
  }, [searchQuery, books, selectedFilter]);

  // Sort books based on filter
  const sortBooks = (booksToSort: Book[], filter: FilterOption): Book[] => {
    const sorted = [...booksToSort];
    switch (filter) {
      case "Alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "Creation Time":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "Difficulty":
        const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 };
        return sorted.sort((a, b) => 
          (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
          (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
        );
      case "Number of Words":
        return sorted.sort((a, b) => a.wordCount - b.wordCount);
      case "Increasing Points":
        return sorted.sort((a, b) => a.points - b.points);
      default:
        return sorted;
    }
  };

  // Toggle book accessibility
  const toggleAccessibility = async (book: Book) => {
    try {
      const bookRef = doc(db, "books", book.id);
      const newAccessible = !book.accessible;
      await updateDoc(bookRef, { accessible: newAccessible });
      
      // Update local state
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, accessible: newAccessible } : b))
      );
    } catch (error) {
      console.error("Error updating accessibility:", error);
      Alert.alert("Error", "Failed to update book accessibility.");
    }
  };

  // Navigate to edit book
  const handleEditBook = (book: Book) => {
    router.push({
      pathname: "../../teacher/addNewMaterial",
      params: {
        editMode: "true",
        bookId: book.id,
        title: book.title,
        passage: book.passage,
        difficulty: book.difficulty,
        imageURL: book.imageURL,
        points: book.points.toString(),
        wordCount: book.wordCount.toString(),
      },
    });
  };

  // Delete book
  const handleDeleteBook = (book: Book) => {
    Alert.alert(
      "Delete Book",
      `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete from Firestore
              await deleteDoc(doc(db, "books", book.id));
              
              // Delete image from Storage
              if (book.imageURL) {
                try {
                  const storage = getStorage();
                  const imageRef = ref(storage, book.imageURL);
                  await deleteObject(imageRef);
                } catch (storageError) {
                  console.log("Image may have been already deleted:", storageError);
                }
              }
              
              // Update local state
              setBooks((prev) => prev.filter((b) => b.id !== book.id));
              Alert.alert("Success", "Book deleted successfully.");
            } catch (error) {
              console.error("Error deleting book:", error);
              Alert.alert("Error", "Failed to delete the book.");
            }
          },
        },
      ]
    );
  };

  // Render book item
  const renderBookItem = (book: Book) => (
    <View key={book.id} style={styles.greenBox}>
      {/* White box with image */}
      <View style={styles.whiteImageBox}>
        <Image source={{ uri: book.imageURL }} style={styles.bookImage} />
      </View>

      {/* Book details */}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.wordCountText}>{book.wordCount} words</Text>
      </View>

      {/* Difficulty label */}
      <Text style={styles.difficultyText}>{book.difficulty}</Text>

      {/* Action icons */}
      <View style={styles.actionIcons}>
        <TouchableOpacity onPress={() => toggleAccessibility(book)} style={styles.iconButton}>
          <MaterialCommunityIcons
            name={book.accessible ? "eye" : "eye-off"}
            size={width * 0.045}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditBook(book)} style={styles.iconButton}>
          <MaterialCommunityIcons name="pencil" size={width * 0.035} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBook(book)} style={styles.iconButton}>
          <MaterialCommunityIcons name="delete" size={width * 0.035} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={width * 0.065} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reading Materials</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={21} color="#00000087" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#00000087"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilterDropdown(!showFilterDropdown)}>
            <MaterialCommunityIcons name="filter-menu-outline" size={24} color="#00000087" />
          </TouchableOpacity>
        </View>

        {/* Filter Dropdown */}
        {showFilterDropdown && (
          <View style={styles.filterDropdown}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  selectedFilter === option && styles.filterOptionSelected,
                ]}
                onPress={() => {
                  setSelectedFilter(option);
                  setShowFilterDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFilter === option && styles.filterOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Books List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#315E34" />
          <Text style={styles.loadingText}>Loading books...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredBooks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="book-open-page-variant" size={60} color="#315E34" />
              <Text style={styles.emptyText}>No reading materials found</Text>
            </View>
          ) : (
            filteredBooks.map((book) => renderBookItem(book))
          )}
          {/* Spacer for button */}
          <View style={{ height: height * 0.1 }} />
        </ScrollView>
      )}

      {/* Add New Material Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("../../teacher/addNewMaterial")}
        >
          <Text style={styles.addButtonText}>ADD NEW MATERIAL</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.07,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
  },
  backButton: {
    padding: width * 0.02,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.05,
    color: "#000000",
    textAlign: "center",
    marginRight: width * 0.1,
  },
  searchContainer: {
    paddingHorizontal: width * 0.06,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000000",
    borderRadius: 5,
    paddingHorizontal: width * 0.03,
    height: height * 0.055,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.035,
    color: "#000000",
    marginLeft: width * 0.02,
  },
  filterDropdown: {
    position: "absolute",
    top: height * 0.06,
    right: width * 0.06,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000000",
    zIndex: 101,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterOption: {
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  filterOptionSelected: {
    backgroundColor: "#315E34",
  },
  filterOptionText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.032,
    color: "#000000",
  },
  filterOptionTextSelected: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
  },
  greenBox: {
    backgroundColor: "#315E34",
    borderRadius: 10,
    height: height * 0.175,
    marginBottom: height * 0.018,
    padding: width * 0.03,
    flexDirection: "row",
    position: "relative",
  },
  whiteImageBox: {
    width: width * 0.23,
    height: height * 0.15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  bookImage: {
    width: "95%",
    height: "98%",
    borderRadius: 12,
    resizeMode: "cover",
  },
  bookDetails: {
    marginLeft: width * 0.03,
    justifyContent: "center",
    flex: 1,
  },
  bookTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    marginBottom: height * 0.005,
  },
  wordCountText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.025,
    color: "#FFFFFF",
  },
  difficultyText: {
    position: "absolute",
    top: height * 0.015,
    right: width * 0.04,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.032,
    color: "#FFFFFF",
  },
  actionIcons: {
    position: "absolute",
    bottom: height * 0.015,
    right: width * 0.04,
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: width * 0.035,
    padding: width * 0.01,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.035,
    color: "#315E34",
    marginTop: height * 0.01,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: height * 0.15,
  },
  emptyText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#315E34",
    marginTop: height * 0.02,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: height * 0.03,
    left: width * 0.06,
    right: width * 0.06,
  },
  addButton: {
    backgroundColor: "#94D231",
    borderRadius: 10,
    height: height * 0.065,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#FFFFFF",
  },
});

export default ReadingMaterials;