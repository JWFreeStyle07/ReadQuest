import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

const VerificationScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const verificationId = params.verificationId as string;
  const phoneNumber = params.phoneNumber as string;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  // Animation values
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (index === 5 && text) {
      const fullCode = newCode.join("");
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous input
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const otpCode = verificationCode || code.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const credential = PhoneAuthProvider.credential(verificationId, otpCode);
      const userCredential = await signInWithCredential(auth, credential);

      setLoading(false);
      
      // Show success animation
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
        // Animate checkmark after circle appears
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start(() => {
          // Navigate to next screen after animation
          setTimeout(() => {
            router.push("/login/signinScreen"); // Change to your actual next screen
          }, 1000);
        });
      });

      console.log("User signed in:", userCredential.user);
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Verification Failed", error.message || "Invalid code. Please try again.");
      console.error("Verification Error:", error);
      // Clear code on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (!recaptchaVerifier.current) {
      Alert.alert("Error", "reCAPTCHA not initialized");
      return;
    }

    setResending(true);

    try {
      const phoneProvider = new PhoneAuthProvider(auth);
      const newVerificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );

      setResending(false);
      Alert.alert("Code Resent", "A new verification code has been sent to your phone.");

      // Update with new verification ID
      router.setParams({ verificationId: newVerificationId });
    } catch (error: any) {
      setResending(false);
      Alert.alert("Error", error.message || "Failed to resend code. Please try again.");
      console.error("Resend Error:", error);
    }
  };

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Firebase reCAPTCHA for resend */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={{
          apiKey: "AIzaSyDE4Qnu_ki5QlGyScePySmFtfE_zAyHk3Q",
          authDomain: "readquest-1801e.firebaseapp.com",
          projectId: "readquest-1801e",
          storageBucket: "readquest-1801e.firebasestorage.app",
          messagingSenderId: "88958724983",
          appId: "1:88958724983:web:1b1562da118b83bf0b4f72",
        }}
        attemptInvisibleVerification={true}
      />

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
            Verification Successful!
          </Animated.Text>
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Verify your{"\n"}Phone Number</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Enter your OTP code here.</Text>

      {/* OTP Input Boxes */}
      <View style={styles.otpContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!loading && !showSuccess}
          />
        ))}
      </View>

      {/* Resend Text */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>
          Didn't receive code?{" "}
          {resending ? (
            <ActivityIndicator size="small" color="#ffec65" />
          ) : (
            <Text style={styles.resendLink} onPress={handleResend}>
              RESEND
            </Text>
          )}
        </Text>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.verifyButton, (loading || showSuccess) && styles.verifyButtonDisabled]}
        onPress={() => handleVerify()}
        disabled={loading || showSuccess}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.verifyText}>VERIFY</Text>
        )}
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
  backButton: {
    position: "absolute",
    top: height * 0.06,
    left: width * 0.05,
    zIndex: 10,
    padding: width * 0.02,
  },
  title: {
    position: "absolute",
    top: height * 0.26,
    width: width * 0.533,
    left: width * 0.213,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0625,
    lineHeight: width * 0.0625,
    textAlign: "center",
    color: "#FFCD6F",
  },
  subtitle: {
    position: "absolute",
    top: height * 0.365,
    width: width * 0.74,
    left: width * 0.12,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0325,
    lineHeight: width * 0.0325,
    textAlign: "center",
    color: "#FFFFFF",
  },
  otpContainer: {
    position: "absolute",
    top: height * 0.46,
    left: width * 0.05,
    width: width * 0.9,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.02,
  },
  otpInput: {
    width: width * 0.135,
    height: height * 0.076,
    borderWidth: 1,
    borderColor: "#94D231",
    borderRadius: 10,
    backgroundColor: "transparent",
    fontSize: width * 0.06,
    fontFamily: "Poppins",
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  resendContainer: {
    position: "absolute",
    top: height * 0.55,
    left: width * 0.075,
    width: width * 0.83,
  },
  resendText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0275,
    lineHeight: width * 0.033,
    textAlign: "center",
    color: "#FFFFFF",
  },
  resendLink: {
    color: "#ffec65",
    textDecorationLine: "underline",
  },
  verifyButton: {
    position: "absolute",
    top: height * 0.6,
    left: width * 0.08,
    width: width * 0.83,
    height: height * 0.056,
    backgroundColor: "#94D231",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyText: {
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
    color: "#FFCD6F",
    textAlign: "center",
  },
});

export default VerificationScreen;