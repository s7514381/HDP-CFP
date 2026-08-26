'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { API_MAP } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { getNativeLanguageName } from '@/lib/languageDisplayName';

interface LanguageItem {
  id: string;
  name: string;
  code: string;
  isBaseLanguage: boolean;
}

interface LanguageSelectorModalProps {
  show: boolean;
  onClose: () => void;
}

const DEFAULT_LANGUAGES: LanguageItem[] = [
  { id: 'zh-TW', name: LANGUAGE_KEYS.common.chineseTraditional, code: 'zh-TW', isBaseLanguage: true },
  { id: 'en-US', name: LANGUAGE_KEYS.common.english, code: 'en-US', isBaseLanguage: false },
];

export default function LanguageSelectorModal({ show, onClose }: LanguageSelectorModalProps) {
  const { formPost } = useAppApi();
  const { languageCode, setLanguage, translate } = useLanguage();
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(show);
  const [changingLanguage, setChangingLanguage] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!show) return;

    let isMounted = true;
    const loadLanguages = async () => {
      setLoading(true);
      try {
        const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_ACTIVE_LANGUAGES, {});
        if (!isMounted) return;

        if (result.success && Array.isArray(result.data)) {
          setLanguages(result.data as LanguageItem[]);
        } else {
          setLanguages(DEFAULT_LANGUAGES);
        }
      } catch (error) {
        console.error('Failed to load languages', error);
        if (isMounted) setLanguages(DEFAULT_LANGUAGES);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void loadLanguages();

    return () => {
      isMounted = false;
    };
  }, [formPost, show]);

  const handleLanguageSelect = async (code: string) => {
    setChangingLanguage(true);
    const changed = await setLanguage(code);
    setChangingLanguage(false);
    if (changed) handleClose();
  };

  return (
    <Modal show={show} size="sm" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>{translate(LANGUAGE_KEYS.common.language)}</Modal.Title>
      <Modal.Body>
        <div className="mb-3 text-muted">{translate(LANGUAGE_KEYS.common.selectLanguage)}</div>
        {loading ? (
          <div className="text-muted" role="status">{translate(LANGUAGE_KEYS.common.loadingLanguages)}</div>
        ) : (
          <div className="list-group" role="radiogroup" aria-label={translate(LANGUAGE_KEYS.common.languageSelection)}>
            {languages.map(language => (
              <button
                type="button"
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${languageCode === language.code ? 'active' : ''}`}
                key={language.id}
                aria-pressed={languageCode === language.code}
                disabled={changingLanguage}
                onClick={() => handleLanguageSelect(language.code)}
              >
                <span>{getNativeLanguageName(language.code, language.name)} ({language.code})</span>
                {languageCode === language.code && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
