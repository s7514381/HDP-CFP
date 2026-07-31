'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function AdminFunctionCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.adminFunction.addTitle}
      content={Content}
      onSubmit={(data) => formPost(API_MAP.ADMIN_FUNCTION_CREATE, data)}
      redirectPath="/AdminFunction"
    />
  );
}
