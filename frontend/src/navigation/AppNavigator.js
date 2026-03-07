import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ── Auth & Onboarding ──
import SplashScreen          from '../screens/SplashScreen';
import OnboardingScreen      from '../screens/OnboardingScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import LoginScreen           from '../screens/LoginScreen';

// ── Main App ──
import HomeScreen            from '../screens/HomeScreen';
import CalendarScreen        from '../screens/CalendarScreen';
import DoctorScreen          from '../screens/DoctorScreen';
import SocialScreen          from '../screens/SocialScreen';
import RemindersScreen       from '../screens/RemindersScreen';
import ProfileScreen         from '../screens/ProfileScreen';
import NotificationsScreen   from '../screens/NotificationsScreen';
import ChatbotScreen         from '../screens/ChatbotScreen';
import ShopScreen            from '../screens/ShopScreen';

// ── Exercise ──
import ExerciseScreen        from '../screens/ExerciseScreen';
import ExerciseDetailScreen  from '../screens/ExerciseDetailScreen';

const Stack = createStackNavigator();

/**
 * Full navigation flow:
 *
 *  Splash → Onboarding → Register ↔ Login
 *                                    └─► Home ──► Calendar
 *                                             ──► Doctor
 *                                             ──► Social
 *                                             ──► Reminders
 *                                             ──► Profile    → Login (logout)
 *                                             ──► Notifications  (🔔 bell)
 *                                             ──► Chatbot    (Ovia AI bot)
 *                                             ──► Exercise ──► ExerciseDetail
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFE5EC' },
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}
      >
        {/* ─── ONBOARDING ─── */}
        <Stack.Screen name="Splash"      component={SplashScreen}     options={{ animationEnabled: false }} />
        <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
        <Stack.Screen name="Register"    component={RegisterScreen} />
        <Stack.Screen name="Login"       component={LoginScreen} />

        {/* ─── MAIN APP ─── */}
        <Stack.Screen name="Home"          component={HomeScreen}          options={{ gestureEnabled: false }} />
        <Stack.Screen name="Calendar"      component={CalendarScreen} />
        <Stack.Screen name="Doctor"        component={DoctorScreen} />
        <Stack.Screen name="Social"        component={SocialScreen} />
        <Stack.Screen name="Reminders"     component={RemindersScreen} />
        <Stack.Screen name="Profile"       component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Chatbot"       component={ChatbotScreen} />
        <Stack.Screen name="Shop"          component={ShopScreen} />

        {/* ─── EXERCISE ─── */}
        <Stack.Screen name="Exercise"       component={ExerciseScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}