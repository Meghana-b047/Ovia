import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, StatusBar,
  Animated, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line } from 'react-native-svg';

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
  bubbleUser: '#FB6F92',
  bubbleBot: '#FFFFFF',
};

// ─────────────────────────────────────────────────────
// System prompt — scopes Ovia AI to women's health
// ─────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Ovia AI, a compassionate and knowledgeable women's health assistant built into the Ovia period and health tracking app. 

You specialize in:
- Menstrual cycle health, period pain relief, cycle tracking
- PCOS and PCOD symptoms, management, and lifestyle advice
- Pregnancy questions, prenatal care, postpartum recovery
- Endometriosis, fibroids, and hormonal conditions
- Nutrition, exercise, and lifestyle for women's hormonal health
- Mental health and emotional wellbeing related to hormonal cycles
- General health questions women commonly ask

Guidelines:
- Be warm, empathetic, and non-judgmental
- Give practical, evidence-based answers
- Always remind users to consult a doctor for medical diagnosis or treatment
- Keep responses concise and easy to read — use bullet points when helpful
- Use light, supportive language
- You can respond in the language the user writes in

You are NOT a replacement for medical advice. Always recommend professional consultation for serious symptoms.`;

// ─────────────────────────────────────────────────────
// Anthropic API call
// ─────────────────────────────────────────────────────
async function callClaudeAPI(messages) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': '', // Handled by proxy — leave empty
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error.message || 'API error');

  return data.content?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again.";
}

// ── Chat Bubble Heart (matches HomeScreen FAB) ──
const ChatBubbleHeart = ({ size = 32 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 120 106" fill="none">
    <Path
      d="M60 4 C28 4, 4 22, 4 46 C4 67, 24 82, 50 85 C52 85, 53 88, 52 98 C52 100, 54 101, 55 99 C62 90, 68 87, 72 85 C97 82, 116 66, 116 46 C116 22, 92 4, 60 4 Z"
      fill="#FB6F92"
    />
    <Path
      d="M30 14 C38 10, 50 8, 62 9 C74 10, 84 14, 88 20 C80 16, 68 13, 56 13 C44 13, 34 16, 30 14 Z"
      fill="rgba(255,255,255,0.35)"
    />
    <Path
      d="M60 68 C60 68, 36 54, 36 40 C36 32, 42 26, 50 28 C54 29, 58 32, 60 36 C62 32, 66 29, 70 28 C78 26, 84 32, 84 40 C84 54, 60 68, 60 68 Z"
      fill="rgba(255,200,215,0.85)"
    />
    <Path
      d="M60 62 C60 62, 42 50, 42 40 C42 35, 46 31, 51 33 C55 34, 58 37, 60 40 C62 37, 65 34, 69 33 C74 31, 78 35, 78 40 C78 50, 60 62, 60 62 Z"
      fill="rgba(255,230,235,0.6)"
    />
  </Svg>
);

// ── Quick suggestion chips ──
const QUICK_CHIPS = [
  'What helps with period cramps?',
  'PCOS diet tips',
  'When am I most fertile?',
  'Pregnancy safe exercises',
  'How to track my cycle?',
  'Manage bloating during period',
];

// ── Typing indicator ──
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    anim(dot1, 0).start();
    anim(dot2, 150).start();
    anim(dot3, 300).start();
  }, []);

  return (
    <View style={styles.typingBubble}>
      {[dot1, dot2, dot3].map((d, i) => (
        <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: d }] }]} />
      ))}
    </View>
  );
};

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Ovia AI 🌸 Your personal women's health companion.\n\nAsk me anything about your cycle, PCOS, pregnancy, nutrition, or general health. I'm here to help!",
      time: 'Now',
    },
  ]);
  const [inputText, setInputText]   = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [showChips, setShowChips]   = useState(true);
  const scrollRef = useRef(null);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const inputRef  = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed || isLoading) return;

    setInputText('');
    setShowChips(false);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      // Build conversation history for API (exclude first greeting from API call)
      const apiHistory = updatedMessages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const reply = await callClaudeAPI(apiHistory);

      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again 💕",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user';
    return (
      <View key={msg.id} style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}>
        {/* Bot avatar */}
        {!isUser && (
          <View style={styles.botAvatar}>
            <ChatBubbleHeart size={28} />
          </View>
        )}

        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot, msg.isError && styles.bubbleError]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
            {msg.content}
          </Text>
          <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeBot]}>
            {msg.time}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.watermelon} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.botAvatarHeader}>
            <ChatBubbleHeart size={34} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ovia AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online · Always here for you</Text>
            </View>
          </View>
        </View>

        {/* Clear chat */}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => {
            setMessages([{
              id: '0', role: 'assistant',
              content: "Hi! I'm Ovia AI 🌸 Your personal women's health companion.\n\nAsk me anything about your cycle, PCOS, pregnancy, nutrition, or general health. I'm here to help!",
              time: 'Now',
            }]);
            setShowChips(true);
          }}
        >
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* ── MESSAGES ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.ScrollView
          ref={scrollRef}
          style={[styles.messagesList, { opacity: fadeAnim }]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(renderMessage)}

          {/* Typing indicator */}
          {isLoading && (
            <View style={styles.msgRowBot}>
              <View style={styles.botAvatar}>
                <ChatBubbleHeart size={28} />
              </View>
              <TypingIndicator />
            </View>
          )}

          {/* Quick chips — only shown at start */}
          {showChips && !isLoading && (
            <View style={styles.chipsSection}>
              <Text style={styles.chipsSectionLabel}>💡 Try asking:</Text>
              <View style={styles.chipsWrap}>
                {QUICK_CHIPS.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickChip}
                    onPress={() => sendMessage(chip)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.quickChipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 12 }} />
        </Animated.ScrollView>

        {/* ── INPUT BAR ── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask Ovia AI anything..."
              placeholderTextColor={COLORS.pastelPink}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.sendBtnText}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.disclaimer}>
            Ovia AI provides health information, not medical advice. Always consult a doctor.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },

  // Header
  header: {
    backgroundColor: COLORS.watermelon,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: COLORS.watermelon,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { color: COLORS.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  botAvatarHeader: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#69F0AE' },
  onlineText: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7,
  },
  clearBtnText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // Messages
  messagesList: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  messagesContent: { paddingHorizontal: 16, paddingTop: 16 },

  msgRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot:  { justifyContent: 'flex-start' },

  botAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    marginRight: 8, flexShrink: 0,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
    shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },

  bubble: {
    maxWidth: width * 0.72,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  bubbleUser: {
    backgroundColor: COLORS.bubbleUser,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: COLORS.bubbleBot,
    borderBottomLeftRadius: 4,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
  },
  bubbleError: {
    backgroundColor: '#FFF3E0', borderColor: '#FFCC80',
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  bubbleTextUser: { color: COLORS.white, fontWeight: '400' },
  bubbleTextBot:  { color: COLORS.darkText },
  bubbleTime: { fontSize: 10, marginTop: 6 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  bubbleTimeBot:  { color: COLORS.pastelPink },

  // Typing
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1.5, borderColor: COLORS.pinkChampagne,
  },
  typingDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.pastelPink,
  },

  // Quick chips
  chipsSection: { marginTop: 8, marginBottom: 4 },
  chipsSectionLabel: { fontSize: 12, color: COLORS.mutedText, fontWeight: '600', marginBottom: 10, marginLeft: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    backgroundColor: COLORS.white, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1.5, borderColor: COLORS.pastelPink,
    shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 2,
  },
  quickChipText: { fontSize: 12, color: COLORS.watermelon, fontWeight: '700' },

  // Input
  inputBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1, borderTopColor: COLORS.pinkChampagne,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 10,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: COLORS.lavenderBlush, borderRadius: 28,
    paddingLeft: 18, paddingRight: 6, paddingVertical: 6,
    borderWidth: 1.5, borderColor: COLORS.pastelPink,
    marginBottom: 8,
  },
  input: {
    flex: 1, fontSize: 15, color: COLORS.darkText,
    maxHeight: 100, paddingVertical: 6,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.watermelon,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
    shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35, shadowRadius: 6, elevation: 5,
  },
  sendBtnDisabled: { backgroundColor: COLORS.pastelPink, shadowOpacity: 0 },
  sendBtnText: { color: COLORS.white, fontSize: 20, fontWeight: '700' },
  disclaimer: {
    fontSize: 10, color: COLORS.mutedText,
    textAlign: 'center', lineHeight: 14,
  },
});