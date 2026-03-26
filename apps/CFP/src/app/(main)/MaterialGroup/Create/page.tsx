'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function MaterialGroupCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增群組"
      content={Content}
      onSubmit={(data) => formPost(API_MAP.MATERIAL_GROUP_CREATE, data)}
      redirectPath="/MaterialGroup"
    />
  );
}