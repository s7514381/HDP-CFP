'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function AdminMenuCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增選單"
      content={Content}
      onSubmit={(data) => formPost(API_MAP.ADMIN_MENU_CREATE, data)}
      redirectPath="/AdminMenu"
    />
  );
}