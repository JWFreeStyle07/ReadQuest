import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width, height } = Dimensions.get("window");

// Story data with titles, points, and images
const STORIES = [
  { 
    title: "Telling Time", 
    points: 100, 
    image: require("../../assets/images/books/tellingTime.png"),
    route: "../../algorithm/pronunciation"
  },
  { 
    title: "Counting the Hours", 
    points: 80, 
    image: require("../../assets/images/books/countingTheHours.png"),
    route: "../../algorithm/countingTheHours"
  },
  { 
    title: "Nose Bleeds", 
    points: 90, 
    image: require("../../assets/images/books/noseBleeds.png"),
    route: "../../algorithm/noseBleeds"
  },
  { 
    title: "Matilda", 
    points: 100, 
    image: require("../../assets/images/books/Matilda.png"),
    route: "../../books/Matilda"
  },
  { 
    title: "The Secret Ingredient", 
    points: 120, 
    image: require("../../assets/images/books/secretIngredient.png"),
    route: "../../books/secretIngredient"
  },
  { 
    title: "Journey to the Stars", 
    points: 110, 
    image: require("../../assets/images/books/journeyToTheStars.png"),
    route: "../../books/journeyToTheStars"
  },
];

// Suggested books data - matched with STORIES
const SUGGESTED_BOOKS = [
  { 
    id: 1, 
    image: require("../../assets/images/books/tellingTime.png"), 
    route: "../../offline/TT",
    title: "Telling Time"
  },
  { 
    id: 2, 
    image: require("../../assets/images/books/countingTheHours.png"), 
    route: "../offline/CTH",
    title: "Counting the Hours"
  },
  { 
    id: 3, 
    image: require("../../assets/images/books/noseBleeds.png"), 
    route: "../../offline/NB",
    title: "Nose Bleeds"
  },
  { 
    id: 4, 
    image: require("../../assets/images/books/secretIngredient.png"), 
    route: "../../books/secretIngredient",
    title: "The Secret Ingredient"
  },
  { 
    id: 5, 
    image: require("../../assets/images/books/Matilda.png"), 
    route: "../../books/Matilda",
    title: "Matilda"
  },
  { 
    id: 6, 
    image: require("../../assets/images/books/journeyToTheStars.png"), 
    route: "../../books/journeyToTheStars",
    title: "Journey to the Stars"
  },
];

const OfflineScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("Guest");
  const [starPoints, setStarPoints] = useState(0);
  const [todayStory, setTodayStory] = useState(STORIES[0]);
  const [showStarPopup, setShowStarPopup] = useState(false);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const [centerIndex, setCenterIndex] = useState(2);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Select random story for today
    const selectTodayStory = async () => {
      const today = new Date().toDateString();
      const savedDate = await AsyncStorage.getItem("offlineStoryDate");
      
      if (savedDate !== today) {
        const randomIndex = Math.floor(Math.random() * STORIES.length);
        setTodayStory(STORIES[randomIndex]);
        await AsyncStorage.setItem("offlineStoryDate", today);
        await AsyncStorage.setItem("offlineStoryIndex", randomIndex.toString());
      } else {
        const savedIndex = parseInt((await AsyncStorage.getItem("offlineStoryIndex")) || "0");
        setTodayStory(STORIES[savedIndex]);
      }
    };

    selectTodayStory();
  }, []);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const itemWidth = width * 0.43;
    const index = Math.round(scrollPosition / itemWidth);
    setCenterIndex(index);
  };

  const getBookStyle = (index: number) => {
    const isCenterBook = index === centerIndex;
    return {
      width: isCenterBook ? width * 0.43 : width * 0.39,
      height: isCenterBook ? height * 0.305 : height * 0.245,
      marginTop: isCenterBook ? 0 : height * 0.03,
    };
  };

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.profileCircle}>
              <Image
                source={require("../../assets/images/welcome/circleBg.png")}
                style={styles.profileBgImage}
                resizeMode="cover"
              />
            </View>
            <Image
              source={require("../../assets/images/welcome/birdHead.png")}
              style={styles.profileIcon}
              resizeMode="contain"
            />
          </View>

          <View style={styles.greetingContainer}>
            <Text style={styles.helloText}>Hello!</Text>
            <Text style={styles.usernameText}>{username}</Text>
          </View>

          <TouchableOpacity
            style={styles.starButton}
            onPress={() => setShowStarPopup(true)}
          >
            <Image
              source={require("../../assets/images/welcome/star.png")}
              style={styles.starIcon}
              resizeMode="contain"
            />
            <Text style={styles.starPointsText}>{starPoints}</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Pick Rectangle */}
        <View style={styles.todayPickContainer}>
          <Text style={styles.todayPickLabel}>Today's pick</Text>
          <Text style={styles.todayPickTitle}>"{todayStory.title}"</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.readButton}
              onPress={() => {
                router.push(todayStory.route as any);
              }}
            >
              <Text style={styles.readButtonText}>Read</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pointsButton}
              onPress={() => setShowPointsPopup(true)}
            >
              <Image
                source={require("../../assets/images/welcome/star.png")}
                style={styles.pointsIcon}
                resizeMode="contain"
              />
              <Text style={styles.pointsText}>{todayStory.points}</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={todayStory.image}
            style={styles.todayPickImage}
            resizeMode="contain"
          />
        </View>

        {/* Suggested Readings Section */}
        <View style={styles.suggestedHeader}>
          <Text style={styles.suggestedText}>Suggested readings</Text>
          <TouchableOpacity onPress={() => router.push("../../student/allBooks")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal ScrollView for Suggested Books */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.booksScrollContent}
          snapToInterval={width * 0.43}
          decelerationRate="fast"
        >
          {SUGGESTED_BOOKS.map((book, index) => (
            <TouchableOpacity
              key={book.id}
              style={[styles.bookContainer, getBookStyle(index)]}
              onPress={() => {
                router.push(book.route as any);
              }}
            >
              <Image
                source={book.image}
                style={styles.bookImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Next Reward Rectangle */}
        <View style={styles.rewardContainer}>
          <Image
            source={require("../../assets/images/welcome/starJar.png")}
            style={styles.trophyImage}
            resizeMode="contain"
          />
          <Text style={styles.rewardText}>Next reward at 100 {"\n"}Stars!</Text>
          <View style={styles.rewardButton}>
            <Image
              source={require("../../assets/images/welcome/star.png")}
              style={styles.rewardStarIcon}
              resizeMode="contain"
            />
            <Text style={styles.rewardStarText}>100</Text>
          </View>
        </View>
      </ScrollView>

      {/* Star Points Popup */}
      <Modal
        visible={showStarPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStarPopup(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setShowStarPopup(false)}
        >
          <View style={styles.popupContainer}>
            <Text style={styles.popupText}>
              You have {starPoints} star points! Keep reading to earn more.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Points Info Popup */}
      <Modal
        visible={showPointsPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPointsPopup(false)}
      >
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={() => setShowPointsPopup(false)}
        >
          <View style={styles.popupContainer}>
            <Text style={styles.popupText}>Points for reading</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.091,
    paddingHorizontal: width * 0.083,
    marginBottom: height * 0.025,
  },
  profileContainer: {
    position: "relative",
    width: width * 0.161,
    height: height * 0.08,
  },
  profileCircle: {
    width: width * 0.161,
    height: height * 0.08,
    borderRadius: width * 0.0805,
    overflow: "hidden",
  },
  profileBgImage: {
    width: "100%",
    height: "100%",
  },
  profileIcon: {
    position: "absolute",
    top: height * -0.015,
    left: width * 0.000,
    width: width * 0.165,
    height: height * 0.112,
  },
  greetingContainer: {
    marginLeft: width * 0.026,
    flex: 1,
  },
  helloText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0375,
    lineHeight: width * 0.0375,
    color: "#FFFFFF",
    marginBottom: height * 0.005,
  },
  usernameText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0375,
    lineHeight: width * 0.0375,
    color: "#FFFFFF",
  },
  starButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#94D231",
    borderRadius: 100,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.035,
  },
  starIcon: {
    width: width * 0.059,
    height: height * 0.029,
    marginRight: width * 0.015,
    borderRadius: 30
  },
  starPointsText: {
    fontFamily: "Poppins",
    fontWeight: "900",
    fontSize: width * 0.0375,
    lineHeight: width * 0.0375,
    color: "#ffffffff",
  },
  todayPickContainer: {
    marginHorizontal: width * 0.047,
    backgroundColor: "#94D231D9",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#94D231",
    padding: width * 0.062,
    marginBottom: height * 0.025,
    position: "relative",
  },
  todayPickLabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0375,
    lineHeight: width * 0.0375,
    color: "#28242C",
    marginBottom: height * 0.01,
  },
  todayPickTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.05,
    lineHeight: width * 0.05,
    color: "#28242C",
    marginBottom: height * 0.015,
  },
  buttonRow: {
    flexDirection: "row",
    gap: width * 0.02,
  },
  readButton: {
    backgroundColor: "#315E34D9",
    borderRadius: 100,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.045,
  },
  readButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.0325,
    lineHeight: width * 0.0325,
    color: "#FFFFFF",
  },
  pointsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#315E34D9",
    borderRadius: 100,
    paddingVertical: height * 0.008,
    paddingHorizontal: width * 0.03,
    gap: width * 0.015,
  },
  pointsIcon: {
    width: width * 0.042,
    height: height * 0.02,
    borderRadius: width * 0.021,
  },
  pointsText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.0325,
    lineHeight: width * 0.0325,
    color: "#FFFFFF",
  },
  todayPickImage: {
    position: "absolute",
    top: height * 0.007,
    right: width * 0.037,
    width: width * 0.245,
    height: height * 0.143,
    borderRadius: 0
  },
  suggestedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: width * 0.073,
    marginBottom: height * 0.02,
  },
  suggestedText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    lineHeight: width * 0.04,
    color: "#FFFFFF",
  },
  seeAllText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0375,
    lineHeight: width * 0.0375,
    color: "#F8CB5E",
    textDecorationLine: "underline",
  },
  booksScrollContent: {
    paddingHorizontal: width * 0.095,
    gap: width * 0.02,
    marginBottom: height * 0.03,
  },
  bookContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  rewardContainer: {
    flexDirection: "row",
    alignItems: "center",
    top: width * 0.1,
    marginHorizontal: width * 0.047,
    backgroundColor: "#94D231",
    borderRadius: 30,
    padding: width * 0.03,
    marginBottom: height * 0.5,
  },
  trophyImage: {
    width: width * 0.244,
    height: height * 0.093,
    marginRight: width * 0.01,
  },
  rewardText: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    lineHeight: width * 0.04,
    color: "#28242C",
  },
  rewardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#315E34D9",
    borderRadius: 100,
    paddingVertical: height * 0.005,
    paddingHorizontal: width * 0.03,
    paddingRight: width * 0.05,
    gap: width * 0.015,
  },
  rewardStarIcon: {
    width: width * 0.042,
    height: height * 0.02,
    borderRadius: width * 0.021,
  },
  rewardStarText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.0325,
    lineHeight: width * 0.0325,
    color: "#FFFFFF",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    backgroundColor: "#315E34D9",
    borderRadius: 20,
    padding: width * 0.1,
    maxWidth: width * 0.8,
  },
  popupText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.04,
    lineHeight: width * 0.048,
    color: "#FFFFFF",
    textAlign: "center",
  },
});

export default OfflineScreen;