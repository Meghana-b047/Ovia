import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions, StatusBar,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line } from 'react-native-svg';
// AsyncStorage — run: npx expo install @react-native-async-storage/async-storage
let AsyncStorage = null;
try { AsyncStorage = require('@react-native-async-storage/async-storage').default; } catch(e) {}

const { width } = Dimensions.get('window');

const COLORS = {
  lavenderBlush: '#FFE5EC',
  pastelPink: '#FFB3C6',
  lightPink: '#FF8FAB',
  pinkChampagne: '#FFC2D1',
  watermelon: '#FB6F92',
  white: '#FFFFFF',
  darkText: '#2D1B1E',
  mutedText: '#9B6B78',
  navInactive: '#A0A0B0',
};

const TODAY = 'TUESDAY, JUNE 14';
const CYCLE_DAY = 14;
const CYCLE_TOTAL = 28;

const MOODS = [
  { emoji: '😢', label: 'Sad' },
  { emoji: '😕', label: 'Down' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😄', label: 'Great' },
];

const EXERCISE_MODULES = [
  { id: '1', title: 'Period Relief',    subtitle: 'Ease cramps & bloating',     emoji: '🩸', bg: '#FFE5EC', accent: '#FB6F92', videoCount: 8,  category: 'Period',    searchQuery: 'period cramps relief yoga exercises' },
  { id: '2', title: 'PCOS & PCOD Yoga', subtitle: 'Balance hormones naturally', emoji: '🧘', bg: '#F3E5F5', accent: '#AB47BC', videoCount: 12, category: 'PCOS',      searchQuery: 'PCOS PCOD yoga workout exercises hormone balance' },
  { id: '3', title: 'Pregnancy Safe',   subtitle: 'Gentle prenatal workouts',   emoji: '🤰', bg: '#E8F5E9', accent: '#4CAF50', videoCount: 10, category: 'Pregnancy', searchQuery: 'pregnancy safe prenatal yoga exercises workout' },
];

// ── Nav Icons ──
const DashboardIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} />
    <Rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} />
    <Rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} />
    <Rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} />
  </Svg>
);
const CalendarIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" />
    <Line x1="8" y1="3" x2="8" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="3" x2="16" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="7" y="13" width="3" height="3" rx="0.5" fill={color} />
    <Rect x="11" y="13" width="3" height="3" rx="0.5" fill={color} />
  </Svg>
);
const DoctorIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="8" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="9" y1="11" x2="15" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="17" x2="16" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);
const SocialIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="8" y1="13" x2="13" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </Svg>
);

// ── Ovia Bot Face SVG ──
// ── Animated Speech Bubble Heart FAB ──
const ChatBubbleHeart = ({ size = 44, heartScale = 1 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 120 106" fill="none">
    {/* Bubble body - glossy pink ellipse */}
    <Path
      d="M60 4 C28 4, 4 22, 4 46 C4 67, 24 82, 50 85 C52 85, 53 88, 52 98 C52 100, 54 101, 55 99 C62 90, 68 87, 72 85 C97 82, 116 66, 116 46 C116 22, 92 4, 60 4 Z"
      fill="#FB6F92"
    />
    {/* Gloss highlight */}
    <Path
      d="M30 14 C38 10, 50 8, 62 9 C74 10, 84 14, 88 20 C80 16, 68 13, 56 13 C44 13, 34 16, 30 14 Z"
      fill="rgba(255,255,255,0.35)"
    />
    {/* Heart shape */}
    <Path
      d="M60 68 C60 68, 36 54, 36 40 C36 32, 42 26, 50 28 C54 29, 58 32, 60 36 C62 32, 66 29, 70 28 C78 26, 84 32, 84 40 C84 54, 60 68, 60 68 Z"
      fill="rgba(255,200,215,0.85)"
    />
    {/* Inner heart glow */}
    <Path
      d="M60 62 C60 62, 42 50, 42 40 C42 35, 46 31, 51 33 C55 34, 58 37, 60 40 C62 37, 65 34, 69 33 C74 31, 78 35, 78 40 C78 50, 60 62, 60 62 Z"
      fill="rgba(255,230,235,0.6)"
    />
  </Svg>
);

// ── Shared stores ──
let _reminders = [
  { id: '1', icon: '💊', title: 'Iron Supplement', time: '8:00 AM',  color: COLORS.pastelPink },
  { id: '2', icon: '🩺', title: 'Dr. Appointment', time: 'Tomorrow', color: COLORS.pinkChampagne },
  { id: '3', icon: '🏃', title: 'Evening Walk',     time: '6:00 PM', color: COLORS.lightPink },
];
let _remindersListeners = [];
export const getReminders       = () => _reminders;
export const setReminders       = (r) => { _reminders = r; _remindersListeners.forEach(fn => fn(r)); };
export const subscribeReminders = (fn) => {
  _remindersListeners.push(fn);
  return () => { _remindersListeners = _remindersListeners.filter(f => f !== fn); };
};

let _userName = 'Maya';
let _userNameListeners = [];
export const getUserName        = () => _userName;
export const setUserName        = (n) => { _userName = n; _userNameListeners.forEach(fn => fn(n)); };
export const subscribeUserName  = (fn) => {
  _userNameListeners.push(fn);
  return () => { _userNameListeners = _userNameListeners.filter(f => f !== fn); };
};

const ShopIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const NAV_TABS = [
  { key: 'Dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { key: 'Calendar',  label: 'Calendar',  Icon: CalendarIcon },
  { key: 'Doctor',    label: 'Doctor',    Icon: DoctorIcon },
  { key: 'Social',    label: 'Social',    Icon: SocialIcon },
  { key: 'Shop',      label: 'Shop',      Icon: ShopIcon },
];

export default function HomeScreen({ navigation, route }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const ringAnim  = useRef(new Animated.Value(0)).current;
  const botPulse  = useRef(new Animated.Value(1)).current;
  const ripple1   = useRef(new Animated.Value(1)).current;
  const ripple2   = useRef(new Animated.Value(1)).current;
  const botWiggle   = useRef(new Animated.Value(0)).current;
  const heartBeat   = useRef(new Animated.Value(1)).current;
  const bubbleFloat = useRef(new Animated.Value(0)).current;

  const [activeTab,       setActiveTab]       = useState('Dashboard');
  const [selectedMood,    setSelectedMood]    = useState(3);
  const [prevMood,        setPrevMood]        = useState(3);

  // Per-emoji animation values
  const moodScales    = React.useRef(MOODS.map(() => new Animated.Value(1))).current;
  const moodRotates   = React.useRef(MOODS.map(() => new Animated.Value(0))).current;
  const moodBounceY   = React.useRef(MOODS.map(() => new Animated.Value(0))).current;
  const moodCardScale = React.useRef(new Animated.Value(1)).current;
  const moodLabelAnim = React.useRef(new Animated.Value(1)).current;

  const triggerMoodAnimation = (idx) => {
    // Reset all to base
    MOODS.forEach((_, i) => {
      if (i !== idx) {
        Animated.spring(moodScales[i],  { toValue: 1,  useNativeDriver: true, friction: 6 }).start();
        Animated.spring(moodBounceY[i], { toValue: 0,  useNativeDriver: true, friction: 6 }).start();
        Animated.spring(moodRotates[i], { toValue: 0,  useNativeDriver: true, friction: 6 }).start();
      }
    });
    // Animate selected emoji — bounce + spin + scale up
    Animated.sequence([
      Animated.parallel([
        Animated.spring(moodScales[idx],  { toValue: 1.7, useNativeDriver: true, friction: 3, tension: 200 }),
        Animated.spring(moodBounceY[idx], { toValue: -14, useNativeDriver: true, friction: 3, tension: 200 }),
        Animated.timing(moodRotates[idx], { toValue: 1,   useNativeDriver: true, duration: 180 }),
      ]),
      Animated.parallel([
        Animated.spring(moodScales[idx],  { toValue: 1.4, useNativeDriver: true, friction: 5 }),
        Animated.spring(moodBounceY[idx], { toValue: -8,  useNativeDriver: true, friction: 5 }),
        Animated.timing(moodRotates[idx], { toValue: -0.5, useNativeDriver: true, duration: 120 }),
      ]),
      Animated.parallel([
        Animated.spring(moodScales[idx],  { toValue: 1.25, useNativeDriver: true, friction: 6 }),
        Animated.spring(moodBounceY[idx], { toValue: 0,    useNativeDriver: true, friction: 6 }),
        Animated.spring(moodRotates[idx], { toValue: 0,    useNativeDriver: true, friction: 6 }),
      ]),
    ]).start();
    // Pulse the big icon on the left
    Animated.sequence([
      Animated.spring(moodCardScale, { toValue: 1.35, useNativeDriver: true, friction: 3, tension: 200 }),
      Animated.spring(moodCardScale, { toValue: 0.9,  useNativeDriver: true, friction: 5 }),
      Animated.spring(moodCardScale, { toValue: 1.0,  useNativeDriver: true, friction: 6 }),
    ]).start();
    // Fade-slide label
    Animated.sequence([
      Animated.timing(moodLabelAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(moodLabelAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
  };
  const [reminders,       setLocalReminders]  = useState(_reminders);
  const [userName,        setLocalUserName]   = useState(_userName);

  // ── Interactive Quick Stats ──
  const [waterGlasses,    setWaterGlasses]    = useState(0);
  const [sleepHours,      setSleepHours]      = useState(7);
  const [sleepMins,       setSleepMins]       = useState(0);
  const [showWaterModal,  setShowWaterModal]  = useState(false);
  const [showSleepModal,  setShowSleepModal]  = useState(false);
  const [sleepInputH,     setSleepInputH]     = useState('7');
  const [sleepInputM,     setSleepInputM]     = useState('0');
  const [waterTab,        setWaterTab]        = useState('today');
  const [sleepTab,        setSleepTab]        = useState('today');
  const [waterHistory,    setWaterHistory]    = useState([]);
  const [sleepHistory,    setSleepHistory]    = useState([]);
  const [dataLoaded,      setDataLoaded]      = useState(false);

  // ── Date helpers ──
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const dateKeyForDaysAgo = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const getDayLabel = (dateKey) => {
    if (!dateKey) return '';
    if (dateKey === todayKey())          return 'Today';
    if (dateKey === dateKeyForDaysAgo(1)) return 'Yesterday';
    const [y, mo, dy] = dateKey.split('-').map(Number);
    return new Date(y, mo - 1, dy).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // ── AsyncStorage keys ──
  const WATER_STORE = 'OVIA_WATER_V1';
  const SLEEP_STORE = 'OVIA_SLEEP_V1';

  // ── Build history arrays from stored data ──
  const buildHistories = (wData, sData) => {
    // Build from ALL stored keys (lifetime), sorted newest first
    const wHist = Object.keys(wData)
      .filter(dk => dk !== todayKey())
      .sort((a, b) => b.localeCompare(a))
      .map(dk => ({ dateKey: dk, glasses: wData[dk] }));
    const sHist = Object.keys(sData)
      .filter(dk => dk !== todayKey())
      .sort((a, b) => b.localeCompare(a))
      .map(dk => ({ dateKey: dk, h: sData[dk].h, m: sData[dk].m }));
    setWaterHistory(wHist);
    setSleepHistory(sHist);
  };

  // ── Load saved data on mount ──
  useEffect(() => {
    const load = async () => {
      if (!AsyncStorage) { setDataLoaded(true); return; }
      try {
        const [wRaw, sRaw] = await Promise.all([
          AsyncStorage.getItem(WATER_STORE),
          AsyncStorage.getItem(SLEEP_STORE),
        ]);
        const wData = wRaw ? JSON.parse(wRaw) : {};
        const sData = sRaw ? JSON.parse(sRaw) : {};
        const today = todayKey();
        if (wData[today] !== undefined) setWaterGlasses(wData[today]);
        if (sData[today] !== undefined) {
          setSleepHours(sData[today].h);
          setSleepMins(sData[today].m);
          setSleepInputH(String(sData[today].h));
          setSleepInputM(String(sData[today].m));
        }
        buildHistories(wData, sData);
      } catch(e) {}
      setDataLoaded(true);
    };
    load();
  }, []);

  // ── Persist water whenever waterGlasses changes (after load) ──
  const waterGlassesRef = React.useRef(waterGlasses);
  waterGlassesRef.current = waterGlasses;
  useEffect(() => {
    if (!dataLoaded || !AsyncStorage) return;
    const save = async () => {
      try {
        const raw = await AsyncStorage.getItem(WATER_STORE);
        const data = raw ? JSON.parse(raw) : {};
        data[todayKey()] = waterGlasses;
        await AsyncStorage.setItem(WATER_STORE, JSON.stringify(data));
        buildHistories(data, await AsyncStorage.getItem(SLEEP_STORE).then(r => r ? JSON.parse(r) : {}));
      } catch(e) {}
    };
    save();
  }, [waterGlasses, dataLoaded]);

  // ── Persist sleep whenever hours/mins change (after load) ──
  useEffect(() => {
    if (!dataLoaded || !AsyncStorage) return;
    const save = async () => {
      try {
        const raw = await AsyncStorage.getItem(SLEEP_STORE);
        const data = raw ? JSON.parse(raw) : {};
        data[todayKey()] = { h: sleepHours, m: sleepMins };
        await AsyncStorage.setItem(SLEEP_STORE, JSON.stringify(data));
        buildHistories(await AsyncStorage.getItem(WATER_STORE).then(r => r ? JSON.parse(r) : {}), data);
      } catch(e) {}
    };
    save();
  }, [sleepHours, sleepMins, dataLoaded]);

  const WATER_GOAL    = 10;
  const GLASS_ML      = 250;
  const waterML       = waterGlasses * GLASS_ML;
  const waterLiters   = (waterML / 1000).toFixed(1);
  const waterPct      = Math.min(Math.round((waterGlasses / WATER_GOAL) * 100), 100);
  const SLEEP_GOAL_H  = 8;
  const sleepTotalMin = sleepHours * 60 + sleepMins;
  const sleepPct      = Math.min(Math.round((sleepTotalMin / (SLEEP_GOAL_H * 60)) * 100), 100);
  const sleepDisplay  = sleepMins > 0 ? `${sleepHours}h ${String(sleepMins).padStart(2,'0')}m` : `${sleepHours}h`;

  const addWater    = () => setWaterGlasses(g => Math.min(g + 1, WATER_GOAL));
  const removeWater = () => setWaterGlasses(g => Math.max(g - 1, 0));
  const saveSleep   = () => {
    const h = Math.min(Math.max(parseInt(sleepInputH) || 0, 0), 23);
    const m = Math.min(Math.max(parseInt(sleepInputM) || 0, 0), 59);
    setSleepHours(h); setSleepMins(m); setShowSleepModal(false);
  };
  const saveWaterAndClose = () => { setShowWaterModal(false); };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
    Animated.timing(ringAnim, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: false }).start();

    // Gentle pulse on bot FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(botPulse, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(botPulse, { toValue: 1.00, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    // Expanding ripple rings
    const startRipple = (anim, delay, toVal, dur) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: toVal, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1,     duration: 0,   useNativeDriver: true }),
        ])
      ).start();
    };
    startRipple(ripple1, 0,    1.6, 1600);
    startRipple(ripple2, 700,  1.9, 1600);

    // Head wiggle every few seconds
    const wiggle = () => {
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(botWiggle, { toValue:  1, duration: 100, useNativeDriver: true }),
        Animated.timing(botWiggle, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(botWiggle, { toValue:  1, duration: 100, useNativeDriver: true }),
        Animated.timing(botWiggle, { toValue:  0, duration: 100, useNativeDriver: true }),
      ]).start(wiggle);
    };
    wiggle();

    // Heartbeat animation — double-pump like a real heartbeat
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartBeat, { toValue: 1.28, duration: 120, useNativeDriver: true }),
        Animated.timing(heartBeat, { toValue: 1.0,  duration: 100, useNativeDriver: true }),
        Animated.timing(heartBeat, { toValue: 1.18, duration: 100, useNativeDriver: true }),
        Animated.timing(heartBeat, { toValue: 1.0,  duration: 120, useNativeDriver: true }),
        Animated.delay(1100),
      ])
    ).start();

    // Gentle vertical float
    Animated.loop(
      Animated.sequence([
        Animated.timing(bubbleFloat, { toValue: -5, duration: 1200, useNativeDriver: true }),
        Animated.timing(bubbleFloat, { toValue:  0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    const unsubR = subscribeReminders((r) => setLocalReminders([...r]));
    const unsubU = subscribeUserName((n)  => setLocalUserName(n));
    return () => { unsubR(); unsubU(); };
  }, []);

  useEffect(() => { setLocalUserName(getUserName()); }, [route]);

  const cycleProgress = (CYCLE_DAY / CYCLE_TOTAL) * 100;
  const currentMood   = MOODS[selectedMood];
  const firstName     = userName.split(' ')[0] || userName;
  const initials      = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const hour          = new Date().getHours();
  const greeting      = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.blobTop} />
        <View style={styles.blobRight} />

        {/* ── TOP BAR ── */}
        <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
          <View style={styles.avatarRow}>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
              <Text style={styles.avatarText}>{initials}</Text>
              <View style={styles.avatarEditDot} />
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
              <Text style={styles.dateText}>{TODAY}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── CYCLE CARD ── */}
        <Animated.View style={[styles.cycleCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.cycleLeft}>
            <View style={styles.cyclePhaseBadge}>
              <Text style={styles.cyclePhaseBadgeText}>🌕 Ovulation Phase</Text>
            </View>
            <Text style={styles.cycleDayText}>Day {CYCLE_DAY}</Text>
            <Text style={styles.cycleDesc}>Your peak fertility window is open.</Text>
            <TouchableOpacity style={styles.insightBtn} onPress={() => navigation.navigate('Calendar')} activeOpacity={0.7}>
              <Text style={styles.insightBtnText}>View Insights →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cycleRingWrapper}>
            <View style={styles.cycleRingOuter}>
              <View style={styles.cycleRingInner}>
                <Text style={styles.cycleRingNumber}>{CYCLE_DAY}</Text>
                <Text style={styles.cycleRingLabel}>of {CYCLE_TOTAL}</Text>
              </View>
            </View>
            <View style={styles.progressDotsRow}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={[styles.progressDot, i < 3 ? styles.progressDotFilled : styles.progressDotEmpty]} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── CYCLE PROGRESS BAR ── */}
        <Animated.View style={[styles.progressBarCard, { opacity: fadeAnim }]}>
          <View style={styles.progressBarRow}>
            <Text style={styles.progressBarLabel}>Cycle Progress</Text>
            <Text style={styles.progressBarPct}>Day {CYCLE_DAY}/{CYCLE_TOTAL}</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: ringAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${cycleProgress}%`] }),
            }]} />
            <View style={[styles.phaseMarker, { left: '25%' }]} />
            <View style={[styles.phaseMarker, { left: '50%' }]} />
            <View style={[styles.phaseMarker, { left: '75%' }]} />
          </View>
          <View style={styles.phaseLabelsRow}>
            {['Period', 'Follicular', 'Ovulation', 'Luteal'].map(p => (
              <Text key={p} style={styles.phaseLabel}>{p}</Text>
            ))}
          </View>
        </Animated.View>

        {/* ── QUICK STATS ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>

            {/* ── WATER CARD (interactive) ── */}
            <TouchableOpacity style={[styles.statCard, styles.statCardPink]} activeOpacity={0.85} onPress={() => setShowWaterModal(true)}>
              <View style={styles.statTopRow}>
                <Text style={styles.statIcon}>💧</Text>
                <Text style={styles.statPct}>{waterPct}%</Text>
              </View>
              <Text style={styles.statValue}>{waterLiters}L</Text>
              <Text style={styles.statLabel}>WATER · {waterGlasses}/{WATER_GOAL} glasses</Text>
              <View style={styles.statBar}>
                <Animated.View style={[styles.statBarFill, { width: `${waterPct}%`, backgroundColor: waterPct >= 100 ? COLORS.green : COLORS.watermelon }]} />
              </View>
              {/* Quick +/- buttons */}
              <View style={styles.statQuickRow}>
                <TouchableOpacity style={styles.statQuickBtn} onPress={(e) => { e.stopPropagation?.(); removeWater(); }} activeOpacity={0.7}>
                  <Text style={styles.statQuickBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.statQuickLabel}>Tap to log</Text>
                <TouchableOpacity style={[styles.statQuickBtn, styles.statQuickBtnAdd]} onPress={(e) => { e.stopPropagation?.(); addWater(); }} activeOpacity={0.7}>
                  <Text style={[styles.statQuickBtnText, { color: COLORS.white }]}>+</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* ── SLEEP CARD (interactive) ── */}
            <TouchableOpacity style={[styles.statCard, styles.statCardPurple]} activeOpacity={0.85} onPress={() => { setSleepInputH(String(sleepHours)); setSleepInputM(String(sleepMins)); setShowSleepModal(true); }}>
              <View style={styles.statTopRow}>
                <Text style={styles.statIcon}>🌙</Text>
                <Text style={styles.statPct}>{sleepPct}%</Text>
              </View>
              <Text style={styles.statValue}>{sleepDisplay}</Text>
              <Text style={styles.statLabel}>SLEEP · goal {SLEEP_GOAL_H}h</Text>
              <View style={styles.statBar}>
                <View style={[styles.statBarFill, { width: `${sleepPct}%`, backgroundColor: '#9C88D4' }]} />
              </View>
              <View style={styles.statQuickRow}>
                <TouchableOpacity style={[styles.statQuickBtn, { borderColor: '#9C88D4' }]} onPress={(e) => { e.stopPropagation?.(); setSleepHours(h => Math.max(h - 1, 0)); }} activeOpacity={0.7}>
                  <Text style={[styles.statQuickBtnText, { color: '#9C88D4' }]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.statQuickLabel}>Tap to edit</Text>
                <TouchableOpacity style={[styles.statQuickBtn, { borderColor: '#9C88D4', backgroundColor: '#9C88D4' }]} onPress={(e) => { e.stopPropagation?.(); setSleepHours(h => Math.min(h + 1, 23)); }} activeOpacity={0.7}>
                  <Text style={[styles.statQuickBtnText, { color: COLORS.white }]}>+</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* ── MOOD CARD (animated) ── */}
            <View style={[styles.statCard, styles.statCardMood]}>
              {/* Big emoji left — pulses on selection */}
              <Animated.Text style={[styles.moodCardIcon, { transform: [{ scale: moodCardScale }] }]}>
                {currentMood.emoji}
              </Animated.Text>
              <View style={styles.moodCardMiddle}>
                <Text style={styles.moodLabel}>MOOD</Text>
                <Animated.Text style={[styles.moodValue, { opacity: moodLabelAnim, transform: [{ translateY: moodLabelAnim.interpolate({ inputRange: [0,1], outputRange: [6,0] }) }] }]}>
                  {currentMood.label}
                </Animated.Text>
              </View>
              <View style={styles.moodDots}>
                {MOODS.map((m, i) => {
                  const isActive = i === selectedMood;
                  const rotateStr = moodRotates[i].interpolate({ inputRange: [-1, 0, 1], outputRange: ['-30deg', '0deg', '30deg'] });
                  return (
                    <TouchableOpacity
                      key={i}
                      style={styles.moodDotWrap}
                      onPress={() => {
                        if (i !== selectedMood) {
                          setSelectedMood(i);
                          triggerMoodAnimation(i);
                        }
                      }}
                      activeOpacity={0.9}
                    >
                      {/* Active glow ring */}
                      {isActive && (
                        <Animated.View style={[styles.moodGlowRing, { transform: [{ scale: moodScales[i] }] }]} />
                      )}
                      <Animated.View style={[
                        styles.moodDot,
                        isActive && styles.moodDotActive,
                        {
                          transform: [
                            { scale: moodScales[i] },
                            { translateY: moodBounceY[i] },
                            { rotate: rotateStr },
                          ]
                        }
                      ]}>
                        <Text style={[styles.moodDotEmoji, isActive && styles.moodDotEmojiActive]}>{m.emoji}</Text>
                      </Animated.View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ════════ WATER MODAL ════════ */}
        <Modal visible={showWaterModal} transparent animationType="slide" onRequestClose={() => setShowWaterModal(false)}>
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowWaterModal(false)} />
            <View style={[styles.modalSheet, { paddingBottom: Platform.OS === 'ios' ? 40 : 28 }]}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>💧 Water Intake</Text>

              {/* ── Tab switcher ── */}
              <View style={styles.histTabRow}>
                {['today','history'].map(t => (
                  <TouchableOpacity key={t} style={[styles.histTab, waterTab === t && styles.histTabActive]} onPress={() => setWaterTab(t)} activeOpacity={0.8}>
                    <Text style={[styles.histTabText, waterTab === t && styles.histTabTextActive]}>
                      {t === 'today' ? '📅 Today' : '📋 All History'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {waterTab === 'today' ? (
                <>
                  <Text style={styles.modalSubtitle}>Goal: {WATER_GOAL} glasses ({(WATER_GOAL * GLASS_ML / 1000).toFixed(1)}L) per day</Text>
                  <View style={styles.modalStatDisplay}>
                    <Text style={styles.modalBigValue}>{waterLiters}L</Text>
                    <Text style={styles.modalBigSub}>{waterGlasses} of {WATER_GOAL} glasses</Text>
                    <View style={styles.modalProgressTrack}>
                      <View style={[styles.modalProgressFill, { width: `${waterPct}%`, backgroundColor: waterPct >= 100 ? COLORS.green : COLORS.watermelon }]} />
                    </View>
                    <Text style={[styles.modalPctText, { color: waterPct >= 100 ? COLORS.green : COLORS.watermelon }]}>
                      {waterPct >= 100 ? '🎉 Daily goal reached!' : `${waterPct}% of daily goal`}
                    </Text>
                  </View>
                  <View style={styles.glassGrid}>
                    {Array.from({ length: WATER_GOAL }).map((_, i) => (
                      <TouchableOpacity key={i} style={[styles.glassBtn, i < waterGlasses && styles.glassBtnFilled]} onPress={() => setWaterGlasses(i + 1)} activeOpacity={0.75}>
                        <Text style={{ fontSize: 20 }}>{i < waterGlasses ? '💧' : '🫙'}</Text>
                        <Text style={[styles.glassBtnLabel, i < waterGlasses && { color: COLORS.watermelon }]}>{i + 1}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity style={styles.modalMinusBtn} onPress={removeWater} activeOpacity={0.8}>
                      <Text style={styles.modalMinusBtnText}>− Remove</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalAddBtn} onPress={addWater} activeOpacity={0.85}>
                      <Text style={styles.modalAddBtnText}>+ Add glass</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.modalDoneBtn} onPress={saveWaterAndClose} activeOpacity={0.85}>
                    <Text style={styles.modalDoneBtnText}>Done ✓</Text>
                  </TouchableOpacity>
                </>
              ) : (
                /* ── WATER HISTORY VIEW ── */
                waterHistory.length === 0 ? (
                  <View style={styles.histEmptyWrap}>
                    <Text style={{fontSize:40,marginBottom:12}}>💧</Text>
                    <Text style={styles.histEmptyTitle}>No history yet</Text>
                    <Text style={styles.histEmptyText}>Start logging water today — your past 7 days will appear here automatically.</Text>
                  </View>
                ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
                  {/* Weekly bar chart */}
                  <View style={styles.histChartWrap}>
                    <Text style={styles.histChartTitle}>Last 7 Days</Text>
                    <View style={styles.histBarChart}>
                      {waterHistory.slice(0, 7).map((day, i) => {
                        const pct = Math.min((day.glasses / WATER_GOAL), 1);
                        const litres = ((day.glasses * GLASS_ML) / 1000).toFixed(1);
                        const lbl = getDayLabel(day.dateKey); const dayShort = lbl === 'Yesterday' ? 'Yest' : lbl.split(' ')[0];
                        return (
                          <View key={i} style={styles.histBarCol}>
                            <Text style={styles.histBarVal}>{litres}L</Text>
                            <View style={styles.histBarTrack}>
                              <View style={[styles.histBarFill, {
                                height: `${Math.max(pct * 100, 8)}%`,
                                backgroundColor: pct >= 1 ? COLORS.green : pct >= 0.7 ? COLORS.watermelon : COLORS.pastelPink
                              }]} />
                            </View>
                            <Text style={styles.histBarLabel}>{dayShort}</Text>
                          </View>
                        );
                      })}
                    </View>
                    {/* Legend */}
                    <View style={styles.histLegend}>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:COLORS.green}]}/><Text style={styles.histLegendText}>Goal met</Text></View>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:COLORS.watermelon}]}/><Text style={styles.histLegendText}>≥70%</Text></View>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:COLORS.pastelPink}]}/><Text style={styles.histLegendText}>Below 70%</Text></View>
                    </View>
                  </View>
                  {/* Day-by-day list */}
                  <Text style={styles.histListTitle}>All Time ({waterHistory.length} {waterHistory.length === 1 ? 'day' : 'days'})</Text>
                  {waterHistory.map((day, i) => {
                    const pct = Math.min(Math.round((day.glasses / WATER_GOAL) * 100), 100);
                    const litres = ((day.glasses * GLASS_ML) / 1000).toFixed(1);
                    const met = day.glasses >= WATER_GOAL;
                    return (
                      <View key={i} style={styles.histRow}>
                        <View style={styles.histRowLeft}>
                          <Text style={styles.histRowEmoji}>{met ? '✅' : '💧'}</Text>
                          <View>
                            <Text style={styles.histRowDay}>{getDayLabel(day.dateKey)}</Text>
                            <Text style={styles.histRowDetail}>{day.glasses}/{WATER_GOAL} glasses · {litres}L</Text>
                          </View>
                        </View>
                        <View style={styles.histRowRight}>
                          <Text style={[styles.histRowPct, { color: met ? COLORS.green : COLORS.watermelon }]}>{pct}%</Text>
                          <View style={styles.histRowBar}>
                            <View style={[styles.histRowBarFill, { width: `${pct}%`, backgroundColor: met ? COLORS.green : COLORS.watermelon }]} />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ height: 12 }} />
                </ScrollView>
                )
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ════════ SLEEP MODAL ════════ */}
        <Modal visible={showSleepModal} transparent animationType="slide" onRequestClose={() => setShowSleepModal(false)}>
          <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowSleepModal(false)} />
            <View style={[styles.modalSheet, { paddingBottom: Platform.OS === 'ios' ? 40 : 28 }]}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>🌙 Sleep Tracker</Text>

              {/* ── Tab switcher ── */}
              <View style={styles.histTabRow}>
                {['today','history'].map(t => (
                  <TouchableOpacity key={t} style={[styles.histTab, sleepTab === t && styles.histTabActiveSleep]} onPress={() => setSleepTab(t)} activeOpacity={0.8}>
                    <Text style={[styles.histTabText, sleepTab === t && styles.histTabTextActive]}>
                      {t === 'today' ? '📅 Today' : '📋 All History'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {sleepTab === 'today' ? (
                <>
                  <Text style={styles.modalSubtitle}>Recommended: 7–9 hours per night</Text>
                  <View style={styles.modalStatDisplay}>
                    <Text style={styles.modalBigValue}>{sleepDisplay}</Text>
                    <View style={styles.modalProgressTrack}>
                      <View style={[styles.modalProgressFill, { width: `${sleepPct}%`, backgroundColor: '#9C88D4' }]} />
                    </View>
                    <Text style={[styles.modalPctText, { color: '#9C88D4' }]}>
                      {sleepPct >= 100 ? '🎉 Great sleep!' : `${sleepPct}% of goal`}
                    </Text>
                  </View>
                  <Text style={styles.modalLabel}>How long did you sleep?</Text>
                  <View style={styles.sleepInputRow}>
                    <View style={styles.sleepInputGroup}>
                      <TextInput style={styles.sleepInput} value={sleepInputH} onChangeText={t => setSleepInputH(t.replace(/[^0-9]/g,''))} keyboardType="number-pad" maxLength={2} selectTextOnFocus />
                      <Text style={styles.sleepInputUnit}>hours</Text>
                    </View>
                    <Text style={styles.sleepColon}>:</Text>
                    <View style={styles.sleepInputGroup}>
                      <TextInput style={styles.sleepInput} value={sleepInputM} onChangeText={t => setSleepInputM(t.replace(/[^0-9]/g,''))} keyboardType="number-pad" maxLength={2} selectTextOnFocus />
                      <Text style={styles.sleepInputUnit}>mins</Text>
                    </View>
                  </View>
                  <Text style={styles.modalLabel}>Quick select</Text>
                  <View style={styles.sleepPresets}>
                    {[['5h','5','0'],['6h','6','0'],['7h','7','0'],['7h30m','7','30'],['8h','8','0'],['9h','9','0']].map(([label,h,m]) => {
                      const isActive = sleepInputH === h && sleepInputM === m;
                      return (
                        <TouchableOpacity key={label} style={[styles.sleepPreset, isActive && styles.sleepPresetActive]} onPress={() => { setSleepInputH(h); setSleepInputM(m); }} activeOpacity={0.75}>
                          <Text style={[styles.sleepPresetText, isActive && { color: COLORS.white }]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity style={styles.modalMinusBtn} onPress={() => setShowSleepModal(false)} activeOpacity={0.8}>
                      <Text style={styles.modalMinusBtnText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalAddBtn} onPress={saveSleep} activeOpacity={0.85}>
                      <Text style={styles.modalAddBtnText}>Save Sleep ✓</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* ── SLEEP HISTORY VIEW ── */
                sleepHistory.length === 0 ? (
                  <View style={styles.histEmptyWrap}>
                    <Text style={{fontSize:40,marginBottom:12}}>🌙</Text>
                    <Text style={styles.histEmptyTitle}>No history yet</Text>
                    <Text style={styles.histEmptyText}>Log your sleep today — your past 7 days will appear here automatically.</Text>
                  </View>
                ) : (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
                  {/* Weekly bar chart */}
                  <View style={styles.histChartWrap}>
                    <Text style={styles.histChartTitle}>Last 7 Days</Text>
                    <View style={styles.histBarChart}>
                      {sleepHistory.slice(0, 7).map((day, i) => {
                        const total = day.h + day.m / 60;
                        const pct = Math.min(total / SLEEP_GOAL_H, 1);
                        const label = day.m > 0 ? `${day.h}h${day.m}m` : `${day.h}h`;
                        const lbl2 = getDayLabel(day.dateKey); const dayShort = lbl2 === 'Yesterday' ? 'Yest' : lbl2.split(' ')[0];
                        return (
                          <View key={i} style={styles.histBarCol}>
                            <Text style={styles.histBarVal}>{label}</Text>
                            <View style={styles.histBarTrack}>
                              <View style={[styles.histBarFill, {
                                height: `${Math.max(pct * 100, 8)}%`,
                                backgroundColor: pct >= 1 ? COLORS.green : pct >= 0.75 ? '#9C88D4' : '#C5B8EA'
                              }]} />
                            </View>
                            <Text style={styles.histBarLabel}>{dayShort}</Text>
                          </View>
                        );
                      })}
                    </View>
                    <View style={styles.histLegend}>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:COLORS.green}]}/><Text style={styles.histLegendText}>Goal met</Text></View>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:'#9C88D4'}]}/><Text style={styles.histLegendText}>≥75%</Text></View>
                      <View style={styles.histLegendItem}><View style={[styles.histLegendDot,{backgroundColor:'#C5B8EA'}]}/><Text style={styles.histLegendText}>Below 75%</Text></View>
                    </View>
                  </View>
                  {/* Day-by-day list */}
                  <Text style={styles.histListTitle}>All Time ({sleepHistory.length} {sleepHistory.length === 1 ? 'day' : 'days'})</Text>
                  {sleepHistory.map((day, i) => {
                    const total = day.h * 60 + day.m;
                    const pct = Math.min(Math.round((total / (SLEEP_GOAL_H * 60)) * 100), 100);
                    const met = total >= SLEEP_GOAL_H * 60;
                    const disp = day.m > 0 ? `${day.h}h ${String(day.m).padStart(2,'0')}m` : `${day.h}h`;
                    return (
                      <View key={i} style={styles.histRow}>
                        <View style={styles.histRowLeft}>
                          <Text style={styles.histRowEmoji}>{met ? '✅' : '🌙'}</Text>
                          <View>
                            <Text style={styles.histRowDay}>{getDayLabel(day.dateKey)}</Text>
                            <Text style={styles.histRowDetail}>{disp} slept</Text>
                          </View>
                        </View>
                        <View style={styles.histRowRight}>
                          <Text style={[styles.histRowPct, { color: met ? COLORS.green : '#9C88D4' }]}>{pct}%</Text>
                          <View style={styles.histRowBar}>
                            <View style={[styles.histRowBarFill, { width: `${pct}%`, backgroundColor: met ? COLORS.green : '#9C88D4' }]} />
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  <View style={{ height: 12 }} />
                </ScrollView>
                )
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── REMINDERS ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Reminders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {reminders.length === 0 ? (
            <TouchableOpacity style={styles.emptyReminders} onPress={() => navigation.navigate('Reminders')}>
              <Text style={styles.emptyRemindersText}>＋ Add your first reminder</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.remindersScroll}>
              {reminders.slice(0, 6).map(r => (
                <View key={r.id} style={[styles.reminderChip, { backgroundColor: r.color || COLORS.pastelPink }]}>
                  <Text style={styles.reminderIcon}>{r.icon}</Text>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={styles.reminderTime}>{r.time}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addReminderChip} onPress={() => navigation.navigate('Reminders')}>
                <Text style={styles.addReminderIcon}>＋</Text>
                <Text style={styles.addReminderText}>Add</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </Animated.View>

        {/* ── EXERCISE MODULES ── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercise Modules</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Exercise')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {EXERCISE_MODULES.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              style={[styles.exerciseCard, { backgroundColor: mod.bg, borderColor: mod.accent + '40' }]}
              onPress={() => navigation.navigate('ExerciseDetail', { module: mod })}
              activeOpacity={0.85}
            >
              <View style={[styles.exerciseAccentStrip, { backgroundColor: mod.accent }]} />
              <View style={[styles.exerciseIconCircle, { backgroundColor: mod.accent + '22' }]}>
                <Text style={styles.exerciseEmoji}>{mod.emoji}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseTitle, { color: mod.accent }]}>{mod.title}</Text>
                <Text style={styles.exerciseSubtitle}>{mod.subtitle}</Text>
                <Text style={[styles.exerciseCount, { color: mod.accent }]}>▶ {mod.videoCount} videos</Text>
              </View>
              <View style={[styles.exerciseArrow, { backgroundColor: mod.accent }]}>
                <Text style={styles.exerciseArrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── CHATBOT FLOATING BUTTON ── */}
      {/* Ripple rings */}
      <Animated.View pointerEvents="none" style={[
        styles.chatFabRipple,
        { transform: [{ scale: ripple1 }],
          opacity: ripple1.interpolate({ inputRange: [1, 1.6], outputRange: [0.4, 0] }) }
      ]} />
      <Animated.View pointerEvents="none" style={[
        styles.chatFabRipple,
        { transform: [{ scale: ripple2 }],
          opacity: ripple2.interpolate({ inputRange: [1, 1.9], outputRange: [0.22, 0] }) }
      ]} />
      {/* FAB button */}
      <Animated.View style={[styles.chatFabWrapper, { transform: [{ scale: botPulse }] }]}>
        <TouchableOpacity
          style={styles.chatFab}
          onPress={() => navigation.navigate('Chatbot')}
          activeOpacity={0.85}
        >
          {/* Float wrapper */}
          <Animated.View style={{ transform: [{ translateY: bubbleFloat }] }}>
            {/* Wiggle wrapper */}
            <Animated.View style={{ transform: [{ rotate: botWiggle.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-6deg', '0deg', '6deg'] }) }] }}>
              <ChatBubbleHeart size={46} />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* ── BOTTOM NAV ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const color = isActive ? COLORS.watermelon : COLORS.navInactive;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navTab}
              onPress={() => {
                setActiveTab(tab.key);
                if (tab.key === 'Calendar') navigation.navigate('Calendar');
                if (tab.key === 'Doctor')   navigation.navigate('Doctor');
                if (tab.key === 'Social')   navigation.navigate('Social');
                if (tab.key === 'Shop')     navigation.navigate('Shop');
              }}
              activeOpacity={0.7}
            >
              {isActive && <View style={styles.navActivePill} />}
              {isActive && <View style={styles.navActiveCircle} />}
              <tab.Icon color={color} size={26} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12 },
  blobTop: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.pinkChampagne, opacity: 0.4, top: -60, right: -60 },
  blobRight: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.pastelPink, opacity: 0.25, top: 200, left: -40 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: COLORS.watermelon, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6, borderWidth: 2.5, borderColor: COLORS.white, position: 'relative' },
  avatarText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  avatarEditDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.pinkChampagne, borderWidth: 1.5, borderColor: COLORS.white },
  greeting: { fontSize: 15, fontWeight: '700', color: COLORS.darkText },
  dateText: { fontSize: 11, color: COLORS.mutedText, letterSpacing: 0.8, fontWeight: '500' },
  bellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  bellIcon: { fontSize: 18 },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.watermelon, borderWidth: 1.5, borderColor: COLORS.white },

  cycleCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  cycleLeft: { flex: 1, paddingRight: 12 },
  cyclePhaseBadge: { backgroundColor: COLORS.lavenderBlush, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: COLORS.pastelPink },
  cyclePhaseBadgeText: { fontSize: 11, color: COLORS.watermelon, fontWeight: '700' },
  cycleDayText: { fontSize: 26, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  cycleDesc: { fontSize: 12, color: COLORS.mutedText, lineHeight: 18, marginBottom: 12 },
  insightBtn: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: COLORS.lavenderBlush, borderRadius: 20, borderWidth: 1, borderColor: COLORS.pastelPink },
  insightBtnText: { fontSize: 13, color: COLORS.watermelon, fontWeight: '800' },
  cycleRingWrapper: { alignItems: 'center', gap: 8 },
  cycleRingOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: COLORS.pastelPink, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.lavenderBlush },
  cycleRingInner: { alignItems: 'center' },
  cycleRingNumber: { fontSize: 24, fontWeight: '800', color: COLORS.watermelon, lineHeight: 28 },
  cycleRingLabel: { fontSize: 9, color: COLORS.mutedText, fontWeight: '600' },
  progressDotsRow: { flexDirection: 'row', gap: 3 },
  progressDot: { width: 6, height: 6, borderRadius: 3 },
  progressDotFilled: { backgroundColor: COLORS.watermelon },
  progressDotEmpty: { backgroundColor: COLORS.pinkChampagne },

  progressBarCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  progressBarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBarLabel: { fontSize: 12, fontWeight: '700', color: COLORS.darkText },
  progressBarPct: { fontSize: 12, color: COLORS.mutedText, fontWeight: '600' },
  progressTrack: { height: 8, backgroundColor: COLORS.lavenderBlush, borderRadius: 4, overflow: 'hidden', marginBottom: 8, position: 'relative' },
  progressFill: { height: '100%', backgroundColor: COLORS.watermelon, borderRadius: 4 },
  phaseMarker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: COLORS.white, opacity: 0.8 },
  phaseLabelsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  phaseLabel: { fontSize: 9, color: COLORS.mutedText, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText, marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.watermelon, fontWeight: '700', marginBottom: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { borderRadius: 20, padding: 16, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },

  statQuickRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  statQuickBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: COLORS.watermelon, alignItems: 'center', justifyContent: 'center' },
  statQuickBtnAdd: { backgroundColor: COLORS.watermelon },
  statQuickBtnText: { fontSize: 16, fontWeight: '800', color: COLORS.watermelon, lineHeight: 20 },
  statQuickLabel: { fontSize: 10, color: COLORS.mutedText, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 28 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: COLORS.mutedText, marginBottom: 18 },
  modalStatDisplay: { backgroundColor: COLORS.lavenderBlush, borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 18, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  modalBigValue: { fontSize: 40, fontWeight: '900', color: COLORS.darkText, letterSpacing: -1 },
  modalBigSub: { fontSize: 13, color: COLORS.mutedText, marginBottom: 12, marginTop: 2 },
  modalProgressTrack: { width: '100%', height: 8, backgroundColor: COLORS.pinkChampagne, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  modalProgressFill: { height: '100%', borderRadius: 4 },
  modalPctText: { fontSize: 12, fontWeight: '700' },
  modalLabel: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 10 },

  // Glass grid
  glassGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18, justifyContent: 'center' },
  glassBtn: { width: 52, height: 60, borderRadius: 14, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.pinkChampagne },
  glassBtnFilled: { backgroundColor: '#FFE5EC', borderColor: COLORS.watermelon },
  glassBtnLabel: { fontSize: 10, fontWeight: '700', color: COLORS.mutedText, marginTop: 2 },

  // Modal buttons
  modalBtnRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  modalMinusBtn: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: COLORS.pastelPink },
  modalMinusBtnText: { fontSize: 14, color: COLORS.mutedText, fontWeight: '700' },
  modalAddBtn: { flex: 1.5, borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  modalAddBtnText: { fontSize: 14, color: COLORS.white, fontWeight: '800' },
  modalDoneBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.lavenderBlush, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  modalDoneBtnText: { fontSize: 14, color: COLORS.watermelon, fontWeight: '800' },

  // Sleep inputs
  sleepInputRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 18 },
  sleepInputGroup: { alignItems: 'center', gap: 4 },
  sleepInput: { width: 72, height: 64, backgroundColor: COLORS.lavenderBlush, borderRadius: 16, textAlign: 'center', fontSize: 28, fontWeight: '800', color: COLORS.darkText, borderWidth: 2, borderColor: COLORS.pastelPink },
  sleepInputUnit: { fontSize: 11, color: COLORS.mutedText, fontWeight: '600' },
  sleepColon: { fontSize: 32, fontWeight: '800', color: COLORS.darkText, marginBottom: 16 },
  sleepPresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sleepPreset: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.lavenderBlush, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  sleepPresetActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon },
  sleepPresetText: { fontSize: 13, fontWeight: '700', color: COLORS.mutedText },

  green: COLORS.green,

  // History tabs
  histTabRow: { flexDirection: 'row', backgroundColor: COLORS.lavenderBlush, borderRadius: 14, padding: 4, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  histTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  histTabActive: { backgroundColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  histTabActiveSleep: { backgroundColor: '#9C88D4', shadowColor: '#9C88D4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  histTabText: { fontSize: 12, fontWeight: '700', color: COLORS.mutedText },
  histTabTextActive: { color: COLORS.white },

  // Bar chart
  histEmptyWrap: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  histEmptyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  histEmptyText: { fontSize: 13, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20 },
  histChartWrap: { backgroundColor: COLORS.lavenderBlush, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  histChartTitle: { fontSize: 13, fontWeight: '800', color: COLORS.darkText, marginBottom: 12 },
  histBarChart: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 6, marginBottom: 10 },
  histBarCol: { flex: 1, alignItems: 'center', gap: 4 },
  histBarVal: { fontSize: 9, fontWeight: '700', color: COLORS.mutedText, textAlign: 'center' },
  histBarTrack: { flex: 1, width: '100%', backgroundColor: COLORS.pinkChampagne, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  histBarFill: { width: '100%', borderRadius: 6 },
  histBarLabel: { fontSize: 9, color: COLORS.mutedText, fontWeight: '600', textAlign: 'center' },
  histLegend: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  histLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  histLegendDot: { width: 8, height: 8, borderRadius: 4 },
  histLegendText: { fontSize: 10, color: COLORS.mutedText },

  // Day list rows
  histListTitle: { fontSize: 13, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  histRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  histRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  histRowEmoji: { fontSize: 22 },
  histRowDay: { fontSize: 13, fontWeight: '700', color: COLORS.darkText },
  histRowDetail: { fontSize: 11, color: COLORS.mutedText, marginTop: 1 },
  histRowRight: { alignItems: 'flex-end', gap: 4, minWidth: 70 },
  histRowPct: { fontSize: 13, fontWeight: '800' },
  histRowBar: { width: 70, height: 5, backgroundColor: COLORS.lavenderBlush, borderRadius: 3, overflow: 'hidden' },
  histRowBarFill: { height: '100%', borderRadius: 3 },
  statCardPink: { backgroundColor: COLORS.pinkChampagne, width: (width - 52) / 2, shadowColor: COLORS.lightPink },
  statCardPurple: { backgroundColor: '#EDE7F6', width: (width - 52) / 2, shadowColor: '#B39DDB' },
  statCardMood: { backgroundColor: COLORS.white, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.lightPink, paddingVertical: 14 },
  moodCardIcon: { fontSize: 28, width: 36, textAlign: 'center' },
  moodDotWrap: { alignItems: 'center', justifyContent: 'center', width: 36, height: 44 },
  moodGlowRing: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.watermelon, opacity: 0.18,
  },
  moodCardMiddle: { width: 105 },
  moodLabel: { fontSize: 10, color: COLORS.mutedText, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  moodValue: { fontSize: 14, fontWeight: '700', color: COLORS.darkText },
  moodDots: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end', gap: 4 },
  moodDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  moodDotActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  moodDotEmoji: { fontSize: 16 },
  moodDotEmojiActive: { fontSize: 18 },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  statIcon: { fontSize: 20 },
  statPct: { fontSize: 11, color: COLORS.mutedText, fontWeight: '700' },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.darkText, marginBottom: 2 },
  statLabel: { fontSize: 10, color: COLORS.mutedText, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  statBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 2, overflow: 'hidden' },
  statBarFill: { height: '100%', borderRadius: 2 },

  remindersScroll: { marginBottom: 24 },
  reminderChip: { borderRadius: 20, padding: 14, marginRight: 12, width: 120 },
  reminderIcon: { fontSize: 22, marginBottom: 6 },
  reminderTitle: { fontSize: 12, fontWeight: '700', color: COLORS.darkText, marginBottom: 3 },
  reminderTime: { fontSize: 11, color: COLORS.mutedText, fontWeight: '500' },
  addReminderChip: { borderRadius: 20, padding: 14, marginRight: 12, width: 90, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.pastelPink, borderStyle: 'dashed' },
  addReminderIcon: { fontSize: 22, color: COLORS.watermelon, marginBottom: 4 },
  addReminderText: { fontSize: 11, color: COLORS.watermelon, fontWeight: '700' },
  emptyReminders: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 2, borderColor: COLORS.pastelPink, borderStyle: 'dashed', marginBottom: 24 },
  emptyRemindersText: { fontSize: 14, color: COLORS.watermelon, fontWeight: '700' },

  exerciseCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1.5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3, overflow: 'hidden', position: 'relative' },
  exerciseAccentStrip: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  exerciseIconCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginLeft: 6 },
  exerciseEmoji: { fontSize: 26 },
  exerciseInfo: { flex: 1 },
  exerciseTitle: { fontSize: 15, fontWeight: '800', marginBottom: 3 },
  exerciseSubtitle: { fontSize: 12, color: COLORS.mutedText, marginBottom: 5 },
  exerciseCount: { fontSize: 12, fontWeight: '700' },
  exerciseArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  exerciseArrowText: { color: COLORS.white, fontSize: 20, fontWeight: '300', lineHeight: 24 },


  // ── Chatbot FAB ──
  chatFabWrapper: {
    position: 'absolute',
    bottom: 118,
    right: 20,
    zIndex: 200,
  },
  chatFab: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: COLORS.lavenderBlush,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  chatFabRipple: {
    position: 'absolute',
    bottom: 118, right: 20,
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: COLORS.watermelon,
    zIndex: 198,
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingBottom: 28,       // generous bottom for home indicator
    paddingTop: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.pinkChampagne,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
    minHeight: 72,           // ensures consistent height across devices
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,      // breathing room above/below icon+label
    paddingHorizontal: 2,
    position: 'relative',
    gap: 4,
  },
  navActivePill: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.watermelon,
  },
  navActiveCircle: {
    position: 'absolute',
    top: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.lavenderBlush,
    zIndex: -1,
  },
  navLabel: {
    fontSize: 10,
    color: COLORS.navInactive,
    fontWeight: '500',
    marginTop: 1,
    letterSpacing: 0.2,
  },
  navLabelActive: { color: COLORS.watermelon, fontWeight: '700' },
});