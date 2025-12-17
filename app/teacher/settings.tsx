import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Settings = () => {
  const router = useRouter();
  
  // Settings states
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showTutorials, setShowTutorials] = useState(true);

  const handleBack = () => {
    router.back();
  };

  const handleAbout = () => {
    Alert.alert(
      "About ReadQuest",
      "ReadQuest v1.0\n\nAn interactive reading assessment and learning platform for students and teachers.\n\n© 2024 ReadQuest",
      [{ text: "OK" }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      "Help & Support",
      "For assistance, please contact:\n\nsupport@readquest.app\n\nOr visit our help center at:\nwww.readquest.app/help",
      [{ text: "OK" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your privacy is important to us. ReadQuest collects and stores student reading data to provide personalized learning experiences.\n\nFor full privacy policy, visit:\nwww.readquest.app/privacy",
      [{ text: "OK" }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "Are you sure you want to clear the app cache? This will not delete any student data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // In a real app, you would clear cached data here
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    value,
    onValueChange,
    showSwitch = false,
    onPress,
    showArrow = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    showSwitch?: boolean;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={showSwitch}
      activeOpacity={showSwitch ? 1 : 0.6}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon as any} size={width * 0.06} color="#41765D" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#D1D1D1", true: "#9FE62DCF" }}
          thumbColor={value ? "#41765D" : "#f4f3f4"}
        />
      )}
      {showArrow && (
        <MaterialCommunityIcons name="chevron-right" size={width * 0.06} color="#999999" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={width * 0.08} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <SectionHeader title="General" />
        
        <SettingItem
          icon="bell-outline"
          title="Notifications"
          subtitle="Receive updates about student progress"
          value={notifications}
          onValueChange={setNotifications}
          showSwitch
        />

        <SettingItem
          icon="volume-high"
          title="Sound Effects"
          subtitle="Enable app sound effects"
          value={soundEffects}
          onValueChange={setSoundEffects}
          showSwitch
        />

        <SettingItem
          icon="content-save-outline"
          title="Auto-Save"
          subtitle="Automatically save changes"
          value={autoSave}
          onValueChange={setAutoSave}
          showSwitch
        />

        <SettingItem
          icon="theme-light-dark"
          title="Dark Mode"
          subtitle="Switch to dark theme (Coming soon)"
          value={darkMode}
          onValueChange={setDarkMode}
          showSwitch
        />

        {/* Display Settings */}
        <SectionHeader title="Display" />

        <SettingItem
          icon="school-outline"
          title="Show Tutorials"
          subtitle="Display helpful tips and guides"
          value={showTutorials}
          onValueChange={setShowTutorials}
          showSwitch
        />

        {/* Data & Storage */}
        <SectionHeader title="Data & Storage" />

        <SettingItem
          icon="delete-sweep-outline"
          title="Clear Cache"
          subtitle="Free up storage space"
          onPress={handleClearCache}
          showArrow
        />

        {/* Information */}
        <SectionHeader title="Information" />

        <SettingItem
          icon="information-outline"
          title="About ReadQuest"
          subtitle="Version and app information"
          onPress={handleAbout}
          showArrow
        />

        <SettingItem
          icon="help-circle-outline"
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={handleHelp}
          showArrow
        />

        <SettingItem
          icon="shield-check-outline"
          title="Privacy Policy"
          subtitle="View our privacy policy"
          onPress={handlePrivacy}
          showArrow
        />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.05,
    paddingBottom: height * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  backButton: {
    padding: width * 0.02,
    marginRight: width * 0.02,
  },
  headerTitle: {
    fontFamily: "Poppins",
    fontWeight: "700",
    fontSize: width * 0.065,
    color: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.025,
    paddingBottom: height * 0.01,
  },
  sectionHeaderText: {
    fontFamily: "Poppins",
    fontWeight: "600",
    fontSize: width * 0.04,
    color: "#41765D",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.06,
    paddingVertical: height * 0.018,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: width * 0.04,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: "Poppins",
    fontWeight: "500",
    fontSize: width * 0.04,
    color: "#000000",
    marginBottom: height * 0.002,
  },
  settingSubtitle: {
    fontFamily: "Poppins",
    fontWeight: "400",
    fontSize: width * 0.03,
    color: "#666666",
  },
  bottomSpacing: {
    height: height * 0.03,
  },
});

export default Settings;