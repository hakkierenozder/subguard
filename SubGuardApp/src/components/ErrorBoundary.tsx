import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Mevcut paketten
import { SafeAreaView } from 'react-native-safe-area-context'; // Mevcut paketten

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Fırtına Mavisi Teması
const THEME = {
    primary: '#334155',    // Slate 700 - Fırtına Mavisi
    bg: '#F8FAFC',         // Slate 50 - Arka Plan
    textMain: '#0F172A',   // Slate 900 - Başlık
    textSec: '#64748B',    // Slate 500 - Açıklama
    white: '#FFFFFF',
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Bir sonraki render'da fallback UI göstermek için state'i güncelle
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata loglama servisine (Sentry, Firebase Crashlytics vb.) buradan gönderebiliriz.
    console.error("Global Hata Yakalandı:", error, errorInfo);
  }

  handleReset = () => {
    // Uygulamayı yeniden başlatmak yerine state'i sıfırlayarak kurtarmayı deniyoruz.
    // Eğer kök dizinde bir sorun varsa kullanıcı uygulamayı kapatıp açmalıdır.
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
                <Ionicons name="alert-circle" size={80} color={THEME.primary} />
            </View>

            <Text style={styles.title}>Bir şeyler ters gitti</Text>
            
            <Text style={styles.message}>
              Beklenmedik bir hata oluştu. Teknik ekibimiz durumdan haberdar edildi.
            </Text>

            {/* Geliştirici Modunda Hatayı Göster */}
            {__DEV__ && this.state.error && (
                <View style={styles.debugBox}>
                    <Text style={styles.debugText}>Hata: {this.state.error.toString()}</Text>
                </View>
            )}

            <TouchableOpacity 
                style={styles.retryButton} 
                onPress={this.handleReset}
                activeOpacity={0.8}
            >
                <Ionicons name="refresh" size={20} color={THEME.white} style={{marginRight: 8}} />
                <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.textMain,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: THEME.textSec,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: THEME.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: {
    color: THEME.white,
    fontSize: 16,
    fontWeight: '700',
  },
  debugBox: {
      backgroundColor: '#E2E8F0',
      padding: 10,
      borderRadius: 8,
      marginBottom: 20,
      width: '100%',
  },
  debugText: {
      color: '#EF4444',
      fontSize: 12,
      fontFamily: 'monospace'
  }
});

export default ErrorBoundary;