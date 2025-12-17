import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { logout } from "../../firebase/authService";
import { auth, db } from "../../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");

const StudentAccount = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [loginUsername, setLoginUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          
          // Get display name (what student sees and can edit)
          const name = userData.displayName || userData.username || userData.name || "";
          setDisplayName(name);
          setOriginalDisplayName(name);
          
          // Get login username (used for authentication, cannot be changed)
          const loginName = userData.loginUsername || userData.username || userData.name || "";
          setLoginUsername(loginName);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user data");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (displayName.trim() === originalDisplayName.trim()) {
      Alert.alert("No Changes", "No changes were made to your display name");
      return;
    }

    if (displayName.trim() === "") {
      Alert.alert("Invalid Input", "Display name cannot be empty");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert("Error", "No user logged in");
        setSaving(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        Alert.alert("Error", "User data not found");
        setSaving(false);
        return;
      }

      const userData = userSnap.data();
      
      // Ensure loginUsername is preserved
      const updates: any = {
        displayName: displayName.trim(),
        name: displayName.trim(),
        username: displayName.trim(),
      };
      
      // If loginUsername doesn't exist yet, create it from current username
      if (!userData.loginUsername) {
        updates.loginUsername = userData.username || userData.name || "";
      }
      
      await updateDoc(userRef, updates);
      
      setOriginalDisplayName(displayName.trim());
      Alert.alert("Success", "Display name updated successfully");
      
    } catch (error: any) {
      console.error("Error updating display name:", error);
      Alert.alert("Error", `Failed to update display name: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchAccount = () => {
    Alert.alert(
      "Switch Account",
      "Are you sure you want to switch account?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Switch",
          onPress: async () => {
            try {
              await logout();
              router.replace("../../login/loginScreen" as any);
            } catch (error) {
              console.error("Error logging out:", error);
              Alert.alert("Error", "Failed to logout");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              
              if (user) {
                // Delete user document from Firestore
                const userRef = doc(db, "users", user.uid);
                await deleteDoc(userRef);
                
                // Delete the authentication account
                await user.delete();
                
                Alert.alert("Account Deleted", "Your account has been deleted successfully");
                router.replace("../../login/loginScreen" as any);
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "Failed to delete account. You may need to log in again.");
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0d4949", "#315e35"]}
        locations={[0.1538, 0.5913]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#94D231" />
        <Text style={styles.loadingText}>Loading Account...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0d4949", "#315e35"]}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <MaterialCommunityIcons name="arrow-left" size={width * 0.08} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/welcome/birdHead.png")}
          style={styles.profileImage}
          resizeMode="contain"
        />
      </View>

      {/* Display Name Section */}
      <Text style={styles.label}>Display name</Text>
      <TextInput
        style={styles.input}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Enter your display name"
        placeholderTextColor="#ffffff80"
      />

      {/* Login Username Info (Read-only) */}
      {loginUsername && (
        <>
          <Text style={styles.loginLabel}>Login username (cannot be changed)</Text>
          <View style={styles.loginUsernameContainer}>
            <Text style={styles.loginUsernameText}>{loginUsername}</Text>
          </View>
        </>
      )}

      {/* Account Management Section */}
      <Text style={styles.accountLabel}>Account management</Text>

      {/* Switch Account Button */}
      <TouchableOpacity style={styles.switchButton} onPress={handleSwitchAccount}>
        <MaterialCommunityIcons
          name="account-switch"
          size={width * 0.07}
          color="#000000"
          style={styles.buttonIcon}
        />
        <Text style={styles.switchButtonText}>Switch Account</Text>
      </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <MaterialCommunityIcons
          name="delete-forever"
          size={width * 0.07}
          color="#000000"
          style={styles.buttonIcon}
        />
        <Text style={styles.deleteButtonText}>Delete account</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#94D231",
  },
  backButton: {
    position: "absolute",
    left: width * 0.05,
    top: height * 0.06,
    zIndex: 10,
    padding: width * 0.02,
  },
  saveButton: {
    position: "absolute",
    right: width * 0.06,
    top: height * 0.07,
    zIndex: 10,
    minWidth: width * 0.12,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.04,
    color: "#FFFFFF",
  },
  imageContainer: {
    width: width * 0.35,
    height: width * 0.36,
    borderRadius: (width * 0.35) / 2,
    borderWidth: 3,
    borderColor: "#94D231",
    alignSelf: "center",
    marginTop: height * 0.11,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(148, 210, 49, 0.2)",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  label: {
    position: "absolute",
    left: width * 0.08,
    top: height * 0.34,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.033,
    color: "#FFFFFF",
  },
  input: {
    position: "absolute",
    width: width * 0.88,
    height: height * 0.065,
    left: width * 0.06,
    top: height * 0.37,
    backgroundColor: "rgba(148, 210, 49, 0.3)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#94D231",
    paddingHorizontal: width * 0.05,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#FFFFFF",
  },
  loginLabel: {
    position: "absolute",
    left: width * 0.08,
    top: height * 0.45,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.028,
    color: "#CCCCCC",
  },
  loginUsernameContainer: {
    position: "absolute",
    width: width * 0.88,
    height: height * 0.055,
    left: width * 0.06,
    top: height * 0.475,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 210, 49, 0.5)",
    paddingHorizontal: width * 0.05,
    justifyContent: "center",
  },
  loginUsernameText: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#CCCCCC",
  },
  accountLabel: {
    position: "absolute",
    left: width * 0.08,
    top: height * 0.555,
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.033,
    color: "#FFFFFF",
  },
  switchButton: {
    position: "absolute",
    width: width * 0.88,
    height: height * 0.065,
    left: width * 0.06,
    top: height * 0.59,
    backgroundColor: "#F4C62D",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: width * 0.08,
  },
  buttonIcon: {
    marginRight: width * 0.02,
  },
  switchButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.04,
    color: "#000000",
  },
  deleteButton: {
    position: "absolute",
    width: width * 0.88,
    height: height * 0.065,
    left: width * 0.06,
    top: height * 0.67,
    backgroundColor: "#F05959",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: width * 0.08,
  },
  deleteButtonText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.04,
    color: "#000000",
  },
});

export default StudentAccount;