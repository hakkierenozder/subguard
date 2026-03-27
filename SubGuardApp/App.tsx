import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Utils & Components
import { isLoggedIn, logout } from './src/utils/AuthManager';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import { THEME, useThemeColors } from './src/constants/theme';
import { useSettingsStore } from './src/store/useSettingsStore';
import { useNotificationStore } from './src/store/useNotificationStore';
import { useUserSubscriptionStore } from './src/store/useUserSubscriptionStore';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: { email: string; userId: string };
  ForgotPassword: undefined;
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
  MySubscriptions: { openSubscriptionId?: string } | undefined;
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
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const colors = useThemeColors();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) {
          setInitialRoute('Login');
          return;
        }

        // Uygulama kilidi — soğuk başlatmada biometrik doğrulama
        try {
          const settingsRaw = await AsyncStorage.getItem('subguard-settings-storage');
          const appLockEnabled = settingsRaw
            ? (JSON.parse(settingsRaw)?.state?.appLockEnabled ?? false)
            : false;

          if (appLockEnabled) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: 'SubGuard\'a erişmek için kimliğinizi doğrulayın',
              fallbackLabel: 'Şifre Kullan',
              cancelLabel: 'İptal',
              disableDeviceFallback: false,
            });
            if (!result.success) {
              await logout();
              setInitialRoute('Login');
              return;
            }
          }
        } catch {
          // Biyometrik hata → kilidi atla, uygulamaya gir
        }

        setInitialRoute(onboardingCompleted ? 'Main' : 'Onboarding');
      } catch (e) {
        setInitialRoute('Login');
      }
    };
    checkAuth();
  }, []);

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
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
      </ErrorBoundary>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}