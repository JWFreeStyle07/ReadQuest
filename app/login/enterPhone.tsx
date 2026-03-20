import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";

const { width, height } = Dimensions.get("window");

// Hardcoded credentials for testing
const VALID_PHONE = "+639478539344";
const VALID_OTP = "123456";

const EnterPhone = () => {
  const router = useRouter();
  const [countryCode, setCountryCode] = useState<CountryCode>("PH");
  const [callingCode, setCallingCode] = useState("63");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
  };

  const clearPhoneNumber = () => {
    setPhoneNumber("");
  };

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit phone number.");
      return;
    }

    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);

      // Check if phone number matches the hardcoded one
      if (fullPhoneNumber === VALID_PHONE) {
        Alert.alert(
          "OTP Sent",
          `Verification code sent to ${fullPhoneNumber}\n\nFor testing, use OTP: ${VALID_OTP}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to verification screen
                router.push({
                  pathname: "../../login/verification",
                  params: { 
                    phoneNumber: fullPhoneNumber,
                    // Pass the valid OTP so verification screen knows what to check against
                    validOtp: VALID_OTP
                  },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Test Mode",
          `Phone number not recognized.\n\nFor testing, please use:\n${VALID_PHONE.replace('+63', '63').substring(2)}\n\nOr change VALID_PHONE in the code.`
        );
      }
    }, 1500); // Simulate 1.5 second delay
  };

  const handleTermsPress = () => {
    console.log("Terms of Use pressed");
    // Navigate to terms page
  };

  const handlePrivacyPress = () => {
    console.log("Privacy Policy pressed");
    // Navigate to privacy policy page
  };

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={width * 0.08}
          color="#ffffff"
        />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Enter your Phone Number</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        We will send you a 6 digit verification code
      </Text>

      {/* Phone Input Container */}
      <View style={styles.phoneInputContainer}>
        {/* Country Code Button */}
        <TouchableOpacity
          style={styles.countryCodeButton}
          onPress={() => setShowCountryPicker(true)}
        >
          <CountryPicker
            countryCode={countryCode}
            withFlag
            withCallingCode
            withFilter
            withAlphaFilter
            onSelect={onSelectCountry}
            visible={showCountryPicker}
            onClose={() => setShowCountryPicker(false)}
          />
          <Text style={styles.callingCodeText}>+{callingCode}</Text>
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View style={styles.divider} />

        {/* Phone Number Input */}
        <TextInput
          style={styles.phoneInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="9478539344"
          placeholderTextColor="#ffffff80"
          keyboardType="number-pad"
          maxLength={10}
          editable={!loading}
        />

        {/* Clear Button */}
        {phoneNumber.length > 0 && !loading && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearPhoneNumber}
          >
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={width * 0.06}
              color="#ffffff"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Terms and Privacy Text */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By providing phone number, I hereby agree and accept {"\n"} the{" "}
          <Text style={styles.linkText} onPress={handleTermsPress}>
            Terms of Use
          </Text>{" "}
          and{" "}
          <Text style={styles.linkText} onPress={handlePrivacyPress}>
            Privacy Policy
          </Text>{" "}
          of this app.
        </Text>
      </View>

      {/* Send OTP Button */}
      <TouchableOpacity 
        style={[styles.sendOtpButton, loading && styles.sendOtpButtonDisabled]} 
        onPress={handleSendOTP}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.sendOtpText}>SEND OTP</Text>
        )}
      </TouchableOpacity>

      {/* Dev Mode Indicator */}
      <View style={styles.devModeContainer}>
        <Text style={styles.devModeText}>
          🔧 Test Mode: Use {VALID_PHONE.replace('+63', '63').substring(2)}
        </Text>
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
  title: {
    position: "absolute",
    top: height * 0.26,
    width: width * 0.91,
    left: width * 0.037,
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.0625,
    lineHeight: width * 0.0625,
    textAlign: "center",
    color: "#FFCD6F",
  },
  subtitle: {
    position: "absolute",
    top: height * 0.31,
    width: width * 0.74,
    left: width * 0.12,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0325,
    lineHeight: width * 0.0325,
    textAlign: "center",
    color: "#FFFFFF",
  },
  phoneInputContainer: {
    position: "absolute",
    top: height * 0.425,
    left: width * 0.07,
    width: width * 0.85,
    height: height * 0.076,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#94D231",
    borderRadius: 10,
    backgroundColor: "transparent",
    paddingHorizontal: width * 0.03,
  },
  countryCodeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: width * 0.02,
  },
  callingCodeText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    marginLeft: width * 0.02,
  },
  divider: {
    width: 1,
    height: "60%",
    backgroundColor: "#94D231",
    marginHorizontal: width * 0.02,
  },
  phoneInput: {
    flex: 1,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  clearButton: {
    padding: width * 0.01,
  },
  termsContainer: {
    position: "absolute",
    top: height * 0.52,
    left: width * 0.07,
    width: width * 0.83,
  },
  termsText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.0275,
    lineHeight: width * 0.033,
    textAlign: "center",
    color: "#FFFFFF",
  },
  linkText: {
    color: "#F8CB5E",
    textDecorationLine: "underline",
  },
  sendOtpButton: {
    position: "absolute",
    top: height * 0.61,
    left: width * 0.07,
    width: width * 0.85,
    height: height * 0.056,
    backgroundColor: "#94D231",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendOtpButtonDisabled: {
    opacity: 0.6,
  },
  sendOtpText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#000000",
    letterSpacing: 0.5,
  },
  devModeContainer: {
    position: "absolute",
    bottom: height * 0.05,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  devModeText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.03,
    color: "#FFCD6F",
    opacity: 0.8,
  },
});

export default EnterPhone;