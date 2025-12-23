// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';

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

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Reports: undefined;
  MySubscriptions: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn(); 
      setInitialRoute(loggedIn ? 'Home' : 'Login');
    };
    checkAuth();
  }, []);

  if (!initialRoute) return null; 

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" />
          {/* headerShown: false (boolean) olduğundan emin oluyoruz */}
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="MySubscriptions" component={MySubscriptionsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}