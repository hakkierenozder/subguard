import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, THEME } from '../constants/theme';

// ─── Renk tipi ───────────────────────────────────────────────────────────────
type Colors = ReturnType<typeof useThemeColors>;

interface Props {
  children: ReactNode;
  colors: Colors;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Hata Yakalandı:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { colors } = this.props;

    if (this.state.hasError) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
          <StatusBar
            barStyle={colors.bg === THEME.bg ? 'dark-content' : 'light-content'}
            backgroundColor={colors.bg}
          />

          <View style={styles.content}>
            <View style={[styles.iconContainer, { shadowColor: colors.primary }]}>
              <Ionicons name="alert-circle" size={80} color={colors.primary} />
            </View>

            <Text style={[styles.title, { color: colors.textMain }]}>Bir şeyler ters gitti</Text>

            <Text style={[styles.message, { color: colors.textSec }]}>
              Beklenmedik bir hata oluştu. Teknik ekibimiz durumdan haberdar edildi.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={[styles.debugBox, { backgroundColor: colors.inputBg }]}>
                <Text style={styles.debugText}>Hata: {this.state.error.toString()}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

// ─── Functional wrapper — hooks burada kullanılır ─────────────────────────────
export default function ErrorBoundary({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  return <ErrorBoundaryClass colors={colors}>{children}</ErrorBoundaryClass>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  debugBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
