import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import agent from '../api/agent';
import { saveAuthData } from '../utils/AuthManager';

interface Props {
  onLoginSuccess: () => void;
  onGoToLogin: () => void;
}

export default function RegisterScreen({ onLoginSuccess, onGoToLogin }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const response = await agent.Auth.register({ fullName, email, password });
      
      if (response && response.data) {
        const { accessToken, userId, fullName: serverName } = response.data;
        // Token'ı kaydet ve direkt giriş yap
        await saveAuthData(accessToken, userId, serverName);
        onLoginSuccess();
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Hata", "Kayıt olunamadı. E-posta kullanımda olabilir.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Kayıt Ol</Text>
        <Text style={styles.subtitle}>Hemen başla, paran cebinde kalsın.</Text>

        <TextInput style={styles.input} placeholder="Adın Soyadın" value={fullName} onChangeText={setFullName} />
        <TextInput style={styles.input} placeholder="E-posta Adresi" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Hesap Oluştur</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToLogin} style={{marginTop: 20}}>
            <Text style={styles.linkText}>Zaten hesabın var mı? <Text style={{fontWeight:'bold'}}>Giriş Yap</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Stiller LoginScreen ile aynı (tekrar kopyalamana gerek yok, yukarıdakiyle aynı css)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', justifyContent: 'center' },
  content: { padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  button: { backgroundColor: '#333', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkText: { textAlign: 'center', color: '#666' }
});