'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function ManagerCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.manager.title}
      content={Content}
      onSubmit={(data) => formPost(API_MAP.MANAGER_CREATE, data)}
      redirectPath="/Manager"
    />
  );
}
