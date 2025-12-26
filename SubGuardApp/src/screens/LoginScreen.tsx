import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import agent from '../api/agent';
import { saveRefreshToken, saveToken, saveUserId } from '../utils/AuthManager';
import { useThemeColors } from '../constants/theme'; // Hook
import { useSettingsStore } from '../store/useSettingsStore'; // Store
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const isDarkMode = useSettingsStore((state) => state.isDarkMode);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  });
  const [loading, setLoading] = useState(false);

const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await agent.Auth.login(data);
      if (response && response.data && response.data.accessToken) {
        await saveToken(response.data.accessToken);
        if (response.data.userId) {
            await saveUserId(response.data.userId);
        }
        await saveRefreshToken(response.data.refreshToken);
        navigation.replace('Main'); 
      } else {
        Alert.alert('Hata', 'Giriş yapılamadı.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı adı veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Üst Dekoratif Alan - Gradient renklerini de hook'tan alabiliriz */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color={colors.white} />
        </View>
        <Text style={[styles.title, { color: colors.white }]}>SubGuard</Text>
        <Text style={styles.subtitle}>Aboneliklerini yönet, tasarruf et.</Text>
      </LinearGradient>

      {/* Form Alanı */}
      <View style={[styles.formContainer, { backgroundColor: colors.cardBg, shadowColor: isDarkMode ? '#000' : '#000' }]}>
        <Text style={[styles.welcomeText, { color: colors.textMain }]}>Tekrar Hoşgeldin!</Text>

        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSec} style={styles.inputIcon} />
            <Controller
            control={control}
            rules={{ required: 'E-posta zorunludur' }}
            render={({ field: { onChange, value } }) => (
                <TextInput
                style={[styles.input, { color: colors.textMain }]}
                placeholder="E-posta"
                placeholderTextColor={colors.textSec}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                />
            )}
            name="email"
            />
        </View>
        {errors.email && <Text style={[styles.errorText, { color: colors.error }]}>{errors.email.message}</Text>}

        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSec} style={styles.inputIcon} />
            <Controller
            control={control}
            rules={{ required: 'Şifre zorunludur' }}
            render={({ field: { onChange, value } }) => (
                <TextInput
                style={[styles.input, { color: colors.textMain }]}
                placeholder="Şifre"
                placeholderTextColor={colors.textSec}
                secureTextEntry
                value={value}
                onChangeText={onChange}
                />
            )}
            name="password"
            />
        </View>
        {errors.password && <Text style={[styles.errorText, { color: colors.error }]}>{errors.password.message}</Text>}

        <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && { opacity: 0.7 }]} 
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
        >
          <Text style={[styles.buttonText, { color: colors.white }]}>{loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSec }]}>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.linkText, { color: colors.accent }]}>Kayıt Ol</Text>
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingBottom: 40
  },
  logoContainer: {
      width: 100,
      height: 100,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)'
  },
  title: { fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  formContainer: {
    flex: 1,
    marginTop: -40,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20
  },
  welcomeText: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 30,
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50 },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  buttonText: { fontWeight: 'bold', fontSize: 16 },
  errorText: { marginBottom: 10, fontSize: 12, marginLeft: 4 },
  footer: { 
      flexDirection: 'row', 
      justifyContent: 'center', 
      marginTop: 24 
  },
  footerText: { marginRight: 6 },
  linkText: { fontWeight: 'bold' },
});