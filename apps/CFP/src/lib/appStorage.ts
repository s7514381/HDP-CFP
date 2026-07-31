import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@packages/lib/localstorage';
import { useSyncExternalStore } from 'react';

const subscribers = new Map<string, Set<() => void>>();

function notify(key: string): void {
  subscribers.get(key)?.forEach(listener => listener());
}

export const appStorage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    return getLocalStorage<T>(key, defaultValue);
  },

  set<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      setLocalStorage(key, value);
      notify(key);
    }
  },

  remove(key: string): void {
    if (typeof window !== 'undefined') {
      removeLocalStorage(key);
      notify(key);
    }
  },
};

export const sessionStorageKeys = {
  token: 'token',
  userInfo: 'userInfo',
  languageCode: 'languageCode',
  menus: 'menus',
} as const;

export function useStoredValue<T>(key: string, defaultValue: T): T {
  return useSyncExternalStore(
    (listener) => {
      const keySubscribers = subscribers.get(key) ?? new Set<() => void>();
      keySubscribers.add(listener);
      subscribers.set(key, keySubscribers);
      return () => keySubscribers.delete(listener);
    },
    () => appStorage.get<T>(key, defaultValue) ?? defaultValue,
    () => defaultValue
  );
}

export function clearSession(): void {
  appStorage.remove(sessionStorageKeys.token);
  appStorage.remove(sessionStorageKeys.userInfo);
}
