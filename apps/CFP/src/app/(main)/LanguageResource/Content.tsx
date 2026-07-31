'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
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
  sourceText?: string;
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
        text: language.isBaseLanguage ? (formData?.sourceText || '') : ''
      }))
    ];
    updateForm({ translationList });
  }, [languages, formData?.translationList, formData?.sourceText, updateForm]);

  const menuOptions = useMemo(() => {
    const result = [{ label: translate(LANGUAGE_KEYS.common.notConfigured, '通用'), value: '' }];
    const flatten = (items: AdminMenuData[], depth = 0) => {
      items.forEach(item => {
        result.push({
          label: `${'　'.repeat(depth)}${item.englishCode || translate(LANGUAGE_KEYS.common.notConfigured, '未設定')} - ${item.title || ''}`,
          value: item.id
        });
        if (item.childList?.length) flatten(item.childList, depth + 1);
      });
    };
    flatten(menus);
    return result;
  }, [menus, translate]);

  const handleSourceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const sourceText = event.target.value;
    const baseLanguage = languages.find(language => language.isBaseLanguage);
    const translationList = (formData?.translationList || []).map(item =>
      baseLanguage && item.languageId === baseLanguage.id ? { ...item, text: sourceText } : item
    );

    updateForm({ sourceText, translationList });
  };

  const handleTranslationChange = (languageId: string, text: string) => {
    const translationList = (formData?.translationList || []).map(item =>
      item.languageId === languageId ? { ...item, text } : item
    );
    updateForm({ translationList });
  };

  return (
    <>
      <ActionBar title={title}>
        <div className="ms-auto d-flex gap-2">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel" disabled={loading}>
            {translate(LANGUAGE_KEYS.common.backToList, '返回列表')}
          </Btn>
        </div>
      </ActionBar>

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input label={translate(LANGUAGE_KEYS.common.resourceCode, languageCode === 'en-US' ? 'Code' : '代號')} value={formData?.serialNumber || translate(LANGUAGE_KEYS.common.loadingData, '儲存後由系統產生')} disabled />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.languageResource.menuCode, '功能英文代號')}
                    name="adminMenuId"
                    value={formData?.adminMenuId || ''}
                    onChange={onChange}
                    options={menuOptions}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <Input
                    label={translate(LANGUAGE_KEYS.languageResource.baseContent, '中文（基礎語言）')}
                    name="sourceText"
                    value={formData?.sourceText || ''}
                    onChange={handleSourceChange}
                    placeholder={translate(LANGUAGE_KEYS.languageResource.baseContent, '例如：確定要XX嗎')}
                    required
                  />
                </Grid.Col>

                <Grid.Col md={12}>
                  <h5 className="fw-bold mt-3 mb-2">{translate(LANGUAGE_KEYS.languageResource.translationContent, '翻譯內容')}</h5>
                  <div className="d-flex flex-column gap-3">
                    {(formData?.translationList || []).map(language => (
                      <Grid.Row className="g-3 align-items-end" key={language.languageId}>
                        <Grid.Col md={3}>
                          <Input label={translate(LANGUAGE_KEYS.common.language, '語言')} value={`${language.languageName || ''} (${language.languageCode || ''})`} disabled />
                        </Grid.Col>
                        <Grid.Col md={9}>
                          <Input
                            label={language.isBaseLanguage ? translate(LANGUAGE_KEYS.common.baseLanguageContent, '基礎內容') : translate(LANGUAGE_KEYS.common.translation, '翻譯')}
                            value={language.text || ''}
                            onChange={(event) => handleTranslationChange(language.languageId, event.target.value)}
                            disabled={language.isBaseLanguage}
                            placeholder={language.isBaseLanguage ? translate(LANGUAGE_KEYS.common.baseLanguageContent, '由中文欄位同步') : translate(LANGUAGE_KEYS.common.translation, '請輸入翻譯內容')}
                          />
                        </Grid.Col>
                      </Grid.Row>
                    ))}
                  </div>
                </Grid.Col>

                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.status, '狀態')}
                    name="status"
                    value={formData?.status?.toString() || '1'}
                    onChange={onChange}
                    options={[{ label: translate(LANGUAGE_KEYS.common.enabled, '啟用'), value: '1' }, { label: translate(LANGUAGE_KEYS.common.disabled, '停用'), value: '0' }]}
                  />
                </Grid.Col>
                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/LanguageResource')}>
                    {translate(LANGUAGE_KEYS.common.cancel, '取消')}
                  </Btn>
                  <Btn type="submit" color="primary" loading={loading} icon="save">
                    {translate(submitLabel, submitLabel)}
                  </Btn>
                </Grid.Col>
              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
