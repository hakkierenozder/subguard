import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import agent from '../api/agent';
import { saveAuthData } from '../utils/AuthManager';

interface Props {
  onLoginSuccess: () => void;
  onGoToRegister: () => void;
}

export default function LoginScreen({ onLoginSuccess, onGoToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const response = await agent.Auth.login({ email, password });
      
      if (response && response.data) {
        const { accessToken, userId, fullName } = response.data;
        // Token'ı kaydet
        await saveAuthData(accessToken, userId, fullName);
        // Ana ekrana geç
        onLoginSuccess();
      } else {
          Alert.alert("Giriş Başarısız", "Bilgileri kontrol edin.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Hata", "Giriş yapılamadı. Şifre veya e-posta hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>SubGuard</Text>
        <Text style={styles.subtitle}>Aboneliklerini Yönet, Tasarruf Et 🚀</Text>

        <TextInput 
          style={styles.input} 
          placeholder="E-posta Adresi" 
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput 
          style={styles.input} 
          placeholder="Şifre" 
          secureTextEntry 
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoToRegister} style={{marginTop: 20}}>
            <Text style={styles.linkText}>Hesabın yok mu? <Text style={{fontWeight:'bold'}}>Kayıt Ol</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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