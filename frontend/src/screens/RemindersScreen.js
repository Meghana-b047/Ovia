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
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getReminders, setReminders } from './HomeScreen';

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
  error: '#E53935',
};

// ── Chip color options ──
const CHIP_COLORS = [
  { label: 'Pink', value: '#FFB3C6' },
  { label: 'Champagne', value: '#FFC2D1' },
  { label: 'Light Pink', value: '#FF8FAB' },
  { label: 'Peach', value: '#FFCCBC' },
  { label: 'Lavender', value: '#E1BEE7' },
  { label: 'Sky', value: '#B3E5FC' },
];

// ── Icon options ──
const ICON_OPTIONS = [
  '💊', '🩺', '🏃', '🧘', '💧', '🍎', '🌙', '⏰',
  '🩸', '🧴', '💉', '🫀', '🥗', '🏋️', '📋', '🌸',
];

// ── Repeat options ──
const REPEAT_OPTIONS = ['Once', 'Daily', 'Weekly', 'Monthly'];

export default function RemindersScreen({ navigation }) {
  const [reminders, setLocalReminders] = useState(getReminders());
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💊');
  const [selectedColor, setSelectedColor] = useState(CHIP_COLORS[0].value);
  const [selectedRepeat, setSelectedRepeat] = useState('Once');
  const [titleError, setTitleError] = useState('');
  const [timeError, setTimeError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const resetForm = () => {
    setTitle('');
    setTime('');
    setSelectedIcon('💊');
    setSelectedColor(CHIP_COLORS[0].value);
    setSelectedRepeat('Once');
    setTitleError('');
    setTimeError('');
  };

  const handleCreate = () => {
    let valid = true;
    if (!title.trim()) { setTitleError('Please enter a reminder title'); valid = false; }
    else setTitleError('');
    if (!time.trim()) { setTimeError('Please enter a time (e.g. 8:00 AM)'); valid = false; }
    else setTimeError('');
    if (!valid) return;

    const newReminder = {
      id: Date.now().toString(),
      icon: selectedIcon,
      title: title.trim(),
      time: time.trim(),
      color: selectedColor,
      repeat: selectedRepeat,
    };

    const updated = [newReminder, ...reminders];
    setLocalReminders(updated);
    setReminders(updated); // sync to HomeScreen
    resetForm();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const updated = reminders.filter(r => r.id !== id);
          setLocalReminders(updated);
          setReminders(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      {/* Blobs */}
      <View style={styles.blobTopRight} />
      <View style={styles.blobBottomLeft} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSub}>{reminders.length} active</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>＋ New</Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={[{ flex: 1 }, { opacity: fadeAnim }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty state */}
        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>⏰</Text>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptySub}>Tap "＋ New" to create your first reminder</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.emptyBtnText}>Create Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reminders list */}
        {reminders.map((r, index) => (
          <Animated.View
            key={r.id}
            style={[styles.reminderCard, { transform: [{ translateY: slideAnim }] }]}
          >
            {/* Color accent bar */}
            <View style={[styles.cardAccent, { backgroundColor: r.color }]} />

            <View style={[styles.iconBadge, { backgroundColor: r.color + '60' }]}>
              <Text style={styles.cardIcon}>{r.icon}</Text>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{r.title}</Text>
              <View style={styles.cardMetaRow}>
                <Text style={styles.cardTime}>🕐 {r.time}</Text>
                {r.repeat && r.repeat !== 'Once' && (
                  <View style={styles.repeatBadge}>
                    <Text style={styles.repeatBadgeText}>🔁 {r.repeat}</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(r.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      {/* ── CREATE REMINDER MODAL ── */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => { setShowModal(false); resetForm(); }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => { setShowModal(false); resetForm(); }}
          />
          <View style={styles.modalSheet}>
            <View style={styles.sheetHandle} />

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Reminder</Text>
              <TouchableOpacity
                style={[styles.modalSaveBtn, (!title.trim() || !time.trim()) && { opacity: 0.4 }]}
                onPress={handleCreate}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* Title input */}
              <Text style={styles.fieldLabel}>Reminder Title *</Text>
              <View style={[styles.inputWrapper, titleError && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Take Iron Supplement"
                  placeholderTextColor={COLORS.pastelPink}
                  value={title}
                  onChangeText={(t) => { setTitle(t); if (t.trim()) setTitleError(''); }}
                  autoCapitalize="sentences"
                />
              </View>
              {!!titleError && <Text style={styles.errorText}>⚠ {titleError}</Text>}

              {/* Time input */}
              <Text style={styles.fieldLabel}>Time *</Text>
              <View style={[styles.inputWrapper, timeError && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 8:00 AM or Tomorrow"
                  placeholderTextColor={COLORS.pastelPink}
                  value={time}
                  onChangeText={(t) => { setTime(t); if (t.trim()) setTimeError(''); }}
                />
              </View>
              {!!timeError && <Text style={styles.errorText}>⚠ {timeError}</Text>}

              {/* Icon picker */}
              <Text style={styles.fieldLabel}>Choose Icon</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[styles.iconOption, selectedIcon === icon && styles.iconOptionSelected]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconOptionEmoji}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color picker */}
              <Text style={styles.fieldLabel}>Chip Color</Text>
              <View style={styles.colorRow}>
                {CHIP_COLORS.map(c => (
                  <TouchableOpacity
                    key={c.value}
                    style={[styles.colorDot, { backgroundColor: c.value }, selectedColor === c.value && styles.colorDotSelected]}
                    onPress={() => setSelectedColor(c.value)}
                  >
                    {selectedColor === c.value && <Text style={styles.colorCheck}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Repeat */}
              <Text style={styles.fieldLabel}>Repeat</Text>
              <View style={styles.repeatRow}>
                {REPEAT_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.repeatChip, selectedRepeat === opt && styles.repeatChipActive]}
                    onPress={() => setSelectedRepeat(opt)}
                  >
                    <Text style={[styles.repeatChipText, selectedRepeat === opt && styles.repeatChipTextActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <Text style={styles.fieldLabel}>Preview</Text>
              <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
                <Text style={styles.previewIcon}>{selectedIcon}</Text>
                <Text style={styles.previewTitle}>{title || 'Reminder Title'}</Text>
                <Text style={styles.previewTime}>{time || 'Time'}</Text>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  blobTopRight: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.pinkChampagne, opacity: 0.4, top: -60, right: -60 },
  blobBottomLeft: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: COLORS.pastelPink, opacity: 0.25, bottom: 60, left: -50 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  backBtn: { backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  backArrow: { fontSize: 13, color: COLORS.watermelon, fontWeight: '700' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText },
  headerSub: { fontSize: 11, color: COLORS.mutedText, fontWeight: '500' },
  addBtn: { backgroundColor: COLORS.watermelon, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  addBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },

  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { backgroundColor: COLORS.watermelon, borderRadius: 24, paddingHorizontal: 28, paddingVertical: 14, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  emptyBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },

  // Reminder card
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, borderRadius: 3 },
  iconBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 8 },
  cardIcon: { fontSize: 24 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 4 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTime: { fontSize: 12, color: COLORS.mutedText, fontWeight: '500' },
  repeatBadge: { backgroundColor: COLORS.lavenderBlush, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  repeatBadgeText: { fontSize: 10, color: COLORS.watermelon, fontWeight: '700' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF0F3', alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.lavenderBlush },
  modalCancelText: { fontSize: 15, color: COLORS.mutedText, fontWeight: '600' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },
  modalSaveBtn: { backgroundColor: COLORS.watermelon, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  modalSaveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  modalScrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 36 : 24 },

  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 8, marginTop: 14, letterSpacing: 0.3 },
  inputWrapper: { backgroundColor: COLORS.lavenderBlush, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.pastelPink, paddingHorizontal: 14 },
  inputWrapperError: { borderColor: COLORS.error },
  input: { fontSize: 15, color: COLORS.darkText, paddingVertical: 12 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, marginLeft: 4, fontWeight: '500' },

  // Icon grid
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconOption: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  iconOptionSelected: { borderColor: COLORS.watermelon, backgroundColor: COLORS.pinkChampagne, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  iconOptionEmoji: { fontSize: 22 },

  // Color dots
  colorRow: { flexDirection: 'row', gap: 12 },
  colorDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  colorDotSelected: { borderColor: COLORS.darkText, transform: [{ scale: 1.15 }] },
  colorCheck: { fontSize: 14, fontWeight: '800', color: COLORS.darkText },

  // Repeat chips
  repeatRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  repeatChip: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.pastelPink },
  repeatChipActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon },
  repeatChipText: { fontSize: 13, fontWeight: '600', color: COLORS.darkText },
  repeatChipTextActive: { color: COLORS.white, fontWeight: '700' },

  // Preview
  previewCard: { borderRadius: 18, padding: 16, alignItems: 'flex-start', shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 3 },
  previewIcon: { fontSize: 26, marginBottom: 6 },
  previewTitle: { fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginBottom: 3 },
  previewTime: { fontSize: 12, color: COLORS.mutedText, fontWeight: '500' },
});