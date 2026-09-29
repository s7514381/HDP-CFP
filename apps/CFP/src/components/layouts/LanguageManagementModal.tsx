'use client';

import React, { useEffect, useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Btn } from '@packages/components/bootstrap5/Btn';
import FontAwesome from '@packages/components/FontAwsome';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_MAP } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { getNativeLanguageName } from '@/lib/languageDisplayName';

export interface LanguageItem {
  id: string;
  name: string;
  code: string;
  isBaseLanguage: boolean;
}

interface LanguageManagementModalProps {
  show: boolean;
  languages: LanguageItem[];
  canAdd: boolean;
  canDelete: boolean;
  onClose: () => void;
  onAddLanguage: () => void;
  onLanguagesChanged: (languages: LanguageItem[]) => void;
}

export default function LanguageManagementModal({
  show,
  languages: availableLanguages,
  canAdd,
  canDelete,
  onClose,
  onAddLanguage,
  onLanguagesChanged,
}: LanguageManagementModalProps) {
  const { formPost } = useAppApi();
  const { confirm } = useConfirm();
  const { danger, success } = useToast();
  const {
    languageCode,
    invalidateLanguageTranslations,
    setLanguage,
    translate,
  } = useLanguage();
  const [languages, setLanguages] = useState<LanguageItem[]>(availableLanguages);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLanguages(availableLanguages);
  }, [availableLanguages]);

  useEffect(() => {
    if (!show) return;

    let mounted = true;
    const loadLanguages = async () => {
      setLoading(true);
      try {
        const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_ACTIVE_LANGUAGES, {});
        if (!mounted) return;

        if (result.success && Array.isArray(result.data)) {
          setLanguages(result.data as LanguageItem[]);
        } else {
          danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
        }
      } catch (error) {
        console.error('Failed to load languages for management', error);
        if (mounted) {
          danger({ message: <span>{translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadLanguages();
    return () => {
      mounted = false;
    };
  }, [danger, formPost, show, translate]);

  const handleDelete = async (language: LanguageItem) => {
    if (deletingId || language.isBaseLanguage) return;
    if (!await confirm(translate(LANGUAGE_KEYS.languageResource.deleteConfirm))) return;

    setDeletingId(language.id);
    try {
      const result = await formPost(API_MAP.LANGUAGE_DELETE, { id: language.id });
      if (!result.success) {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
        return;
      }

      const nextLanguages = languages.filter(item => item.id !== language.id);
      const baseLanguage = nextLanguages.find(item => item.isBaseLanguage);
      setLanguages(nextLanguages);
      onLanguagesChanged(nextLanguages);
      invalidateLanguageTranslations(language.code);

      if (languageCode === language.code) {
        if (!baseLanguage) {
          danger({ message: <span>{translate(LANGUAGE_KEYS.common.operationFailed)}</span> });
          return;
        }

        const changed = await setLanguage(baseLanguage.code);
        if (!changed) {
          danger({ message: <span>{translate(LANGUAGE_KEYS.common.operationFailed)}</span> });
          return;
        }
      }

      success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
    } catch (error) {
      console.error('Failed to delete language', error);
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal show={show} size="lg" onClose={onClose}>
      <Modal.Title onClose={onClose}>{translate(LANGUAGE_KEYS.common.multilingualSettings)}</Modal.Title>
      <Modal.Body>
        {canAdd && (
          <div className="d-flex justify-content-end mb-3">
            <Btn
              type="button"
              color="primary"
              icon="add"
              onClick={onAddLanguage}
              disabled={Boolean(deletingId) || loading}
            >
              {translate(LANGUAGE_KEYS.languageResource.addLanguage)}
            </Btn>
          </div>
        )}
        <div className="table-responsive">
          <table className="table table-bordered align-middle mb-0">
            <thead>
              <tr>
                <th>{translate(LANGUAGE_KEYS.common.languageName)}</th>
                <th>{translate(LANGUAGE_KEYS.common.languageCode)}</th>
                <th className="text-center">{translate(LANGUAGE_KEYS.common.actions)}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    {translate(LANGUAGE_KEYS.common.loading)}
                  </td>
                </tr>
              ) : languages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-muted">
                    {translate(LANGUAGE_KEYS.common.noData)}
                  </td>
                </tr>
              ) : (
                languages.map(language => (
                  <tr key={language.id}>
                    <td>{getNativeLanguageName(language.code, language.name)}</td>
                    <td>{language.code}</td>
                    <td className="text-center">
                      {language.isBaseLanguage ? (
                        <span className="text-muted" title={translate(LANGUAGE_KEYS.common.baseLanguageContent)}>
                          <FontAwesome icon="fa-solid fa-lock me-1" />
                          {translate(LANGUAGE_KEYS.common.baseLanguageContent)}
                        </span>
                      ) : canDelete ? (
                        <Btn
                          type="button"
                          color="danger"
                          size="sm"
                          icon="delete"
                          loading={deletingId === language.id}
                          disabled={Boolean(deletingId)}
                          onClick={() => void handleDelete(language)}
                        >
                          {translate(LANGUAGE_KEYS.common.delete)}
                        </Btn>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
}
