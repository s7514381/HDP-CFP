'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function AdminMenuEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.ADMIN_MENU_GET_MODEL, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title="編輯選單"
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.ADMIN_MENU_EDIT, data)}
      redirectPath="/AdminMenu"
    />
  );
}