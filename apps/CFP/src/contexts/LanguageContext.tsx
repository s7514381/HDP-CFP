'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { appStorage, sessionStorageKeys, useStoredValue } from '@/lib/appStorage';

const DEFAULT_LANGUAGE_CODE = 'zh-TW';
// Increment when adding language resources so existing browser caches refresh.
const TRANSLATION_CACHE_VERSION = 37;
const INITIAL_LANGUAGE_RETRY_DELAY_MS = 2000;
const translationStorageKey = (languageCode: string) => `languageTranslations:${languageCode}`;

interface LanguageResourceText {
  languageResourceId?: string;
  serialNumber?: string;
  text?: string;
}

interface LanguageContextValue {
  languageCode: string;
  loading: boolean;
  initialized: boolean;
  setLanguage: (languageCode: string) => Promise<boolean>;
  translate: (serialNumber: string) => string;
  translateByLanguageResourceId: (languageResourceId: string) => string;
}

interface TranslationState {
  translations: Record<string, string>;
  translationsById: Record<string, string>;
}

interface TranslationCache {
  version: number;
  state: TranslationState;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const isStringRecord = (value: unknown): value is Record<string, string> => (
  isRecord(value) && Object.values(value).every(item => typeof item === 'string')
);

const buildTranslationState = (data: unknown): TranslationState | null => {
  if (!Array.isArray(data)) return null;

  const resources = data as LanguageResourceText[];
  const translations = resources.reduce<Record<string, string>>((map, resource) => {
    if (resource.serialNumber && resource.text?.trim()) map[resource.serialNumber] = resource.text;
    return map;
  }, {});
  const translationsById = resources.reduce<Record<string, string>>((map, resource) => {
    if (resource.languageResourceId && resource.text?.trim()) map[resource.languageResourceId] = resource.text;
    return map;
  }, {});

  return { translations, translationsById };
};

const readCachedTranslations = (languageCode: string): TranslationState | null => {
  const cache = appStorage.get<unknown>(translationStorageKey(languageCode));
  if (!isRecord(cache) || cache.version !== TRANSLATION_CACHE_VERSION || !isRecord(cache.state)) return null;

  const { translations, translationsById } = cache.state;
  if (!isStringRecord(translations) || !isStringRecord(translationsById)) return null;

  return { translations, translationsById };
};

const writeCachedTranslations = (languageCode: string, state: TranslationState): void => {
  const cache: TranslationCache = { version: TRANSLATION_CACHE_VERSION, state };
  appStorage.set(translationStorageKey(languageCode), cache);
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { formPost } = useAppApi();
  const languageCode = useStoredValue(sessionStorageKeys.languageCode, DEFAULT_LANGUAGE_CODE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationsById, setTranslationsById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const appliedLanguageCodeRef = useRef<string | null>(null);
  const translationRequestIdRef = useRef(0);

  const fetchTranslations = useCallback(async (nextLanguageCode: string): Promise<TranslationState | null> => {
    const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_TRANSLATIONS, { languageCode: nextLanguageCode });
    if (!result.success) return null;
    return buildTranslationState(result.data);
  }, [formPost]);

  const setLanguage = useCallback(async (nextLanguageCode: string): Promise<boolean> => {
    const normalizedCode = nextLanguageCode.trim() || DEFAULT_LANGUAGE_CODE;
    if (normalizedCode === languageCode && appliedLanguageCodeRef.current === normalizedCode) return true;

    const requestId = ++translationRequestIdRef.current;
    const cachedTranslations = readCachedTranslations(normalizedCode);

    if (cachedTranslations) {
      setTranslations(cachedTranslations.translations);
      setTranslationsById(cachedTranslations.translationsById);
      appliedLanguageCodeRef.current = normalizedCode;
      appStorage.set(sessionStorageKeys.languageCode, normalizedCode);
      setLoading(false);
      return true;
    }

    setLoading(true);
    try {
      const nextState = await fetchTranslations(normalizedCode);
      if (requestId !== translationRequestIdRef.current) return false;
      if (!nextState) {
        console.error('Failed to load language translations', normalizedCode);
        return false;
      }

      setTranslations(nextState.translations);
      setTranslationsById(nextState.translationsById);
      writeCachedTranslations(normalizedCode, nextState);
      appliedLanguageCodeRef.current = normalizedCode;
      appStorage.set(sessionStorageKeys.languageCode, normalizedCode);
      return true;
    } catch (error) {
      console.error('Failed to load language translations', error);
      return false;
    } finally {
      if (requestId === translationRequestIdRef.current) setLoading(false);
    }
  }, [fetchTranslations, languageCode]);

  useEffect(() => {
    if (appliedLanguageCodeRef.current === languageCode) return;

    let isMounted = true;
    const requestId = ++translationRequestIdRef.current;
    const cachedTranslations = readCachedTranslations(languageCode);

    if (cachedTranslations) {
      setTranslations(cachedTranslations.translations);
      setTranslationsById(cachedTranslations.translationsById);
      appliedLanguageCodeRef.current = languageCode;
      setInitialized(true);
      setLoading(false);
      return;
    }

    const loadTranslations = async () => {
      setLoading(true);
      while (isMounted && requestId === translationRequestIdRef.current) {
        try {
          const nextState = await fetchTranslations(languageCode);
          if (!isMounted || requestId !== translationRequestIdRef.current) return;

          if (nextState) {
            setTranslations(nextState.translations);
            setTranslationsById(nextState.translationsById);
            writeCachedTranslations(languageCode, nextState);
            appliedLanguageCodeRef.current = languageCode;
            setInitialized(true);
            setLoading(false);
            return;
          }

          console.error('Failed to load language translations', languageCode);
        } catch (error) {
          console.error('Failed to load language translations', error);
        }

        await new Promise(resolve => setTimeout(resolve, INITIAL_LANGUAGE_RETRY_DELAY_MS));
      }
    };

    void loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [fetchTranslations, languageCode]);

  const translate = useCallback((serialNumber: string) => {
    return translations[serialNumber] || '';
  }, [translations]);
  const translateByLanguageResourceId = useCallback((languageResourceId: string) => {
    return translationsById[languageResourceId] || '';
  }, [translationsById]);

  const value = useMemo(() => ({
    languageCode,
    loading,
    initialized,
    setLanguage,
    translate,
    translateByLanguageResourceId,
  }), [languageCode, loading, initialized, setLanguage, translate, translateByLanguageResourceId]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
