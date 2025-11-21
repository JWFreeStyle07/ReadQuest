import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface OpeningProps {
  onLoadComplete: () => void;
}

export default function Opening({ onLoadComplete }: OpeningProps) {
  const letterAnimations = useRef(
    'ReadQuest'.split('').map(() => new Animated.Value(0))
  ).current;
  
  const logoJump = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Wave animation for letters
    const waveAnimation = Animated.loop(
      Animated.stagger(
        100,
        letterAnimations.map(anim =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -10,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        )
      )
    );
    
    waveAnimation.start();
    
    // After 3 seconds, stop wave and jump logo
    const timer = setTimeout(() => {
      waveAnimation.stop();
      letterAnimations.forEach(anim => anim.setValue(0));
      
      Animated.sequence([
        Animated.timing(logoJump, {
          toValue: -30,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(logoJump, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => onLoadComplete(), 300);
      });
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      waveAnimation.stop();
    };
  }, []);
  
  const letters = 'ReadQuest'.split('');
  
  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/login/ReadQuest.png')}
        style={[
          styles.logo,
          { transform: [{ translateY: logoJump }] }
        ]}
        resizeMode="contain"
      />
      
      <View style={styles.textContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.letter,
              { transform: [{ translateY: letterAnimations[index] }] }
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#93DCB975',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 205,
    height: 217,
    marginBottom: 10,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  letter: {
    fontFamily: 'PottaOne-Regular',
    fontWeight: '400',
    fontSize: 25,
    lineHeight: 25,
    color: '#000',
  },
});