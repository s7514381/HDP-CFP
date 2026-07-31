'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useUser } from '@/contexts/UserContext';
import { appStorage, sessionStorageKeys, useStoredValue } from '@/lib/appStorage';

const DEFAULT_LANGUAGE_CODE = 'zh-TW';
const translationStorageKey = (languageCode: string) => `languageTranslations:${languageCode}`;

interface LanguageResourceText {
  languageResourceId?: string;
  serialNumber?: string;
  text?: string;
}

interface LanguageContextValue {
  languageCode: string;
  loading: boolean;
  setLanguage: (languageCode: string) => void;
  translate: (serialNumber: string, fallbackText?: string) => string;
  translateByLanguageResourceId: (languageResourceId: string, fallbackText?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const getCachedTranslations = (languageCode: string): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  return appStorage.get<Record<string, string>>(translationStorageKey(languageCode), {}) || {};
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { formPost } = useAppApi();
  const { user } = useUser();
  const languageCode = useStoredValue(sessionStorageKeys.languageCode, DEFAULT_LANGUAGE_CODE);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationsById, setTranslationsById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setLanguage = useCallback((nextLanguageCode: string) => {
    const normalizedCode = nextLanguageCode.trim() || DEFAULT_LANGUAGE_CODE;
    setTranslations(getCachedTranslations(normalizedCode));
    setTranslationsById({});
    appStorage.set(sessionStorageKeys.languageCode, normalizedCode);
  }, []);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadTranslations = async () => {
      setLoading(true);
      try {
        const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_TRANSLATIONS, { languageCode });
        if (!isMounted) return;

        if (!result.success || !Array.isArray(result.data)) {
          setTranslations({});
          setTranslationsById({});
          return;
        }

        const nextTranslations = (result.data as LanguageResourceText[]).reduce<Record<string, string>>((map, resource) => {
          if (resource.serialNumber && resource.text?.trim()) map[resource.serialNumber] = resource.text;
          return map;
        }, {});
        const nextTranslationsById = (result.data as LanguageResourceText[]).reduce<Record<string, string>>((map, resource) => {
          if (resource.languageResourceId && resource.text?.trim()) map[resource.languageResourceId] = resource.text;
          return map;
        }, {});
        setTranslations(nextTranslations);
        setTranslationsById(nextTranslationsById);
        appStorage.set(translationStorageKey(languageCode), nextTranslations);
      } catch (error) {
        if (isMounted) console.error('Failed to load language translations', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadTranslations();

    return () => {
      isMounted = false;
    };
  }, [formPost, languageCode, user]);

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
