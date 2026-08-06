'use client';

import React from 'react';
import Content, { DEFAULT_PCR_PATTERN_FORM } from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { PcrPatternFormData } from '@/types/pcrPattern';

export default function PcrPatternCreatePage() {
  const { formPost } = useAppApi();

  return (
    <FormPageWrapper<PcrPatternFormData>
      title={LANGUAGE_KEYS.pcrPattern.addTitle}
      content={Content}
      initialData={DEFAULT_PCR_PATTERN_FORM}
      onSubmit={(data) => formPost(API_MAP.PCR_PATTERN_CREATE, {
        ...data,
        item: data.item.trim(),
        category: Number(data.category),
        childList: data.childList.map(child => ({
          ...child,
          item: child.item.trim(),
        })),
      })}
      redirectPath="/PcrPattern"
      successMessage={LANGUAGE_KEYS.pcrPattern.added}
    />
  );
}
