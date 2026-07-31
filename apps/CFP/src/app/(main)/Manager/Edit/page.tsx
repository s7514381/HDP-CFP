'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function ManagerEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.MANAGER_GET_MODEL, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.manager.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.MANAGER_EDIT, data)}
      redirectPath="/Manager"
    />
  );
}
