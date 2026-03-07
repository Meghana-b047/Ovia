import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions, StatusBar, TextInput,
  Modal, KeyboardAvoidingView, Platform, Alert, AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const COLORS = {
  lavenderBlush: '#FFE5EC',
  pastelPink:    '#FFB3C6',
  lightPink:     '#FF8FAB',
  pinkChampagne: '#FFC2D1',
  watermelon:    '#FB6F92',
  white:         '#FFFFFF',
  darkText:      '#2D1B1E',
  mutedText:     '#9B6B78',
  navInactive:   '#A0A0B0',
  tickGreen:     '#4CAF50',
  crossRed:      '#F44336',
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');
const toKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['S','M','T','W','T','F','S'];

const PERIOD_DAYS    = [1, 2, 3, 4, 5];
const OVULATION_DAYS = [14, 15, 16];
const FERTILE_DAYS   = [11, 12, 13, 14, 15, 16, 17];

const TASK_ICONS = ['📋','🩸','💊','🧘','🏃','💧','🥗','😴','🩺','💆','🌿','⏰','🍵','🧴'];
const STORAGE_KEY = 'OVIA_TASKS_V2';

// ─────────────────────────────────────────
// Nav Icons
// ─────────────────────────────────────────
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
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { return new Date(year, month, 1).getDay(); }

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function CalendarScreen({ navigation }) {
  const today = new Date();
  const todayKey = toKey(today);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  // selectedDay is the DATE object the user is viewing
  const [selectedDate, setSelectedDate] = useState(today);
  const [activeTab,    setActiveTab]    = useState('Calendar');

  // allTasks: { "YYYY-MM-DD": [ taskObj ] }
  const [allTasks, setAllTasks] = useState({});
  const [loaded,   setLoaded]   = useState(false);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle,     setNewTitle]     = useState('');
  const [newSub,       setNewSub]       = useState('');
  const [newTime,      setNewTime]      = useState('');
  const [newIcon,      setNewIcon]      = useState('📋');
  const modalAnim = useRef(new Animated.Value(0)).current;

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // ── Load tasks from AsyncStorage on mount ──
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setAllTasks(JSON.parse(raw));
      } catch (_) {}
      setLoaded(true);
    })();
  }, []);

  // ── Persist tasks whenever they change ──
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allTasks)).catch(() => {});
  }, [allTasks, loaded]);

  // ── Midnight reset: check when app comes to foreground ──
  useEffect(() => {
    const handleAppState = (nextState) => {
      if (nextState === 'active') {
        // If today has changed, just reset selectedDate to new today
        // Tasks for the new day start empty — nothing to delete
        const newToday = new Date();
        setSelectedDate(prev => {
          if (toKey(prev) === toKey(newToday)) return prev;
          return newToday;
        });
        setCurrentMonth(new Date().getMonth());
        setCurrentYear(new Date().getFullYear());
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);

    // Schedule a timer that fires just after midnight to auto-reset UI
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5).getTime() - now.getTime();
    const midnightTimer = setTimeout(() => {
      const newToday = new Date();
      setSelectedDate(newToday);
      setCurrentMonth(newToday.getMonth());
      setCurrentYear(newToday.getFullYear());
    }, msUntilMidnight);

    return () => {
      sub.remove();
      clearTimeout(midnightTimer);
    };
  }, []);

  // ── Calendar animation on month change ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [currentMonth]);

  // ── Derived ──
  const selectedKey  = toKey(selectedDate);
  const isToday      = selectedKey === todayKey;
  const isPastDay    = selectedDate < today && !isToday;
  const dayTasks     = allTasks[selectedKey] ?? [];

  const doneCount    = dayTasks.filter(t => t.status === 'done').length;
  const skipCount    = dayTasks.filter(t => t.status === 'skip').length;
  const pendingCount = dayTasks.filter(t => t.status === 'pending').length;

  // ── Save updated task list for a day ──
  const updateDayTasks = useCallback((key, tasks) => {
    setAllTasks(prev => ({ ...prev, [key]: tasks }));
  }, []);

  // ── Toggle task status ──
  const setTaskStatus = (taskId, status) => {
    const updated = dayTasks.map(t =>
      t.id === taskId ? { ...t, status: t.status === status ? 'pending' : status } : t
    );
    updateDayTasks(selectedKey, updated);
  };

  // ── Delete task ──
  const deleteTask = (taskId) => {
    Alert.alert('Remove Task', 'Delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => updateDayTasks(selectedKey, dayTasks.filter(t => t.id !== taskId)),
      },
    ]);
  };

  // ── Add Task modal ──
  const openModal = () => {
    setNewTitle(''); setNewSub(''); setNewTime(''); setNewIcon('📋');
    setModalVisible(true);
    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: true, tension: 65, friction: 10 }).start();
  };
  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => setModalVisible(false));
  };
  const confirmAddTask = () => {
    if (!newTitle.trim()) { Alert.alert('Title required'); return; }
    const task = {
      id:     `${selectedKey}-${Date.now()}`,
      icon:   newIcon,
      title:  newTitle.trim(),
      sub:    newSub.trim(),
      time:   newTime.trim() || 'Any time',
      color:  COLORS.watermelon,
      bg:     COLORS.white,
      status: 'pending',
    };
    updateDayTasks(selectedKey, [...dayTasks, task]);
    closeModal();
  };

  // ── Calendar nav ──
  const goToPrevMonth = () => {
    fadeAnim.setValue(0); slideAnim.setValue(20);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const goToNextMonth = () => {
    fadeAnim.setValue(0); slideAnim.setValue(20);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDayPress = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    setSelectedDate(d);
  };

  const handleNavTab = (key) => {
    setActiveTab(key);
    if (key === 'Dashboard') navigation.navigate('Home');
    if (key === 'Doctor')    navigation.navigate('Doctor');
    if (key === 'Social')    navigation.navigate('Social');
    if (key === 'Shop')      navigation.navigate('Shop');
  };

  const daysInMonth  = getDaysInMonth(currentYear, currentMonth);
  const firstDay     = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarCells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // ── Day circle styling ──
  const getDayStyle = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const k = toKey(d);
    if (k === selectedKey) return styles.daySelected;
    if (k === todayKey) return styles.dayToday;
    if (PERIOD_DAYS.includes(day)    && currentMonth === today.getMonth()) return styles.dayPeriod;
    if (OVULATION_DAYS.includes(day) && currentMonth === today.getMonth()) return styles.dayOvulation;
    if (FERTILE_DAYS.includes(day)   && currentMonth === today.getMonth()) return styles.dayFertile;
    return null;
  };
  const getDayTextStyle = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const k = toKey(d);
    if (k === selectedKey || k === todayKey) return styles.dayTextSelected;
    if (PERIOD_DAYS.includes(day)    && currentMonth === today.getMonth()) return styles.dayTextPeriod;
    if (OVULATION_DAYS.includes(day) && currentMonth === today.getMonth()) return styles.dayTextOvulation;
    return null;
  };

  // ── Has tasks indicator ──
  const dayHasTasks = (day) => {
    const k = toKey(new Date(currentYear, currentMonth, day));
    return (allTasks[k] ?? []).length > 0;
  };
  const dayAllDone = (day) => {
    const k = toKey(new Date(currentYear, currentMonth, day));
    const tasks = allTasks[k] ?? [];
    return tasks.length > 0 && tasks.every(t => t.status === 'done');
  };

  // ── Formatted display date ──
  const formattedSelected = `${MONTHS[selectedDate.getMonth()].slice(0, 3)} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, { width: 16 }]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {MONTHS[currentMonth]} {currentYear} Calendar
        </Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── CALENDAR CARD ── */}
        <Animated.View style={[styles.calendarCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Month nav */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrowBtn}>
              <Text style={styles.monthArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrowBtn}>
              <Text style={styles.monthArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaderRow}>
            {DAYS.map((d, i) => (
              <Text key={i} style={[styles.dayHeader, (i === 0 || i === 6) && styles.dayHeaderWeekend]}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.calendarGrid}>
            {calendarCells.map((day, i) => (
              <TouchableOpacity
                key={i} style={styles.dayCell}
                onPress={() => day && handleDayPress(day)}
                activeOpacity={day ? 0.7 : 1}
              >
                {day ? (
                  <>
                    <View style={[styles.dayCircle, getDayStyle(day)]}>
                      <Text style={[styles.dayText, getDayTextStyle(day)]}>{day}</Text>
                    </View>
                    {/* Task indicator dots */}
                    {dayAllDone(day)
                      ? <View style={[styles.dayDot, { backgroundColor: COLORS.tickGreen }]} />
                      : dayHasTasks(day)
                        ? <View style={[styles.dayDot, { backgroundColor: COLORS.watermelon }]} />
                        : PERIOD_DAYS.includes(day) && currentMonth === today.getMonth()
                          ? <View style={[styles.dayDot, { backgroundColor: COLORS.watermelon, opacity: 0.4 }]} />
                          : OVULATION_DAYS.includes(day) && currentMonth === today.getMonth()
                            ? <View style={[styles.dayDot, { backgroundColor: COLORS.lightPink }]} />
                            : <View style={styles.dayDotEmpty} />
                    }
                  </>
                ) : (
                  <View style={styles.dayCircle} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: COLORS.watermelon, label: 'Period' },
              { color: COLORS.lightPink,  label: 'Ovulation' },
              { color: COLORS.tickGreen,  label: 'All done' },
              { color: COLORS.pastelPink, label: 'Today' },
            ].map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── DAILY TASKS HEADER ── */}
        <View style={styles.taskSection}>
          <View style={styles.taskTitleRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.taskTitleInner}>
                <Text style={styles.taskTitle}>Daily Tasks</Text>
                {/* Viewing badge */}
                <View style={[
                  styles.viewingBadge,
                  isToday ? styles.viewingBadgeToday : styles.viewingBadgePast
                ]}>
                  <Text style={[
                    styles.viewingBadgeText,
                    isToday ? styles.viewingBadgeTextToday : styles.viewingBadgeTextPast
                  ]}>
                    {isToday ? '📅 Today' : `📂 ${formattedSelected}`}
                  </Text>
                </View>
              </View>
              {dayTasks.length > 0 && (
                <Text style={styles.taskSubtitle}>
                  <Text style={{ color: COLORS.tickGreen }}>{doneCount} done</Text>
                  {skipCount > 0 && <Text style={{ color: COLORS.crossRed }}> · {skipCount} skipped</Text>}
                  {pendingCount > 0 && <Text style={{ color: COLORS.mutedText }}> · {pendingCount} pending</Text>}
                </Text>
              )}
            </View>
            {dayTasks.length > 0 && (
              <View style={styles.progressPill}>
                <Text style={styles.progressPillText}>{doneCount}/{dayTasks.length}</Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          {dayTasks.length > 0 && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(doneCount / dayTasks.length) * 100}%` }]} />
            </View>
          )}

          {/* ── PAST DAY: read-only banner ── */}
          {!isToday && (
            <View style={styles.pastBanner}>
              <Text style={styles.pastBannerIcon}>📂</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.pastBannerTitle}>Viewing past tasks</Text>
                <Text style={styles.pastBannerSub}>
                  {dayTasks.length === 0
                    ? 'No tasks were added on this day.'
                    : `${doneCount} done · ${skipCount} skipped · ${pendingCount} pending`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.goTodayBtn}
                onPress={() => {
                  const t = new Date();
                  setSelectedDate(t);
                  setCurrentMonth(t.getMonth());
                  setCurrentYear(t.getFullYear());
                }}
              >
                <Text style={styles.goTodayBtnText}>Go to Today</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── TODAY: empty state ── */}
          {isToday && dayTasks.length === 0 && (
            <View style={styles.emptyToday}>
              <Text style={styles.emptyTodayEmoji}>✨</Text>
              <Text style={styles.emptyTodayTitle}>Fresh start!</Text>
              <Text style={styles.emptyTodaySub}>
                Your task list resets every day at midnight.{'\n'}Tap "+ Add Task" to plan your day.
              </Text>
            </View>
          )}

          {/* ── TASK CARDS ── */}
          {dayTasks.map((task) => {
            const isDone = task.status === 'done';
            const isSkip = task.status === 'skip';
            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  { backgroundColor: task.bg || COLORS.white },
                  isDone && styles.taskCardDone,
                  isSkip && styles.taskCardSkip,
                ]}
              >
                {/* Accent strip */}
                <View style={[styles.taskAccent, {
                  backgroundColor: isDone ? COLORS.tickGreen : isSkip ? COLORS.crossRed : task.color,
                }]} />

                {/* Icon */}
                <View style={[styles.taskIconBadge, {
                  backgroundColor: isDone ? COLORS.tickGreen + '22' : isSkip ? COLORS.crossRed + '15' : task.color + '18'
                }]}>
                  <Text style={[styles.taskIcon, (isDone || isSkip) && { opacity: 0.55 }]}>
                    {task.icon}
                  </Text>
                </View>

                {/* Info */}
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskItemTitle,
                    isDone && styles.taskTitleDone,
                    isSkip && styles.taskTitleSkip,
                  ]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {task.sub ? (
                    <Text style={[styles.taskItemSub, (isDone || isSkip) && { opacity: 0.5 }]} numberOfLines={1}>
                      {task.sub}
                    </Text>
                  ) : null}
                  <Text style={[
                    styles.taskTime,
                    { color: isDone ? COLORS.tickGreen : isSkip ? COLORS.crossRed : task.color }
                  ]}>
                    {isDone ? '✓ Done' : isSkip ? '✗ Skipped' : task.time}
                  </Text>
                </View>

                {/* ✓ Tick — only editable on today */}
                {isToday ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, isDone ? styles.actionBtnDoneActive : styles.actionBtnDone]}
                      onPress={() => setTaskStatus(task.id, 'done')}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.actionBtnIcon, isDone && { color: COLORS.white }]}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, isSkip ? styles.actionBtnSkipActive : styles.actionBtnSkip]}
                      onPress={() => setTaskStatus(task.id, 'skip')}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.actionBtnIcon, isSkip && { color: COLORS.white }]}>✗</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  /* Past day: show status chip only */
                  <View style={[
                    styles.statusChip,
                    isDone && { backgroundColor: COLORS.tickGreen + '20' },
                    isSkip && { backgroundColor: COLORS.crossRed + '15' },
                    !isDone && !isSkip && { backgroundColor: COLORS.pinkChampagne },
                  ]}>
                    <Text style={[
                      styles.statusChipText,
                      isDone && { color: COLORS.tickGreen },
                      isSkip && { color: COLORS.crossRed },
                    ]}>
                      {isDone ? '✓' : isSkip ? '✗' : '—'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Past day with tasks — summary footer */}
          {!isToday && dayTasks.length > 0 && (
            <View style={styles.pastSummary}>
              <View style={styles.pastSummaryItem}>
                <View style={[styles.pastSummaryDot, { backgroundColor: COLORS.tickGreen }]} />
                <Text style={styles.pastSummaryText}>{doneCount} completed</Text>
              </View>
              <View style={styles.pastSummaryItem}>
                <View style={[styles.pastSummaryDot, { backgroundColor: COLORS.crossRed }]} />
                <Text style={styles.pastSummaryText}>{skipCount} skipped</Text>
              </View>
              <View style={styles.pastSummaryItem}>
                <View style={[styles.pastSummaryDot, { backgroundColor: COLORS.mutedText }]} />
                <Text style={styles.pastSummaryText}>{pendingCount} pending</Text>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* FAB — only for today */}
      {isToday && (
        <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.85}>
          <Text style={styles.fabText}>＋ Add Task</Text>
        </TouchableOpacity>
      )}

      {/* ── BOTTOM NAV ── */}
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

      {/* ── ADD TASK MODAL ── */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeModal} />
          <Animated.View style={[
            styles.modalSheet,
            { transform: [{ translateY: modalAnim.interpolate({ inputRange: [0,1], outputRange: [500,0] }) }] },
          ]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add New Task</Text>
            <Text style={styles.modalDateLabel}>📅 Today — {formattedSelected}</Text>

            {/* Icon picker */}
            <Text style={styles.modalLabel}>Choose Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 14 }}>
              {TASK_ICONS.map(ic => (
                <TouchableOpacity
                  key={ic}
                  style={[styles.iconChip, newIcon === ic && styles.iconChipActive]}
                  onPress={() => setNewIcon(ic)}
                >
                  <Text style={{ fontSize: 20 }}>{ic}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Task Title *</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Take iron tablets"
                placeholderTextColor={COLORS.pastelPink}
                value={newTitle}
                onChangeText={setNewTitle}
                maxLength={60}
              />
            </View>

            <Text style={styles.modalLabel}>Note (optional)</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. With warm water after meal"
                placeholderTextColor={COLORS.pastelPink}
                value={newSub}
                onChangeText={setNewSub}
                maxLength={80}
              />
            </View>

            <Text style={styles.modalLabel}>Time (optional)</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 08:00 AM"
                placeholderTextColor={COLORS.pastelPink}
                value={newTime}
                onChangeText={setNewTime}
                maxLength={20}
              />
            </View>

            {/* Live preview */}
            {newTitle.trim().length > 0 && (
              <View style={styles.taskPreview}>
                <Text style={{ fontSize: 22 }}>{newIcon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskPreviewTitle}>{newTitle}</Text>
                  {newSub ? <Text style={styles.taskPreviewSub}>{newSub}</Text> : null}
                </View>
                <Text style={styles.taskPreviewTime}>{newTime || 'Any time'}</Text>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmAddTask}>
                <Text style={styles.modalConfirmBtnText}>＋ Add Task</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────
// Styles
// ─────────────────────────────────────────
const DAY_SIZE = (width - 40 - 24) / 7;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  menuBtn: { gap: 4, padding: 4 },
  menuLine: { width: 22, height: 2.5, backgroundColor: COLORS.darkText, borderRadius: 2 },
  headerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  bellDot: { position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.watermelon, borderWidth: 1, borderColor: COLORS.white },

  // Calendar
  calendarCard: { backgroundColor: COLORS.white, borderRadius: 24, padding: 18, marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  monthArrowBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  monthArrow: { fontSize: 20, color: COLORS.watermelon, fontWeight: '700', lineHeight: 24 },
  monthTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText },
  dayHeaderRow: { flexDirection: 'row', marginBottom: 8 },
  dayHeader: { width: DAY_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700', color: COLORS.mutedText },
  dayHeaderWeekend: { color: COLORS.lightPink },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: DAY_SIZE, alignItems: 'center', marginBottom: 4 },
  dayCircle: { width: DAY_SIZE - 4, height: DAY_SIZE - 4, borderRadius: (DAY_SIZE - 4) / 2, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, fontWeight: '500', color: COLORS.darkText },
  daySelected: { backgroundColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  dayToday: { backgroundColor: COLORS.pinkChampagne, borderWidth: 2, borderColor: COLORS.watermelon },
  dayTextSelected: { color: COLORS.white, fontWeight: '800' },
  dayPeriod: { backgroundColor: '#FFE5EC', borderWidth: 1.5, borderColor: COLORS.watermelon },
  dayTextPeriod: { color: COLORS.watermelon, fontWeight: '700' },
  dayOvulation: { backgroundColor: COLORS.lightPink },
  dayTextOvulation: { color: COLORS.white, fontWeight: '700' },
  dayFertile: { backgroundColor: COLORS.lavenderBlush },
  dayDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  dayDotEmpty: { width: 5, height: 5, marginTop: 2 },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.lavenderBlush },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.mutedText, fontWeight: '600' },

  // Task section
  taskSection: { marginBottom: 16 },
  taskTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  taskTitleInner: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 3 },
  taskTitle: { fontSize: 17, fontWeight: '800', color: COLORS.darkText },
  viewingBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  viewingBadgeToday: { backgroundColor: COLORS.watermelon },
  viewingBadgePast: { backgroundColor: COLORS.pinkChampagne },
  viewingBadgeText: { fontSize: 10, fontWeight: '700' },
  viewingBadgeTextToday: { color: COLORS.white },
  viewingBadgeTextPast: { color: COLORS.mutedText },
  taskSubtitle: { fontSize: 11, color: COLORS.mutedText, marginTop: 2 },
  progressPill: { backgroundColor: COLORS.watermelon, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  progressPillText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 5, backgroundColor: COLORS.pinkChampagne, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.tickGreen, borderRadius: 3 },

  // Past banner
  pastBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  pastBannerIcon: { fontSize: 22 },
  pastBannerTitle: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  pastBannerSub: { fontSize: 11, color: COLORS.mutedText },
  goTodayBtn: { backgroundColor: COLORS.watermelon, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  goTodayBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },

  // Today empty
  emptyToday: { alignItems: 'center', paddingVertical: 36, gap: 8 },
  emptyTodayEmoji: { fontSize: 48 },
  emptyTodayTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText },
  emptyTodaySub: { fontSize: 13, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20 },

  // Task card
  taskCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.pastelPink, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2, overflow: 'hidden', position: 'relative' },
  taskCardDone: { borderColor: COLORS.tickGreen + '50', backgroundColor: '#F1FBF1' },
  taskCardSkip: { borderColor: COLORS.crossRed + '35', backgroundColor: '#FFF5F5', opacity: 0.8 },
  taskAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  taskIconBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginLeft: 8 },
  taskIcon: { fontSize: 20 },
  taskInfo: { flex: 1, marginRight: 6 },
  taskItemTitle: { fontSize: 14, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.mutedText, fontWeight: '500' },
  taskTitleSkip: { textDecorationLine: 'line-through', color: COLORS.crossRed, fontWeight: '500', opacity: 0.7 },
  taskItemSub: { fontSize: 11, color: COLORS.mutedText, marginBottom: 3 },
  taskTime: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 5, borderWidth: 2 },
  actionBtnDone:       { borderColor: COLORS.tickGreen, backgroundColor: COLORS.white },
  actionBtnDoneActive: { borderColor: COLORS.tickGreen, backgroundColor: COLORS.tickGreen },
  actionBtnSkip:       { borderColor: COLORS.crossRed,  backgroundColor: COLORS.white },
  actionBtnSkipActive: { borderColor: COLORS.crossRed,  backgroundColor: COLORS.crossRed },
  actionBtnIcon: { fontSize: 14, fontWeight: '800', color: COLORS.mutedText },

  statusChip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 6 },
  statusChipText: { fontSize: 13, fontWeight: '800', color: COLORS.mutedText },

  // Past summary footer
  pastSummary: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.white, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: COLORS.pinkChampagne, marginTop: 4 },
  pastSummaryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pastSummaryDot: { width: 8, height: 8, borderRadius: 4 },
  pastSummaryText: { fontSize: 12, color: COLORS.darkText, fontWeight: '600' },

  // FAB
  fab: { position: 'absolute', bottom: 118, right: 20, backgroundColor: COLORS.watermelon, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 14, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10, zIndex: 100 },
  fabText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

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

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.38)' },
  modalSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 36, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 20 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.darkText, marginBottom: 2 },
  modalDateLabel: { fontSize: 12, color: COLORS.watermelon, fontWeight: '700', marginBottom: 18 },
  modalLabel: { fontSize: 12, fontWeight: '700', color: COLORS.darkText, marginBottom: 6, marginTop: 4 },
  iconChip: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.lavenderBlush, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  iconChipActive: { borderColor: COLORS.watermelon, backgroundColor: COLORS.pinkChampagne },
  modalInputWrapper: { backgroundColor: COLORS.lavenderBlush, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.pastelPink, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 10 },
  modalInput: { fontSize: 14, color: COLORS.darkText, paddingVertical: 10 },
  taskPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lavenderBlush, borderRadius: 14, padding: 12, marginVertical: 10, borderWidth: 1.5, borderColor: COLORS.pastelPink, gap: 10 },
  taskPreviewTitle: { fontSize: 13, fontWeight: '700', color: COLORS.darkText },
  taskPreviewSub: { fontSize: 11, color: COLORS.mutedText },
  taskPreviewTime: { fontSize: 11, color: COLORS.watermelon, fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: COLORS.pastelPink },
  modalCancelBtnText: { fontSize: 14, color: COLORS.mutedText, fontWeight: '700' },
  modalConfirmBtn: { flex: 2, borderRadius: 16, paddingVertical: 14, alignItems: 'center', backgroundColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  modalConfirmBtnText: { fontSize: 14, color: COLORS.white, fontWeight: '800' },
});