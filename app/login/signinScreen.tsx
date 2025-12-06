import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
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

const SigninScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher'>('student');
  const [initializing, setInitializing] = useState(true);
  

  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const getUserType = async () => {
      try {
        const pendingUserType = await AsyncStorage.getItem('pendingUserType');
        console.log("📱 Retrieved pendingUserType from AsyncStorage:", pendingUserType);
        if (pendingUserType) {
          setUserType(pendingUserType as 'student' | 'teacher');
        } else {
          setUserType('student');
        }
      } catch (error) {
        console.error("Error retrieving user type:", error);
        setUserType('student');
      } finally {
        setInitializing(false);
      }
    };
    getUserType();
  }, []);

  const validateUsername = (name: string): boolean => {
    if (name.length < 5 || name.length > 20) {
      Alert.alert("Invalid Username", "Username must be between 5-20 characters long.");
      return false;
    }

    const spaceCount = (name.match(/ /g) || []).length;
    if (spaceCount !== 1) {
      Alert.alert("Invalid Username", "Username must contain exactly one space separating first and last name.");
      return false;
    }

    const nameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
    if (!nameRegex.test(name)) {
      Alert.alert("Invalid Username", "Username must contain only alphabets and one space (no numbers or special characters).");
      return false;
    }

    const parts = name.split(" ");
    if (parts[0].length === 0 || parts[1].length === 0) {
      Alert.alert("Invalid Username", "Both first name and last name are required.");
      return false;
    }

    return true;
  };

  const validatePassword = (pass: string): boolean => {
    if (pass.length < 5 || pass.length > 20) {
      Alert.alert("Invalid Password", "Password must be between 5-20 characters long.");
      return false;
    }

    const hasLetter = /[A-Za-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);

    if (!hasLetter || !hasNumber) {
      Alert.alert("Invalid Password", "Password must contain both letters and numbers.");
      return false;
    }

    return true;
  };

  const validateGrade = (gradeValue: string): boolean => {
    if (!gradeValue.trim()) {
      Alert.alert("Invalid Grade", "Grade level is required for students.");
      return false;
    }

    const gradeRegex = /^[0-9]+$/;
    if (!gradeRegex.test(gradeValue)) {
      Alert.alert("Invalid Grade", "Grade must contain only numbers.");
      return false;
    }

    const gradeNum = parseInt(gradeValue);
    if (gradeNum < 1 || gradeNum > 12) {
      Alert.alert("Invalid Grade", "Grade must be between 1 and 12.");
      return false;
    }

    return true;
  };

  const validateSection = (sectionValue: string): boolean => {
    if (!sectionValue.trim()) {
      Alert.alert("Invalid Section", "Section is required for students.");
      return false;
    }

    const sectionRegex = /^[A-Za-z0-9]+$/;
    if (!sectionRegex.test(sectionValue)) {
      Alert.alert("Invalid Section", "Section must contain only letters and numbers (no special characters).");
      return false;
    }

    if (sectionValue.length > 10) {
      Alert.alert("Invalid Section", "Section must be 10 characters or less.");
      return false;
    }

    return true;
  };

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

  const handleSignIn = async () => {
    if (!validateUsername(username)) return;
    if (!validatePassword(password)) return;
    
    // Validate grade and section only for students
    if (userType === 'student') {
      if (!validateGrade(grade)) return;
      if (!validateSection(section)) return;
    }
    
    if (!userType) {
      Alert.alert("Error", "User type not loaded. Please try again.");
      return;
    }
    
    setLoading(true);

    try {
      const email = `${username.replace(" ", "").toLowerCase()}@readquest.app`;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Prepare user data based on user type
      const userData: any = {
        username: username,
        email: email,
        userType: userType,
        createdAt: new Date().toISOString(),
        scores: [],
        readerType: "Beginner",
      };

      // Add grade and section only for students
      if (userType === 'student') {
        userData.grade = parseInt(grade, 10); // Convert to integer
        userData.section = section;
      }

      // Store user profile in Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Clear the pending user type from AsyncStorage
      await AsyncStorage.removeItem('pendingUserType');

      setLoading(false);

      console.log("User signed up with type:", userType);
      if (userType === 'student') {
        console.log("Student details - Grade:", grade, "Section:", section);
      }

      // Show success animation
      showSuccessAnimation(() => {
        router.push("/login/loginScreen");
      });

    } catch (error: any) {
      setLoading(false);
      
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Account Exists", "This username is already taken. Please choose a different one.");
      } else {
        Alert.alert("Sign In Failed", error.message || "An error occurred. Please try again.");
      }
      
      console.error("Sign In Error:", error);
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
                Sign In Successful!
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

          {/* User Type Indicator */}
          <View style={styles.userTypeIndicator}>
            <Text style={styles.userTypeText}>
              Signing up as: <Text style={styles.userTypeBold}>{userType.toUpperCase()}</Text>
            </Text>
          </View>

          {/* Grade and Section Container - Only for Students */}
          {userType === 'student' && (
            <View style={styles.gradeContainer}>
              {/* Grade Input */}
              <View style={styles.gradeInputSection}>
                <Text style={styles.inputLabel}>Grade Level</Text>
                <TextInput
                  style={styles.input}
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="7"
                  placeholderTextColor="#ffffff60"
                  keyboardType="number-pad"
                  maxLength={2}
                  editable={!loading && !showSuccess}
                />
              </View>

              {/* Vertical Divider */}
              <View style={styles.verticalDivider} />

              {/* Section Input */}
              <View style={styles.sectionInputSection}>
                <Text style={styles.inputLabel}>Section</Text>
                <TextInput
                  style={styles.input}
                  value={section}
                  onChangeText={setSection}
                  placeholder="A"
                  placeholderTextColor="#ffffff60"
                  autoCapitalize="characters"
                  maxLength={10}
                  editable={!loading && !showSuccess}
                />
              </View>
            </View>
          )}

          {/* Input Container */}
          <View style={[
            styles.inputContainer,
            userType === 'student' && styles.inputContainerWithGrade
          ]}>
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

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              userType === 'student' && styles.signInButtonWithGrade,
              (loading || showSuccess) && styles.signInButtonDisabled
            ]}
            onPress={handleSignIn}
            disabled={loading || showSuccess}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.signInText}>SIGN IN</Text>
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
  userTypeIndicator: {
    position: "absolute",
    top: height * 0.495,
    left: width * 0.089,
    width: width * 0.822,
    alignItems: "center",
  },
  userTypeText: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: width * 0.032,
    color: "#FFFFFF",
  },
  userTypeBold: {
    fontWeight: "700",
    color: "#94D231",
  },
  gradeContainer: {
    position: "absolute",
    top: height * 0.524,
    left: width * 0.089,
    width: width * 0.822,
    height: height * 0.095,
    borderWidth: 1,
    borderColor: "#94D231",
    borderRadius: 10,
    backgroundColor: "transparent",
    flexDirection: "row",
  },
  gradeInputSection: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
  },
  sectionInputSection: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: "#94D231",
    height: "100%",
  },
  inputContainer: {
    position: "absolute",
    top: height * 0.524,
    left: width * 0.089,
    width: width * 0.822,
    borderWidth: 1,
    borderColor: "#94D231",
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  inputContainerWithGrade: {
    top: height * 0.631,
  },
  inputSection: {
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.015,
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
    padding: width * 0.00001,
  },
  signInButton: {
    position: "absolute",
    top: height * 0.7,
    left: width * 0.09,
    width: width * 0.82,
    height: height * 0.056,
    backgroundColor: "#94D231",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  signInButtonWithGrade: {
    top: height * 0.807,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInText: {
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

export default SigninScreen;