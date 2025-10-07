import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const SecondScreen = () => {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons name="arrow-left" size={width * 0.08} color="#ffffffff" />
      </TouchableOpacity>

      {/* Speech Bubble */}
      <View style={styles.speechBubbleContainer}>
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>
            Who's using{"\n"}ReadQuest?
          </Text>
        </View>
        {/* Speech Bubble Tail */}
        <View style={styles.speechBubbleTail} />
      </View>

      {/* Oval behind image */}
      <View style={styles.ovalContainer}>
        <View style={styles.oval} />
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/login/birdMagnifier.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonsContainer}>
        {/* Student Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => {
            // Handle student selection
            console.log("Student selected");
          }}
        >
          <LinearGradient
            colors={["#4a7c44", "#5a9152"]} // Tweak these colors as needed
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Student</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Teacher Button */}
        <TouchableOpacity
          style={styles.buttonWrapper}
          onPress={() => {
            // Handle teacher selection
            console.log("Teacher selected");
          }}
        >
          <LinearGradient
            colors={["#4a7c44", "#5a9152"]} // Tweak these colors as needed
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Teacher</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  backButton: {
    position: "absolute",
    top: height * 0.06,
    left: width * 0.05,
    zIndex: 10,
    padding: width * 0.02,
  },
  speechBubbleContainer: {
    position: "absolute",
    top: height * 0.22,
    left: width * 0.5,
    transform: [{ translateX: -width * 0.143 }],
    alignItems: "center",
  },
  speechBubble: {
    width: width * 0.286,
    height: height * 0.133,
    borderWidth: 2,
    borderColor: "#94D231",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  speechBubbleTail: {
    position: "absolute",
    bottom: -height * 0.025,
    left: width * 0.04,
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: width * 0.03,
    borderRightWidth: width * 0.03,
    borderTopWidth: height * 0.04,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#94D231",
  },
  speechBubbleText: {
    fontFamily: "Poppins",
    fontWeight: "800",
    fontSize: width * 0.034,
    lineHeight: width * 0.054,
    textAlign: "center",
    color: "#ffffffff",
    paddingHorizontal: width * 0.02,
  },
  ovalContainer: {
    position: "absolute",
    top: height * 0.51,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 0,
  },
  oval: {
    width: width * 0.3,
    height: height * 0.03,
    backgroundColor: "#f6c856",
    borderRadius: width * 0.1,
  },
  imageContainer: {
    position: "absolute",
    top: height * 0.35,
    left: 0,
    right: 0,
    alignItems: "center",
    height: height * 0.20,
    zIndex: 1,
  },
  image: {
    width: width * 0.6,
    height: "100%",
  },
  buttonsContainer: {
    position: "absolute",
    bottom: height * 0.1,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: height * 0.02,
  },
  buttonWrapper: {
    width: width * 0.687,
    height: height * 0.117,
    shadowColor: "#000000",
    shadowOffset: {
      width: -4,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 8,
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#94D231",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins",
    fontWeight: "900",
    fontSize: width * 0.045,
    color: "#ffffffff",
    letterSpacing: 0.5,
  },
});

export default SecondScreen;