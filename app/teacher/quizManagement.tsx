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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
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

export default function QuizManagement() {
  const router = useRouter();
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const booksCollection = collection(db, 'books');
      const booksSnapshot = await getDocs(booksCollection);
      const booksList = booksSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        passage: doc.data().passage,
      }));
      setBooks(booksList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to load books from database');
      setLoading(false);
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
  input: {
    width: 356,
    height: 46,
    marginTop: height * 0.02,
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
    marginTop: height * 0.35,
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