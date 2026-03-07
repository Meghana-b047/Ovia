import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, StatusBar, Animated, Linking, ActivityIndicator,
  Image,
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
  black: '#000000',
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 YOUTUBE DATA API v3
// Replace YOUR_YOUTUBE_API_KEY with your actual key.
// Get one free at: https://console.cloud.google.com → APIs → YouTube Data API v3
// ─────────────────────────────────────────────────────────────────────────────
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// Fallback videos shown when API key is not set or request fails
const FALLBACK_VIDEOS = {
  'period cramps relief yoga exercises': [
    { id: { videoId: 'qFpKb_GTCT8' }, snippet: { title: 'Yoga for Period Cramps Relief', channelTitle: 'Yoga With Adriene', description: 'Gentle yoga poses to relieve menstrual cramps and lower back pain.' } },
    { id: { videoId: '4pKly2JojMw' }, snippet: { title: 'Period Pain Relief Exercises', channelTitle: 'Blogilates', description: 'Quick workout to reduce period pain and bloating.' } },
    { id: { videoId: 'oX6I6vs1EFs' }, snippet: { title: 'Yoga for Menstrual Cramps', channelTitle: 'SarahBethYoga', description: 'Soothing yoga sequence for your period.' } },
    { id: { videoId: 'sTANio_2E0Q' }, snippet: { title: 'Period Stretches for Cramp Relief', channelTitle: 'MommaStrong', description: 'Stretching routine designed for menstrual relief.' } },
  ],
  'PCOS PCOD yoga workout exercises hormone balance': [
    { id: { videoId: 'zqktGSM_Lhk' }, snippet: { title: 'Yoga for PCOS - Balance Hormones', channelTitle: 'Yoga With Adriene', description: 'Special yoga sequence for managing PCOS symptoms.' } },
    { id: { videoId: 'J8IbHoL1S0k' }, snippet: { title: 'PCOS Workout Routine for Women', channelTitle: 'Blogilates', description: 'Low-impact workout designed for women with PCOS.' } },
    { id: { videoId: 'nBNqCTBBf8s' }, snippet: { title: 'PCOD Exercise Guide', channelTitle: 'HealthyGamerGG', description: 'Complete exercise guide for PCOD management.' } },
    { id: { videoId: 'Xnk_tc2V3Tk' }, snippet: { title: 'Hormone Balancing Yoga', channelTitle: 'Breathe and Flow', description: 'Yoga to naturally balance hormones for PCOS.' } },
  ],
  'pregnancy safe prenatal yoga exercises workout': [
    { id: { videoId: '1JNyNqkJFKU' }, snippet: { title: 'Prenatal Yoga - First Trimester', channelTitle: 'Yoga With Adriene', description: 'Safe and gentle yoga for early pregnancy.' } },
    { id: { videoId: 'ZqXBapVGRKM' }, snippet: { title: 'Pregnancy Safe Full Body Workout', channelTitle: 'Sydney Cummings', description: 'Low-impact full body workout safe for all trimesters.' } },
    { id: { videoId: 'c2yBmRaAHVc' }, snippet: { title: 'Prenatal Stretching Routine', channelTitle: 'MommaStrong', description: 'Gentle stretching for pregnant women.' } },
    { id: { videoId: 'fq5xPBFYeAM' }, snippet: { title: 'Pregnancy Yoga for Back Pain', channelTitle: 'Boho Beautiful', description: 'Prenatal yoga to relieve back pain during pregnancy.' } },
  ],
};

// Generic fallback for modules without specific fallback data
const GENERIC_FALLBACK = [
  { id: { videoId: 'qFpKb_GTCT8' }, snippet: { title: 'Beginner Yoga for Women', channelTitle: 'Yoga With Adriene', description: 'Beginner-friendly yoga for women.' } },
  { id: { videoId: 'J8IbHoL1S0k' }, snippet: { title: 'Low Impact Women Workout', channelTitle: 'Blogilates', description: 'Low-impact workout for women.' } },
  { id: { videoId: 'ZqXBapVGRKM' }, snippet: { title: 'Full Body Stretching', channelTitle: 'Sydney Cummings', description: 'Full body stretching routine.' } },
  { id: { videoId: 'c2yBmRaAHVc' }, snippet: { title: 'Relaxing Yoga Flow', channelTitle: 'Boho Beautiful', description: 'Calming yoga flow for relaxation.' } },
];

function getYoutubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ExerciseDetailScreen({ navigation, route }) {
  const { module } = route.params;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }
  }, [loading]);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);

    // If no API key set, use fallback immediately
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
      const fallback = FALLBACK_VIDEOS[module.searchQuery] || GENERIC_FALLBACK;
      setVideos(fallback);
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: module.searchQuery,
        type: 'video',
        videoCategoryId: '17', // Sports
        maxResults: '12',
        relevanceLanguage: 'en',
        safeSearch: 'strict',
        key: YOUTUBE_API_KEY,
      });

      const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      if (data.items && data.items.length > 0) {
        setVideos(data.items);
        setUsingFallback(false);
      } else {
        throw new Error('No videos found');
      }
    } catch (err) {
      console.warn('YouTube API error:', err.message);
      // Fall back to curated list
      const fallback = FALLBACK_VIDEOS[module.searchQuery] || GENERIC_FALLBACK;
      setVideos(fallback);
      setUsingFallback(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = (video) => {
    const videoId = video.id?.videoId || video.id;
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Try YouTube app deep link
        Linking.openURL(`youtube://watch?v=${videoId}`).catch(() => {
          Linking.openURL(url);
        });
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={module.accent} />

      {/* ── HERO HEADER ── */}
      <View style={[styles.hero, { backgroundColor: module.accent }]}>
        <View style={styles.heroBlob1} />
        <View style={styles.heroBlob2} />

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.heroEmoji}>{module.emoji}</Text>
        <Text style={styles.heroTitle}>{module.title}</Text>
        <Text style={styles.heroSubtitle}>{module.subtitle}</Text>

        <View style={styles.heroMeta}>
          <View style={styles.heroMetaChip}>
            <Text style={styles.heroMetaText}>▶ {videos.length} videos</Text>
          </View>
          <View style={styles.heroMetaChip}>
            <Text style={styles.heroMetaText}>📱 YouTube</Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={[styles.descCard, { borderColor: module.accent + '40' }]}>
        <Text style={styles.descText}>{module.description}</Text>
      </View>

      {/* API key notice */}
      {usingFallback && YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY' && (
        <View style={styles.apiNotice}>
          <Text style={styles.apiNoticeIcon}>ℹ️</Text>
          <Text style={styles.apiNoticeText}>
            Add your YouTube API key in ExerciseDetailScreen.js to load live videos.
            Showing curated content for now.
          </Text>
        </View>
      )}

      {/* Videos */}
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={module.accent} />
          <Text style={[styles.loadingText, { color: module.accent }]}>Fetching videos...</Text>
        </View>
      ) : (
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.videoList}
          style={{ opacity: fadeAnim }}
        >
          {videos.map((video, idx) => {
            const videoId = video.id?.videoId || video.id;
            const title = video.snippet?.title || 'Video';
            const channel = video.snippet?.channelTitle || '';
            const description = video.snippet?.description || '';

            return (
              <TouchableOpacity
                key={`${videoId}-${idx}`}
                style={styles.videoCard}
                onPress={() => handleVideoPress(video)}
                activeOpacity={0.88}
              >
                {/* Thumbnail */}
                <View style={styles.thumbnailWrapper}>
                  <Image
                    source={{ uri: getYoutubeThumbnail(videoId) }}
                    style={styles.thumbnail}
                    defaultSource={{ uri: `https://img.youtube.com/vi/${videoId}/default.jpg` }}
                  />
                  {/* Play button overlay */}
                  <View style={styles.playOverlay}>
                    <View style={[styles.playBtn, { backgroundColor: module.accent }]}>
                      <Text style={styles.playBtnText}>▶</Text>
                    </View>
                  </View>
                  {/* Duration badge */}
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>YouTube</Text>
                  </View>
                </View>

                {/* Video info */}
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={2}>{title}</Text>
                  <Text style={styles.videoChannel}>📺 {channel}</Text>
                  {description.length > 0 && (
                    <Text style={styles.videoDesc} numberOfLines={2}>{description}</Text>
                  )}
                  <View style={[styles.watchBtn, { backgroundColor: module.bg || '#FFE5EC', borderColor: module.accent + '60' }]}>
                    <Text style={[styles.watchBtnText, { color: module.accent }]}>Watch on YouTube ↗</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Refresh button */}
          <TouchableOpacity style={[styles.refreshBtn, { borderColor: module.accent }]} onPress={fetchVideos}>
            <Text style={[styles.refreshBtnText, { color: module.accent }]}>🔄 Load More Videos</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },

  hero: {
    paddingTop: 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBlob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.12)', top: -80, right: -60 },
  heroBlob2: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.08)', bottom: -40, left: -30 },
  backBtn: {
    position: 'absolute', top: 10, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  backArrow: { color: COLORS.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  heroEmoji: { fontSize: 48, marginBottom: 10, marginTop: 4 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 4 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 14 },
  heroMeta: { flexDirection: 'row', gap: 10 },
  heroMetaChip: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  heroMetaText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  descCard: {
    backgroundColor: COLORS.white, marginHorizontal: 20, marginTop: -1,
    borderRadius: 18, padding: 16, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
    marginBottom: 12,
  },
  descText: { fontSize: 13, color: COLORS.mutedText, lineHeight: 20 },

  apiNotice: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#FFF8E1', marginHorizontal: 20, borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#FFE082',
  },
  apiNoticeIcon: { fontSize: 14 },
  apiNoticeText: { flex: 1, fontSize: 11, color: '#795548', lineHeight: 16 },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 14, fontWeight: '600' },

  videoList: { paddingHorizontal: 20, paddingTop: 4 },

  videoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.pinkChampagne,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  thumbnailWrapper: { position: 'relative', width: '100%', height: 190 },
  thumbnail: { width: '100%', height: '100%', backgroundColor: '#F5F5F5', resizeMode: 'cover' },
  playOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  playBtn: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  playBtnText: { color: COLORS.white, fontSize: 18, marginLeft: 3 },
  durationBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  durationText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },

  videoInfo: { padding: 14 },
  videoTitle: { fontSize: 15, fontWeight: '700', color: COLORS.darkText, marginBottom: 4, lineHeight: 21 },
  videoChannel: { fontSize: 12, color: COLORS.mutedText, marginBottom: 4 },
  videoDesc: { fontSize: 12, color: COLORS.mutedText, lineHeight: 17, marginBottom: 10 },
  watchBtn: {
    borderRadius: 12, paddingVertical: 9, alignItems: 'center',
    borderWidth: 1.5,
  },
  watchBtnText: { fontSize: 13, fontWeight: '700' },

  refreshBtn: {
    borderRadius: 16, paddingVertical: 14, alignItems: 'center',
    borderWidth: 2, marginBottom: 8,
    backgroundColor: COLORS.white,
  },
  refreshBtnText: { fontSize: 14, fontWeight: '700' },
});