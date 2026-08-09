'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useUser } from '@/contexts/UserContext';
import { appStorage, sessionStorageKeys, useStoredValue } from '@/lib/appStorage';

const DEFAULT_LANGUAGE_CODE = 'zh-TW';
const TRANSLATION_CACHE_VERSION = 3;
const translationStorageKey = (languageCode: string) => `languageTranslations:${languageCode}`;

interface LanguageResourceText {
  languageResourceId?: string;
  serialNumber?: string;
  text?: string;
}

interface LanguageContextValue {
  languageCode: string;
  loading: boolean;
  setLanguage: (languageCode: string) => Promise<boolean>;
  translate: (serialNumber: string, fallbackText?: string) => string;
  translateByLanguageResourceId: (languageResourceId: string, fallbackText?: string) => string;
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
  const { user } = useUser();
  const languageCode = useStoredValue(sessionStorageKeys.languageCode, DEFAULT_LANGUAGE_CODE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationsById, setTranslationsById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
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
    if (!user || appliedLanguageCodeRef.current === languageCode) return;

    let isMounted = true;
    const requestId = ++translationRequestIdRef.current;
    const cachedTranslations = readCachedTranslations(languageCode);

    if (cachedTranslations) {
      setTranslations(cachedTranslations.translations);
      setTranslationsById(cachedTranslations.translationsById);
      appliedLanguageCodeRef.current = languageCode;
      setLoading(false);
      return;
    }

    const loadTranslations = async () => {
      setLoading(true);
      try {
        const nextState = await fetchTranslations(languageCode);
        if (!isMounted || requestId !== translationRequestIdRef.current) return;

        if (!nextState) {
          setTranslations({});
          setTranslationsById({});
          return;
        }

        setTranslations(nextState.translations);
        setTranslationsById(nextState.translationsById);
        writeCachedTranslations(languageCode, nextState);
        appliedLanguageCodeRef.current = languageCode;
      } catch (error) {
        if (isMounted && requestId === translationRequestIdRef.current) {
          console.error('Failed to load language translations', error);
        }
      } finally {
        if (isMounted && requestId === translationRequestIdRef.current) setLoading(false);
      }
    };

    void loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [fetchTranslations, languageCode, user]);

  const translate = useCallback((serialNumber: string, fallbackText?: string) => {
    return translations[serialNumber] || fallbackText || '';
  }, [translations]);
  const translateByLanguageResourceId = useCallback((languageResourceId: string, fallbackText?: string) => {
    return translationsById[languageResourceId] || fallbackText || '';
  }, [translationsById]);

  const value = useMemo(() => ({
    languageCode,
    loading,
    setLanguage,
    translate,
    translateByLanguageResourceId,
  }), [languageCode, loading, setLanguage, translate, translateByLanguageResourceId]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
