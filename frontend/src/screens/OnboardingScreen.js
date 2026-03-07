import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const BASE_URL = 'http://localhost:8000'; // 🔁 change to your IP if testing on phone

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

const QUESTIONS = [
  {
    id: 'cycle_length',
    step: '01',
    title: 'How long is your\ntypical cycle?',
    subtitle: "Don't worry, you can change this later",
    type: 'cycle_picker',
    options: ['21-25 days', '26-30 days', '31-35 days', 'Not sure'],
    defaultOption: '26-30 days',
    defaultValue: 28,
    min: 18,
    max: 40,
  },
  {
    id: 'period_duration',
    step: '02',
    title: 'How long does\nyour period last?',
    subtitle: "We'll use this to track your flow",
    type: 'cycle_picker',
    options: ['1-3 days', '4-5 days', '6-7 days', 'Not sure'],
    defaultOption: '4-5 days',
    defaultValue: 5,
    min: 1,
    max: 10,
  },
  {
    id: 'last_period',
    step: '03',
    title: 'When did your last\nperiod start?',
    subtitle: 'This helps us predict your next cycle',
    type: 'options_only',
    options: ['Today', 'Yesterday', '2 days ago', '3+ days ago'],
    defaultOption: 'Yesterday',
  },
  {
    id: 'goal',
    step: '04',
    title: "What's your\nmain goal?",
    subtitle: 'Choose what matters most to you',
    type: 'options_only',
    options: ['Track my cycle', 'Manage PCOS/PCOD', 'Plan pregnancy', 'General health'],
    defaultOption: '',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(QUESTIONS[0].defaultOption);
  const [scrollValue, setScrollValue] = useState(QUESTIONS[0].defaultValue || 28);
  const [loading, setLoading] = useState(false);

  // useNativeDriver must be false on web
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const animateTransition = (callback) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      callback();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    });
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setAnswers({ ...answers, [question.id]: option });
  };

  const handleContinue = async () => {
    // Save current step's answer
    const updatedAnswers = {
      ...answers,
      [question.id]: question.type === 'cycle_picker' ? scrollValue : selectedOption,
    };
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      // Not the last step — just go to next question
      animateTransition(() => {
        setCurrentStep(currentStep + 1);
        const next = QUESTIONS[currentStep + 1];
        setSelectedOption(next.defaultOption || '');
        setScrollValue(next.defaultValue || null);
      });
    } else {
      // Last step — submit to backend
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await fetch(`${BASE_URL}/api/v1/onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cycle_length_option: updatedAnswers.cycle_length,
            cycle_length_days: typeof updatedAnswers.cycle_length === 'number'
              ? updatedAnswers.cycle_length
              : scrollValue,
            period_duration_option: updatedAnswers.period_duration,
            period_duration_days: typeof updatedAnswers.period_duration === 'number'
              ? updatedAnswers.period_duration
              : 5,
            last_period_option: updatedAnswers.last_period || 'Yesterday',
            goal: updatedAnswers.goal || 'Track my cycle',
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || 'Failed to save');
        }

        navigation.replace('Register'); // 🔁 change to 'Home' when HomeScreen is ready
      } catch (err) {
        alert('Could not save onboarding data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    if (currentStep < QUESTIONS.length - 1) {
      animateTransition(() => {
        setCurrentStep(currentStep + 1);
        const next = QUESTIONS[currentStep + 1];
        setSelectedOption(next.defaultOption || '');
        setScrollValue(next.defaultValue || null);
      });
    }
  };

  const renderCyclePicker = () => (
    <View>
      <View style={styles.optionsGrid}>
        {question.options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.optionChip, selectedOption === option && styles.optionChipActive]}
            onPress={() => handleOptionSelect(option)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selectedOption === option && styles.optionTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.pickerCard}>
        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => setScrollValue(Math.max(question.min, scrollValue - 1))}
        >
          <Text style={styles.arrowText}>▲</Text>
        </TouchableOpacity>

        <View style={styles.numberRow}>
          <Text style={styles.ghostNum}>{scrollValue - 1}</Text>
          <View style={styles.selectedNumWrapper}>
            <Text style={styles.selectedNum}>{scrollValue}</Text>
            <Text style={styles.daysTag}>DAYS</Text>
          </View>
          <Text style={styles.ghostNum}>{scrollValue + 1}</Text>
        </View>

        <TouchableOpacity
          style={styles.arrowBtn}
          onPress={() => setScrollValue(Math.min(question.max, scrollValue + 1))}
        >
          <Text style={styles.arrowText}>▼</Text>
        </TouchableOpacity>

        <Text style={styles.scrollHint}>tap arrows to adjust</Text>
      </View>
    </View>
  );

  const renderOptionsOnly = () => (
    <View style={styles.optionsGrid}>
      {question.options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.optionChip, selectedOption === option && styles.optionChipActive]}
          onPress={() => handleOptionSelect(option)}
          activeOpacity={0.8}
        >
          <Text style={[styles.optionText, selectedOption === option && styles.optionTextActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Blobs — pointerEvents none so they never block clicks */}
        <View style={styles.blobTopRight} pointerEvents="none" />
        <View style={styles.blobBottomLeft} pointerEvents="none" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepText}>{question.step} / 0{QUESTIONS.length}</Text>
          </View>
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        {/* Question content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]} pointerEvents="box-none">
          <View style={styles.questionBlock}>
            <Text style={styles.questionTitle}>{question.title}</Text>
            <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          </View>

          <View style={styles.inputBlock}>
            {question.type === 'cycle_picker' ? renderCyclePicker() : renderOptionsOnly()}
          </View>
        </Animated.View>

        {/* Continue button */}
        <TouchableOpacity
          style={[styles.continueBtn, loading && { opacity: 0.7 }]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.continueBtnText}>
            {loading ? 'Saving...' : currentStep === QUESTIONS.length - 1 ? 'Finish' : 'Continue'}
          </Text>
          {!loading && <Text style={styles.continueBtnArrow}>→</Text>}
        </TouchableOpacity>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {QUESTIONS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentStep ? styles.dotActive : styles.dotInactive,
                i < currentStep && styles.dotDone,
              ]}
            />
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.lavenderBlush,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  blobTopRight: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.pinkChampagne,
    opacity: 0.5,
    top: -60,
    right: -60,
    zIndex: -1,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.pastelPink,
    opacity: 0.35,
    bottom: 80,
    left: -50,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    zIndex: 1,
  },
  stepBadge: {
    backgroundColor: COLORS.pinkChampagne,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.watermelon,
    letterSpacing: 0.5,
  },
  skipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.mutedText,
    fontWeight: '500',
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.pinkChampagne,
    borderRadius: 10,
    marginBottom: 32,
    overflow: 'hidden',
    zIndex: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.watermelon,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  questionBlock: {
    marginBottom: 28,
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.darkText,
    lineHeight: 36,
    marginBottom: 8,
  },
  questionSubtitle: {
    fontSize: 14,
    color: COLORS.mutedText,
    fontWeight: '400',
    lineHeight: 20,
  },
  inputBlock: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.pastelPink,
    minWidth: '44%',
    alignItems: 'center',
    shadowColor: COLORS.lightPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  optionChipActive: {
    backgroundColor: COLORS.watermelon,
    borderColor: COLORS.watermelon,
    elevation: 4,
  },
  optionText: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  pickerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.pastelPink,
    shadowColor: COLORS.lightPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  arrowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  arrowText: {
    fontSize: 14,
    color: COLORS.lightPink,
    fontWeight: '700',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 6,
  },
  ghostNum: {
    fontSize: 22,
    color: COLORS.pastelPink,
    fontWeight: '300',
    width: 36,
    textAlign: 'center',
  },
  selectedNumWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.lavenderBlush,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    borderWidth: 2,
    borderColor: COLORS.pinkChampagne,
  },
  selectedNum: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.watermelon,
    lineHeight: 44,
  },
  daysTag: {
    fontSize: 11,
    color: COLORS.lightPink,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  scrollHint: {
    fontSize: 10,
    color: COLORS.pastelPink,
    letterSpacing: 1,
    marginTop: 4,
    fontWeight: '500',
  },
  continueBtn: {
    backgroundColor: COLORS.watermelon,
    borderRadius: 50,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 1,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  continueBtnArrow: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    zIndex: 1,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: COLORS.watermelon,
  },
  dotInactive: {
    width: 6,
    backgroundColor: COLORS.pastelPink,
  },
  dotDone: {
    width: 6,
    backgroundColor: COLORS.lightPink,
  },
});