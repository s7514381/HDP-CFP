'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function RoleCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增功能"
      content={Content}
      onSubmit={(data) => formPost(`${API_URL}/Role/Create`, data)}
      redirectPath="/Role"
    />
  );
}
