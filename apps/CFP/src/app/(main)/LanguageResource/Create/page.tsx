'use client';

import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function LanguageResourceCreatePage() {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { hasPermission, isReady } = usePagePermissions('/LanguageResource');
  const canAddTranslation = hasPermission('LanguageResource:Create');

  useEffect(() => {
    if (isReady && !canAddTranslation) {
      router.replace('/LanguageResource');
    }
  }, [canAddTranslation, isReady, router]);

  if (!isReady || !canAddTranslation) return null;

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.languageResource.addResourceTitle}
      content={Content}
      onSubmit={(data) => formPost(API_MAP.LANGUAGE_RESOURCE_CREATE, data)}
      redirectPath="/LanguageResource"
    />
  );
}
