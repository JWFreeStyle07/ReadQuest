import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const IntroductionScreen = () => {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation values for wiggle/wave effect
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleContinue = () => {
    setIsAnimating(true);

    // Create wiggle animation (rotate back and forth) - 1 second total
    const wiggle = Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    // Add slight scale effect
    const scale = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    // Run animations in parallel (no loop, just once)
    Animated.parallel([
      wiggle,
      scale,
    ]).start(() => {
      // Navigate to student dashboard after animation EDIT
      setTimeout(() => {
        router.push("../../algorithm/pronunciation");
      }, 500);
    });
  };

  // Interpolate rotation
  const rotate = wiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Center Content Container */}
      <View style={styles.centerContent}>
        {/* Animated Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              transform: [{ rotate }, { scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={require("../../assets/images/welcome/birdBook.png")}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Greeting Text */}
        <Text style={styles.greetingText}>Hi there! I'm Bibo</Text>

        {/* Question Text */}
        <Text style={styles.questionText}>Ready to read?</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, isAnimating && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={isAnimating}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  centerContent: {
    position: "absolute",
    top: height * 0.28,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: height * 0.01,
  },
  image: {
    width: width * 0.406,
    height: height * 0.179,
  },
  greetingText: {
    width: width * 0.632,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0625,
    lineHeight: width * 0.0625,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: height * 0.005,
  },
  questionText: {
    width: width * 0.392,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.05,
    lineHeight: width * 0.05,
    textAlign: "center",
    color: "#FFFFFF",
  },
  continueButton: {
    position: "absolute",
    top: height * 0.85,
    left: width * 0.157,
    width: width * 0.668,
    height: height * 0.056,
    backgroundColor: "#94D231",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  continueText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.045,
    lineHeight: width * 0.045,
    textAlign: "center",
    color: "#000000",
    letterSpacing: 0.5,
  },
});

export default IntroductionScreen;