'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function RoleCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.role.addTitle}
      content={Content}
      onSubmit={(data) => formPost(`${API_URL}/Role/Create`, data)}
      redirectPath="/Role"
    />
  );
}
