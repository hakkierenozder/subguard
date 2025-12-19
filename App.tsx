import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Ekranlar
import HomeScreen from './src/screens/HomeScreen';
import MySubscriptionsScreen from './src/screens/MySubscriptionsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={{
            headerShown: false, // DİKKAT: Burası tırnaksız false olmalı!
            tabBarActiveTintColor: '#333',
            tabBarInactiveTintColor: '#999',
          }}
        >
          <Tab.Screen 
            name="Katalog" 
            component={HomeScreen} 
            options={{ tabBarLabel: 'Keşfet' }}
          />
          
          <Tab.Screen 
            name="Cüzdanım" 
            component={MySubscriptionsScreen} 
            options={{ tabBarLabel: 'Aboneliklerim' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}