import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Ekranlar
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Utils & Components
import { isLoggedIn } from './src/utils/AuthManager'; 
import ErrorBoundary from './src/components/ErrorBoundary'; 
import { THEME } from './src/constants/theme';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined; // Tab Menü
};

export type MainTabParamList = {
  Home: undefined;
  MySubscriptions: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// --- TAB MENÜ YAPILANDIRMASI (DÜZELTİLDİ) ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textSec,
        // DÜZELTME BURADA: Menüyü yukarı kaldırıyoruz
        tabBarStyle: {
          backgroundColor: THEME.white,
          borderTopWidth: 1,
          borderTopColor: THEME.border,
          height: Platform.OS === 'ios' ? 90 : 70, // iOS için daha yüksek
          paddingBottom: Platform.OS === 'ios' ? 30 : 10, // Alttan boşluk bırak
          paddingTop: 10,
          elevation: 10, // Android gölge
          shadowColor: '#000', // iOS gölge
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MySubscriptions') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Ana Sayfa' }} 
      />
      <Tab.Screen 
        name="MySubscriptions" 
        component={MySubscriptionsScreen} 
        options={{ title: 'Abonelikler' }} 
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ title: 'Raporlar' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ayarlar' }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const loggedIn = await isLoggedIn(); 
        setInitialRoute(loggedIn ? 'Main' : 'Login'); 
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
    <SafeAreaProvider>
      <ErrorBoundary>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
          <Stack.Navigator 
            initialRouteName={initialRoute} 
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            {/* Tab Menüyü Stack içine gömüyoruz */}
            <Stack.Screen name="Main" component={AppTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}