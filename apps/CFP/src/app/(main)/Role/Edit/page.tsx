'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function RoleEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(`${API_URL}/Role/GetModel`, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.role.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(`${API_URL}/Role/Edit`, data)}
      redirectPath="/Role"
    />
  );
}
