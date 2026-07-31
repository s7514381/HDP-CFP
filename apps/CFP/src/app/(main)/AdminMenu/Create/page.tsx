'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function AdminMenuCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.adminMenu.addTitle}
      content={Content}
      onSubmit={(data) => formPost(API_MAP.ADMIN_MENU_CREATE, data)}
      redirectPath="/AdminMenu"
    />
  );
}
