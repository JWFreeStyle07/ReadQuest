// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef } from "react";
// import {
//   Animated,
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const { width, height } = Dimensions.get("window");

// const Login = () => {
//   const router = useRouter();

//   // Animated values for leaves waving
//   const leftLeafRotation = useRef(new Animated.Value(0)).current;
//   const rightLeafRotation = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Left leaf waving animation
//     const leftLeafAnimation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(leftLeafRotation, {
//           toValue: 1,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//         Animated.timing(leftLeafRotation, {
//           toValue: 0,
//           duration: 2000,
//           useNativeDriver: true,
//         }),
//       ])
//     );

//     // Right leaf waving animation
//     const rightLeafAnimation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(rightLeafRotation, {
//           toValue: 1,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(rightLeafRotation, {
//           toValue: 0,
//           duration: 2500,
//           useNativeDriver: true,
//         }),
//       ])
//     );

//     leftLeafAnimation.start();
//     rightLeafAnimation.start();

//     return () => {
//       leftLeafAnimation.stop();
//       rightLeafAnimation.stop();
//     };
//   }, []);

//   // Interpolate rotation for left leaf (20deg base + wave movement)
//   const leftLeafRotate = leftLeafRotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['15deg', '25deg'],
//   });

//   // Interpolate rotation for right leaf (-30deg base + wave movement)
//   const rightLeafRotate = rightLeafRotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['-25deg', '-35deg'],
//   });

//   return (
//     <View style={styles.container}>
//       {/* Image Section */}
//         {/* Leaves Overlay */}
//         <Animated.Image
//           source={require("../assets/images/login/leafLeft.png")}
//           style={[
//             styles.leafLeft,
//             {
//               transform: [{ rotate: leftLeafRotate }],
//             },
//           ]}
//           resizeMode="contain"
//         />
//         <Animated.Image
//           source={require("../assets/images/login/leafRight.png")}
//           style={[
//             styles.leafRight,
//             {
//               transform: [{ rotate: rightLeafRotate }, { scaleX: -1 }],
//             },
//           ]}
//           resizeMode="contain"
//         />
//       <View style={styles.imageContainer}>
//         <Image
//           source={require("../assets/images/login/readBoy.png")}
//           style={styles.image}
//           resizeMode="cover"
//         />
//       </View>

//       {/* Gradient Section */}
//       <LinearGradient
//         colors={["#0d4949", "#315e35"]}
//         style={styles.gradientContainer}
//       >
//         <Text style={styles.title}>Turn Reading Into an{"\n"}Adventure!</Text>
//         <Text style={styles.subtitle}>
//           Practice reading out loud, improve your{"\n"}
//           pronunciation, and learn new words
//         </Text>

//         {/* Buttons */}
//         <TouchableOpacity
//           style={styles.getStartedBtn}
//           //onPress={() => router.push("../algorithm/pronunciation")}
//           onPress={() => router.push("../login/whosUsing")}
//         >
//           <Text style={styles.getStartedText}>GET STARTED</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.loginBtn}
//           onPress={() => router.push("/login/loginScreen")}
//         >
//           <Text style={styles.loginText}>I ALREADY HAVE AN ACCOUNT</Text>
//         </TouchableOpacity>
//       </LinearGradient>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width,
//     height,
//     flex: 1,
//     backgroundColor: "white",
//   },
//   imageContainer: {
//     height: height * 0.40, // 2/5 of screen
//     width: "100%",
//     position: "relative",
//     overflow: "hidden",
//   },
//   image: {
//     width: "100%",
//     height: "100%",
//   },
//   leafLeft: {
//     position: "absolute",
//     top: height * 0.09,
//     left: "-10%",
//     width: "60%",
//     height: "60%",
//     zIndex: 20,
//   },
//   leafRight: {
//     position: "absolute",
//     top: height * 0.12,
//     right: "-10%",
//     width: "50%",
//     height: "50%",
//     zIndex: 10,
//   },
//   gradientContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     color: "#aea245",
//     textAlign: "center",
//     marginBottom: 12,
//   },
//   subtitle: {
//     fontSize: 16,
//     color: "white",
//     textAlign: "center",
//     marginBottom: 30,
//   },
//   getStartedBtn: {
//     backgroundColor: "white",
//     marginTop: 70,
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 10,
//     width: "95%",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   getStartedText: {
//     color: "black",
//     fontWeight: "bold",
//   },
//   loginBtn: {
//     borderColor: "white",
//     borderWidth: 2,
//     paddingVertical: 15,
//     borderRadius: 10,
//     width: "95%",
//     alignItems: "center",
//   },
//   loginText: {
//     color: "white",
//     fontWeight: "bold",
//   },
// });

// export default Login;
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
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

const Login = () => {
  const router = useRouter();

  // Animated values for leaves waving
  const leftLeafRotation = useRef(new Animated.Value(0)).current;
  const rightLeafRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Left leaf waving animation
    const leftLeafAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(leftLeafRotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(leftLeafRotation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Right leaf waving animation
    const rightLeafAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rightLeafRotation, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rightLeafRotation, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );

    leftLeafAnimation.start();
    rightLeafAnimation.start();

    return () => {
      leftLeafAnimation.stop();
      rightLeafAnimation.stop();
    };
  }, []);

  // Interpolate rotation for left leaf (20deg base + wave movement)
  const leftLeafRotate = leftLeafRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '25deg'],
  });

  // Interpolate rotation for right leaf (-30deg base + wave movement)
  const rightLeafRotate = rightLeafRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '-35deg'],
  });

  return (
    <View style={styles.container}>
      {/* Image Section */}
        {/* Leaves Overlay */}
        <Animated.Image
          source={require("../assets/images/login/leafLeft.png")}
          style={[
            styles.leafLeft,
            {
              transform: [{ rotate: leftLeafRotate }],
            },
          ]}
          resizeMode="contain"
        />
        <Animated.Image
          source={require("../assets/images/login/leafRight.png")}
          style={[
            styles.leafRight,
            {
              transform: [{ rotate: rightLeafRotate }, { scaleX: -1 }],
            },
          ]}
          resizeMode="contain"
        />
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/login/readBoy.png")}
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

        {/* Buttons */}
        <TouchableOpacity
          style={styles.getStartedBtn}
          //onPress={() => router.push("../algorithm/pronunciation")}
          onPress={() => router.push("../login/whosUsing")}
        >
          <Text style={styles.getStartedText}>GET STARTED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push("/login/loginScreen")}
        >
          <Text style={styles.loginText}>I ALREADY HAVE AN ACCOUNT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.offlineBtn}
          onPress={() => router.push("../offline/offlineScreen")}
        >
          <Text style={styles.offlineText}>TRY OFFLINE</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
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
    height: height * 0.40, // 2/5 of screen
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
    top: height * 0.09,
    left: "-10%",
    width: "60%",
    height: "60%",
    zIndex: 20,
  },
  leafRight: {
    position: "absolute",
    top: height * 0.12,
    right: "-10%",
    width: "50%",
    height: "50%",
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
    paddingTop: 100,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 30,
  },
  getStartedBtn: {
    backgroundColor: "white",
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "95%",
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
    borderRadius: 10,
    width: "95%",
    alignItems: "center",
    marginBottom: 15,
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
  },
  offlineBtn: {
    backgroundColor: "white",
    borderWidth: 2,
    paddingVertical: 15,
    borderRadius: 10,
    width: "95%",
    alignItems: "center",
  },
  offlineText: {
    color: "black",
    fontWeight: "bold",
  },
});

export default Login;