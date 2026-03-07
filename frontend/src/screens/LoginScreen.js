import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ Import shared user store from HomeScreen
import { setUserName } from './HomeScreen';
// ✅ Import shared email store from ProfileScreen
import { setUserEmail } from './ProfileScreen';

const { width, height } = Dimensions.get('window');

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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD:ovia/src/screens/LoginScreen.js
  const handleLogin = () => {
    if (validate()) {
      // ✅ Derive a display name from the email (e.g. "maya@example.com" → "Maya")
      // In a real app this would come from your backend/auth response
      const emailPrefix = email.trim().split('@')[0];
      const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1).replace(/[._\-]/g, ' ');

      setUserName(displayName);
      setUserEmail(email.trim().toLowerCase());

      // Navigate to Home and clear stack so back-button doesn't return to Login
      navigation.replace('Home');
=======
  const handleLogin = async () => {
  if (validate()) {
    try {
      const data = await apiFetch('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      navigation.replace(data.onboarding_complete ? 'Home' : 'Onboarding');
    } catch (err) {
      alert(err.detail || 'Login failed');
>>>>>>> 22be4ce (connect frontend and backend):frontend/src/screens/LoginScreen.js
    }
  }
};

  const renderInput = ({
    label, value, onChangeText, placeholder,
    keyboardType = 'default', fieldKey,
    isPassword = false, icon,
  }) => {
    const isFocused = focusedField === fieldKey;
    const hasError = !!errors[fieldKey];
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}>
          <Text style={styles.inputIcon}>{icon}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(text) => {
              onChangeText(text);
              if (errors[fieldKey]) setErrors({ ...errors, [fieldKey]: null });
            }}
            placeholder={placeholder}
            placeholderTextColor={COLORS.pastelPink}
            keyboardType={keyboardType}
            secureTextEntry={isPassword && !showPassword}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField('')}
            autoCapitalize="none"
          />
          {isPassword && (
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.errorText}>⚠ {errors[fieldKey]}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Blobs */}
          <View style={styles.blobTopRight} />
          <View style={styles.blobBottomLeft} />
          <View style={styles.blobTopLeft} />

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>🔑</Text>
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue your health journey with Ovia</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {renderInput({
              label: 'Email Address', value: email, onChangeText: setEmail,
              placeholder: 'Enter your email', keyboardType: 'email-address',
              fieldKey: 'email', icon: '✉️',
            })}
            {renderInput({
              label: 'Password', value: password, onChangeText: setPassword,
              placeholder: 'Enter your password', fieldKey: 'password',
              isPassword: true, icon: '🔒',
            })}

            {/* Forgot password */}
            <TouchableOpacity style={styles.forgotBtn} onPress={() => alert('Forgot Password coming soon!')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginBtnText}>Log In</Text>
              <Text style={styles.loginBtnArrow}>→</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google login */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.lavenderBlush },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  blobTopRight: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.pinkChampagne, opacity: 0.45, top: -70, right: -70 },
  blobBottomLeft: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.pastelPink, opacity: 0.3, bottom: 40, left: -50 },
  blobTopLeft: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.lightPink, opacity: 0.12, top: 60, left: -20 },
  header: { alignItems: 'center', marginBottom: 36, marginTop: 8 },
  backBtn: { alignSelf: 'flex-start', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 20, borderWidth: 1.5, borderColor: COLORS.pinkChampagne, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 2 },
  backArrow: { fontSize: 14, color: COLORS.watermelon, fontWeight: '700' },
  iconBadge: { width: 68, height: 68, borderRadius: 34, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5, borderWidth: 2, borderColor: COLORS.pinkChampagne },
  iconBadgeText: { fontSize: 32 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.darkText, marginBottom: 8, letterSpacing: 0.3 },
  subtitle: { fontSize: 14, color: COLORS.mutedText, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  form: { gap: 4 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.darkText, marginBottom: 6, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.pastelPink, paddingHorizontal: 14, paddingVertical: 4, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  inputWrapperFocused: { borderColor: COLORS.watermelon, shadowOpacity: 0.2, elevation: 4, shadowColor: COLORS.watermelon },
  inputWrapperError: { borderColor: COLORS.error },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: COLORS.darkText, paddingVertical: 12, fontWeight: '400' },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4, marginLeft: 4, fontWeight: '500' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { fontSize: 13, color: COLORS.watermelon, fontWeight: '700' },
  loginBtn: { backgroundColor: COLORS.watermelon, borderRadius: 50, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, marginBottom: 20 },
  loginBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  loginBtnArrow: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.pinkChampagne },
  dividerText: { color: COLORS.mutedText, fontSize: 13, fontWeight: '500' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 50, paddingVertical: 16, borderWidth: 1.5, borderColor: COLORS.pastelPink, gap: 10, marginBottom: 28, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: COLORS.watermelon },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.darkText },
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.mutedText },
  registerLink: { fontSize: 14, color: COLORS.watermelon, fontWeight: '800' },
});