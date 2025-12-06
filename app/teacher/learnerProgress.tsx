// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { doc, getDoc } from "firebase/firestore";
// import React, { useEffect, useState } from "react";
// import {
//     ActivityIndicator,
//     Dimensions,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { db } from "../../firebase/firebaseConfig";

// const { width, height } = Dimensions.get("window");

// interface StoryScore {
//   pronunciationScore?: number;
//   accuracyScore?: number;
//   miscues?: number;
//   timestamp: string;
// }

// interface StudentData {
//   username: string;
//   grade: string;
//   section: string;
//   readerType: string;
//   storyScores: {
//     [bookTitle: string]: StoryScore;
//   };
// }

// const LearnerProgress = () => {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const [studentData, setStudentData] = useState<StudentData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudentData = async () => {
//       if (!id || typeof id !== "string") {
//         setLoading(false);
//         return;
//       }

//       try {
//         const userRef = doc(db, "users", id);
//         const userSnap = await getDoc(userRef);

//         if (userSnap.exists()) {
//           const data = userSnap.data();
//           setStudentData({
//             username: data.username || data.name || "Unknown",
//             grade: data.grade || "",
//             section: data.section || "",
//             readerType: data.readerType || "Beginner",
//             storyScores: data.storyScores || {},
//           });
//         }
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching student data:", error);
//         setLoading(false);
//       }
//     };

//     fetchStudentData();
//   }, [id]);

//   const formatDate = (timestamp: string) => {
//     try {
//       const date = new Date(timestamp);
//       const month = date.getMonth() + 1;
//       const day = date.getDate();
//       const year = date.getFullYear();
//       return `${month}/${day}/${year}`;
//     } catch (error) {
//       return "N/A";
//     }
//   };

//   const getOralReadingSessions = () => {
//     if (!studentData || !studentData.storyScores) return [];

//     return Object.entries(studentData.storyScores).map(([bookTitle, scores]) => ({
//       passage: bookTitle,
//       date: formatDate(scores.timestamp),
//       accuracy: scores.accuracyScore !== undefined ? `${scores.accuracyScore}%` : "N/A",
//       miscues: scores.miscues !== undefined ? scores.miscues.toString() : "N/A",
//     }));
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#41765D" />
//         <Text style={styles.loadingText}>Loading Progress...</Text>
//       </View>
//     );
//   }

//   if (!studentData) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.errorText}>Student data not found</Text>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Text style={styles.backButtonText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const sessions = getOralReadingSessions();

//   return (
//     <View style={styles.container}>
//       {/* Header with Back Button */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backIcon}
//           onPress={() => router.back()}
//         >
//           <MaterialCommunityIcons
//             name="arrow-left"
//             size={width * 0.08}
//             color="#000000"
//           />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Learner Progress</Text>
//       </View>

//       <ScrollView 
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Student Info */}
//         <View style={styles.infoContainer}>
//           <Text style={styles.nameText}>{studentData.username}</Text>
//           <Text style={styles.gradeText}>
//             Grade {studentData.grade} - Section {studentData.section}
//           </Text>
//           <Text style={styles.readerLevelText}>
//             Reader Level:{" "}
//             <Text style={styles.readerTypeText}>{studentData.readerType}</Text>
//           </Text>
//         </View>

//         {/* Oral Reading Sessions Table */}
//         <View style={styles.tableContainer}>
//           <Text style={styles.tableName}>Oral Reading Sessions</Text>

//           {/* Table Header */}
//           <View style={styles.tableHeader}>
//             <Text style={[styles.columnHeader, { flex: 2 }]}>Passage</Text>
//             <Text style={[styles.columnHeader, { flex: 1.2 }]}>Date</Text>
//             <Text style={[styles.columnHeader, { flex: 1 }]}>Accuracy</Text>
//             <Text style={[styles.columnHeader, { flex: 1 }]}>Miscues</Text>
//           </View>

//           {/* Table Body */}
//           <ScrollView 
//             style={styles.tableBody}
//             nestedScrollEnabled={true}
//             showsVerticalScrollIndicator={false}
//           >
//             {sessions.length > 0 ? (
//               sessions.map((session, index) => (
//                 <View key={index} style={styles.tableRow}>
//                   <Text
//                     style={[styles.cellText, { flex: 2 }]}
//                     numberOfLines={2}
//                   >
//                     {session.passage}
//                   </Text>
//                   <Text style={[styles.cellText, { flex: 1.2 }]}>
//                     {session.date}
//                   </Text>
//                   <Text style={[styles.cellText, { flex: 1 }]}>
//                     {session.accuracy}
//                   </Text>
//                   <Text style={[styles.cellText, { flex: 1 }]}>
//                     {session.miscues}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <View style={styles.noDataContainer}>
//                 <Text style={styles.noDataText}>
//                   No oral reading sessions found
//                 </Text>
//               </View>
//             )}
//           </ScrollView>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   loadingText: {
//     marginTop: height * 0.02,
//     fontFamily: "Poppins",
//     fontSize: width * 0.04,
//     color: "#41765D",
//   },
//   errorText: {
//     fontFamily: "Poppins",
//     fontSize: width * 0.045,
//     color: "#000000",
//     marginBottom: height * 0.02,
//   },
//   backButton: {
//     backgroundColor: "#41765D",
//     paddingHorizontal: width * 0.06,
//     paddingVertical: height * 0.015,
//     borderRadius: 5,
//   },
//   backButtonText: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#FFFFFF",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: height * 0.08,
//     paddingHorizontal: width * 0.06,
//     marginBottom: height * 0.03,
//   },
//   backIcon: {
//     position: "absolute",
//     left: width * 0.06,
//     top: height * 0.08,
//     zIndex: 1,
//   },
//   headerTitle: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.05,
//     color: "#000000",
//     textAlign: "center",
//     flex: 1,
//   },
//   infoContainer: {
//     paddingHorizontal: width * 0.06,
//     marginBottom: height * 0.03,
//   },
//   nameText: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#000000",
//     marginBottom: height * 0.005,
//   },
//   gradeText: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#000000",
//     marginBottom: height * 0.005,
//   },
//   readerLevelText: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#000000",
//   },
//   readerTypeText: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#98c74b",
//   },
//   tableContainer: {
//     marginHorizontal: width * 0.06,
//     backgroundColor: "#41765D",
//     borderRadius: 10,
//     padding: width * 0.04,
//     marginBottom: height * 0.03,
//     maxHeight: height * 0.5,
//   },
//   tableName: {
//     fontFamily: "Poppins",
//     fontWeight: "700",
//     fontSize: width * 0.04,
//     color: "#FFFFFF",
//     marginBottom: height * 0.015,
//   },
//   tableHeader: {
//     flexDirection: "row",
//     paddingBottom: height * 0.015,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.3)",
//   },
//   columnHeader: {
//     fontFamily: "Poppins",
//     fontWeight: "500",
//     fontSize: width * 0.03,
//     color: "#FFFFFF",
//     textAlign: "center",
//   },
//   tableBody: {
//     marginTop: height * 0.01,
//     maxHeight: height * 0.35,
//   },
//   tableRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 5,
//     marginBottom: height * 0.008,
//     paddingVertical: height * 0.015,
//     paddingHorizontal: width * 0.02,
//     minHeight: height * 0.05,
//   },
//   cellText: {
//     fontFamily: "Poppins",
//     fontWeight: "500",
//     fontSize: width * 0.028,
//     color: "#000000",
//     textAlign: "center",
//   },
//   noDataContainer: {
//     paddingVertical: height * 0.05,
//     alignItems: "center",
//   },
//   noDataText: {
//     fontFamily: "Poppins",
//     fontSize: width * 0.035,
//     color: "#FFFFFF",
//   },
// });

// export default LearnerProgress;
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

interface StoryScore {
  pronunciationScore?: number;
  accuracyScore?: number;
  miscues?: number;
  timestamp: string;
  quizPercent?: number;
  incorrect?: number;
  quizCompletedAt?: string;
}

interface Student {
  id: string;
  username: string;
  grade: number;
  section: string;
  readerType: string;
  storyScores: {
    [bookTitle: string]: StoryScore;
  };
}

const LearnerProgress = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  const filters = [
    "Name",
    "Grade",
    "Reader Level",
    "Section",
    "Completion +",
    "Completion -",
    "Quiz +",
    "Quiz -",
  ];

  // Fetch all students from Firebase
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userType", "==", "student"));
        const querySnapshot = await getDocs(q);

        const studentList: Student[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          studentList.push({
            id: doc.id,
            username: data.username || data.name || "Unknown",
            grade: data.grade || 0,
            section: data.section || "",
            readerType: data.readerType || "Beginner",
            storyScores: data.storyScores || {},
          });
        });

        setStudents(studentList);
        setFilteredStudents(studentList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (error) {
      return "N/A";
    }
  };

  const getOralReadingSessions = (storyScores: { [key: string]: StoryScore }) => {
    return Object.entries(storyScores).map(([bookTitle, scores]) => ({
      passage: bookTitle,
      date: formatDate(scores.timestamp),
      accuracy: scores.accuracyScore !== undefined ? `${scores.accuracyScore}%` : "N/A",
      miscues: scores.miscues !== undefined ? scores.miscues.toString() : "N/A",
    }));
  };

  const getQuizResults = (storyScores: { [key: string]: StoryScore }) => {
    return Object.entries(storyScores)
      .filter(([_, scores]) => scores.quizCompletedAt)
      .map(([bookTitle, scores]) => ({
        passage: bookTitle,
        date: scores.quizCompletedAt ? formatDate(scores.quizCompletedAt) : "N/A",
        score: scores.quizPercent !== undefined ? `${scores.quizPercent}%` : "N/A",
        incorrect: scores.incorrect !== undefined ? scores.incorrect.toString() : "N/A",
      }));
  };

  const hasOralReadingSessions = (student: Student) => {
    return Object.keys(student.storyScores || {}).length > 0;
  };

  const hasQuizResults = (student: Student) => {
    if (!student.storyScores) return false;
    return Object.values(student.storyScores).some((score) => score.quizCompletedAt);
  };

  // Filter and sort students
  useEffect(() => {
    let result = [...students];

    // Search functionality
    if (searchText) {
      result = result.filter((s) => {
        const searchLower = searchText.toLowerCase();
        const matchesName = s.username.toLowerCase().includes(searchLower);
        const matchesGrade = s.grade.toString().includes(searchText);
        const matchesSection = s.section.toLowerCase().includes(searchLower);
        const matchesReaderLevel = s.readerType.toLowerCase().includes(searchLower);

        return matchesName || matchesGrade || matchesSection || matchesReaderLevel;
      });
    }

    // Sorting based on selected filter
    if (selectedFilter) {
      if (selectedFilter === "Name") {
        result.sort((a, b) => a.username.localeCompare(b.username));
      } else if (selectedFilter === "Grade") {
        result.sort((a, b) => a.grade - b.grade);
      } else if (selectedFilter === "Reader Level") {
        const levelOrder: { [key: string]: number } = {
          Beginner: 1,
          Emerging: 2,
          Proficient: 3,
        };
        result.sort((a, b) => {
          const orderA = levelOrder[a.readerType] || 999;
          const orderB = levelOrder[b.readerType] || 999;
          return orderA - orderB;
        });
      } else if (selectedFilter === "Section") {
        result.sort((a, b) => a.section.localeCompare(b.section));
      } else if (selectedFilter === "Completion +") {
        result.sort((a, b) => {
          const aHas = hasOralReadingSessions(a) ? 1 : 0;
          const bHas = hasOralReadingSessions(b) ? 1 : 0;
          return bHas - aHas;
        });
      } else if (selectedFilter === "Completion -") {
        result.sort((a, b) => {
          const aHas = hasOralReadingSessions(a) ? 1 : 0;
          const bHas = hasOralReadingSessions(b) ? 1 : 0;
          return aHas - bHas;
        });
      } else if (selectedFilter === "Quiz +") {
        result.sort((a, b) => {
          const aHas = hasQuizResults(a) ? 1 : 0;
          const bHas = hasQuizResults(b) ? 1 : 0;
          return bHas - aHas;
        });
      } else if (selectedFilter === "Quiz -") {
        result.sort((a, b) => {
          const aHas = hasQuizResults(a) ? 1 : 0;
          const bHas = hasQuizResults(b) ? 1 : 0;
          return aHas - bHas;
        });
      }
    }

    setFilteredStudents(result);
  }, [searchText, selectedFilter, students]);

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41765D" />
        <Text style={styles.loadingText}>Loading Progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={width * 0.12} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Learners Progress</Text>
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
          placeholder="Search..."
          placeholderTextColor="#00000087"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={() => setShowFilterDropdown(!showFilterDropdown)}>
          <MaterialCommunityIcons
            name="filter-menu-outline"
            size={width * 0.055}
            color="#00000087"
          />
        </TouchableOpacity>
      </View>

      {/* Filter Dropdown */}
      {showFilterDropdown && (
        <View style={styles.filterDropdown}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={styles.filterItem}
              onPress={() => handleFilterSelect(filter)}
            >
              <Text style={styles.filterItemText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Students List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student, studentIndex) => {
            const oralSessions = getOralReadingSessions(student.storyScores);
            const quizResults = getQuizResults(student.storyScores);

            return (
              <View key={student.id}>
                {/* Student Info */}
                <View style={styles.studentInfoContainer}>
                  <Text style={styles.nameText}>{student.username}</Text>
                  <Text style={styles.gradeText}>
                    Grade {student.grade} - Section {student.section}
                  </Text>
                  <Text style={styles.readerLevelText}>
                    Reader Level:{" "}
                    <Text style={styles.readerTypeText}>{student.readerType}</Text>
                  </Text>
                </View>

                {/* Oral Reading Sessions Table */}
                <View style={styles.tableContainer}>
                  <Text style={styles.tableName}>Oral Reading Sessions</Text>

                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.columnHeader, { flex: 2 }]}>Passage</Text>
                    <Text style={[styles.columnHeader, { flex: 1.2 }]}>Date</Text>
                    <Text style={[styles.columnHeader, { flex: 1 }]}>Accuracy</Text>
                    <Text style={[styles.columnHeader, { flex: 1 }]}>Miscues</Text>
                  </View>

                  {/* Table Body */}
                  <View style={styles.tableBody}>
                    {oralSessions.length > 0 ? (
                      oralSessions.map((session, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={2}>
                            {session.passage}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1.2 }]}>
                            {session.date}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1 }]}>
                            {session.accuracy}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1 }]}>
                            {session.miscues}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>
                          No oral reading sessions found
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Quiz Results Table */}
                <View style={styles.tableContainer}>
                  <Text style={styles.tableName}>Quiz Results</Text>

                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.columnHeader, { flex: 2 }]}>Passage</Text>
                    <Text style={[styles.columnHeader, { flex: 1.2 }]}>Date</Text>
                    <Text style={[styles.columnHeader, { flex: 1 }]}>Score</Text>
                    <Text style={[styles.columnHeader, { flex: 1 }]}>Incorrect</Text>
                  </View>

                  {/* Table Body */}
                  <View style={styles.tableBody}>
                    {quizResults.length > 0 ? (
                      quizResults.map((result, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={2}>
                            {result.passage}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1.2 }]}>
                            {result.date}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1 }]}>
                            {result.score}
                          </Text>
                          <Text style={[styles.cellText, { flex: 1 }]}>
                            {result.incorrect}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.noDataContainer}>
                        <Text style={styles.noDataText}>No quiz results found</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Separator Line (only if not the last student) */}
                {studentIndex < filteredStudents.length - 1 && (
                  <View style={styles.separatorContainer}>
                    <View style={[styles.separatorSection, { backgroundColor: "#9FE62D" }]} />
                    <View style={[styles.separatorSection, { backgroundColor: "#FACE7D" }]} />
                    <View style={[styles.separatorSection, { backgroundColor: "#F05959" }]} />
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: height * 0.02,
    fontFamily: "Poppins",
    fontSize: width * 0.04,
    color: "#41765D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingHorizontal: width * 0.065,
    marginBottom: height * 0.02,
  },
  backIcon: {
    position: "absolute",
    left: width * 0.065,
    top: height * 0.08,
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.05,
    color: "#000000",
    textAlign: "center",
    flex: 1,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.065,
    marginBottom: height * 0.02,
    height: height * 0.055,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: width * 0.03,
  },
  searchIcon: {
    marginRight: width * 0.02,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.035,
    color: "#000000",
  },
  filterDropdown: {
    position: "absolute",
    top: height * 0.175,
    right: width * 0.065,
    width: width * 0.45,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000000",
    zIndex: 100,
    elevation: 5,
    paddingVertical: height * 0.01,
  },
  filterItem: {
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
  },
  filterItemText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.025,
    color: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: height * 0.03,
  },
  studentInfoContainer: {
    paddingHorizontal: width * 0.065,
    marginBottom: height * 0.02,
  },
  nameText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#000000",
    marginBottom: height * 0.005,
  },
  gradeText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#000000",
    marginBottom: height * 0.005,
  },
  readerLevelText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#000000",
  },
  readerTypeText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#98c74b",
  },
  tableContainer: {
    marginHorizontal: width * 0.065,
    backgroundColor: "#41765D",
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.02,
  },
  tableName: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    marginBottom: height * 0.015,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  columnHeader: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.03,
    color: "#FFFFFF",
    textAlign: "center",
  },
  tableBody: {
    marginTop: height * 0.01,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    marginBottom: height * 0.008,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    minHeight: height * 0.05,
  },
  cellText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.028,
    color: "#000000",
    textAlign: "center",
  },
  noDataContainer: {
    paddingVertical: height * 0.03,
    alignItems: "center",
  },
  noDataText: {
    fontFamily: "Poppins",
    fontSize: width * 0.035,
    color: "#FFFFFF",
  },
  separatorContainer: {
    flexDirection: "row",
    width: "100%",
    height: height * 0.01,
    marginVertical: height * 0.03,
  },
  separatorSection: {
    flex: 1,
    height: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.1,
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: width * 0.045,
    color: "#000000",
  },
});

export default LearnerProgress;