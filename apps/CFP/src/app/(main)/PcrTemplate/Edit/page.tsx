'use client';

import React, { useCallback } from 'react';
import Content, { PcrTemplateFormData } from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { appStorage } from '@/lib/appStorage';
import {
  isPcrTemplateCategory,
  PCR_TEMPLATE_CATEGORY_STORAGE_KEY,
} from '@/types/pcrTemplate';

export default function PcrTemplateEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => {
    const result = await formPost(API_MAP.PCR_TEMPLATE_GET_MODEL, { id });
    const category = result.data && typeof result.data === 'object' && 'category' in result.data
      ? result.data.category
      : null;

    if (isPcrTemplateCategory(category)) {
      appStorage.set(PCR_TEMPLATE_CATEGORY_STORAGE_KEY, category);
    }

    return result;
  }, [formPost]);

  return (
    <FormPageWrapper<PcrTemplateFormData>
      title={LANGUAGE_KEYS.pcrTemplate.title}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.PCR_TEMPLATE_EDIT, {
        ...data,
        item: data.item.trim(),
        category: Number(data.category),
        childList: data.childList.map(child => ({
          ...child,
          item: child.item.trim(),
        })),
      })}
      redirectPath="/PcrTemplate"
    />
  );
}
