// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import React, { useState } from 'react';
// import {
//   Alert,
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { auth, db } from '../../firebase/firebaseConfig';

// const { width, height } = Dimensions.get('window');

// const QuizRewards = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   const bookTitle = params.bookTitle as string;
//   const oralPoints = parseInt(params.oralPoints as string) || 0;
//   const quizPoints = parseInt(params.quizPoints as string) || 0;
//   const totalQuestions = parseInt(params.totalQuestions as string) || 0;
  
//   const totalStars = oralPoints + quizPoints;
//   const [isCollecting, setIsCollecting] = useState(false);

//   const handleCollectStars = async () => {
//     if (isCollecting) return;
    
//     try {
//       setIsCollecting(true);
//       const user = auth.currentUser;
      
//       if (!user) {
//         Alert.alert('Error', 'User not authenticated');
//         return;
//       }

//       // Get current user data
//       const userRef = doc(db, 'users', user.uid);
//       const userDoc = await getDoc(userRef);
      
//       if (!userDoc.exists()) {
//         Alert.alert('Error', 'User data not found');
//         return;
//       }

//       const userData = userDoc.data();
//       const currentStarPoints = userData.starPoints || 0;
//       const newStarPoints = currentStarPoints + totalStars;

//       // Update user's star points in Firebase
//       await updateDoc(userRef, {
//         starPoints: newStarPoints,
//       });

//       // Navigate back to student dashboard
//       router.push('../../student/studentDashboard');
      
//     } catch (error) {
//       console.error('Error updating star points:', error);
//       Alert.alert('Error', 'Failed to collect stars. Please try again.');
//     } finally {
//       setIsCollecting(false);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#0d4949', '#315e35']}
//       locations={[0.1538, 0.5913]}
//       style={styles.container}
//     >
//       {/* Back Button */}
//       <TouchableOpacity 
//         style={styles.backButton} 
//         onPress={() => router.back()}
//       >
//         <MaterialCommunityIcons 
//           name="arrow-down" 
//           size={width * 0.075} 
//           color="#ffffff" 
//         />
//       </TouchableOpacity>

//       {/* Star Quiz Image */}
//       <Image
//         source={require('../../assets/images/quiz/starQuiz.png')}
//         style={styles.starQuizImage}
//         resizeMode="contain"
//       />

//       {/* Bird Cry Image */}
//       <Image
//         source={require('../../assets/images/quiz/birdCry.png')}
//         style={styles.birdCryImage}
//         resizeMode="contain"
//       />

//       {/* Great Job Text */}
//       <Text style={styles.greatJobText}>
//         Great Job!{'\n'}You earned
//       </Text>

//       {/* Stars Box */}
//       <View style={styles.starsBox}>
//         <MaterialCommunityIcons
//           name="star"
//           size={width * 0.128}
//           color="#F4C62D"
//           style={styles.starIcon}
//         />
//         <Text style={styles.starsText}>{totalStars}</Text>
//       </View>

//       {/* Collect Stars Button */}
//       <TouchableOpacity
//         style={styles.collectButton}
//         onPress={handleCollectStars}
//         disabled={isCollecting}
//       >
//         <Text style={styles.collectButtonText}>
//           {isCollecting ? 'COLLECTING...' : 'COLLECT STARS'}
//         </Text>
//       </TouchableOpacity>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   backButton: {
//     position: 'absolute',
//     top: height * 0.057,
//     left: width * 0.053,
//     zIndex: 10,
//     padding: width * 0.02,
//     transform: [{ rotate: '90.36deg' }],
//   },
//   starQuizImage: {
//     position: 'absolute',
//     top: height * 0.205,
//     left: width * 0.118,
//     width: width * 0.243,
//     height: height * 0.181,
//     transform: [{ rotate: '-180deg' }],
//   },
//   birdCryImage: {
//     position: 'absolute',
//     top: height * 0.226,
//     left: width * 0.348,
//     width: width * 0.32,
//     height: height * 0.241,
//   },
//   greatJobText: {
//     position: 'absolute',
//     top: height * 0.481,
//     left: width * 0.13,
//     width: width * 0.755,
//     color: '#FFFFFF',
//     fontSize: width * 0.08,
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     lineHeight: width * 0.08,
//     textAlign: 'center',
//   },
//   starsBox: {
//     position: 'absolute',
//     top: height * 0.632,
//     left: width * 0.313,
//     width: width * 0.37,
//     height: height * 0.096,
//     backgroundColor: '#94D231F2',
//     borderRadius: 5,
//     borderWidth: 1,
//     borderColor: '#94D231',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: width * 0.015,
//   },
//   starIcon: {
//     marginRight: width * 0.02,
//   },
//   starsText: {
//     color: '#28242C',
//     fontSize: width * 0.08,
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     lineHeight: width * 0.08,
//     textAlign: 'center',
//   },
//   collectButton: {
//     position: 'absolute',
//     top: height * 0.838,
//     left: width * 0.07,
//     width: width * 0.865,
//     height: height * 0.062,
//     backgroundColor: '#94D231F2',
//     borderRadius: 5,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   collectButtonText: {
//     color: '#28242C',
//     fontSize: width * 0.045,
//     fontFamily: 'Poppins',
//     fontWeight: '600',
//     textAlign: 'center',
//     lineHeight: width * 0.045,
//   },
// });

// export default QuizRewards;
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../firebase/firebaseConfig';
import { updateStoryQuizResult } from '../../firebase/userService';

const { width, height } = Dimensions.get('window');

const QuizRewards = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const bookTitle = params.bookTitle as string;
  const oralPoints = parseInt(params.oralPoints as string) || 0;
  const quizPoints = parseInt(params.quizPoints as string) || 0;
  const totalQuestions = parseInt(params.totalQuestions as string) || 0;
  const incorrectCount = parseInt(params.incorrectCount as string) || 0;
  
  const totalStars = oralPoints + quizPoints;
  const [isCollecting, setIsCollecting] = useState(false);

  const handleCollectStars = async () => {
    if (isCollecting) return;
    
    try {
      setIsCollecting(true);
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Calculate quiz percentage
      const correctAnswers = totalQuestions - incorrectCount;
      const quizPercent = totalQuestions > 0 
        ? Math.round((correctAnswers / totalQuestions) * 100) 
        : 0;

      console.log('Quiz Results:', {
        totalQuestions,
        correctAnswers,
        incorrectCount,
        quizPercent
      });

      // Save quiz results to Firebase under the same storyScores
      await updateStoryQuizResult(
        user.uid,
        bookTitle,
        quizPercent,
        incorrectCount
      );

      // Get current user data
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        Alert.alert('Error', 'User data not found');
        return;
      }

      const userData = userDoc.data();
      const currentStarPoints = userData.starPoints || 0;
      const newStarPoints = currentStarPoints + totalStars;

      // Update user's star points in Firebase
      await updateDoc(userRef, {
        starPoints: newStarPoints,
      });

      console.log('✅ Quiz results and star points saved successfully');

      // Navigate back to student dashboard
      router.push('../../student/studentDashboard');
      
    } catch (error) {
      console.error('Error updating star points:', error);
      Alert.alert('Error', 'Failed to collect stars. Please try again.');
    } finally {
      setIsCollecting(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0d4949', '#315e35']}
      locations={[0.1538, 0.5913]}
      style={styles.container}
    >
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons 
          name="arrow-down" 
          size={width * 0.075} 
          color="#ffffff" 
        />
      </TouchableOpacity>

      {/* Star Quiz Image */}
      <Image
        source={require('../../assets/images/quiz/starQuiz.png')}
        style={styles.starQuizImage}
        resizeMode="contain"
      />

      {/* Bird Cry Image */}
      <Image
        source={require('../../assets/images/quiz/birdCry.png')}
        style={styles.birdCryImage}
        resizeMode="contain"
      />

      {/* Great Job Text */}
      <Text style={styles.greatJobText}>
        Great Job!{'\n'}You earned
      </Text>

      {/* Stars Box */}
      <View style={styles.starsBox}>
        <MaterialCommunityIcons
          name="star"
          size={width * 0.128}
          color="#F4C62D"
          style={styles.starIcon}
        />
        <Text style={styles.starsText}>{totalStars}</Text>
      </View>

      {/* Collect Stars Button */}
      <TouchableOpacity
        style={styles.collectButton}
        onPress={handleCollectStars}
        disabled={isCollecting}
      >
        <Text style={styles.collectButtonText}>
          {isCollecting ? 'COLLECTING...' : 'COLLECT STARS'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.057,
    left: width * 0.053,
    zIndex: 10,
    padding: width * 0.02,
    transform: [{ rotate: '90.36deg' }],
  },
  starQuizImage: {
    position: 'absolute',
    top: height * 0.205,
    left: width * 0.118,
    width: width * 0.243,
    height: height * 0.181,
    transform: [{ rotate: '-180deg' }],
  },
  birdCryImage: {
    position: 'absolute',
    top: height * 0.226,
    left: width * 0.348,
    width: width * 0.32,
    height: height * 0.241,
  },
  greatJobText: {
    position: 'absolute',
    top: height * 0.481,
    left: width * 0.13,
    width: width * 0.755,
    color: '#FFFFFF',
    fontSize: width * 0.08,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: width * 0.08,
    textAlign: 'center',
  },
  starsBox: {
    position: 'absolute',
    top: height * 0.632,
    left: width * 0.313,
    width: width * 0.37,
    height: height * 0.096,
    backgroundColor: '#94D231F2',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#94D231',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.015,
  },
  starIcon: {
    marginRight: width * 0.02,
  },
  starsText: {
    color: '#28242C',
    fontSize: width * 0.08,
    fontFamily: 'Poppins',
    fontWeight: '700',
    lineHeight: width * 0.08,
    textAlign: 'center',
  },
  collectButton: {
    position: 'absolute',
    top: height * 0.838,
    left: width * 0.07,
    width: width * 0.865,
    height: height * 0.062,
    backgroundColor: '#94D231F2',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  collectButtonText: {
    color: '#28242C',
    fontSize: width * 0.045,
    fontFamily: 'Poppins',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: width * 0.045,
  },
});

export default QuizRewards;