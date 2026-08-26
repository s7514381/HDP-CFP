'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { API_MAP } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';

export interface LanguageResourceTranslationData {
  id?: string;
  languageResourceId?: string;
  languageId: string;
  languageName?: string;
  languageCode?: string;
  isBaseLanguage?: boolean;
  text?: string;
}

export interface LanguageResourceData {
  id?: string;
  serialNumber?: string;
  adminMenuId?: string;
  status?: string | number;
  translationList?: LanguageResourceTranslationData[];
}

interface LanguageData {
  id: string;
  name: string;
  code: string;
  isBaseLanguage: boolean;
}

interface AdminMenuData {
  id: string;
  title?: string;
  englishCode?: string;
  childList?: AdminMenuData[];
}

interface ContentProps {
  title: string;
  formData: LanguageResourceData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<LanguageResourceData>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [menus, setMenus] = useState<AdminMenuData[]>([]);
  const { languageCode, translate } = useLanguage();

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [languageResult, menuResult] = await Promise.all([
          formPost(API_MAP.LANGUAGE_RESOURCE_GET_ACTIVE_LANGUAGES, {}),
          formPost(API_MAP.ADMIN_MENU_GET_ADMIN_MENUS, {})
        ]);

        if (languageResult.success && Array.isArray(languageResult.data)) {
          setLanguages(languageResult.data);
        }
        if (menuResult.success && Array.isArray(menuResult.data)) {
          setMenus(menuResult.data);
        }
      } catch (error) {
        console.error('Failed to load multilingual options', error);
      }
    };

    loadOptions();
  }, [formPost]);

  useEffect(() => {
    if (languages.length === 0) return;

    const current = formData?.translationList || [];
    const missing = languages.filter(language => !current.some(item => item.languageId === language.id));
    if (missing.length === 0) return;

    const translationList = [
      ...current,
      ...missing.map(language => ({
        languageId: language.id,
        languageName: language.name,
        languageCode: language.code,
        isBaseLanguage: language.isBaseLanguage,
        text: ''
      }))
    ];
    updateForm({ translationList });
  }, [languages, formData?.translationList, updateForm]);

  const menuOptions = useMemo(() => {
    const result = [{ label: translate(LANGUAGE_KEYS.common.notConfigured), value: '' }];
    const flatten = (items: AdminMenuData[], depth = 0) => {
      items.forEach(item => {
        result.push({
          label: `${'　'.repeat(depth)}${item.englishCode || translate(LANGUAGE_KEYS.common.notConfigured)} - ${item.title || ''}`,
          value: item.id
        });
        if (item.childList?.length) flatten(item.childList, depth + 1);
      });
    };
    flatten(menus);
    return result;
  }, [menus, translate]);

  const handleTranslationChange = (languageId: string, text: string) => {
    const translationList = (formData?.translationList || []).map(item =>
      item.languageId === languageId ? { ...item, text } : item
    );
    updateForm({ translationList });
  };

  return (
    <>
      <FormActionBar
        title={title}
        formId="language-resource-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="language-resource-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input label={translate(LANGUAGE_KEYS.common.resourceCode)} value={formData?.serialNumber || translate(LANGUAGE_KEYS.common.loadingData)} disabled />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.languageResource.menuCode)}
                    name="adminMenuId"
                    value={formData?.adminMenuId || ''}
                    onChange={onChange}
                    options={menuOptions}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <h5 className="fw-bold mt-3 mb-2">{translate(LANGUAGE_KEYS.languageResource.translationContent)}</h5>
                  <div className="d-flex flex-column gap-3">
                    {(formData?.translationList || []).map(language => (
                      <Grid.Row className="g-3 align-items-end" key={language.languageId}>
                        <Grid.Col md={3}>
                          <Input label={translate(LANGUAGE_KEYS.common.language)} value={`${language.languageName || ''} (${language.languageCode || ''})`} disabled />
                        </Grid.Col>
                        <Grid.Col md={9}>
                          <Input
                            label={language.isBaseLanguage ? translate(LANGUAGE_KEYS.common.baseLanguageContent) : translate(LANGUAGE_KEYS.common.translation)}
                            value={language.text || ''}
                            onChange={(event) => handleTranslationChange(language.languageId, event.target.value)}
                            required={language.isBaseLanguage}
                            placeholder={language.isBaseLanguage ? translate(LANGUAGE_KEYS.common.baseLanguageContent) : translate(LANGUAGE_KEYS.common.translation)}
                          />
                        </Grid.Col>
                      </Grid.Row>
                    ))}
                  </div>
                </Grid.Col>

                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.status)}
                    name="status"
                    value={formData?.status?.toString() || '1'}
                    onChange={onChange}
                    options={[{ label: translate(LANGUAGE_KEYS.common.enabled), value: '1' }, { label: translate(LANGUAGE_KEYS.common.disabled), value: '0' }]}
                  />
                </Grid.Col>
              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
