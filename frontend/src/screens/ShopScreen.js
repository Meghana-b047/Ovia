import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, Animated, Dimensions, StatusBar,
  TextInput, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

// ── Nav Icons (identical to all other screens) ──
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
const ShopNavIcon = ({ color, size = 28 }) => (
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
  { key: 'Shop',      label: 'Shop',      Icon: ShopNavIcon },
];

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

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
  amazon:        '#FF9900',
  flipkart:      '#2874F0',
  star:          '#FFB300',
};

// ── Icon components ──
const SearchIcon = ({ color = COLORS.mutedText, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
const CartIcon = ({ color = COLORS.watermelon, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="3" y1="6" x2="21" y2="6" stroke={color} strokeWidth="2"/>
    <Path d="M16 10a4 4 0 01-8 0" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);
const AmazonLogo = ({ size = 16 }) => (
  <Svg width={size * 2.8} height={size} viewBox="0 0 80 28" fill="none">
    <Text style={{ fontSize: 12, fontWeight: '900', fill: COLORS.amazon }}>amazon</Text>
  </Svg>
);

// ── Deep-link builders ──
const openAmazon = (query) => {
  const encoded = encodeURIComponent(query);
  const url = `https://www.amazon.in/s?k=${encoded}`;
  Linking.openURL(url).catch(() =>
    Alert.alert('Could not open Amazon', 'Please install the Amazon app or check your internet.')
  );
};

const openFlipkart = (query) => {
  const encoded = encodeURIComponent(query);
  const url = `https://www.flipkart.com/search?q=${encoded}`;
  Linking.openURL(url).catch(() =>
    Alert.alert('Could not open Flipkart', 'Please install the Flipkart app or check your internet.')
  );
};

// ── Category data ──
const CATEGORIES = [
  { key: 'all',        label: 'All',           emoji: '✨' },
  { key: 'pads',       label: 'Pads',          emoji: '🩺' },
  { key: 'tampons',    label: 'Tampons',        emoji: '🌿' },
  { key: 'cups',       label: 'Menstrual Cups', emoji: '🫙' },
  { key: 'cramps',     label: 'Cramp Relief',   emoji: '💊' },
  { key: 'skincare',   label: 'Skincare',       emoji: '🌸' },
  { key: 'wellness',   label: 'Wellness',       emoji: '🧘' },
  { key: 'intimate',   label: 'Intimate Care',  emoji: '🌺' },
];

// ── Product data ──
const PRODUCTS = [
  // Pads
  {
    id: '1', category: 'pads',
    emoji: '🌸', name: 'Whisper Ultra Soft XL',
    brand: 'Whisper', price: '₹189', originalPrice: '₹240',
    rating: 4.5, reviews: 12400, tag: 'Best Seller',
    tagColor: '#E91E63', desc: 'Ultra soft wings, 8hr protection',
    amazonQuery: 'Whisper Ultra Soft XL pads',
    flipkartQuery: 'Whisper Ultra Soft sanitary pads',
  },
  {
    id: '2', category: 'pads',
    emoji: '🩷', name: 'Stayfree Secure XL',
    brand: 'Stayfree', price: '₹165', originalPrice: '₹200',
    rating: 4.3, reviews: 8700, tag: 'Organic',
    tagColor: '#4CAF50', desc: 'Cottony soft, overnight protection',
    amazonQuery: 'Stayfree Secure XL overnight pads',
    flipkartQuery: 'Stayfree Secure sanitary pads',
  },
  {
    id: '3', category: 'pads',
    emoji: '💚', name: 'Sirona Organic Pads',
    brand: 'Sirona', price: '₹299', originalPrice: '₹349',
    rating: 4.7, reviews: 5200, tag: '100% Organic',
    tagColor: '#4CAF50', desc: 'Chemical-free, biodegradable',
    amazonQuery: 'Sirona organic sanitary pads',
    flipkartQuery: 'Sirona organic pads women',
  },
  {
    id: '4', category: 'pads',
    emoji: '🌙', name: 'Sofy Bodyfit Night',
    brand: 'Sofy', price: '₹149', originalPrice: '₹180',
    rating: 4.2, reviews: 6100, tag: 'Night Use',
    tagColor: '#3F51B5', desc: 'Extra long, leak-proof sides',
    amazonQuery: 'Sofy Bodyfit Night pads',
    flipkartQuery: 'Sofy Bodyfit overnight pads',
  },
  // Tampons
  {
    id: '5', category: 'tampons',
    emoji: '🌿', name: 'Tampax Pearl Regular',
    brand: 'Tampax', price: '₹450', originalPrice: '₹550',
    rating: 4.4, reviews: 3200, tag: 'Top Rated',
    tagColor: '#9C27B0', desc: 'LeakGuard braid, smooth insertion',
    amazonQuery: 'Tampax Pearl Regular tampons India',
    flipkartQuery: 'Tampax tampons regular',
  },
  {
    id: '6', category: 'tampons',
    emoji: '🍃', name: 'Sirona Applicator Tampons',
    brand: 'Sirona', price: '₹399', originalPrice: '₹479',
    rating: 4.5, reviews: 2800, tag: 'New',
    tagColor: '#00BCD4', desc: 'Easy applicator, 8hr comfort',
    amazonQuery: 'Sirona applicator tampons',
    flipkartQuery: 'Sirona tampons applicator women',
  },
  // Menstrual cups
  {
    id: '7', category: 'cups',
    emoji: '🫙', name: 'Sirona Menstrual Cup',
    brand: 'Sirona', price: '₹549', originalPrice: '₹799',
    rating: 4.6, reviews: 9100, tag: 'Eco-Friendly',
    tagColor: '#4CAF50', desc: 'Medical grade silicone, reusable',
    amazonQuery: 'Sirona menstrual cup',
    flipkartQuery: 'Sirona menstrual cup reusable',
  },
  {
    id: '8', category: 'cups',
    emoji: '💜', name: 'Pee Safe Menstrual Cup',
    brand: 'Pee Safe', price: '₹499', originalPrice: '₹699',
    rating: 4.5, reviews: 7600, tag: 'Best Value',
    tagColor: '#FF9800', desc: '12hr protection, soft & flexible',
    amazonQuery: 'Pee Safe menstrual cup',
    flipkartQuery: 'Pee Safe menstrual cup women',
  },
  // Cramp relief
  {
    id: '9', category: 'cramps',
    emoji: '🔥', name: 'Soothe Period Patch',
    brand: 'Sirona', price: '₹249', originalPrice: '₹299',
    rating: 4.4, reviews: 4400, tag: 'Drug-Free',
    tagColor: '#F44336', desc: 'Heat therapy, stick-on patch',
    amazonQuery: 'period pain relief heat patch',
    flipkartQuery: 'period cramp relief patch heat',
  },
  {
    id: '10', category: 'cramps',
    emoji: '💊', name: 'Meftal Spas Tablets',
    brand: 'Meftal', price: '₹89', originalPrice: '₹120',
    rating: 4.3, reviews: 18200, tag: '#1 Period Pain',
    tagColor: '#E91E63', desc: 'Fast cramp & spasm relief',
    amazonQuery: 'Meftal Spas tablets period pain',
    flipkartQuery: 'Meftal Spas period cramp tablets',
  },
  {
    id: '11', category: 'cramps',
    emoji: '🌿', name: 'Gynoveda Period Wellness',
    brand: 'Gynoveda', price: '₹699', originalPrice: '₹999',
    rating: 4.5, reviews: 6800, tag: 'Ayurvedic',
    tagColor: '#8BC34A', desc: 'Ayurvedic herbs, hormone balance',
    amazonQuery: 'Gynoveda period wellness tablets',
    flipkartQuery: 'Gynoveda period pain ayurvedic',
  },
  {
    id: '12', category: 'cramps',
    emoji: '🛁', name: 'Bengay Pain Relief Cream',
    brand: 'Bengay', price: '₹199', originalPrice: '₹250',
    rating: 4.1, reviews: 3100, tag: 'Topical',
    tagColor: '#FF5722', desc: 'Cooling menthol relief cream',
    amazonQuery: 'Bengay pain relief cream period',
    flipkartQuery: 'pain relief cream cramps women',
  },
  // Skincare
  {
    id: '13', category: 'skincare',
    emoji: '🌸', name: 'Plum Hormonal Acne Gel',
    brand: 'Plum', price: '₹395', originalPrice: '₹450',
    rating: 4.4, reviews: 5600, tag: 'Hormone Acne',
    tagColor: '#9C27B0', desc: 'Targets cycle-related breakouts',
    amazonQuery: 'Plum hormonal acne gel women',
    flipkartQuery: 'Plum acne gel hormonal skincare',
  },
  {
    id: '14', category: 'skincare',
    emoji: '✨', name: 'Dot & Key Body Butter',
    brand: 'Dot & Key', price: '₹449', originalPrice: '₹549',
    rating: 4.6, reviews: 7200, tag: 'Self-Care',
    tagColor: '#FF9800', desc: 'Period bloat & skin nourishment',
    amazonQuery: 'Dot and Key body butter women',
    flipkartQuery: 'Dot Key body butter moisturizer',
  },
  // Wellness
  {
    id: '15', category: 'wellness',
    emoji: '💊', name: 'Iron + Folic Acid Tablets',
    brand: 'TrueBasics', price: '₹349', originalPrice: '₹499',
    rating: 4.5, reviews: 11200, tag: 'Daily Essential',
    tagColor: '#F44336', desc: 'Replenish iron lost during period',
    amazonQuery: 'iron folic acid tablets women period',
    flipkartQuery: 'TrueBasics iron folic acid women',
  },
  {
    id: '16', category: 'wellness',
    emoji: '🌺', name: 'Wellbeing Nutrition Magnesium',
    brand: 'WN', price: '₹699', originalPrice: '₹899',
    rating: 4.6, reviews: 4300, tag: 'PMS Relief',
    tagColor: '#673AB7', desc: 'Reduces PMS & muscle cramps',
    amazonQuery: 'magnesium supplement PMS women India',
    flipkartQuery: 'magnesium PMS relief women supplement',
  },
  // Intimate care
  {
    id: '17', category: 'intimate',
    emoji: '🌺', name: 'Pee Safe Intimate Wash',
    brand: 'Pee Safe', price: '₹299', originalPrice: '₹399',
    rating: 4.5, reviews: 8900, tag: 'pH Balanced',
    tagColor: '#E91E63', desc: 'Gentle, fragrance-free formula',
    amazonQuery: 'Pee Safe intimate wash women pH',
    flipkartQuery: 'Pee Safe intimate wash feminine',
  },
  {
    id: '18', category: 'intimate',
    emoji: '🫧', name: 'Sirona Intimate Wipes',
    brand: 'Sirona', price: '₹199', originalPrice: '₹249',
    rating: 4.3, reviews: 5400, tag: 'On-The-Go',
    tagColor: '#00ACC1', desc: 'Travel-friendly, dermatologist tested',
    amazonQuery: 'Sirona intimate wipes women',
    flipkartQuery: 'Sirona intimate wipes feminine care',
  },
];

// ── Featured banner data ──
const BANNERS = [
  { id: '1', title: 'Period Essentials Kit', subtitle: 'Pads + Cramp relief + Wipes', emoji: '🌸', bg: '#FFE5EC', accent: '#FB6F92', query: 'period essentials kit women India' },
  { id: '2', title: 'Switch to Organic', subtitle: 'Chemical-free period products', emoji: '🌿', bg: '#E8F5E9', accent: '#4CAF50', query: 'organic period products India' },
  { id: '3', title: 'Menstrual Cup Starter', subtitle: 'Save money & the planet', emoji: '♻️', bg: '#E3F2FD', accent: '#1E88E5', query: 'menstrual cup starter kit India' },
];

// ── Star rating component ──
const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Text key={i} style={{ fontSize: 10, color: i < full ? COLORS.star : i === full && half ? COLORS.star : COLORS.pastelPink }}>
          {i < full ? '★' : i === full && half ? '⯨' : '★'}
        </Text>
      ))}
    </View>
  );
};

export default function ShopScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Shop');

  const handleNavTab = (key) => {
    setActiveTab(key);
    if (key === 'Dashboard') navigation.navigate('Home');
    if (key === 'Calendar')  navigation.navigate('Calendar');
    if (key === 'Doctor')    navigation.navigate('Doctor');
    if (key === 'Social')    navigation.navigate('Social');
  };
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const bannerAnim  = useRef(new Animated.Value(0)).current;
  const bannerScroll = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    // Auto-scroll banners
    const timer = setInterval(() => {
      setBannerIndex(prev => {
        const next = (prev + 1) % BANNERS.length;
        bannerScroll.current?.scrollTo({ x: next * (width - 40), animated: true });
        return next;
      });
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const filtered = PRODUCTS.filter(p => {
    const matchCat    = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchText.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchText.toLowerCase()) ||
                        p.desc.toLowerCase().includes(searchText.toLowerCase());
    return matchCat && matchSearch;
  });

  const openProduct = (product, platform) => {
    if (platform === 'amazon') {
      openAmazon(product.amazonQuery);
    } else {
      openFlipkart(product.flipkartQuery);
    }
  };

  const renderProduct = ({ item: p }) => (
    <Animated.View key={p.id} style={[styles.productCard, { opacity: fadeAnim }]}>
      {/* Tag */}
      {p.tag && (
        <View style={[styles.productTag, { backgroundColor: p.tagColor }]}>
          <Text style={styles.productTagText}>{p.tag}</Text>
        </View>
      )}

      {/* Emoji thumbnail */}
      <View style={[styles.productThumb, { backgroundColor: p.tagColor + '18' }]}>
        <Text style={styles.productEmoji}>{p.emoji}</Text>
      </View>

      {/* Info */}
      <Text style={styles.productBrand}>{p.brand}</Text>
      <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
      <Text style={styles.productDesc} numberOfLines={2}>{p.desc}</Text>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Stars rating={p.rating} />
        <Text style={styles.reviewCount}>({(p.reviews / 1000).toFixed(1)}k)</Text>
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={styles.price}>{p.price}</Text>
        <Text style={styles.originalPrice}>{p.originalPrice}</Text>
        <Text style={styles.discount}>
          {Math.round((1 - parseInt(p.price.slice(1)) / parseInt(p.originalPrice.slice(1))) * 100)}% off
        </Text>
      </View>

      {/* Buy buttons */}
      <View style={styles.buyButtons}>
        <TouchableOpacity
          style={styles.amazonBtn}
          onPress={() => openProduct(p, 'amazon')}
          activeOpacity={0.85}
        >
          <Text style={styles.amazonBtnText}>🛒 Amazon</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.flipkartBtn}
          onPress={() => openProduct(p, 'flipkart')}
          activeOpacity={0.85}
        >
          <Text style={styles.flipkartBtnText}>⚡ Flipkart</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.lavenderBlush} />
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shop 🛍️</Text>
          <Text style={styles.headerSub}>Period & wellness essentials</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={{ fontSize: 18 }}>🔔</Text>
          <View style={styles.bellDot} />
        </TouchableOpacity>
      </View>

      {/* ── SEARCH ── */}
      <View style={styles.searchBar}>
        <SearchIcon />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pads, tampons, cramp relief..."
          placeholderTextColor={COLORS.pastelPink}
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={{ color: COLORS.mutedText, fontSize: 14, paddingLeft: 8 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim }}
      >
        {/* ── FEATURED BANNERS ── */}
        {!searchText && (
          <View style={styles.bannerSection}>
            <ScrollView
              ref={bannerScroll}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => {
                setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 40)));
              }}
            >
              {BANNERS.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.banner, { backgroundColor: b.bg, borderColor: b.accent + '60', width: width - 40 }]}
                  onPress={() => openAmazon(b.query)}
                  activeOpacity={0.88}
                >
                  <View style={[styles.bannerBlobLeft, { backgroundColor: b.accent + '25' }]} />
                  <View style={[styles.bannerBlobRight, { backgroundColor: b.accent + '18' }]} />
                  <Text style={styles.bannerEmoji}>{b.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bannerTitle, { color: b.accent }]}>{b.title}</Text>
                    <Text style={styles.bannerSub}>{b.subtitle}</Text>
                    <View style={[styles.bannerBtn, { backgroundColor: b.accent }]}>
                      <Text style={styles.bannerBtnText}>Shop on Amazon →</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Dots */}
            <View style={styles.bannerDots}>
              {BANNERS.map((_, i) => (
                <View key={i} style={[styles.bannerDot, i === bannerIndex && styles.bannerDotActive]} />
              ))}
            </View>
          </View>
        )}

        {/* ── CATEGORY CHIPS ── */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.key}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsList}
          renderItem={({ item: c }) => {
            const isActive = activeCategory === c.key;
            return (
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCategory(c.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* ── RESULTS COUNT ── */}
        <View style={styles.resultsRow}>
          <Text style={styles.resultsCount}>{filtered.length} products</Text>
          <TouchableOpacity
            style={styles.amazonAllBtn}
            onPress={() => openAmazon(
              activeCategory === 'all' ? 'period products women India' :
              CATEGORIES.find(c => c.key === activeCategory)?.label + ' women India'
            )}
          >
            <Text style={styles.amazonAllBtnText}>🛒 See all on Amazon</Text>
          </TouchableOpacity>
        </View>

        {/* ── PRODUCT GRID ── */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>Try a different search or category</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filtered.map(p => <React.Fragment key={p.id}>{renderProduct({ item: p })}</React.Fragment>)}
          </View>
        )}

        {/* ── DISCLAIMER ── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            🔗 Ovia links to Amazon & Flipkart for your convenience. We don't sell products directly. Prices & availability may vary.
          </Text>
        </View>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* ── BOTTOM NAV — identical spacing to all other screens ── */}
      <View style={styles.bottomNav}>
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
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
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.pinkChampagne, opacity: 0.35, top: -60, right: -60 },
  blob2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.pastelPink, opacity: 0.2, bottom: 120, left: -40 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.darkText },
  headerSub: { fontSize: 12, color: COLORS.mutedText, fontWeight: '500', marginTop: 2 },
  bellBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.pinkChampagne, position: 'relative' },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.watermelon, borderWidth: 1.5, borderColor: COLORS.white },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: COLORS.pastelPink },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.darkText, marginLeft: 8 },

  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },

  // Featured banners
  bannerSection: { marginBottom: 18 },
  banner: { borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, overflow: 'hidden', position: 'relative', marginRight: 0 },
  bannerBlobLeft: { position: 'absolute', left: -20, top: -20, width: 100, height: 100, borderRadius: 50 },
  bannerBlobRight: { position: 'absolute', right: -20, bottom: -20, width: 80, height: 80, borderRadius: 40 },
  bannerEmoji: { fontSize: 46, zIndex: 2 },
  bannerTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  bannerSub: { fontSize: 12, color: COLORS.mutedText, marginBottom: 10 },
  bannerBtn: { alignSelf: 'flex-start', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  bannerBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.pastelPink },
  bannerDotActive: { backgroundColor: COLORS.watermelon, width: 18, borderRadius: 3 },

  // Category chips
  chipsList: { flexGrow: 0, marginBottom: 16 },
  chipsContainer: { paddingVertical: 4, paddingRight: 20 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 50, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.pastelPink, marginRight: 10 },
  chipActive: { backgroundColor: COLORS.watermelon, borderColor: COLORS.watermelon, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.mutedText },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },

  // Results row
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultsCount: { fontSize: 12, color: COLORS.mutedText, fontWeight: '600' },
  amazonAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: COLORS.amazon },
  amazonAllBtnText: { fontSize: 11, color: COLORS.amazon, fontWeight: '700' },

  // Product grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },

  // Product card
  productCard: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: 20, padding: 14,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
    position: 'relative', overflow: 'hidden',
    marginBottom: 0,
  },
  productTag: { position: 'absolute', top: 10, right: 10, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3, zIndex: 2 },
  productTagText: { color: COLORS.white, fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },
  productThumb: { width: '100%', height: 90, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productEmoji: { fontSize: 42 },
  productBrand: { fontSize: 9, color: COLORS.mutedText, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 },
  productName: { fontSize: 13, fontWeight: '800', color: COLORS.darkText, marginBottom: 4, lineHeight: 17 },
  productDesc: { fontSize: 10, color: COLORS.mutedText, lineHeight: 14, marginBottom: 7 },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 7 },
  reviewCount: { fontSize: 9, color: COLORS.mutedText, fontWeight: '500' },

  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.darkText },
  originalPrice: { fontSize: 11, color: COLORS.mutedText, textDecorationLine: 'line-through' },
  discount: { fontSize: 10, color: '#4CAF50', fontWeight: '700' },

  buyButtons: { gap: 7 },
  amazonBtn: { backgroundColor: COLORS.amazon, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  amazonBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  flipkartBtn: { backgroundColor: COLORS.flipkart, borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  flipkartBtnText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.darkText, marginBottom: 6 },
  emptySub: { fontSize: 13, color: COLORS.mutedText },

  // Disclaimer
  disclaimer: { backgroundColor: COLORS.white, borderRadius: 14, padding: 14, marginTop: 8, borderWidth: 1, borderColor: COLORS.pinkChampagne },
  disclaimerText: { fontSize: 11, color: COLORS.mutedText, lineHeight: 16, textAlign: 'center' },

  // ── Bottom Nav (matches all other screens exactly) ──
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingBottom: 28,
    paddingTop: 10,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.pinkChampagne,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 16,
    minHeight: 72,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
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