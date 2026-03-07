import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
};

export const ALL_MODULES = [
  {
    id: '1',
    title: 'Period Relief',
    subtitle: 'Ease cramps & bloating',
    description: 'Gentle stretches and yoga poses specifically designed to relieve menstrual cramps, reduce bloating, and ease lower back pain during your period.',
    emoji: '🩸',
    bg: '#FFE5EC',
    accent: '#FB6F92',
    videoCount: 8,
    category: 'Period',
    searchQuery: 'period cramps relief yoga exercises',
  },
  {
    id: '2',
    title: 'PCOS & PCOD Yoga',
    subtitle: 'Balance hormones naturally',
    description: 'Targeted yoga and low-impact workouts to help manage PCOS/PCOD symptoms, regulate hormones, and reduce insulin resistance.',
    emoji: '🧘',
    bg: '#F3E5F5',
    accent: '#AB47BC',
    videoCount: 12,
    category: 'PCOS',
    searchQuery: 'PCOS PCOD yoga workout exercises hormone balance',
  },
  {
    id: '3',
    title: 'Pregnancy Safe',
    subtitle: 'Gentle prenatal workouts',
    description: 'Safe and effective prenatal exercises approved for all trimesters. Strengthen your body and prepare for childbirth.',
    emoji: '🤰',
    bg: '#E8F5E9',
    accent: '#4CAF50',
    videoCount: 10,
    category: 'Pregnancy',
    searchQuery: 'pregnancy safe prenatal yoga exercises workout',
  },
  {
    id: '4',
    title: 'Wall Pilates',
    subtitle: 'Core strength & posture',
    description: 'Use the wall for support and resistance in these pilates routines that target core strength, posture, and flexibility.',
    emoji: '🏋️',
    bg: '#FFF3E0',
    accent: '#FF9800',
    videoCount: 9,
    category: 'Fitness',
    searchQuery: 'wall pilates workout women core strength',
  },
  {
    id: '5',
    title: 'Weight Loss',
    subtitle: 'Burn fat gently',
    description: 'Low-impact cardio and strength workouts designed specifically for women to lose weight safely without stressing the body.',
    emoji: '🔥',
    bg: '#FCE4EC',
    accent: '#E91E63',
    videoCount: 15,
    category: 'Fitness',
    searchQuery: 'women weight loss workout cardio at home',
  },
  {
    id: '6',
    title: 'Chair Yoga',
    subtitle: 'Seated mindful movement',
    description: 'Accessible yoga routines you can do seated in a chair — perfect for office breaks, mobility issues, or recovery days.',
    emoji: '🪑',
    bg: '#E8EAF6',
    accent: '#5C6BC0',
    videoCount: 7,
    category: 'Yoga',
    searchQuery: 'chair yoga seated exercises women beginners',
  },
  {
    id: '7',
    title: 'Stretching',
    subtitle: 'Flexibility & recovery',
    description: 'Full-body stretching routines to improve flexibility, reduce muscle soreness, and promote relaxation after workouts.',
    emoji: '🙆',
    bg: '#E0F7FA',
    accent: '#00ACC1',
    videoCount: 11,
    category: 'Recovery',
    searchQuery: 'full body stretching flexibility recovery women',
  },
  {
    id: '8',
    title: 'Postpartum Recovery',
    subtitle: 'Heal & rebuild strength',
    description: 'Gentle exercises to help new moms recover after childbirth, strengthen the pelvic floor, and rebuild core stability.',
    emoji: '👶',
    bg: '#F9FBE7',
    accent: '#9CCC65',
    videoCount: 8,
    category: 'Pregnancy',
    searchQuery: 'postpartum recovery exercises pelvic floor new mom',
  },
  {
    id: '9',
    title: 'Endometriosis Care',
    subtitle: 'Pain management movement',
    description: 'Specially curated low-impact exercises to help manage endometriosis pain, improve circulation, and reduce inflammation.',
    emoji: '💜',
    bg: '#F8F0FF',
    accent: '#9C27B0',
    videoCount: 6,
    category: 'Period',
    searchQuery: 'endometriosis exercises pain relief yoga gentle',
  },
  {
    id: '10',
    title: 'Stress & Anxiety',
    subtitle: 'Calm your nervous system',
    description: 'Breathwork, gentle yoga, and mindfulness movement to reduce cortisol, calm anxiety, and balance the nervous system.',
    emoji: '🧠',
    bg: '#E3F2FD',
    accent: '#1E88E5',
    videoCount: 10,
    category: 'Mental Health',
    searchQuery: 'stress anxiety yoga breathing exercises women',
  },
];

const CATEGORIES = [
  { key: 'All',           label: '✦ All' },
  { key: 'Period',        label: 'Period' },
  { key: 'PCOS',          label: 'PCOS' },
  { key: 'Pregnancy',     label: 'Pregnancy' },
  { key: 'Fitness',       label: 'Fitness' },
  { key: 'Yoga',          label: 'Yoga' },
  { key: 'Recovery',      label: 'Recovery' },
  { key: 'Mental Health', label: 'Mental' },
];

export default function ExerciseScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filtered = ALL_MODULES.filter(m => {
    const matchCat = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch =
      m.title.toLowerCase().includes(searchText.toLowerCase()) ||
      m.subtitle.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Module card ──
  const renderModule = ({ item: mod }) => (
    <TouchableOpacity
      style={[styles.moduleCard, { backgroundColor: mod.bg, borderColor: mod.accent + '50' }]}
      onPress={() => navigation.navigate('ExerciseDetail', { module: mod })}
      activeOpacity={0.88}
    >
      {/* Banner */}
      <View style={[styles.moduleBanner, { backgroundColor: mod.accent + '22' }]}>
        <View style={[styles.bannerBlob1, { backgroundColor: mod.accent + '18' }]} />
        <View style={[styles.bannerBlob2, { backgroundColor: mod.accent + '22' }]} />
        <Text style={styles.bannerEmoji}>{mod.emoji}</Text>
        <View style={[styles.videoBadge, { backgroundColor: mod.accent }]}>
          <Text style={styles.videoBadgeText}>▶ {mod.videoCount} videos</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.moduleInfo}>
        <View style={styles.titleRow}>
          <Text style={[styles.moduleTitle, { color: mod.accent }]}>{mod.title}</Text>
          <View style={[styles.catBadge, { backgroundColor: mod.accent + '18' }]}>
            <Text style={[styles.catBadgeText, { color: mod.accent }]}>{mod.category}</Text>
          </View>
        </View>
        <Text style={styles.moduleSubtitle}>{mod.subtitle}</Text>
        <Text style={styles.moduleDesc} numberOfLines={2}>{mod.description}</Text>

        <TouchableOpacity
          style={[styles.startBtn, { backgroundColor: mod.accent }]}
          onPress={() => navigation.navigate('ExerciseDetail', { module: mod })}
          activeOpacity={0.85}
        >
          <Text style={styles.startBtnText}>Start Module ▶</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      {/* Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Exercise Modules</Text>
          <Text style={styles.headerSub}>{filtered.length} modules for you</Text>
        </View>
        <View style={{ width: 70 }} />
      </View>

      {/* ── SEARCH ── */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={COLORS.pastelPink}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearSearch}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CATEGORY CHIPS — horizontal FlatList so they never get clipped ── */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsList}
        removeClippedSubviews={false}
        renderItem={({ item }) => {
          const isActive = activeCategory === item.key;
          return (
            <TouchableOpacity
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveCategory(item.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── MODULE LIST ── */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No modules found</Text>
          <Text style={styles.emptySub}>Try a different search or category</Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderModule}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          style={{ opacity: fadeAnim }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  blob1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.pinkChampagne, opacity: 0.35, top: -70, right: -70 },
  blob2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.pastelPink, opacity: 0.2, bottom: 100, left: -50 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    backgroundColor: COLORS.white, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
  },
  backArrow: { fontSize: 13, color: COLORS.watermelon, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText },
  headerSub: { fontSize: 11, color: COLORS.mutedText, fontWeight: '500' },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: COLORS.pastelPink, marginBottom: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.darkText },
  clearSearch: { fontSize: 14, color: COLORS.mutedText, paddingLeft: 8 },

  // ── Category chips ──
  chipsList: {
    flexGrow: 0,
    marginBottom: 14,
    // CRITICAL: overflow visible so active chip shadow isn't clipped
    overflow: 'visible',
  },
  chipsContainer: {
    paddingLeft: 20,
    paddingRight: 24,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',    // vertically centers all chips in the row
    flexDirection: 'row',    // explicit row direction for consistent layout
  },
  chip: {
    // Fixed height + minWidth so every chip is same size regardless of label
    height: 38,
    minWidth: 56,
    paddingHorizontal: 18,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.pastelPink,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: COLORS.pastelPink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: COLORS.watermelon,
    borderColor: COLORS.watermelon,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.mutedText,
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '800',
  },

  // Module list
  listContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },

  // Module card
  moduleCard: {
    borderRadius: 24, marginBottom: 18, borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09, shadowRadius: 12, elevation: 5,
  },
  moduleBanner: {
    height: 130, alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  bannerBlob1: { position: 'absolute', left: -30, top: -30, width: 140, height: 140, borderRadius: 70 },
  bannerBlob2: { position: 'absolute', right: -20, bottom: -20, width: 100, height: 100, borderRadius: 50 },
  bannerEmoji: { fontSize: 54, zIndex: 2 },
  videoBadge: {
    position: 'absolute', bottom: 12, right: 14,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, zIndex: 2,
  },
  videoBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  moduleInfo: { padding: 16 },
  titleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 4,
  },
  moduleTitle: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 8 },
  catBadge: { borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  moduleSubtitle: { fontSize: 13, color: COLORS.mutedText, marginBottom: 6 },
  moduleDesc: { fontSize: 12, color: COLORS.mutedText, lineHeight: 18, marginBottom: 14 },
  startBtn: {
    borderRadius: 16, paddingVertical: 12, alignItems: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  startBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.mutedText },
});