import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal, KeyboardAvoidingView, Platform,
  StatusBar, Dimensions, Image, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserName, setUserName } from './HomeScreen';

const { width } = Dimensions.get('window');

const COLORS = {
  lavenderBlush: '#FFE5EC',
  pastelPink:    '#FFB3C6',
  lightPink:     '#FF8FAB',
  pinkChampagne: '#FFC2D1',
  watermelon:    '#FB6F92',
  deepPink:      '#E8487A',
  white:         '#FFFFFF',
  darkText:      '#2D1B1E',
  mutedText:     '#9B6B78',
  error:         '#E53935',
  green:         '#4CAF50',
  lightGreen:    '#E8F5E9',
};

let _userEmail = 'maya@example.com';
export const getUserEmail = () => _userEmail;
export const setUserEmail = (e) => { _userEmail = e; };

// ─────────────────────────────────────────────────────────
// SUB-SCREEN: Notifications
// ─────────────────────────────────────────────────────────
function NotificationsSubScreen({ onBack }) {
  const [settings, setSettings] = useState({
    secretChats:   true,
    personalAdvice: true,
    periodSoon:    true,
    ovulation:     false,
    periodEnd:     false,
    periodStart:   true,
    contraception: false,
    lifestyle:     true,
    waterReminder: false,
    sleepReminder: true,
    exerciseReminder: false,
  });

  const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

  const Section = ({ title }) => (
    <Text style={notifStyles.sectionHeader}>{title}</Text>
  );

  const Row = ({ label, sub, settingKey }) => (
    <View style={notifStyles.row}>
      <View style={{ flex: 1 }}>
        <Text style={notifStyles.rowLabel}>{label}</Text>
        {sub ? <Text style={notifStyles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggle(settingKey)}
        trackColor={{ false: COLORS.pinkChampagne, true: COLORS.watermelon }}
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.pinkChampagne}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.subBackBtn} onPress={onBack}>
          <Text style={styles.subBackArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={notifStyles.card}>
          <Section title="Secret Chats" />
          <Row label="Secret Chats notifications" sub="On" settingKey="secretChats" />
        </View>

        <View style={notifStyles.card}>
          <Section title="Content" />
          <Row label="Personal advice" sub="On" settingKey="personalAdvice" />
        </View>

        <View style={notifStyles.card}>
          <Section title="Cycle" />
          <Row label="Period in a couple of days" sub="10:00 am" settingKey="periodSoon" />
          <View style={notifStyles.divider} />
          <Row label="Ovulation" sub="Off" settingKey="ovulation" />
          <View style={notifStyles.divider} />
          <Row label="Period end" sub="Off" settingKey="periodEnd" />
          <View style={notifStyles.divider} />
          <Row label="Period start" sub="10:00 am" settingKey="periodStart" />
        </View>

        <View style={notifStyles.card}>
          <Section title="Medication and contraception" />
          <Row label="Contraception" sub="Off" settingKey="contraception" />
          <TouchableOpacity style={notifStyles.addPillBtn}>
            <Text style={notifStyles.addPillText}>+ ADD A PILL REMINDER</Text>
          </TouchableOpacity>
        </View>

        <View style={notifStyles.card}>
          <Section title="Lifestyle" />
          <Row label="Daily water reminder" settingKey="waterReminder" />
          <View style={notifStyles.divider} />
          <Row label="Sleep reminder" settingKey="sleepReminder" />
          <View style={notifStyles.divider} />
          <Row label="Exercise reminder" settingKey="exerciseReminder" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const notifStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 16,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  sectionHeader: {
    fontSize: 12, fontWeight: '700', color: COLORS.watermelon,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6, letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: COLORS.darkText },
  rowSub: { fontSize: 12, color: COLORS.mutedText, marginTop: 2 },
  divider: { height: 1, backgroundColor: COLORS.lavenderBlush, marginHorizontal: 18 },
  addPillBtn: { paddingHorizontal: 18, paddingVertical: 14 },
  addPillText: { fontSize: 13, fontWeight: '800', color: COLORS.watermelon, letterSpacing: 0.5 },
});

// ─────────────────────────────────────────────────────────
// SUB-SCREEN: Privacy & Security
// ─────────────────────────────────────────────────────────
function PrivacySubScreen({ onBack }) {
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const privacyItems = [
    {
      icon: '🛡️',
      title: 'Ovia Privacy Explained',
      sub: 'Find out how Ovia keeps your data safe.',
      onPress: () => setShowPrivacyInfo(true),
    },
    {
      icon: 'ℹ️',
      title: 'Request Information',
      sub: 'Find out what cycle and health-related data we hold about you.',
      onPress: () => Alert.alert('Request Information', 'A data report will be sent to your registered email within 48 hours.', [{ text: 'Request', style: 'default' }, { text: 'Cancel', style: 'cancel' }]),
    },
    {
      icon: '👤',
      title: 'Change Account Details',
      sub: 'Ask us to update your personal details, such as your name or email address.',
      onPress: () => Alert.alert('Change Account Details', 'To update your email or personal details, contact support@oviahealth.com', [{ text: 'OK' }]),
    },
    {
      icon: '📋',
      title: 'Manage Your Consents',
      sub: 'Choose and control your privacy options.',
      onPress: () => Alert.alert('Manage Consents', 'You can opt out of analytics, personalised content, and third-party sharing at any time.', [{ text: 'Manage', style: 'default' }, { text: 'Cancel', style: 'cancel' }]),
    },
    {
      icon: '🗑️',
      title: 'Delete My Account',
      sub: 'Permanently delete your account and any data associated with it, including cycle and health-related data.',
      onPress: () => Alert.alert(
        'Delete Account',
        'This will permanently delete your account and ALL your health data. This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Forever', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.') },
        ]
      ),
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.subBackBtn} onPress={onBack}>
          <Text style={styles.subBackArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Privacy Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={privStyles.card}>
          {privacyItems.map((item, idx) => (
            <View key={idx}>
              <TouchableOpacity style={privStyles.row} onPress={item.onPress} activeOpacity={0.7}>
                <View style={[privStyles.iconBadge, item.danger && { backgroundColor: '#FFEBEE' }]}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={[privStyles.rowTitle, item.danger && { color: COLORS.error }]}>{item.title}</Text>
                  <Text style={privStyles.rowSub}>{item.sub}</Text>
                </View>
                <Text style={privStyles.chevron}>›</Text>
              </TouchableOpacity>
              {idx < privacyItems.length - 1 && <View style={privStyles.divider} />}
            </View>
          ))}
        </View>

        {/* Data Protected Banner */}
        <View style={privStyles.protectedBanner}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>🔒</Text>
          <Text style={privStyles.protectedTitle}>Your data is protected</Text>
          <Text style={privStyles.protectedSub}>
            Privacy is our top priority. We'll never sell your data and you can delete it anytime.
          </Text>
          <TouchableOpacity style={privStyles.learnMoreBtn}
            onPress={() => setShowPrivacyInfo(true)}>
            <Text style={privStyles.learnMoreText}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Ovia Privacy Explained Modal */}
      <Modal visible={showPrivacyInfo} animationType="slide" transparent onRequestClose={() => setShowPrivacyInfo(false)}>
        <View style={privStyles.modalOverlay}>
          <View style={privStyles.modalSheet}>
            <View style={privStyles.modalHandle} />
            <View style={privStyles.modalHeaderRow}>
              <Text style={privStyles.modalTitle}>🛡️ Ovia Privacy Explained</Text>
              <TouchableOpacity onPress={() => setShowPrivacyInfo(false)}>
                <Text style={{ fontSize: 22, color: COLORS.mutedText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { title: '🔐 Your data stays yours', body: 'All your cycle, health, and personal data belongs to you alone. Ovia never sells or rents your data to third parties.' },
                { title: '🏥 Health data is sensitive', body: 'We treat menstrual and health data with the highest level of care. It\'s encrypted end-to-end and never shared without your explicit consent.' },
                { title: '📊 Analytics are anonymous', body: 'If you opt into analytics, all data is anonymised and aggregated. We use it only to improve app features.' },
                { title: '🗑️ Right to deletion', body: 'You can permanently delete your account and all associated data at any time from Privacy Settings → Delete My Account.' },
                { title: '🌍 GDPR & DPDP compliant', body: 'Ovia complies with GDPR (Europe) and India\'s Digital Personal Data Protection Act. You have full rights to access, correct, and erase your data.' },
              ].map((item, i) => (
                <View key={i} style={privStyles.privacyPoint}>
                  <Text style={privStyles.privacyPointTitle}>{item.title}</Text>
                  <Text style={privStyles.privacyPointBody}>{item.body}</Text>
                </View>
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const privStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 20,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 },
  iconBadge: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center',
    marginRight: 14, borderWidth: 1, borderColor: COLORS.pinkChampagne,
  },
  rowTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 3 },
  rowSub: { fontSize: 12, color: COLORS.mutedText, lineHeight: 17 },
  chevron: { fontSize: 20, color: COLORS.pastelPink },
  divider: { height: 1, backgroundColor: COLORS.lavenderBlush, marginHorizontal: 16 },

  protectedBanner: {
    backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 20,
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  protectedTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  protectedSub: { fontSize: 13, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  learnMoreBtn: {
    borderWidth: 1.5, borderColor: COLORS.watermelon, borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 10,
  },
  learnMoreText: { fontSize: 13, fontWeight: '700', color: COLORS.watermelon },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 20, maxHeight: '85%',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginBottom: 16 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },
  privacyPoint: {
    backgroundColor: COLORS.lavenderBlush, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: COLORS.pinkChampagne,
  },
  privacyPointTitle: { fontSize: 14, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  privacyPointBody: { fontSize: 13, color: COLORS.mutedText, lineHeight: 20 },
});

// ─────────────────────────────────────────────────────────
// SUB-SCREEN: Help & Features
// ─────────────────────────────────────────────────────────
function HelpSubScreen({ onBack }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const HELP_CATEGORIES = [
    { key: 'getting_started', icon: '🚀', title: 'Getting Started',   color: '#FFF3E0' },
    { key: 'account',         icon: '👤', title: 'Account & Data',    color: '#E8F5E9' },
    { key: 'using_ovia',      icon: '🌸', title: 'Using Ovia',        color: '#FCE4EC' },
    { key: 'subscription',    icon: '💳', title: 'Subscriptions & Billing', color: '#E3F2FD' },
    { key: 'troubleshoot',    icon: '🔧', title: 'Troubleshooting',   color: '#F3E5F5' },
    { key: 'privacy_help',    icon: '🔒', title: 'Privacy & Security', color: '#E0F7FA' },
    { key: 'general',         icon: '❓', title: 'General Questions', color: '#FFF8E1' },
    { key: 'partners',        icon: '💑', title: 'Ovia for Partners', color: COLORS.lavenderBlush },
  ];

  const FAQ = [
    { q: 'How does Ovia track my cycle?', a: 'Ovia uses the dates you log to predict your next period, fertile window, and ovulation day. The more you log, the more accurate your predictions become.' },
    { q: 'How do I log my period?', a: 'Tap the Calendar tab → select the start date → tap "Add Task" → add a Period entry. Ovia will automatically calculate your next cycle.' },
    { q: 'What is the Chatbot for?', a: 'The Ovia AI chatbot answers women\'s health questions — periods, PCOS, pregnancy, nutrition, and mental health. It\'s not a substitute for medical advice.' },
    { q: 'How do I set reminders?', a: 'Go to the Reminders section from the Home screen → tap "+ Add". You can set pill reminders, appointment reminders, and more.' },
    { q: 'How do I find exercises for PCOS?', a: 'Go to the Exercise Modules tab → tap "PCOS" in the filter bar. You\'ll see yoga and workout videos specifically for PCOS management.' },
    { q: 'Can I see doctors in the app?', a: 'Yes! The Doctor tab shows recommended specialists — gynecologists, therapists, nutritionists, and fertility experts. Tap any card to learn more.' },
    { q: 'What does the Shop section do?', a: 'The Shop tab shows curated period & wellness products. Tapping Amazon or Flipkart opens the product search on that platform directly.' },
    { q: 'How do I delete my account?', a: 'Go to Profile → Privacy & Security → Delete My Account. This permanently removes all your data.' },
    { q: 'Is my health data private?', a: 'Yes. Your data is encrypted and never sold. Read our full policy in Profile → Privacy & Security → Ovia Privacy Explained.' },
    { q: 'How does the Daily Tasks reset work?', a: 'Daily tasks on the Calendar screen reset every midnight. Your previous tasks are saved — just tap any past date to review them.' },
  ];

  const filtered = FAQ.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.subBackBtn} onPress={onBack}>
          <Text style={styles.subBackArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>Help & Features</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <View style={helpStyles.hero}>
          <Text style={helpStyles.heroTitle}>How can Ovia help you?</Text>
          <View style={helpStyles.searchBar}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={helpStyles.searchInput}
              placeholder="What would you like to find?"
              placeholderTextColor={COLORS.mutedText}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: COLORS.mutedText, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Feature categories grid */}
        {!search && (
          <>
            <Text style={helpStyles.sectionTitle}>Browse by Topic</Text>
            <View style={helpStyles.grid}>
              {HELP_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[helpStyles.gridCard, { backgroundColor: cat.color }]}
                  activeOpacity={0.75}
                  onPress={() => Alert.alert(cat.title, `Tap a FAQ below to learn more about "${cat.title}".`)}
                >
                  <Text style={helpStyles.gridIcon}>{cat.icon}</Text>
                  <Text style={helpStyles.gridLabel}>{cat.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* FAQ */}
        <Text style={helpStyles.sectionTitle}>{search ? `Results for "${search}"` : 'Frequently Asked Questions'}</Text>
        {filtered.length === 0 && (
          <View style={helpStyles.emptySearch}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🤷</Text>
            <Text style={helpStyles.emptyText}>No results found. Try different keywords.</Text>
          </View>
        )}
        <View style={helpStyles.faqCard}>
          {filtered.map((item, idx) => (
            <View key={idx}>
              <TouchableOpacity
                style={helpStyles.faqRow}
                onPress={() => setExpanded(expanded === idx ? null : idx)}
                activeOpacity={0.75}
              >
                <Text style={helpStyles.faqQ} numberOfLines={expanded === idx ? 0 : 2}>{item.q}</Text>
                <Text style={helpStyles.faqChevron}>{expanded === idx ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expanded === idx && (
                <View style={helpStyles.faqAnswer}>
                  <Text style={helpStyles.faqAnswerText}>{item.a}</Text>
                </View>
              )}
              {idx < filtered.length - 1 && <View style={helpStyles.divider} />}
            </View>
          ))}
        </View>

        {/* Contact support */}
        <View style={helpStyles.supportCard}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>💬</Text>
          <Text style={helpStyles.supportTitle}>Still need help?</Text>
          <Text style={helpStyles.supportSub}>Our support team is here for you.</Text>
          <TouchableOpacity
            style={helpStyles.supportBtn}
            onPress={() => Alert.alert('Contact Support', 'Email us at support@oviahealth.com\nWe respond within 24 hours 🌸')}
          >
            <Text style={helpStyles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const helpStyles = StyleSheet.create({
  hero: {
    backgroundColor: COLORS.lavenderBlush, margin: 16, borderRadius: 20,
    padding: 20, borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.darkText, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1.5, borderColor: COLORS.pastelPink,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.darkText },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: COLORS.darkText,
    marginHorizontal: 16, marginTop: 20, marginBottom: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12, gap: 10 },
  gridCard: {
    width: (width - 44) / 2, borderRadius: 18,
    padding: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  gridIcon: { fontSize: 30, marginBottom: 8 },
  gridLabel: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, textAlign: 'center' },
  faqCard: {
    backgroundColor: COLORS.white, marginHorizontal: 16,
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  faqRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginRight: 10 },
  faqChevron: { fontSize: 12, color: COLORS.watermelon },
  faqAnswer: { backgroundColor: COLORS.lavenderBlush, paddingHorizontal: 16, paddingVertical: 14, marginHorizontal: 0 },
  faqAnswerText: { fontSize: 13, color: COLORS.mutedText, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.lavenderBlush, marginHorizontal: 16 },
  emptySearch: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 13, color: COLORS.mutedText, textAlign: 'center' },
  supportCard: {
    backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: 20,
    borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  supportTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  supportSub: { fontSize: 13, color: COLORS.mutedText, marginBottom: 16 },
  supportBtn: {
    backgroundColor: COLORS.watermelon, borderRadius: 20,
    paddingHorizontal: 28, paddingVertical: 12,
    shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  supportBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
});

// ─────────────────────────────────────────────────────────
// MAIN PROFILE SCREEN
// ─────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const [userName, setLocalName]   = useState(getUserName());
  const [userEmail]                = useState(getUserEmail());
  const [profileImage, setProfileImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName]    = useState(getUserName());
  const [editNameError, setEditNameError] = useState('');

  // Sub-screen routing: null | 'notifications' | 'privacy' | 'help'
  const [subScreen, setSubScreen] = useState(null);

  const initials = userName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleAvatarPress = () => {
    Alert.alert('Profile Photo', 'Choose how to update your photo', [
      { text: 'Choose from Library', onPress: pickImageFromLibrary },
      { text: 'Take Photo', onPress: takePhoto },
      profileImage ? { text: 'Remove Photo', style: 'destructive', onPress: () => setProfileImage(null) } : null,
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean));
  };

  const pickImageFromLibrary = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed'); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.85 });
      if (!result.canceled && result.assets?.[0]?.uri) setProfileImage(result.assets[0].uri);
    } catch { Alert.alert('Install required', 'Run: npx expo install expo-image-picker'); }
  };

  const takePhoto = async () => {
    try {
      const ImagePicker = require('expo-image-picker');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed'); return; }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.85 });
      if (!result.canceled && result.assets?.[0]?.uri) setProfileImage(result.assets[0].uri);
    } catch { Alert.alert('Install required', 'Run: npx expo install expo-image-picker'); }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) { setEditNameError('Name cannot be empty'); return; }
    const newName = editName.trim();
    setLocalName(newName);
    setUserName(newName);
    setShowEditModal(false);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) },
    ]);
  };

  // ── Render sub-screens ──
  if (subScreen === 'notifications') return <NotificationsSubScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'privacy')       return <PrivacySubScreen       onBack={() => setSubScreen(null)} />;
  if (subScreen === 'help')          return <HelpSubScreen          onBack={() => setSubScreen(null)} />;

  const SETTINGS_ITEMS = [
    { key: 'notifications', icon: '🔔', label: 'Notifications',       sub: 'Cycle, medication & lifestyle alerts', onPress: () => setSubScreen('notifications') },
    { key: 'privacy',       icon: '🛡️', label: 'Privacy & Security',  sub: 'Account details, data & deletion',   onPress: () => setSubScreen('privacy') },
    { key: 'subscription',  icon: '💳', label: 'My Subscription',     sub: 'Manage your Ovia Premium plan',       onPress: () => Alert.alert('My Subscription', 'Premium plan is active ✨') },
    { key: 'help',          icon: '❓', label: 'Help & Features',     sub: 'FAQs, how-to guides, contact support', onPress: () => setSubScreen('help') },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.watermelon} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── HERO ── */}
        <View style={styles.heroSection}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.heroTitle}>My Profile</Text>
          <View style={styles.heroBlob1} />
          <View style={styles.heroBlob2} />

          <TouchableOpacity style={styles.avatarWrapper} onPress={handleAvatarPress} activeOpacity={0.85}>
            <View style={styles.avatarOuter}>
              {profileImage
                ? <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                : <View style={styles.avatarFallback}><Text style={styles.avatarInitials}>{initials}</Text></View>
              }
            </View>
            <View style={styles.cameraBadge}><Text style={styles.cameraBadgeIcon}>📷</Text></View>
          </TouchableOpacity>
        </View>

        {/* ── INFO CARD ── */}
        <View style={styles.infoCard}>
          <Text style={styles.infoName}>{userName}</Text>
          <Text style={styles.infoEmail}>{userEmail}</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumDot}>●</Text>
            <Text style={styles.premiumText}>Premium Status: Active</Text>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => { setEditName(userName); setShowEditModal(true); }} activeOpacity={0.85}>
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── SETTINGS ── */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            {SETTINGS_ITEMS.map((item, idx) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.settingsRow, idx < SETTINGS_ITEMS.length - 1 && styles.settingsRowBorder]}
                activeOpacity={0.7}
                onPress={item.onPress}
              >
                <View style={styles.settingsLeft}>
                  <View style={styles.settingsIconBadge}>
                    <Text style={styles.settingsIcon}>{item.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.settingsLabel}>{item.label}</Text>
                    <Text style={styles.settingsSub}>{item.sub}</Text>
                  </View>
                </View>
                <Text style={styles.settingsChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.appInfoRow}>
          <Text style={styles.appInfoText}>Ovia Health · Version 1.0.0</Text>
          <Text style={styles.appInfoText}>🌸 Made with love</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── EDIT PROFILE MODAL ── */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowEditModal(false)} />
          <View style={[styles.modalSheet, { paddingBottom: Platform.OS === 'ios' ? 36 : 24 }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.fieldLabel}>Display Name</Text>
              <View style={[styles.inputWrapper, !!editNameError && styles.inputWrapperError]}>
                <TextInput
                  style={styles.input} value={editName}
                  onChangeText={(t) => { setEditName(t); if (t.trim()) setEditNameError(''); }}
                  placeholder="Your name" placeholderTextColor={COLORS.pastelPink}
                  autoCapitalize="words" autoFocus
                />
              </View>
              {!!editNameError && <Text style={styles.errorText}>⚠ {editNameError}</Text>}
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputWrapper, { opacity: 0.6 }]}>
                <TextInput style={styles.input} value={userEmail} editable={false} placeholderTextColor={COLORS.pastelPink} />
              </View>
              <Text style={styles.fieldHint}>Email cannot be changed here. Use Privacy & Security → Change Account Details.</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  scrollContent: { paddingBottom: 20 },

  // Sub-screen header
  subHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.pinkChampagne,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 4,
  },
  subBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
  },
  subBackArrow: { fontSize: 24, color: COLORS.watermelon, fontWeight: '300', lineHeight: 28 },
  subHeaderTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },

  // Hero
  heroSection: {
    backgroundColor: COLORS.watermelon, paddingTop: 10, paddingBottom: 60,
    alignItems: 'center', position: 'relative', overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute', top: 10, left: 18, width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  backArrow: { color: COLORS.white, fontSize: 26, fontWeight: '300', lineHeight: 30 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, letterSpacing: 0.3, marginBottom: 20 },
  heroBlob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)', top: -80, right: -60 },
  heroBlob2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -30, left: -20 },

  avatarWrapper: { position: 'relative', marginBottom: 4 },
  avatarOuter: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.white, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  avatarFallback: { width: '100%', height: '100%', backgroundColor: COLORS.deepPink, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: COLORS.white, fontSize: 34, fontWeight: '800' },
  cameraBadge: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.watermelon },
  cameraBadgeIcon: { fontSize: 13 },

  // Info card
  infoCard: {
    backgroundColor: COLORS.white, marginHorizontal: 20, marginTop: -36,
    borderRadius: 24, padding: 22, alignItems: 'center',
    shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne, zIndex: 10,
  },
  infoName: { fontSize: 22, fontWeight: '800', color: COLORS.darkText, marginBottom: 4 },
  infoEmail: { fontSize: 13, color: COLORS.mutedText, marginBottom: 14 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: COLORS.lavenderBlush, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 20, borderWidth: 1, borderColor: COLORS.pastelPink },
  premiumDot: { fontSize: 10, color: COLORS.watermelon },
  premiumText: { fontSize: 12, color: COLORS.watermelon, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  editProfileBtn: { flex: 1, backgroundColor: COLORS.watermelon, borderRadius: 14, paddingVertical: 13, alignItems: 'center', shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  editProfileBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },
  logoutBtn: { flex: 1, backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 13, alignItems: 'center', borderWidth: 2, borderColor: COLORS.pastelPink },
  logoutBtnText: { color: COLORS.darkText, fontSize: 14, fontWeight: '700' },

  // Settings
  settingsSection: { marginHorizontal: 20, marginTop: 28 },
  settingsTitle: { fontSize: 17, fontWeight: '800', color: COLORS.watermelon, marginBottom: 14 },
  settingsCard: { backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.pinkChampagne, overflow: 'hidden', shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16 },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.lavenderBlush },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  settingsIconBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.pinkChampagne },
  settingsIcon: { fontSize: 18 },
  settingsLabel: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  settingsSub: { fontSize: 11, color: COLORS.mutedText },
  settingsChevron: { fontSize: 20, color: COLORS.pastelPink },

  appInfoRow: { alignItems: 'center', marginTop: 24, gap: 4 },
  appInfoText: { fontSize: 12, color: COLORS.mutedText },

  // Edit modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 24 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.lavenderBlush },
  modalCancelText: { fontSize: 15, color: COLORS.mutedText, fontWeight: '600' },
  modalTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },
  modalSaveBtn: { backgroundColor: COLORS.watermelon, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  modalSaveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  modalBody: { paddingHorizontal: 20, paddingTop: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 8, marginTop: 14 },
  inputWrapper: { backgroundColor: COLORS.lavenderBlush, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.pastelPink, paddingHorizontal: 14 },
  inputWrapperError: { borderColor: COLORS.error },
  input: { fontSize: 15, color: COLORS.darkText, paddingVertical: 12 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, fontWeight: '500' },
  fieldHint: { fontSize: 11, color: COLORS.mutedText, marginTop: 6, lineHeight: 16 },
});