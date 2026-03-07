import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Circle, Line, Polyline } from 'react-native-svg';

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
  online: '#4CAF50',
  busy: '#FF9800',
};

// ── Nav Icons (size default now 28) ──
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

const ShopIcon = ({ color, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const NAV_TABS = [
  { key: 'Dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { key: 'Calendar',  label: 'Calendar',  Icon: CalendarIcon },
  { key: 'Doctor',    label: 'Doctor',    Icon: DoctorIcon },
  { key: 'Social',    label: 'Social',    Icon: SocialIcon },
  { key: 'Shop',      label: 'Shop',      Icon: ShopIcon },
];

const SPECIALTIES = [
  { key: 'all', label: 'All' },
  { key: 'therapist', label: 'Therapists' },
  { key: 'gynecologist', label: 'Gynecologists' },
  { key: 'nutritionist', label: 'Nutritionists' },
  { key: 'fertility', label: 'Fertility' },
];

const DOCTORS = [
  { id: 1, name: 'Dr. Elena Rodriguez', specialty: 'Senior Psychologist', category: 'therapist', tags: ['ANXIETY', 'CBT', '15+ YRS'], rating: 4.9, reviews: 108, status: 'online', liked: true, avatar: '👩‍⚕️', avatarBg: '#FFE0E6' },
  { id: 2, name: 'Dr. Sarah Jenkins', specialty: 'Clinical Therapist', category: 'therapist', tags: ['MINDFULNESS', 'TRAUMA'], rating: 4.8, reviews: 85, status: 'busy', liked: false, avatar: '👩‍⚕️', avatarBg: '#E8F5E9' },
  { id: 3, name: 'Dr. Maya Patel', specialty: 'Fertility Specialist', category: 'fertility', tags: ['IVF', 'HORMONAL'], rating: 5.0, reviews: 217, status: 'online', liked: false, avatar: '👩‍⚕️', avatarBg: '#FFF3E0' },
  { id: 4, name: 'Dr. Priya Sharma', specialty: 'Gynecologist & Obstetrician', category: 'gynecologist', tags: ['PCOS', 'PRENATAL', '10+ YRS'], rating: 4.7, reviews: 312, status: 'online', liked: false, avatar: '👩‍⚕️', avatarBg: '#F3E5F5' },
  { id: 5, name: 'Dr. Lisa Chen', specialty: "Women's Nutritionist", category: 'nutritionist', tags: ['PCOS DIET', 'HORMONES'], rating: 4.6, reviews: 94, status: 'online', liked: false, avatar: '👩‍⚕️', avatarBg: '#E3F2FD' },
];

const StarRating = ({ rating }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Text key={s} style={[styles.star, s <= Math.round(rating) ? styles.starFilled : styles.starEmpty]}>★</Text>
    ))}
    <Text style={styles.ratingNum}>{rating}</Text>
  </View>
);

export default function DoctorScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Doctor');
  const [activeSpecialty, setActiveSpecialty] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [likedDoctors, setLikedDoctors] = useState({ 1: true });
  const [searchFocused, setSearchFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleLike = (id) => setLikedDoctors((prev) => ({ ...prev, [id]: !prev[id] }));

  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesSpecialty = activeSpecialty === 'all' || doc.category === activeSpecialty;
    if (showSaved && !likedDoctors[doc.id]) return false;
    const matchesSearch = searchText === '' ||
      doc.name.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchText.toLowerCase()) ||
      doc.tags.some((t) => t.toLowerCase().includes(searchText.toLowerCase()));
    return matchesSpecialty && matchesSearch;
  });

  const handleNavTab = (key) => {
    setActiveTab(key);
    if (key === 'Dashboard') navigation.navigate('Home');
    if (key === 'Calendar') navigation.navigate('Calendar');
    if (key === 'Social') navigation.navigate('Social');
    if (key === 'Shop')   navigation.navigate('Shop');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Specialist</Text>
        <TouchableOpacity
          style={[styles.filterBtn, showSaved && styles.filterBtnActive]}
          onPress={() => setShowSaved(prev => !prev)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterIcon, showSaved && { color: COLORS.white }]}>{showSaved ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* SEARCH */}
        <Animated.View style={[styles.searchWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, searchFocused && styles.searchWrapperFocused]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search doctors or specialties..." placeholderTextColor={COLORS.pastelPink} value={searchText} onChangeText={setSearchText} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} />
          {searchText.length > 0 && <TouchableOpacity onPress={() => setSearchText('')}><Text style={styles.searchClear}>✕</Text></TouchableOpacity>}
        </Animated.View>

        {/* SPECIALTY CHIPS */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialtyScroll} contentContainerStyle={styles.specialtyContent}>
            {SPECIALTIES.map((s) => (
              <TouchableOpacity key={s.key} style={[styles.specialtyChip, activeSpecialty === s.key && styles.specialtyChipActive]} onPress={() => setActiveSpecialty(s.key)} activeOpacity={0.8}>
                <Text style={[styles.specialtyText, activeSpecialty === s.key && styles.specialtyTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* NEARBY BANNER */}
        <Animated.View style={[styles.nearbyBanner, { opacity: fadeAnim }]}>
          <Text style={styles.nearbyIcon}>📍</Text>
          <View style={styles.nearbyInfo}>
            <Text style={styles.nearbyTitle}>Find doctors near you</Text>
            <Text style={styles.nearbySubtitle}>Enable location for distance & availability</Text>
          </View>
          <TouchableOpacity style={styles.nearbyBtn}>
            <Text style={styles.nearbyBtnText}>Enable</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* SECTION TITLE */}
        <Animated.View style={[styles.sectionHeader, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>{showSaved ? '❤️ Saved Doctors' : 'Recommended Specialists'}</Text>
          <Text style={styles.doctorCount}>{filteredDoctors.length} found</Text>
        </Animated.View>

        {/* DOCTOR CARDS */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {filteredDoctors.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>{showSaved ? '🤍' : '🔍'}</Text>
              <Text style={styles.emptyText}>{showSaved ? 'No saved doctors' : 'No specialists found'}</Text>
              <Text style={styles.emptySubText}>{showSaved ? 'Tap the ♡ on any doctor to save them here' : 'Try a different search or category'}</Text>
            </View>
          ) : (
            filteredDoctors.map((doc) => (
              <TouchableOpacity key={doc.id} style={styles.doctorCard} activeOpacity={0.92}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatarWrapper, { backgroundColor: doc.avatarBg }]}>
                    <Text style={styles.avatarEmoji}>{doc.avatar}</Text>
                    <View style={[styles.statusDot, { backgroundColor: doc.status === 'online' ? COLORS.online : COLORS.busy }]} />
                  </View>
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName}>{doc.name}</Text>
                    <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                    <View style={styles.tagsRow}>
                      {doc.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.likeBtn, likedDoctors[doc.id] && styles.likeBtnActive]} onPress={() => toggleLike(doc.id)} activeOpacity={0.8}>
                    <Text style={[styles.likeIcon, likedDoctors[doc.id] && styles.likeIconActive]}>{likedDoctors[doc.id] ? '♥' : '♡'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.ratingWrapper}>
                    <StarRating rating={doc.rating} />
                    <Text style={styles.reviewCount}>({doc.reviews} reviews)</Text>
                  </View>
                  <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85}>
                    <Text style={styles.bookBtnText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* API NOTE */}
        <View style={styles.apiNote}>
          <Text style={styles.apiNoteIcon}>🔗</Text>
          <Text style={styles.apiNoteText}>Real doctor data will load from Google Places API once connected by the backend team.</Text>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* ── BOTTOM NAV — matches HomeScreen ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const color = isActive ? COLORS.watermelon : COLORS.navInactive;
          return (
            <TouchableOpacity key={tab.key} style={styles.navTab} onPress={() => handleNavTab(tab.key)} activeOpacity={0.7}>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  backArrow: { fontSize: 22, color: COLORS.watermelon, fontWeight: '700', lineHeight: 26 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },
  filterBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  filterBtnActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon },
  filterIcon: { fontSize: 16 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.pastelPink, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  searchWrapperFocused: { borderColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOpacity: 0.2 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.darkText, fontWeight: '400' },
  searchClear: { fontSize: 14, color: COLORS.mutedText, paddingLeft: 8 },
  specialtyScroll: { marginBottom: 16 },
  specialtyContent: { paddingRight: 10, gap: 8 },
  specialtyChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.pastelPink, marginRight: 8 },
  specialtyChipActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon },
  specialtyText: { fontSize: 13, color: COLORS.darkText, fontWeight: '600' },
  specialtyTextActive: { color: COLORS.white, fontWeight: '700' },
  nearbyBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.pinkChampagne, gap: 10 },
  nearbyIcon: { fontSize: 20 },
  nearbyInfo: { flex: 1 },
  nearbyTitle: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  nearbySubtitle: { fontSize: 11, color: COLORS.mutedText },
  nearbyBtn: { backgroundColor: COLORS.lavenderBlush, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1.5, borderColor: COLORS.watermelon },
  nearbyBtnText: { fontSize: 12, color: COLORS.watermelon, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText },
  doctorCount: { fontSize: 12, color: COLORS.mutedText, fontWeight: '600' },
  doctorCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  avatarWrapper: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginRight: 12, position: 'relative' },
  avatarEmoji: { fontSize: 32 },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: COLORS.white },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '800', color: COLORS.darkText, marginBottom: 3 },
  doctorSpecialty: { fontSize: 12, color: COLORS.mutedText, fontWeight: '500', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tag: { backgroundColor: COLORS.lavenderBlush, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: COLORS.pinkChampagne },
  tagText: { fontSize: 9, color: COLORS.watermelon, fontWeight: '700', letterSpacing: 0.5 },
  likeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  likeBtnActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon },
  likeIcon: { fontSize: 16, color: COLORS.pastelPink },
  likeIconActive: { color: COLORS.white },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.lavenderBlush },
  ratingWrapper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  star: { fontSize: 13 },
  starFilled: { color: '#FFB300' },
  starEmpty: { color: COLORS.pinkChampagne },
  ratingNum: { fontSize: 12, fontWeight: '700', color: COLORS.darkText, marginLeft: 4 },
  reviewCount: { fontSize: 11, color: COLORS.mutedText },
  bookBtn: { backgroundColor: COLORS.watermelon, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  bookBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.darkText, marginBottom: 6 },
  emptySubText: { fontSize: 13, color: COLORS.mutedText },
  apiNote: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginTop: 8, borderWidth: 1.5, borderColor: COLORS.pinkChampagne, gap: 8 },
  apiNoteIcon: { fontSize: 14 },
  apiNoteText: { flex: 1, fontSize: 11, color: COLORS.mutedText, lineHeight: 16 },


  // ── BOTTOM NAV ──
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