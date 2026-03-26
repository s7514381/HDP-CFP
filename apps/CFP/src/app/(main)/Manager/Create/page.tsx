'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function ManagerCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增管理員"
      content={Content}
      onSubmit={(data) => formPost(API_MAP.MANAGER_CREATE, data)}
      redirectPath="/Manager"
    />
  );
}
