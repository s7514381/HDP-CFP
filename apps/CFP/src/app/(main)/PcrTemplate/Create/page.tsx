'use client';

import React, { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Content, { DEFAULT_PCR_FORM, PcrTemplateFormData } from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { appStorage } from '@/lib/appStorage';
import {
  isPcrTemplateCategory,
  PCR_TEMPLATE_CATEGORY_STORAGE_KEY,
} from '@/types/pcrTemplate';

function PcrTemplateCreatePageInner() {
  const { formPost } = useAppApi();
  const searchParams = useSearchParams();
  const initialData = useMemo<PcrTemplateFormData>(() => {
    const category = Number(searchParams.get('category'));
    const validCategory = isPcrTemplateCategory(category)
      ? category
      : DEFAULT_PCR_FORM.category;

    return { ...DEFAULT_PCR_FORM, category: validCategory };
  }, [searchParams]);

  useEffect(() => {
    appStorage.set(PCR_TEMPLATE_CATEGORY_STORAGE_KEY, initialData.category);
  }, [initialData.category]);

  return (
    <FormPageWrapper<PcrTemplateFormData>
      title={LANGUAGE_KEYS.pcrTemplate.title}
      content={Content}
      initialData={initialData}
      onSubmit={(data) => formPost(API_MAP.PCR_TEMPLATE_CREATE, {
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

export default function PcrTemplateCreatePage() {
  return (
    <Suspense fallback={null}>
      <PcrTemplateCreatePageInner />
    </Suspense>
  );
}
