// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import { collection, getDocs } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { db } from '../../firebase/firebaseConfig';

// const { width, height } = Dimensions.get('window');

// interface Book {
//   id: string;
//   title: string;
//   passage: string;
// }

// export default function QuizManagement({ navigation }: any) {
//   const [numberOfQuestions, setNumberOfQuestions] = useState('');
//   const [selectedBook, setSelectedBook] = useState('');
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       const booksCollection = collection(db, 'books');
//       const booksSnapshot = await getDocs(booksCollection);
//       const booksList = booksSnapshot.docs.map(doc => ({
//         id: doc.id,
//         title: doc.data().title,
//         passage: doc.data().passage,
//       }));
//       setBooks(booksList);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching books:', error);
//       Alert.alert('Error', 'Failed to load books from database');
//       setLoading(false);
//     }
//   };

//   const handleStartCreating = () => {
//     if (!numberOfQuestions || parseInt(numberOfQuestions) <= 0) {
//       Alert.alert('Error', 'Please enter a valid number of questions');
//       return;
//     }

//     if (!selectedBook) {
//       Alert.alert('Error', 'Please select a book');
//       return;
//     }

//     const selectedBookData = books.find(book => book.id === selectedBook);
    
//     navigation.navigate('QuestionMaker', {
//       numberOfQuestions: parseInt(numberOfQuestions),
//       bookId: selectedBook,
//       bookTitle: selectedBookData?.title,
//       bookPassage: selectedBookData?.passage,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={width * 0.07}
//               color="#000"
//             />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Quiz Management</Text>
//         </View>

//         {/* Number of Questions Input */}
//         <TextInput
//           style={styles.input}
//           placeholder="Type the number of questions in quiz"
//           placeholderTextColor="#999"
//           keyboardType="numeric"
//           value={numberOfQuestions}
//           onChangeText={setNumberOfQuestions}
//         />

//         {/* Book Selection Dropdown */}
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedBook}
//             onValueChange={(itemValue) => setSelectedBook(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select a book" value="" />
//             {books.map((book) => (
//               <Picker.Item
//                 key={book.id}
//                 label={book.title}
//                 value={book.id}
//               />
//             ))}
//           </Picker>
//         </View>

//         {/* Start Creating Quiz Button */}
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleStartCreating}
//         >
//           <Text style={styles.submitButtonText}>START CREATING QUIZ</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: height * 0.11,
//     marginLeft: width * 0.12,
//     marginBottom: height * 0.04,
//   },
//   backButton: {
//     position: 'absolute',
//     left: -width * 0.08,
//     transform: [{ rotate: '90.24deg' }],
//   },
//   headerTitle: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: width * 0.053,
//     color: '#000',
//     textAlign: 'center',
//   },
//   input: {
//     width: width * 0.89,
//     height: height * 0.058,
//     marginTop: height * 0.02,
//     marginHorizontal: width * 0.058,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     paddingHorizontal: width * 0.04,
//     fontFamily: 'Poppins',
//     fontSize: width * 0.04,
//   },
//   pickerContainer: {
//     width: width * 0.89,
//     height: height * 0.058,
//     marginTop: height * 0.02,
//     marginHorizontal: width * 0.058,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//   },
//   picker: {
//     width: '100%',
//     height: '100%',
//   },
//   submitButton: {
//     width: width * 0.76,
//     height: height * 0.065,
//     marginTop: height * 0.62,
//     marginHorizontal: width * 0.105,
//     borderRadius: 10,
//     backgroundColor: '#94D231',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   submitButtonText: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: width * 0.05,
//     color: '#FFF',
//     textAlign: 'center',
//   },
// });
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import { useRouter } from 'expo-router';
// import { collection, getDocs } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { db } from '../../firebase/firebaseConfig';

// const { width, height } = Dimensions.get('window');

// interface Book {
//   id: string;
//   title: string;
//   passage: string;
// }

// export default function QuizManagement() {
//   const router = useRouter();
//   const [numberOfQuestions, setNumberOfQuestions] = useState('');
//   const [selectedBook, setSelectedBook] = useState('');
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       const booksCollection = collection(db, 'books');
//       const booksSnapshot = await getDocs(booksCollection);
//       const booksList = booksSnapshot.docs.map(doc => ({
//         id: doc.id,
//         title: doc.data().title,
//         passage: doc.data().passage,
//       }));
//       setBooks(booksList);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching books:', error);
//       Alert.alert('Error', 'Failed to load books from database');
//       setLoading(false);
//     }
//   };

//   const handleStartCreating = () => {
//     if (!numberOfQuestions || parseInt(numberOfQuestions) <= 0) {
//       Alert.alert('Error', 'Please enter a valid number of questions');
//       return;
//     }

//     if (!selectedBook) {
//       Alert.alert('Error', 'Please select a book');
//       return;
//     }

//     const selectedBookData = books.find(book => book.id === selectedBook);
    
//     router.push({
//       pathname: '/teacher/questionMaker',
//       params: {
//         numberOfQuestions: parseInt(numberOfQuestions),
//         bookId: selectedBook,
//         bookTitle: selectedBookData?.title,
//         bookPassage: selectedBookData?.passage,
//       },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.back()}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={width * 0.065}
//               color="#000"
//             />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Quiz Management</Text>
//         </View>

//         {/* Number of Questions Input */}
//         <TextInput
//           style={styles.input}
//           placeholder="Type the number of questions in quiz"
//           placeholderTextColor="#999"
//           keyboardType="numeric"
//           value={numberOfQuestions}
//           onChangeText={setNumberOfQuestions}
//         />

//         {/* Book Selection Dropdown */}
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedBook}
//             onValueChange={(itemValue) => setSelectedBook(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select a book" value="" />
//             {books.map((book) => (
//               <Picker.Item
//                 key={book.id}
//                 label={book.title}
//                 value={book.id}
//               />
//             ))}
//           </Picker>
//         </View>

//         {/* Start Creating Quiz Button */}
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleStartCreating}
//         >
//           <Text style={styles.submitButtonText}>START CREATING QUIZ</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 77,
//     marginBottom: height * 0.04,
//     paddingHorizontal: width * 0.05,
//   },
//   backButton: {
//     position: 'absolute',
//     left: width * 0.12,
//     zIndex: 1,
//   },
//   headerTitle: {
//     width: 249,
//     height: 38,
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: 20,
//     color: '#000',
//     textAlign: 'center',
//     marginLeft: 92.78,
//   },
//   input: {
//     width: width * 0.89,
//     height: height * 0.058,
//     marginTop: height * 0.02,
//     marginHorizontal: width * 0.058,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     paddingHorizontal: width * 0.04,
//     fontFamily: 'Poppins',
//     fontSize: width * 0.04,
//     textAlign: 'center',
//   },
//   pickerContainer: {
//     width: width * 0.89,
//     height: height * 0.07,
//     marginTop: height * 0.02,
//     marginHorizontal: width * 0.058,
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   picker: {
//     width: '100%',
//     height: '100%',
//   },
//   submitButton: {
//     width: width * 0.76,
//     height: height * 0.065,
//     marginTop: height * 0.4,
//     marginHorizontal: width * 0.105,
//     borderRadius: 10,
//     backgroundColor: '#94D231',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   submitButtonText: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: width * 0.05,
//     color: '#FFF',
//     textAlign: 'center',
//   },
// });
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import { useRouter } from 'expo-router';
// import { collection, getDocs } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { db } from '../../firebase/firebaseConfig';

// const { width, height } = Dimensions.get('window');

// interface Book {
//   id: string;
//   title: string;
//   passage: string;
// }

// export default function QuizManagement() {
//   const router = useRouter();
//   const [numberOfQuestions, setNumberOfQuestions] = useState('');
//   const [selectedBook, setSelectedBook] = useState('');
//   const [books, setBooks] = useState<Book[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   const fetchBooks = async () => {
//     try {
//       const booksCollection = collection(db, 'books');
//       const booksSnapshot = await getDocs(booksCollection);
//       const booksList = booksSnapshot.docs.map(doc => ({
//         id: doc.id,
//         title: doc.data().title,
//         passage: doc.data().passage,
//       }));
//       setBooks(booksList);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching books:', error);
//       Alert.alert('Error', 'Failed to load books from database');
//       setLoading(false);
//     }
//   };

//   const handleStartCreating = () => {
//     if (!numberOfQuestions || parseInt(numberOfQuestions) <= 0) {
//       Alert.alert('Error', 'Please enter a valid number of questions');
//       return;
//     }

//     if (!selectedBook) {
//       Alert.alert('Error', 'Please select a book');
//       return;
//     }

//     const selectedBookData = books.find(book => book.id === selectedBook);
    
//     router.push({
//       pathname: '/teacher/questionMaker',
//       params: {
//         numberOfQuestions: numberOfQuestions,
//         bookId: selectedBook,
//         bookTitle: selectedBookData?.title || '',
//         bookPassage: selectedBookData?.passage || '',
//       },
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.headerContainer}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.back()}
//           >
//             <MaterialCommunityIcons
//               name="arrow-left"
//               size={32}
//               color="#000"
//             />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Quiz Management</Text>
//         </View>

//         {/* Number of Questions Input */}
//         <TextInput
//           style={styles.input}
//           placeholder="Type the number of questions in quiz"
//           placeholderTextColor="#999"
//           keyboardType="numeric"
//           value={numberOfQuestions}
//           onChangeText={setNumberOfQuestions}
//         />

//         {/* Book Selection Dropdown */}
//         <View style={styles.pickerContainer}>
//           <Picker
//             selectedValue={selectedBook}
//             onValueChange={(itemValue) => setSelectedBook(itemValue)}
//             style={styles.picker}
//           >
//             <Picker.Item label="Select a book" value="" />
//             {books.map((book) => (
//               <Picker.Item
//                 key={book.id}
//                 label={book.title}
//                 value={book.id}
//               />
//             ))}
//           </Picker>
//         </View>

//         {/* Start Creating Quiz Button */}
//         <TouchableOpacity
//           style={styles.submitButton}
//           onPress={handleStartCreating}
//         >
//           <Text style={styles.submitButtonText}>START CREATING QUIZ</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 77,
//     marginBottom: height * 0.04,
//     position: 'relative',
//   },
//   backButton: {
//     position: 'absolute',
//     left: 48,
//   },
//   headerTitle: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: 20,
//     color: '#000',
//     textAlign: 'center',
//   },
//   input: {
//     width: 356,
//     height: 46,
//     marginTop: height * 0.02,
//     alignSelf: 'center',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     paddingHorizontal: width * 0.04,
//     fontFamily: 'Poppins',
//     fontSize: width * 0.04,
//     textAlign: 'center',
//   },
//   pickerContainer: {
//     width: 356,
//     height: 60,
//     marginTop: height * 0.02,
//     alignSelf: 'center',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#000',
//     backgroundColor: '#FFF',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   picker: {
//     width: '100%',
//     height: '100%',
//   },
//   submitButton: {
//     width: 304,
//     height: 52,
//     marginTop: height * 0.5,
//     alignSelf: 'center',
//     borderRadius: 10,
//     backgroundColor: '#94D231',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 8,
//   },
//   submitButtonText: {
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: 19,
//     color: '#FFF',
//     textAlign: 'center',
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';

const { width, height } = Dimensions.get('window');

interface Book {
  id: string;
  title: string;
  passage: string;
}

interface Quiz {
  id: string;
  bookTitle: string;
  numberOfQuestions: number;
  createdAt: any;
}

export default function QuizManagement() {
  const router = useRouter();
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch books
      const booksCollection = collection(db, 'books');
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        passage: doc.data().passage,
      }));
      setBooks(booksList);

      // Fetch quizzes
      const quizzesCollection = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesCollection);
      const quizzesList = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        bookTitle: doc.data().bookTitle,
        numberOfQuestions: doc.data().numberOfQuestions,
        createdAt: doc.data().createdAt,
      }));
      setQuizzes(quizzesList);
      setFilteredQuizzes(quizzesList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load data from database');
      setLoading(false);
    }
  };

  // Filter quizzes based on search
  useEffect(() => {
    if (searchText) {
      const filtered = quizzes.filter((quiz) =>
        quiz.bookTitle.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchText, quizzes]);

  const handleDeleteQuiz = async (quizId: string, bookTitle: string) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete the quiz for "${bookTitle}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'quizzes', quizId));
              Alert.alert('Success', 'Quiz deleted successfully');
              fetchData(); // Refresh the list
            } catch (error) {
              console.error('Error deleting quiz:', error);
              Alert.alert('Error', 'Failed to delete quiz');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      let date;
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleStartCreating = () => {
    if (!numberOfQuestions || parseInt(numberOfQuestions) <= 0) {
      Alert.alert('Error', 'Please enter a valid number of questions');
      return;
    }

    if (!selectedBook) {
      Alert.alert('Error', 'Please select a book');
      return;
    }

    const selectedBookData = books.find(book => book.id === selectedBook);
    
    router.push({
      pathname: '/teacher/questionMaker',
      params: {
        numberOfQuestions: numberOfQuestions,
        bookId: selectedBook,
        bookTitle: selectedBookData?.title || '',
        bookPassage: selectedBookData?.passage || '',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41765D" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
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
          <Text style={styles.headerTitle}>Quiz Management</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={width * 0.055}
            color="#000"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quizzes..."
            placeholderTextColor="#00000087"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Quizzes Table */}
        <View style={[
          styles.tableContainer,
          {
            height: Math.min(
              height * 0.4,
              height * 0.06 + (filteredQuizzes.length > 0 ? filteredQuizzes.length * height * 0.05 : height * 0.08)
            ),
          }
        ]}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.columnHeader, { flex: 2 }]}>Book Title</Text>
            <Text style={[styles.columnHeader, { flex: 1 }]}>No. of Questions</Text>
            <Text style={[styles.columnHeader, { flex: 1.5 }]}>Date Created</Text>
            <Text style={[styles.columnHeader, { flex: 0.8 }]}>Delete</Text>
          </View>

          {/* Table Data */}
          <ScrollView 
            style={styles.tableBody} 
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {filteredQuizzes.map((quiz) => (
              <View key={quiz.id} style={styles.tableRow}>
                <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>
                  {quiz.bookTitle}
                </Text>
                <Text style={[styles.cellText, { flex: 1 }]}>
                  {quiz.numberOfQuestions}
                </Text>
                <Text style={[styles.cellText, { flex: 1.5 }]} numberOfLines={1}>
                  {formatDate(quiz.createdAt)}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteQuiz(quiz.id, quiz.bookTitle)}
                >
                  <MaterialCommunityIcons
                    name="delete"
                    size={20}
                    color="#FF0000"
                  />
                </TouchableOpacity>
              </View>
            ))}
            {filteredQuizzes.length === 0 && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No quizzes found</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Create New Quiz Section */}
        <Text style={styles.sectionTitle}>Create New Quiz</Text>

        {/* Number of Questions Input */}
        <TextInput
          style={styles.input}
          placeholder="Type the number of questions in quiz"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={numberOfQuestions}
          onChangeText={setNumberOfQuestions}
        />

        {/* Book Selection Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedBook}
            onValueChange={(itemValue) => setSelectedBook(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a book" value="" />
            {books.map((book) => (
              <Picker.Item
                key={book.id}
                label={book.title}
                value={book.id}
              />
            ))}
          </Picker>
        </View>

        {/* Start Creating Quiz Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleStartCreating}
        >
          <Text style={styles.submitButtonText}>START CREATING QUIZ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#41765D',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 77,
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: width * 0.05,
    marginTop: height * 0.01,
    height: height * 0.055,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.03,
  },
  searchIcon: {
    marginRight: width * 0.02,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: width * 0.035,
    color: '#000000',
  },
  tableContainer: {
    marginHorizontal: width * 0.05,
    marginTop: height * 0.015,
    marginBottom: height * 0.02,
    backgroundColor: '#41765D',
    borderRadius: 10,
    padding: width * 0.03,
    maxHeight: height * 0.4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  columnHeader: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: width * 0.03,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableBody: {
    marginTop: height * 0.01,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: height * 0.008,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
  },
  cellText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: width * 0.025,
    color: '#000000',
    textAlign: 'center',
  },
  deleteButton: {
    flex: 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingVertical: height * 0.008,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  noDataText: {
    fontFamily: 'Poppins',
    fontSize: width * 0.04,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  input: {
    width: 356,
    height: 46,
    marginTop: height * 0.01,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#FFF',
    paddingHorizontal: width * 0.04,
    fontFamily: 'Poppins',
    fontSize: width * 0.04,
    textAlign: 'center',
  },
  pickerContainer: {
    width: 356,
    height: 60,
    marginTop: height * 0.02,
    alignSelf: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    width: 304,
    height: 52,
    marginTop: height * 0.03,
    marginBottom: height * 0.03,
    alignSelf: 'center',
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
    fontSize: 19,
    color: '#FFF',
    textAlign: 'center',
  },
});