'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { appStorage, sessionStorageKeys, useStoredValue } from '@/lib/appStorage';

const DEFAULT_LANGUAGE_CODE = 'zh-TW';
// Increment when adding language resources so existing browser caches refresh.
const TRANSLATION_CACHE_VERSION = 39;
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
  invalidateLanguageTranslations: (languageCode: string) => void;
  syncLanguage: () => Promise<boolean>;
  translate: (serialNumber: string) => string;
  translateByLanguageResourceId: (languageResourceId: string) => string;
}

interface TranslationState {
  translations: Record<string, string>;
  translationsById: Record<string, string>;
}

interface TranslationCache {
  version: number;
  updatedAt: string | null;
  state: TranslationState;
}

interface FreshTranslationLoad {
  state: TranslationState;
  updatedAt: string | null;
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

const normalizeUpdatedAt = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  if (typeof value !== 'string' || !value.trim()) return undefined;

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
};

const readCachedTranslations = (languageCode: string): TranslationCache | null => {
  const cache = appStorage.get<unknown>(translationStorageKey(languageCode));
  if (!isRecord(cache) || cache.version !== TRANSLATION_CACHE_VERSION || !isRecord(cache.state)) return null;

  const { translations, translationsById } = cache.state;
  if (!isStringRecord(translations) || !isStringRecord(translationsById)) return null;

  const updatedAt = normalizeUpdatedAt(cache.updatedAt);
  if (updatedAt === undefined) return null;

  return {
    version: TRANSLATION_CACHE_VERSION,
    updatedAt,
    state: { translations, translationsById },
  };
};

const writeCachedTranslations = (languageCode: string, state: TranslationState, updatedAt: string | null): void => {
  const cache: TranslationCache = { version: TRANSLATION_CACHE_VERSION, updatedAt, state };
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
  const freshLoadRef = useRef<{ languageCode: string; promise: Promise<FreshTranslationLoad> } | null>(null);

  const fetchTranslations = useCallback(async (nextLanguageCode: string): Promise<TranslationState | null> => {
    const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_TRANSLATIONS, { languageCode: nextLanguageCode });
    if (!result.success) return null;
    return buildTranslationState(result.data);
  }, [formPost]);

  const fetchTranslationsLastUpdated = useCallback(async (nextLanguageCode: string): Promise<string | null | undefined> => {
    const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_TRANSLATIONS_LAST_UPDATED, { languageCode: nextLanguageCode });
    if (!result.success || !isRecord(result.data)) return undefined;

    const rawUpdatedAt = 'updatedAt' in result.data ? result.data.updatedAt : result.data.UpdatedAt;
    return normalizeUpdatedAt(rawUpdatedAt);
  }, [formPost]);

  const applyTranslationState = useCallback((
    nextLanguageCode: string,
    nextState: TranslationState,
    updatedAt: string | null
  ): void => {
    setTranslations(nextState.translations);
    setTranslationsById(nextState.translationsById);
    writeCachedTranslations(nextLanguageCode, nextState, updatedAt);
    appliedLanguageCodeRef.current = nextLanguageCode;
    appStorage.set(sessionStorageKeys.languageCode, nextLanguageCode);
  }, []);

  const loadFreshTranslations = useCallback(async (
    nextLanguageCode: string,
    knownUpdatedAt?: string | null
  ): Promise<FreshTranslationLoad> => {
    const inFlight = freshLoadRef.current;
    if (inFlight?.languageCode === nextLanguageCode) return inFlight.promise;

    const promise = (async (): Promise<FreshTranslationLoad> => {
      const updatedAt = knownUpdatedAt === undefined
        ? await fetchTranslationsLastUpdated(nextLanguageCode)
        : knownUpdatedAt;
      if (updatedAt === undefined) {
        throw new Error(`Failed to load translation metadata for ${nextLanguageCode}`);
      }

      const state = await fetchTranslations(nextLanguageCode);
      if (!state) {
        throw new Error(`Failed to load translations for ${nextLanguageCode}`);
      }

      writeCachedTranslations(nextLanguageCode, state, updatedAt);
      return { state, updatedAt };
    })();

    freshLoadRef.current = { languageCode: nextLanguageCode, promise };
    try {
      return await promise;
    } finally {
      if (freshLoadRef.current?.promise === promise) freshLoadRef.current = null;
    }
  }, [fetchTranslations, fetchTranslationsLastUpdated]);

  const setLanguage = useCallback(async (nextLanguageCode: string): Promise<boolean> => {
    const normalizedCode = nextLanguageCode.trim() || DEFAULT_LANGUAGE_CODE;
    if (normalizedCode === languageCode && appliedLanguageCodeRef.current === normalizedCode) return true;

    const requestId = ++translationRequestIdRef.current;
    const cachedTranslations = readCachedTranslations(normalizedCode);

    if (cachedTranslations) {
      setTranslations(cachedTranslations.state.translations);
      setTranslationsById(cachedTranslations.state.translationsById);
      appliedLanguageCodeRef.current = normalizedCode;
      appStorage.set(sessionStorageKeys.languageCode, normalizedCode);
      setLoading(false);
      return true;
    }

    setLoading(true);
    try {
      const { state: nextState, updatedAt } = await loadFreshTranslations(normalizedCode);
      if (requestId !== translationRequestIdRef.current) return false;

      applyTranslationState(normalizedCode, nextState, updatedAt);
      return true;
    } catch (error) {
      console.error('Failed to load language translations', error);
      return false;
    } finally {
      if (requestId === translationRequestIdRef.current) setLoading(false);
    }
  }, [applyTranslationState, languageCode, loadFreshTranslations]);

  const invalidateLanguageTranslations = useCallback((targetLanguageCode: string): void => {
    const normalizedCode = targetLanguageCode.trim();
    if (!normalizedCode) return;
    appStorage.remove(translationStorageKey(normalizedCode));
  }, []);

  const syncLanguage = useCallback(async (): Promise<boolean> => {
    const normalizedCode = languageCode.trim() || DEFAULT_LANGUAGE_CODE;
    const requestId = ++translationRequestIdRef.current;
    setLoading(true);

    try {
      const inFlight = freshLoadRef.current;
      if (inFlight?.languageCode === normalizedCode) await inFlight.promise;

      if (requestId !== translationRequestIdRef.current) return false;

      const serverUpdatedAt = await fetchTranslationsLastUpdated(normalizedCode);
      if (requestId !== translationRequestIdRef.current) return false;
      if (serverUpdatedAt === undefined) {
        console.error('Failed to load translation metadata', normalizedCode);
        return false;
      }

      const cachedTranslations = readCachedTranslations(normalizedCode);
      if (cachedTranslations && cachedTranslations.updatedAt === serverUpdatedAt) {
        setTranslations(cachedTranslations.state.translations);
        setTranslationsById(cachedTranslations.state.translationsById);
        appliedLanguageCodeRef.current = normalizedCode;
        appStorage.set(sessionStorageKeys.languageCode, normalizedCode);
        setInitialized(true);
        return true;
      }

      const { state: nextState, updatedAt } = await loadFreshTranslations(normalizedCode, serverUpdatedAt);
      if (requestId !== translationRequestIdRef.current) return false;

      applyTranslationState(normalizedCode, nextState, updatedAt);
      setInitialized(true);
      return true;
    } catch (error) {
      console.error('Failed to synchronize language translations', error);
      return false;
    } finally {
      if (requestId === translationRequestIdRef.current) setLoading(false);
    }
  }, [applyTranslationState, fetchTranslationsLastUpdated, languageCode, loadFreshTranslations]);

  useEffect(() => {
    if (appliedLanguageCodeRef.current === languageCode) return;

    let isMounted = true;
    const requestId = ++translationRequestIdRef.current;
    const cachedTranslations = readCachedTranslations(languageCode);

    if (cachedTranslations) {
      setTranslations(cachedTranslations.state.translations);
      setTranslationsById(cachedTranslations.state.translationsById);
      appliedLanguageCodeRef.current = languageCode;
      setInitialized(true);
      setLoading(false);
      return;
    }

    const loadTranslations = async () => {
      setLoading(true);
      while (isMounted && requestId === translationRequestIdRef.current) {
        try {
          const { state: nextState, updatedAt } = await loadFreshTranslations(languageCode);
          if (!isMounted || requestId !== translationRequestIdRef.current) return;

          applyTranslationState(languageCode, nextState, updatedAt);
          setInitialized(true);
          setLoading(false);
          return;
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
  }, [applyTranslationState, languageCode, loadFreshTranslations]);

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
    invalidateLanguageTranslations,
    syncLanguage,
    translate,
    translateByLanguageResourceId,
  }), [languageCode, loading, initialized, setLanguage, invalidateLanguageTranslations, syncLanguage, translate, translateByLanguageResourceId]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
