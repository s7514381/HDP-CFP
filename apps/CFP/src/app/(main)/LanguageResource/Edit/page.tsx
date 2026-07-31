'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function LanguageResourceEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.LANGUAGE_RESOURCE_GET_MODEL, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.languageResource.editResourceTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.LANGUAGE_RESOURCE_EDIT, data)}
      redirectPath="/LanguageResource"
    />
  );
}
