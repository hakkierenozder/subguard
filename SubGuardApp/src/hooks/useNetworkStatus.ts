// src/hooks/useNetworkStatus.ts
import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { API_URL } from '../config';

// Global offline state — tüm bileşenler aynı değeri paylaşır
let _isOnline = true;
const _listeners: Set<(online: boolean) => void> = new Set();

export const setNetworkStatus = (online: boolean) => {
  if (_isOnline === online) return;
  _isOnline = online;
  _listeners.forEach(fn => fn(online));
};

export const getNetworkStatus = () => _isOnline;

// Arka planda çalışan bağlantı kontrolü (axios interceptor tetikler)
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(_isOnline);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const handler = (online: boolean) => setIsOnline(online);
    _listeners.add(handler);
    return () => { _listeners.delete(handler); };
  }, []);

  // Uygulama ön plana gelince bağlantıyı kontrol et
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        checkConnectivity();
      }
      appState.current = next;
    });
    return () => subscription.remove();
  }, []);

  return isOnline;
};

export const checkConnectivity = async () => {
  try {
    // Lightweight endpoint — sadece API'nin erişilebilir olup olmadığını kontrol eder
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    await fetch(`${API_URL}/health`, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    setNetworkStatus(true);
  } catch {
    setNetworkStatus(false);
  }
};
