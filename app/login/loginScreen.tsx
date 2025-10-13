import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  const showSuccessAnimation = (callback: () => void) => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(callback, 1000);
      });
    });
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("Missing Information", "Please enter your username.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Missing Information", "Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Convert username to email format (same as sign in)
      const email = `${username.replace(" ", "").toLowerCase()}@readquest.app`;

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user profile exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (!userDoc.exists()) {
        Alert.alert("Error", "User profile not found. Please sign in first.");
        setLoading(false);
        return;
      }

      setLoading(false);

      // Show success animation
      showSuccessAnimation(() => {
        router.push("../../login/introductionScreen"); // Change to your actual introductory screen path
      });

    } catch (error: any) {
      setLoading(false);
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        Alert.alert("Login Failed", "Invalid username or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert("Too Many Attempts", "Too many failed login attempts. Please try again later.");
      } else {
        Alert.alert("Login Failed", error.message || "An error occurred. Please try again.");
      }
      
      console.error("Login Error:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -height * 0.2}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Arrow */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={width * 0.08}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Success Animation Overlay */}
          {showSuccess && (
            <View style={styles.successOverlay}>
              <Animated.View
                style={[
                  styles.successCircle,
                  {
                    transform: [{ scale: successScale }],
                    opacity: successOpacity,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.checkmarkContainer,
                    {
                      transform: [{ scale: checkmarkScale }],
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={width * 0.2}
                    color="#ffffff"
                  />
                </Animated.View>
              </Animated.View>
              <Animated.Text
                style={[
                  styles.successText,
                  {
                    opacity: successOpacity,
                  },
                ]}
              >
                Login Successful!
              </Animated.Text>
            </View>
          )}

          {/* Circular Image Container */}
          <View style={styles.imageCircleContainer}>
            <View style={styles.imageCircle}>
              <Image
                source={require("../../assets/images/login/birdCoveringEye.png")}
                style={styles.circleImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter your details</Text>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            {/* Username Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="First Last"
                placeholderTextColor="#ffffff60"
                autoCapitalize="words"
                editable={!loading && !showSuccess}
              />
            </View>

            {/* Divider */}
            <View style={styles.horizontalDivider} />

            {/* Password Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor="#ffffff60"
                  secureTextEntry={!showPassword}
                  editable={!loading && !showSuccess}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={width * 0.06}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Log In Button */}
          <TouchableOpacity
            style={[styles.loginButton, (loading || showSuccess) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading || showSuccess}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.loginText}>LOG IN</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: height,
  },
  backButton: {
    position: "absolute",
    top: height * 0.06,
    left: width * 0.05,
    zIndex: 10,
    padding: width * 0.02,
  },
  imageCircleContainer: {
    position: "absolute",
    top: height * 0.275,
    left: width * 0.5,
    transform: [{ translateX: -(width * 0.141) }],
    alignItems: "center",
  },
  imageCircle: {
    width: width * 0.281,
    height: width * 0.262,
    borderRadius: width * 0.1345,
    borderWidth: 1,
    borderColor: "#94D231",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  circleImage: {
    top: height * 0.03,
    width: width * 0.29,
    height: width * 0.29,
    transform: [{ rotate: "-0.15deg" }],
  },
  title: {
    position: "absolute",
    top: height * 0.445,
    width: width * 0.698,
    left: width * 0.142,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0625,
    lineHeight: width * 0.0625,
    textAlign: "center",
    color: "#F8CB5E",
  },
  inputContainer: {
    position: "absolute",
    top: height * 0.514,
    left: width * 0.089,
    width: width * 0.822,
    borderWidth: 1,
    borderColor: "#94D231",
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  inputSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.010,
  },
  inputLabel: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0325,
    lineHeight: width * 0.039,
    color: "#FFFFFF",
    marginBottom: height * 0.005,
  },
  input: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#94D231",
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: width * 0.0001,
  },
  loginButton: {
    position: "absolute",
    top: height * 0.69,
    left: width * 0.09,
    width: width * 0.82,
    height: height * 0.056,
    backgroundColor: "#94D231",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#000000",
    letterSpacing: 0.5,
  },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  successCircle: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "#94D231",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    marginTop: height * 0.03,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.05,
    color: "#F8CB5E",
    textAlign: "center",
  },
});

export default LoginScreen;