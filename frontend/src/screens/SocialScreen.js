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
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Path, Line, Polygon } from 'react-native-svg';

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

// ── Bookmark icon SVG ──
const BookmarkIcon = ({ filled, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
      fill={filled ? COLORS.watermelon : 'none'}
      stroke={filled ? COLORS.watermelon : COLORS.mutedText}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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

// ── Feed tabs: All Posts | Saved | My Stories ──
const FEED_TABS = [
  { key: 'all', label: 'All Posts' },
  { key: 'saved', label: 'Saved' },
  { key: 'mine', label: 'My Stories' },
];

// ── Tag options ──
const POST_TAGS = ['General', 'PCOS', 'Pregnancy', 'Mental Health', 'Nutrition', 'Exercise', 'Period Tips', 'Story'];

const TAG_COLORS = {
  'General':      { bg: '#FFE5EC', text: COLORS.watermelon },
  'PCOS':         { bg: '#F3E5F5', text: '#8E24AA' },
  'Pregnancy':    { bg: '#E8F5E9', text: '#2E7D32' },
  'Mental Health':{ bg: '#E3F2FD', text: '#1565C0' },
  'Nutrition':    { bg: '#FFF8E1', text: '#F57F17' },
  'Exercise':     { bg: '#FCE4EC', text: '#C62828' },
  'Period Tips':  { bg: '#FFF3E0', text: '#E65100' },
  'Story':        { bg: COLORS.pinkChampagne, text: COLORS.darkText },
};

const getTagStyle = (tag) => TAG_COLORS[tag] || { bg: COLORS.lavenderBlush, text: COLORS.mutedText };

// ── Seed community posts (isOwn: false = community, isOwn: true = current user) ──
const SEED_POSTS = [
  {
    id: '1',
    isOwn: false,
    user: 'Raea M.',
    handle: '@raea_m',
    avatarLetter: 'R',
    avatarColor: '#FB6F92',
    time: '36 mins ago',
    tag: 'General',
    content: "Feeling so grateful for this community's support during my recovery journey. You all make such a 🌸 difference.",
    likes: 34,
    comments: 12,
    liked: false,
    saved: false,
    commentList: [
      { id: 'c1', user: 'Maya J.', text: 'So happy to hear this 💕', time: '10m ago', avatarColor: '#FF8FAB' },
      { id: 'c2', user: 'Priya S.', text: 'We are always here for you!', time: '5m ago', avatarColor: '#9B6B78' },
    ],
  },
  {
    id: '2',
    isOwn: false,
    user: 'Elena Rodriguez',
    handle: '@elena_r',
    avatarLetter: 'E',
    avatarColor: '#9B6B78',
    time: '2 hours ago',
    tag: 'PCOS',
    content: 'Just completed my first week of daily medication. Small steps lead to big changes. Sending love to everyone starting their week today 💊',
    likes: 42,
    comments: 8,
    liked: false,
    saved: false,
    commentList: [
      { id: 'c3', user: 'Lisa C.', text: 'Keep going! You got this 🌸', time: '1h ago', avatarColor: '#FFC2D1' },
    ],
  },
  {
    id: '3',
    isOwn: false,
    user: 'Maya Lemon',
    handle: '@maya_lemon',
    avatarLetter: 'M',
    avatarColor: '#FF8FAB',
    time: '5 hours ago',
    tag: 'Story',
    content: "Morning yoga sessions. It's not about being perfect, it's about showing up for yourself 🧘‍♀️ Consistency is everything.",
    likes: 56,
    comments: 24,
    liked: false,
    saved: false,
    commentList: [],
  },
  {
    id: '4',
    isOwn: false,
    user: 'Priya Sharma',
    handle: '@priya_s',
    avatarLetter: 'P',
    avatarColor: '#FFC2D1',
    time: '1 day ago',
    tag: 'Period Tips',
    content: 'Hot water bottle + chamomile tea + this playlist = surviving day 2. Sharing my period survival kit with you all 💊❤️ Drop yours in comments!',
    likes: 89,
    comments: 31,
    liked: false,
    saved: false,
    commentList: [],
  },
  {
    id: '5',
    isOwn: false,
    user: 'Lisa Chen',
    handle: '@lisa_chen',
    avatarLetter: 'L',
    avatarColor: '#E3F2FD',
    time: '2 days ago',
    tag: 'Nutrition',
    content: "Changed my diet for PCOS management 3 months ago — less sugar, more greens, balanced proteins. My skin is clearer and my cycles are more predictable. Highly recommend tracking what you eat!",
    likes: 127,
    comments: 45,
    liked: false,
    saved: false,
    commentList: [],
  },
];

// ── Empty state component ──
const EmptyState = ({ emoji, title, subtitle }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyEmoji}>{emoji}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptySub}>{subtitle}</Text>
  </View>
);

export default function SocialScreen({ navigation }) {
  const [activeNavTab, setActiveNavTab] = useState('Social');
  const [feedTab, setFeedTab] = useState('all');
  const [posts, setPosts] = useState(SEED_POSTS);
  const [showCompose, setShowCompose] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedTag, setSelectedTag] = useState('General');
  const [openComments, setOpenComments] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // ── Actions ──
  const handleLike = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleSave = (id) => {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, saved: !p.saved } : p
    ));
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      isOwn: true,                     // ← marks as user's own post
      user: 'You',
      handle: '@you',
      avatarLetter: 'Y',
      avatarColor: COLORS.watermelon,
      time: 'Just now',
      tag: selectedTag,
      content: postText.trim(),
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      commentList: [],
    };
    setPosts(prev => [newPost, ...prev]);
    setPostText('');
    setSelectedTag('General');
    setShowCompose(false);
  };

  const handleAddComment = (postId) => {
    if (!commentText.trim()) return;
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            comments: p.comments + 1,
            commentList: [
              ...p.commentList,
              { id: Date.now().toString(), user: 'You', text: commentText.trim(), time: 'Just now', avatarColor: COLORS.watermelon },
            ],
          }
        : p
    ));
    setCommentText('');
  };

  const handleNavTab = (key) => {
    setActiveNavTab(key);
    if (key === 'Dashboard') navigation.navigate('Home');
    if (key === 'Calendar') navigation.navigate('Calendar');
    if (key === 'Doctor') navigation.navigate('Doctor');
    if (key === 'Shop')   navigation.navigate('Shop');
  };

  // ── Filter logic ──
  const filteredPosts = posts.filter(p => {
    if (feedTab === 'all') return true;
    if (feedTab === 'saved') return p.saved === true;
    if (feedTab === 'mine') return p.isOwn === true;
    return true;
  });

  // ── Render single post ──
  const renderPost = (post) => (
    <View key={post.id} style={[styles.postCard, post.isOwn && styles.postCardOwn]}>

      {/* Own post badge */}
      {post.isOwn && (
        <View style={styles.ownBadge}>
          <Text style={styles.ownBadgeText}>✏️ Your Post</Text>
        </View>
      )}

      {/* Post header */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
          <Text style={styles.avatarText}>{post.avatarLetter}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.postUserName}>{post.user}</Text>
          <Text style={styles.postMeta}>{post.handle} · {post.time}</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: getTagStyle(post.tag).bg }]}>
          <Text style={[styles.tagBadgeText, { color: getTagStyle(post.tag).text }]}>{post.tag}</Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Actions row */}
      <View style={styles.actionsRow}>
        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)} activeOpacity={0.7}>
          <Text style={[styles.actionHeart, post.liked && styles.actionHeartLiked]}>
            {post.liked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.actionCount, post.liked && styles.actionCountLiked]}>{post.likes}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setOpenComments(openComments === post.id ? null : post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Save bookmark */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => handleSave(post.id)}
          activeOpacity={0.7}
        >
          <BookmarkIcon filled={post.saved} size={20} />
        </TouchableOpacity>
      </View>

      {/* Saved indicator */}
      {post.saved && (
        <View style={styles.savedIndicator}>
          <Text style={styles.savedIndicatorText}>🔖 Saved to your collection</Text>
        </View>
      )}

      {/* Comments section */}
      {openComments === post.id && (
        <View style={styles.commentsSection}>
          <View style={styles.commentsDivider} />

          {post.commentList.length === 0 && (
            <Text style={styles.noComments}>Be the first to comment 💬</Text>
          )}

          {post.commentList.map(c => (
            <View key={c.id} style={styles.commentRow}>
              <View style={[styles.commentAvatar, { backgroundColor: c.avatarColor || COLORS.pastelPink }]}>
                <Text style={styles.commentAvatarText}>{c.user[0]}</Text>
              </View>
              <View style={styles.commentBubble}>
                <Text style={styles.commentUser}>
                  {c.user} <Text style={styles.commentTime}>· {c.time}</Text>
                </Text>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
            </View>
          ))}

          {/* Add comment */}
          <View style={styles.addCommentRow}>
            <View style={[styles.commentAvatar, { backgroundColor: COLORS.watermelon }]}>
              <Text style={styles.commentAvatarText}>Y</Text>
            </View>
            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor={COLORS.pastelPink}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.commentSendBtn, !commentText.trim() && { opacity: 0.4 }]}
                onPress={() => handleAddComment(post.id)}
                disabled={!commentText.trim()}
              >
                <Text style={styles.commentSendText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community Feed</Text>
          <Text style={styles.headerSub}>{posts.length} posts · {posts.filter(p => p.isOwn).length} by you</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* ── FEED TABS ── */}
      <View style={styles.feedTabsRow}>
        {FEED_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.feedTab, feedTab === tab.key && styles.feedTabActive]}
            onPress={() => setFeedTab(tab.key)}
          >
            <Text style={[styles.feedTabText, feedTab === tab.key && styles.feedTabTextActive]}>
              {tab.label}
            </Text>
            {/* Count badges */}
            {tab.key === 'saved' && posts.filter(p => p.saved).length > 0 && (
              <View style={styles.tabCountBadge}>
                <Text style={styles.tabCountText}>{posts.filter(p => p.saved).length}</Text>
              </View>
            )}
            {tab.key === 'mine' && posts.filter(p => p.isOwn).length > 0 && (
              <View style={styles.tabCountBadge}>
                <Text style={styles.tabCountText}>{posts.filter(p => p.isOwn).length}</Text>
              </View>
            )}
            {feedTab === tab.key && <View style={styles.feedTabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── POSTS ── */}
      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tab-specific headers */}
          {feedTab === 'saved' && (
            <View style={styles.tabHeaderBanner}>
              <Text style={styles.tabHeaderEmoji}>🔖</Text>
              <View>
                <Text style={styles.tabHeaderTitle}>Saved Posts</Text>
                <Text style={styles.tabHeaderSub}>
                  {posts.filter(p => p.saved).length === 0
                    ? 'Tap the bookmark icon on any post to save it'
                    : `${posts.filter(p => p.saved).length} post${posts.filter(p => p.saved).length > 1 ? 's' : ''} saved`}
                </Text>
              </View>
            </View>
          )}

          {feedTab === 'mine' && (
            <View style={styles.tabHeaderBanner}>
              <Text style={styles.tabHeaderEmoji}>✏️</Text>
              <View>
                <Text style={styles.tabHeaderTitle}>My Stories</Text>
                <Text style={styles.tabHeaderSub}>
                  {posts.filter(p => p.isOwn).length === 0
                    ? 'Create your first post to see it here'
                    : `${posts.filter(p => p.isOwn).length} post${posts.filter(p => p.isOwn).length > 1 ? 's' : ''} created by you`}
                </Text>
              </View>
            </View>
          )}

          {/* Empty states */}
          {filteredPosts.length === 0 && feedTab === 'saved' && (
            <EmptyState
              emoji="🔖"
              title="No saved posts yet"
              subtitle="Tap the bookmark icon on any post to save it for later"
            />
          )}
          {filteredPosts.length === 0 && feedTab === 'mine' && (
            <EmptyState
              emoji="✏️"
              title="You haven't posted yet"
              subtitle={'Tap "Share Your Story" below to create your first post'}
            />
          )}

          {/* Posts */}
          {filteredPosts.map(post => renderPost(post))}

          <View style={{ height: 130 }} />
        </ScrollView>
      </Animated.View>

      {/* ── SHARE FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCompose(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>✏️</Text>
        <Text style={styles.fabText}>Share Your Story</Text>
      </TouchableOpacity>

      {/* ── BOTTOM NAV ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => {
          const isActive = activeNavTab === tab.key;
          const color = isActive ? COLORS.watermelon : COLORS.navInactive;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navTab}
              onPress={() => handleNavTab(tab.key)}
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

      {/* ── COMPOSE MODAL ── */}
      <Modal
        visible={showCompose}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCompose(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowCompose(false)}
          />
          <View style={styles.composeSheet}>
            <View style={styles.sheetHandle} />

            {/* Compose header */}
            <View style={styles.composeHeader}>
              <TouchableOpacity onPress={() => setShowCompose(false)}>
                <Text style={styles.composeCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.composeTitle}>New Post</Text>
              <TouchableOpacity
                style={[styles.composePostBtn, !postText.trim() && styles.composePostBtnDisabled]}
                onPress={handlePost}
                disabled={!postText.trim()}
              >
                <Text style={styles.composePostBtnText}>Post</Text>
              </TouchableOpacity>
            </View>

            {/* Input area */}
            <View style={styles.composeBody}>
              <View style={[styles.avatar, { backgroundColor: COLORS.watermelon, marginRight: 12, flexShrink: 0 }]}>
                <Text style={styles.avatarText}>Y</Text>
              </View>
              <TextInput
                style={styles.composeInput}
                placeholder="Share your thoughts, tips, or story with the community..."
                placeholderTextColor={COLORS.pastelPink}
                value={postText}
                onChangeText={setPostText}
                multiline
                autoFocus
                maxLength={280}
              />
            </View>

            {/* Char count */}
            <Text style={[styles.charCount, postText.length > 250 && styles.charCountWarn]}>
              {postText.length}/280
            </Text>

            {/* Tag selector */}
            <Text style={styles.tagSelectorLabel}>Tag your post:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tagScroll}
              contentContainerStyle={styles.tagScrollContent}
            >
              {POST_TAGS.map(tag => {
                const ts = getTagStyle(tag);
                const isSelected = selectedTag === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      { backgroundColor: ts.bg },
                      isSelected && { borderColor: ts.text, borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedTag(tag)}
                  >
                    {isSelected && <Text style={styles.tagOptionCheck}>✓ </Text>}
                    <Text style={[styles.tagOptionText, { color: ts.text }]}>{tag}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Bottom tools */}
            <View style={styles.composeBottomBar}>
              <TouchableOpacity style={styles.composeToolBtn}>
                <Text style={{ fontSize: 22 }}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.composeToolBtn}>
                <Text style={{ fontSize: 22 }}>🎤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.composeToolBtn}>
                <Text style={{ fontSize: 22 }}>😊</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <Text style={styles.composeHint}>Your post will appear in "My Stories"</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },

  // ── Header ──
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.watermelon, letterSpacing: 0.2 },
  headerSub: { fontSize: 12, color: COLORS.mutedText, fontWeight: '500', marginTop: 2 },
  bellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.watermelon, borderWidth: 1.5, borderColor: COLORS.white },

  // ── Feed Tabs ──
  feedTabsRow: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1.5, borderBottomColor: COLORS.pinkChampagne, backgroundColor: COLORS.lavenderBlush },
  feedTab: { marginRight: 20, paddingVertical: 12, position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 5 },
  feedTabText: { fontSize: 14, fontWeight: '600', color: COLORS.mutedText },
  feedTabTextActive: { color: COLORS.watermelon, fontWeight: '800' },
  feedTabUnderline: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: COLORS.watermelon, borderRadius: 2 },
  tabCountBadge: { backgroundColor: COLORS.watermelon, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 18, alignItems: 'center' },
  tabCountText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // ── Scroll ──
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  // ── Tab header banner ──
  tabHeaderBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.white, borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: COLORS.pinkChampagne },
  tabHeaderEmoji: { fontSize: 26 },
  tabHeaderTitle: { fontSize: 15, fontWeight: '800', color: COLORS.darkText },
  tabHeaderSub: { fontSize: 12, color: COLORS.mutedText, fontWeight: '400', marginTop: 2 },

  // ── Empty state ──
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20 },

  // ── Post Card ──
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  postCardOwn: {
    borderColor: COLORS.watermelon,
    borderWidth: 2,
    shadowOpacity: 0.14,
  },
  ownBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.lavenderBlush,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.pastelPink,
  },
  ownBadgeText: { fontSize: 11, color: COLORS.watermelon, fontWeight: '700' },

  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
  postUserInfo: { flex: 1, marginLeft: 10 },
  postUserName: { fontSize: 14, fontWeight: '800', color: COLORS.darkText },
  postMeta: { fontSize: 11, color: COLORS.mutedText, marginTop: 1 },
  tagBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  postContent: { fontSize: 14, color: COLORS.darkText, lineHeight: 22, marginBottom: 14 },

  // ── Actions ──
  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.lavenderBlush },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 16 },
  actionHeart: { fontSize: 18, color: COLORS.mutedText },
  actionHeartLiked: { color: COLORS.watermelon },
  actionEmoji: { fontSize: 17 },
  actionCount: { fontSize: 13, color: COLORS.mutedText, fontWeight: '600' },
  actionCountLiked: { color: COLORS.watermelon },
  saveBtn: { padding: 4 },

  // ── Saved indicator ──
  savedIndicator: { marginTop: 8, backgroundColor: COLORS.lavenderBlush, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-end' },
  savedIndicatorText: { fontSize: 11, color: COLORS.watermelon, fontWeight: '600' },

  // ── Comments ──
  commentsSection: { marginTop: 10 },
  commentsDivider: { height: 1, backgroundColor: COLORS.lavenderBlush, marginBottom: 12 },
  noComments: { fontSize: 12, color: COLORS.mutedText, textAlign: 'center', paddingVertical: 8 },
  commentRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  commentAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 },
  commentAvatarText: { color: COLORS.white, fontSize: 12, fontWeight: '800' },
  commentBubble: { flex: 1, backgroundColor: COLORS.lavenderBlush, borderRadius: 14, padding: 10 },
  commentUser: { fontSize: 12, fontWeight: '700', color: COLORS.darkText, marginBottom: 2 },
  commentTime: { fontSize: 10, color: COLORS.mutedText, fontWeight: '400' },
  commentText: { fontSize: 13, color: COLORS.darkText, lineHeight: 18 },
  addCommentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  commentInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.lavenderBlush, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: COLORS.pastelPink },
  commentInput: { flex: 1, fontSize: 13, color: COLORS.darkText, paddingVertical: 2 },
  commentSendBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.watermelon, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  commentSendText: { color: COLORS.white, fontSize: 14, fontWeight: '800' },

  // ── FAB ──
  fab: {
    position: 'absolute',
    bottom: 105,
    left: width / 2 - 90,
    width: 180,
    backgroundColor: COLORS.watermelon,
    borderRadius: 28,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 100,
  },
  fabIcon: { fontSize: 16 },
  fabText: { color: COLORS.white, fontSize: 14, fontWeight: '700' },

  // ── Bottom Nav ──
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

  // ── Compose Modal ──
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  composeSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.pinkChampagne, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  composeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.lavenderBlush },
  composeCancelText: { fontSize: 15, color: COLORS.mutedText, fontWeight: '600' },
  composeTitle: { fontSize: 16, fontWeight: '800', color: COLORS.darkText },
  composePostBtn: { backgroundColor: COLORS.watermelon, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  composePostBtnDisabled: { opacity: 0.4 },
  composePostBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  composeBody: { flexDirection: 'row', padding: 20, alignItems: 'flex-start' },
  composeInput: { flex: 1, fontSize: 15, color: COLORS.darkText, lineHeight: 24, minHeight: 90, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', paddingHorizontal: 20, fontSize: 12, color: COLORS.mutedText, marginBottom: 8 },
  charCountWarn: { color: COLORS.watermelon, fontWeight: '700' },
  tagSelectorLabel: { paddingHorizontal: 20, fontSize: 12, fontWeight: '700', color: COLORS.darkText, marginBottom: 8 },
  tagScroll: { marginBottom: 14 },
  tagScrollContent: { paddingHorizontal: 20, gap: 8 },
  tagOption: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  tagOptionCheck: { fontSize: 11, fontWeight: '800', color: COLORS.darkText },
  tagOptionText: { fontSize: 12, fontWeight: '700' },
  composeBottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.lavenderBlush, gap: 12 },
  composeToolBtn: { padding: 4 },
  composeHint: { fontSize: 11, color: COLORS.mutedText, fontStyle: 'italic' },
});