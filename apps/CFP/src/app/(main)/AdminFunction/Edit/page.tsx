'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function AdminFunctionEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.ADMIN_FUNCTION_GET_MODEL, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title="編輯功能"
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.ADMIN_FUNCTION_EDIT, data)}
      redirectPath="/AdminFunction"
    />
  );
}
