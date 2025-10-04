import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  // Animated values for leaves
  const leftLeafAnim = useRef(new Animated.Value(0)).current;
  const rightLeafAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(leftLeafAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(rightLeafAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(slide);
  };

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {/* -------- First Screen -------- */}
      <View style={styles.container}>
        {/* Image Section */}
          {/* Leaves Overlay */}
          <Animated.Image
            source={require("../assets/images/login/leafLeft.png")}
            style={[
              styles.leafLeft,
              {
                opacity: leftLeafAnim,
                transform: [
                  {
                    translateY: leftLeafAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />
          <Animated.Image
            source={require("../assets/images/login/leafRight.png")}
            style={[
              styles.leafRight,
              {
                opacity: rightLeafAnim,
                transform: [
                  {
                    translateY: rightLeafAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
            resizeMode="contain"
          />
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/images/login/readBoy.jpg")}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Gradient Section */}
        <LinearGradient
          colors={["#0d4949", "#315e35"]}
          style={styles.gradientContainer}
        >
          <Text style={styles.title}>Turn Reading Into an{"\n"}Adventure!</Text>
          <Text style={styles.subtitle}>
            Practice reading out loud, improve your{"\n"}
            pronunciation, and learn new words
          </Text>

          {/* Dot Indicators */}
          <View style={styles.dotsContainer}>
            {[0, 1].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: activeIndex === i ? 12 : 8,
                    height: activeIndex === i ? 12 : 8,
                    backgroundColor: "white",
                  },
                ]}
              />
            ))}
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => router.push("../algorithm/pronunciation")}
          >
            <Text style={styles.getStartedText}>GET STARTED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login/loginScreen")}
          >
            <Text style={styles.loginText}>I ALREADY HAVE AN ACCOUNT</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* -------- Second Screen -------- */}
      <View style={[styles.container, { backgroundColor: "#315e35" }]}>
        <Text
          style={{
            color: "white",
            fontSize: 24,
            textAlign: "center",
            marginTop: height / 3,
          }}
        >
          This is the second screen
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height,
    flex: 1,
    backgroundColor: "white",
  },
  imageContainer: {
    height: height * 0.35, // 2/5 of screen
    width: "100%",
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  leafLeft: {
    position: "absolute",
    transform: [{ rotate: "-20deg" }],
    top: height * 0.19,   // move up/down above the horizon
    left: -50,
    width: 200,
    height: 200,
    zIndex: 20,
  },
  leafRight: {
    position: "absolute",
    transform: [{ rotate: "-15deg" }],
    top: height * 0.12,
    right: -100,
    width: 300,
    height: 300,
    zIndex: 10,
  },
  gradientContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#aea245",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    gap: 10,
  },
  dot: {
    borderRadius: 6,
  },
  getStartedBtn: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
    marginBottom: 15,
  },
  getStartedText: {
    color: "black",
    fontWeight: "bold",
  },
  loginBtn: {
    borderColor: "white",
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Login;
