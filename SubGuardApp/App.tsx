import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, Platform, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

// Ekranlar
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SharedSubscriptionsScreen from './src/screens/SharedSubscriptionsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import AdminPanelScreen from './src/screens/AdminPanelScreen';

// Utils & Components
import { isLoggedIn, logout } from './src/utils/AuthManager';
import { hasPin } from './src/utils/AppLockManager';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import AppLockOverlay from './src/components/AppLockOverlay';
import { THEME, useThemeColors } from './src/constants/theme';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useNotificationStore } from './src/store/useNotificationStore';
import { useUserSubscriptionStore } from './src/store/useUserSubscriptionStore';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string; userId: string };
  Onboarding: undefined;
  Main: undefined;
  SharedSubscriptions: undefined;
  Discover: undefined;
  Notifications: undefined;
  Calendar: undefined;
  AdminPanel: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  MySubscriptions: undefined;
  Analytics: undefined;
  Settings: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// --- TAB MENÜ ---
function AppTabs() {
  const colors = useThemeColors();
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchExchangeRates = useUserSubscriptionStore((s) => s.fetchExchangeRates);

  // Uygulama açılınca bildirimleri ve döviz kurlarını çek (Fix 16)
  useEffect(() => {
    fetchNotifications(true);
    fetchExchangeRates();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MySubscriptions') iconName = focused ? 'card' : 'card-outline';
          else if (route.name === 'Analytics') iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="MySubscriptions" component={MySubscriptionsScreen} options={{ title: 'Abonelikler' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analiz' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ayarlar' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);
  const [isLoggedInState, setIsLoggedInState] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const appLockEnabled = useSettingsStore((state) => state.appLockEnabled);
  const lockAfterMinutes = useSettingsStore((state) => state.lockAfterMinutes);
  const colors = useThemeColors();
  const lastBgTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        setIsLoggedInState(loggedIn);
        if (loggedIn) {
          setInitialRoute(onboardingCompleted ? 'Main' : 'Onboarding');
        } else {
          setInitialRoute('Login');
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

  // Uygulama kilidi — arka plana geçince süreyi kaydet, öne gelince kontrol et
  useEffect(() => {
    if (!appLockEnabled || !isLoggedInState) return;

    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        lastBgTimeRef.current = Date.now();
      } else if (nextState === 'active' && lastBgTimeRef.current !== null) {
        const elapsedMinutes = (Date.now() - lastBgTimeRef.current) / 60000;
        lastBgTimeRef.current = null;
        if (elapsedMinutes >= lockAfterMinutes) {
          const pinExists = await hasPin();
          if (pinExists) setIsLocked(true);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [appLockEnabled, lockAfterMinutes, isLoggedInState]);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.bg }}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <StatusBar 
            barStyle={isDarkMode ? "light-content" : "dark-content"} 
            backgroundColor={colors.bg} 
          />
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={AppTabs} />
            <Stack.Screen
              name="SharedSubscriptions"
              component={SharedSubscriptionsScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="Discover"
              component={DiscoverScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="Calendar"
              component={CalendarScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
            <Stack.Screen
              name="AdminPanel"
              component={AdminPanelScreen}
              options={{ headerShown: false, presentation: 'modal' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        
        {/* TOAST EKLENTİSİ BURADA */}
        <Toast />
        {/* OFFLİNE BANNER */}
        <OfflineBanner />
        {/* UYGULAMA KİLİDİ OVERLAY */}
        {isLocked && appLockEnabled && (
          <AppLockOverlay
            onUnlock={() => setIsLocked(false)}
            onForceLogout={async () => {
              await logout();
              setIsLocked(false);
              setIsLoggedInState(false);
            }}
          />
        )}
      </ErrorBoundary>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}