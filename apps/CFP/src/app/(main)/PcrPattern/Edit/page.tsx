'use client';

import React, { useCallback } from 'react';
import Content from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { PcrPatternFormData } from '@/types/pcrPattern';

export default function PcrPatternEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => (
    formPost(API_MAP.PCR_PATTERN_GET_MODEL, { id })
  ), [formPost]);

  return (
    <FormPageWrapper<PcrPatternFormData>
      title={LANGUAGE_KEYS.pcrPattern.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.PCR_PATTERN_EDIT, {
        ...data,
        item: data.item.trim(),
        category: Number(data.category),
        childList: data.childList.map(child => ({
          ...child,
          item: child.item.trim(),
        })),
      })}
      redirectPath="/PcrPattern"
      successMessage={LANGUAGE_KEYS.pcrPattern.saved}
    />
  );
}
