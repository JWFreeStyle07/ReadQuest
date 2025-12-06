import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
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
}

interface StudentData {
  username: string;
  grade: string;
  section: string;
  readerType: string;
  storyScores: {
    [bookTitle: string]: StoryScore;
  };
}

const LearnerProgress = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setStudentData({
            username: data.username || data.name || "Unknown",
            grade: data.grade || "",
            section: data.section || "",
            readerType: data.readerType || "Beginner",
            storyScores: data.storyScores || {},
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [id]);

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

  const getOralReadingSessions = () => {
    if (!studentData || !studentData.storyScores) return [];

    return Object.entries(studentData.storyScores).map(([bookTitle, scores]) => ({
      passage: bookTitle,
      date: formatDate(scores.timestamp),
      accuracy: scores.accuracyScore !== undefined ? `${scores.accuracyScore}%` : "N/A",
      miscues: scores.miscues !== undefined ? scores.miscues.toString() : "N/A",
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#41765D" />
        <Text style={styles.loadingText}>Loading Progress...</Text>
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Student data not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sessions = getOralReadingSessions();

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={width * 0.08}
            color="#000000"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learner Progress</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{studentData.username}</Text>
          <Text style={styles.gradeText}>
            Grade {studentData.grade} - Section {studentData.section}
          </Text>
          <Text style={styles.readerLevelText}>
            Reader Level:{" "}
            <Text style={styles.readerTypeText}>{studentData.readerType}</Text>
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
          <ScrollView 
            style={styles.tableBody}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text
                    style={[styles.cellText, { flex: 2 }]}
                    numberOfLines={2}
                  >
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
          </ScrollView>
        </View>
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
  errorText: {
    fontFamily: "Poppins",
    fontSize: width * 0.045,
    color: "#000000",
    marginBottom: height * 0.02,
  },
  backButton: {
    backgroundColor: "#41765D",
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.015,
    borderRadius: 5,
  },
  backButtonText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.08,
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.03,
  },
  backIcon: {
    position: "absolute",
    left: width * 0.06,
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
  infoContainer: {
    paddingHorizontal: width * 0.06,
    marginBottom: height * 0.03,
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
    marginHorizontal: width * 0.06,
    backgroundColor: "#41765D",
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.03,
    maxHeight: height * 0.5,
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
    maxHeight: height * 0.35,
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
    paddingVertical: height * 0.05,
    alignItems: "center",
  },
  noDataText: {
    fontFamily: "Poppins",
    fontSize: width * 0.035,
    color: "#FFFFFF",
  },
});

export default LearnerProgress;