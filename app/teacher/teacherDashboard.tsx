import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

interface Student {
  id: string;
  username: string;
  scores: number[];
  readerType: string;
  grade?: string;
}

const TeacherDashboard = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(width))[0];

  const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
  const filters = [
    "Below 60% (Needs Attention)",
    "60–79% (Developing)",
    "80% above (Proficient)",
  ];

  // Fetch students from Firebase
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
            scores: data.scores || [],
            readerType: data.readerType || "Beginner",
            grade: data.grade || "",
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
// Calculate average score
  const getAverageScore = (scores: number[]) => {
    if (!scores || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

//Calculate Statistics
  const totalLearners = students.length;

// Count students with average reading score below 30%
const learnersNeedingIntervention = students.filter((s) => {
  const avgScore = getAverageScore(s.scores);
  return avgScore < 30;
}).length;

  

  const calculateOverallAverageScore = () => {
  if (students.length === 0) return 0;
  
  let totalAverageSum = 0;
  let studentsWithScores = 0;
  
  students.forEach((student) => {
    if (student.scores && student.scores.length > 0) {
      const studentAverage = student.scores.reduce((a, b) => a + b, 0) / student.scores.length;
      totalAverageSum += studentAverage;
      studentsWithScores++;
    }
  });
  
  if (studentsWithScores === 0) return 0;
  
  return Math.round(totalAverageSum / studentsWithScores);
};

const averageReadingScore = calculateOverallAverageScore();

  // Filter students based on search and filter
  useEffect(() => {
    let result = students;

    if (searchText) {
      result = result.filter((s) =>
        s.username.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedFilter) {
      result = result.filter((s) => {
        const avg = getAverageScore(s.scores);
        if (selectedFilter.includes("Below 60%")) return avg < 60;
        if (selectedFilter.includes("60–79%")) return avg >= 60 && avg < 80;
        if (selectedFilter.includes("80%")) return avg >= 80;
        return true;
      });
    }

    setFilteredStudents(result);
  }, [searchText, selectedFilter, students]);

  // Side menu animation
  const openSideMenu = () => {
    setSideMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: width - 240,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const closeSideMenu = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setSideMenuVisible(false));
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setSearchText(filter);
    setShowFilterDropdown(false);
  };

  const handleGradeSelect = (grade: string) => {
    setSelectedGrade(grade);
    setShowGradeDropdown(false);
  };

  const navigateTo = (screen: string) => {
    closeSideMenu();
    setTimeout(() => {
      router.push(screen as any);
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41765D" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dashboardTitle}>Dashboard</Text>
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={width * 0.04}
          color="#000"
          style={styles.bookIcon}
        />
        
        {/* Grade Dropdown */}
        <TouchableOpacity
          style={styles.gradeDropdown}
          onPress={() => setShowGradeDropdown(!showGradeDropdown)}
        >
          <Text style={styles.gradeText}>{selectedGrade}</Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={width * 0.03}
            color="#000"
          />
        </TouchableOpacity>

        {/* Menu Icon */}
        <TouchableOpacity style={styles.menuButton} onPress={openSideMenu}>
          <MaterialCommunityIcons name="menu" size={width * 0.08} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Grade Dropdown Modal */}
      {showGradeDropdown && (
        <View style={styles.gradeDropdownList}>
          {grades.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={styles.gradeItem}
              onPress={() => handleGradeSelect(grade)}
            >
              <Text style={styles.gradeItemText}>{grade}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Stats Boxes */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: "#9FE62DCF" }]}>
          <Text style={styles.statLabel}>Total{"\n"}Learners</Text>
          <Text style={styles.statNumber}>{totalLearners}</Text>
        </View>

        <View style={[styles.statBox, styles.statBoxMiddle, { backgroundColor: "#FACE7D" }]}>
          <Text style={styles.statLabel}>Learners needing{"\n"}Intervention</Text>
          <Text style={styles.statNumber}>{learnersNeedingIntervention}</Text>
        </View>

        <View style={[styles.statBox, styles.statBoxSmall, { backgroundColor: "#F05959" }]}>
          <Text style={styles.statLabel}>Average Oral{"\n"}Reading{"\n"}Score</Text>
          <Text style={styles.statNumber}>{averageReadingScore}</Text>
        </View>
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
            name="chevron-down"
            size={width * 0.05}
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

      {/* Data Table */}
      {/* Data Table */}
<View style={[
  styles.tableContainer,
  {
    height: Math.min(
      height * 0.45,
      height * 0.06 + (filteredStudents.length > 0 ? filteredStudents.length * height * 0.05 : height * 0.08)
    ),
  }
]}>
  {/* Table Header */}
  <View style={styles.tableHeader}>
    <Text style={[styles.columnHeader, { flex: 2 }]}>Name</Text>
    <Text style={[styles.columnHeader, { flex: 1 }]}>Reading</Text>
    <Text style={[styles.columnHeader, { flex: 1.5 }]}>Reader Level</Text>
    <Text style={[styles.columnHeader, { flex: 1.5 }]}>View Progress</Text>
  </View>

  {/* Table Data */}
  <ScrollView 
    style={styles.tableBody} 
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled={true}
  >
    {filteredStudents.map((student) => (
      <View key={student.id} style={styles.tableRow}>
        <Text style={[styles.cellText, { flex: 2 }]} numberOfLines={1}>
          {student.username}
        </Text>
        <Text style={[styles.cellText, { flex: 1 }]}>
          {getAverageScore(student.scores)}%
        </Text>
        <Text style={[styles.cellText, { flex: 1.5 }]} numberOfLines={1}>
          {student.readerType}
        </Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/teacher/studentAnalytics?id=${student.id}` as any)}
        >
          <Text style={styles.viewButtonText}>View Progress</Text>
        </TouchableOpacity>
      </View>
    ))}
    {filteredStudents.length === 0 && (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No students found</Text>
      </View>
    )}
  </ScrollView>
</View>

      {/* Side Menu Modal */}
<Modal
  visible={sideMenuVisible}
  transparent
  animationType="none"
  onRequestClose={closeSideMenu}
>
  <TouchableOpacity
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={closeSideMenu}
  >
    <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
  <View style={styles.sideMenuContent}>
    {/* Menu Header */}
    <Text style={styles.menuTitle}>ReadQuest</Text>
    <View style={styles.menuDivider} />

    {/* Top Menu Items */}
    <View style={styles.topMenuItems}>
      <TouchableOpacity style={styles.menuItem} onPress={closeSideMenu}>
        <MaterialCommunityIcons
          name="file-table-box-multiple"
          size={18}
          color="#000"
        />
        <Text style={styles.menuItemText}>Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigateTo("../../teacher/learnerProgress")}
      >
        <MaterialCommunityIcons name="progress-check" size={18} color="#000" />
        <Text style={styles.menuItemText}>Progress Tracking</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigateTo("../../teacher/readingMaterials")}
      >
        <MaterialCommunityIcons
          name="book-open-blank-variant"
          size={20}
          color="#000"
        />
        <Text style={styles.menuItemText}>Reading Materials</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigateTo("../../teacher/addNewMaterial")}
      >
        <MaterialCommunityIcons
          name="checkbox-multiple-marked-outline"
          size={24}
          color="#000"
        />
        <Text style={styles.menuItemText}>Quiz Management</Text>
      </TouchableOpacity>
    </View>

    {/* Bottom Section - Account, Settings & Green Footer */}
    <View style={styles.bottomSection}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigateTo("../../teacher/teacherAccount")}
      >
        <MaterialCommunityIcons name="account-circle" size={28} color="#000" />
        <Text style={styles.menuItemText}>Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigateTo("../../teacher/settings")}
      >
        <MaterialCommunityIcons name="cog-outline" size={31} color="#000" />
        <Text style={styles.menuItemText}>Settings</Text>
      </TouchableOpacity>

      {/* Green Footer */}
      <View style={styles.menuFooter} />
    </View>
  </View>
</Animated.View>
  </TouchableOpacity>
</Modal>
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
    marginTop: 10,
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#41765D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingHorizontal: width * 0.04,
  },
  dashboardTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.065,
    color: "#000000",
  },
  bookIcon: {
    marginLeft: width * 0.02,
  },
  gradeDropdown: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: width * 0.02,
  },
  gradeText: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: width * 0.03,
    color: "#000000",
  },
  menuButton: {
    position: "absolute",
    right: width * 0.04,
    top: height * 0.07,
    padding: width * 0.02,
  },
  gradeDropdownList: {
    position: "absolute",
    top: height * 0.12,
    left: width * 0.45,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#000000",
    zIndex: 100,
    elevation: 5,
  },
  gradeItem: {
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.04,
  },
  gradeItemText: {
    fontFamily: "Poppins",
    fontSize: width * 0.03,
    color: "#000000",
  },
  statsContainer: {
  flexDirection: "row",
  justifyContent: "center",
  paddingHorizontal: width * 0.04,
  marginTop: height * 0.03,
  gap: 0,
},
  statBox: {
    width: width * 0.29,
    height: height * 0.2,
    borderRadius: 20,
    padding: width * 0.03,
    justifyContent: "space-between",
  },
  statBoxMiddle: {
    width: width * 0.29,
  },
  statBoxSmall: {
    width: width * 0.29,
  },
  statLabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.03,
    color: "#000000",
  },
  statNumber: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.065,
    color: "#000000",
    textAlign: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.05,
    marginTop: height * 0.02,
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
    top: height * 0.42,
    right: width * 0.05,
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
  tableContainer: {
  marginHorizontal: width * 0.05,
  marginTop: height * 0.015,
  marginBottom: height * 0.02,
  backgroundColor: "#41765D",
  borderRadius: 10,
  padding: width * 0.03,
  maxHeight: height * 0.45,
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
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
  },
    cellText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.025,
    color: "#000000",
    textAlign: "center",
    },
  viewButton: {
    flex: 1.5,
    backgroundColor: "#94D231",
    borderRadius: 5,
    paddingVertical: height * 0.008,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  viewButtonText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.023,
    color: "#000000",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.05,
  },
  noDataText: {
    fontFamily: "Poppins",
    fontSize: width * 0.04,
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  sideMenu: {
  position: "absolute",
  top: 0,
  width: 240,
  height: "100%",
  backgroundColor: "#FFFFFF",
},
sideMenuContent: {
  flex: 1,
  justifyContent: "space-between",
},
topMenuItems: {
  marginTop: height * 0.02,
},
bottomSection: {
  marginTop: "auto",
},
menuFooter: {
  width: 240,
  height: 68,
  backgroundColor: "#41765D",
},
  menuTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.05,
    color: "#F4C62D",
    textAlign: "center",
    marginTop: height * 0.1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F4C62D",
    marginTop: height * 0.015,
    marginHorizontal: width * 0.02,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  menuItemText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.038,
    color: "#000000",
    marginLeft: width * 0.03,
  },
});

export default TeacherDashboard;