import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// 🎨 Pink Color Palette
const COLORS = {
  lavenderBlush: '#FFE5EC',
  pastelPink: '#FFB3C6',
  lightPink: '#FF8FAB',
  pinkChampagne: '#FFC2D1',
  watermelon: '#FB6F92',
  white: '#FFFFFF',
  darkText: '#2D1B1E',
  mutedText: '#9B6B78',
};

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blobs fade in first
    Animated.timing(blob1Anim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(blob2Anim, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Logo pops in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    // App name fades in
    setTimeout(() => {
      Animated.timing(textFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 500);

    // Tagline fades in
    setTimeout(() => {
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Spinner loop
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>

      {/* Decorative blobs */}
      <Animated.View style={[styles.blobTopRight, { opacity: blob1Anim }]} />
      <Animated.View style={[styles.blobBottomLeft, { opacity: blob2Anim }]} />
      <Animated.View style={[styles.blobTopLeft, { opacity: blob1Anim }]} />
      <Animated.View style={[styles.blobBottomRight, { opacity: blob2Anim }]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

    

      {/* Tagline */}
      <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
        Cycle Smarter, Live Better
      </Animated.Text>

      {/* Spinner */}
      <View style={styles.spinnerWrapper}>
        {/* Outer ring */}
        <Animated.View
          style={[styles.spinnerRingOuter, { transform: [{ rotate: spin }] }]}
        />
        {/* Inner ring (opposite spin) */}
        <View style={styles.spinnerDot} />
      </View>

      <Text style={styles.preparingText}>GETTING READY</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lavenderBlush,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative blobs
  blobTopRight: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.pinkChampagne,
    opacity: 0.5,
    top: -80,
    right: -80,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.pastelPink,
    opacity: 0.35,
    bottom: 60,
    left: -60,
  },
  blobTopLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.lightPink,
    opacity: 0.15,
    top: 80,
    left: -30,
  },
  blobBottomRight: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.watermelon,
    opacity: 0.1,
    bottom: 120,
    right: -40,
  },

  // Logo
  logoWrapper: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    // Soft pink glow ring around logo
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  logo: {
    width: 200,
    height: 200,
  },

  // Text
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.watermelon,
    letterSpacing: 3,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.mutedText,
    fontWeight: '400',
    letterSpacing: 0.3,
    marginBottom: 70,
  },

  // Spinner
  spinnerWrapper: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  spinnerRingOuter: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2.5,
    borderColor: COLORS.lightPink,
    borderTopColor: COLORS.watermelon,
    borderRightColor: COLORS.pastelPink,
  },
  spinnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.watermelon,
  },

  // Preparing text
  preparingText: {
    fontSize: 9,
    color: COLORS.lightPink,
    letterSpacing: 3,
    fontWeight: '600',
  },
});