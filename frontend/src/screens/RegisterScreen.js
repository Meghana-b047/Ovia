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
import { apiFetch } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
<<<<<<< HEAD
=======

// ✅ Import shared user store from HomeScreen
import { setUserName } from './HomeScreen';
// ✅ Import shared email store from ProfileScreen
import { setUserEmail } from './ProfileScreen';
>>>>>>> backend

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

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!age.trim()) newErrors.age = 'Age is required';
    else if (isNaN(age) || parseInt(age) < 10 || parseInt(age) > 60) newErrors.age = 'Enter a valid age (10–60)';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< HEAD
  const handleRegister = async () => {
  if (validate()) {
    try {
      const data = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          age: parseInt(age),
          password,
          confirm_password: confirmPassword,
        }),
      });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      navigation.replace(data.onboarding_complete ? 'Home' : 'Onboarding');
    } catch (err) {
      alert(err.detail || 'Registration failed');
    }
  }
};
=======
<<<<<<< HEAD:ovia/src/screens/RegisterScreen.js
  const handleRegister = () => {
    if (validate()) {
      // ✅ Store user name + email so HomeScreen greeting and Profile show correct info
      setUserName(fullName.trim());
      setUserEmail(email.trim().toLowerCase());
>>>>>>> backend

      // Navigate to Home and clear stack so back-button doesn't return to Register
      navigation.replace('Home');
=======
  const handleRegister = async () => {
  if (validate()) {
    try {
      const data = await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          age: parseInt(age),
          password,
          confirm_password: confirmPassword,
        }),
      });
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('refresh_token', data.refresh_token);
      navigation.replace(data.onboarding_complete ? 'Home' : 'Onboarding');
    } catch (err) {
      alert(err.detail || 'Registration failed');
>>>>>>> 22be4ce (connect frontend and backend):frontend/src/screens/RegisterScreen.js
    }
  }
};

  const renderInput = ({
    label, value, onChangeText, placeholder,
    keyboardType = 'default', fieldKey,
    isPassword = false, showPass, toggleShow, icon,
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
            secureTextEntry={isPassword && !showPass}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField('')}
            autoCapitalize={isPassword || keyboardType === 'email-address' ? 'none' : 'words'}
          />
          {isPassword && (
            <TouchableOpacity onPress={toggleShow} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
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

          {/* Header */}
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>🌸</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Ovia and take control of your health journey</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

<<<<<<< HEAD
=======
<<<<<<< HEAD:ovia/src/screens/RegisterScreen.js
            {renderInput({
              label: 'Full Name', value: fullName, onChangeText: setFullName,
              placeholder: 'Enter your full name', fieldKey: 'fullName', icon: '👤',
            })}
            {renderInput({
              label: 'Email Address', value: email, onChangeText: setEmail,
              placeholder: 'Enter your email', keyboardType: 'email-address',
              fieldKey: 'email', icon: '✉️',
            })}
            {renderInput({
              label: 'Age', value: age, onChangeText: setAge,
              placeholder: 'Enter your age', keyboardType: 'numeric',
              fieldKey: 'age', icon: '🎂',
            })}
            {renderInput({
              label: 'Password', value: password, onChangeText: setPassword,
              placeholder: 'Create a password', fieldKey: 'password',
              isPassword: true, showPass: showPassword,
              toggleShow: () => setShowPassword(!showPassword), icon: '🔒',
            })}
            {renderInput({
              label: 'Confirm Password', value: confirmPassword, onChangeText: setConfirmPassword,
              placeholder: 'Re-enter your password', fieldKey: 'confirmPassword',
              isPassword: true, showPass: showConfirmPassword,
              toggleShow: () => setShowConfirmPassword(!showConfirmPassword), icon: '🔒',
            })}
=======
>>>>>>> backend
            {renderInput({ label: 'Full Name', value: fullName, onChangeText: setFullName, placeholder: 'Enter your full name', fieldKey: 'fullName'})}
            {renderInput({ label: 'Email Address', value: email, onChangeText: setEmail, placeholder: 'Enter your email', keyboardType: 'email-address', fieldKey: 'email' })}
            {renderInput({ label: 'Age', value: age, onChangeText: setAge, placeholder: 'Enter your age', keyboardType: 'numeric', fieldKey: 'age' })}
            {renderInput({ label: 'Password', value: password, onChangeText: setPassword, placeholder: 'Create a password', fieldKey: 'password', isPassword: true, showPass: showPassword, toggleShow: () => setShowPassword(!showPassword) })}
            {renderInput({ label: 'Confirm Password', value: confirmPassword, onChangeText: setConfirmPassword, placeholder: 'Re-enter your password', fieldKey: 'confirmPassword', isPassword: true, showPass: showConfirmPassword, toggleShow: () => setShowConfirmPassword(!showConfirmPassword)})}
<<<<<<< HEAD
=======
>>>>>>> 22be4ce (connect frontend and backend):frontend/src/screens/RegisterScreen.js
>>>>>>> backend

            {/* Password strength */}
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={[styles.strengthBar, { backgroundColor: password.length >= 6 ? COLORS.lightPink : COLORS.pastelPink }]} />
                <View style={[styles.strengthBar, { backgroundColor: password.length >= 8 ? COLORS.watermelon : COLORS.pinkChampagne }]} />
                <View style={[styles.strengthBar, { backgroundColor: password.length >= 10 ? COLORS.watermelon : COLORS.pinkChampagne }]} />
                <Text style={styles.strengthText}>
                  {password.length < 6 ? 'Weak' : password.length < 8 ? 'Fair' : 'Strong'}
                </Text>
              </View>
            )}

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>{' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Register button */}
            <TouchableOpacity style={styles.registerBtn} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.registerBtnText}>Create Account</Text>
              <Text style={styles.registerBtnArrow}>→</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google */}
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Text style={styles.loginLink}>Log In</Text>
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
  header: { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  iconBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 5, borderWidth: 2, borderColor: COLORS.pinkChampagne },
  iconBadgeText: { fontSize: 30 },
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
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginTop: -6 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  strengthText: { fontSize: 11, color: COLORS.mutedText, fontWeight: '600', width: 40 },
  termsText: { fontSize: 12, color: COLORS.mutedText, textAlign: 'center', lineHeight: 18, marginBottom: 20, marginTop: 4 },
  termsLink: { color: COLORS.watermelon, fontWeight: '700' },
  registerBtn: { backgroundColor: COLORS.watermelon, borderRadius: 50, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: COLORS.watermelon, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8, marginBottom: 20 },
  registerBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  registerBtnArrow: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.pinkChampagne },
  dividerText: { color: COLORS.mutedText, fontSize: 13, fontWeight: '500' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 50, paddingVertical: 16, borderWidth: 1.5, borderColor: COLORS.pastelPink, gap: 10, marginBottom: 24, shadowColor: COLORS.lightPink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 2 },
  googleIcon: { fontSize: 18, fontWeight: '900', color: COLORS.watermelon },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.darkText },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: COLORS.mutedText },
  loginLink: { fontSize: 14, color: COLORS.watermelon, fontWeight: '800' },
});