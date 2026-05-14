'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

const normalizeCanSell = (value: unknown) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', '是', '可'].includes(normalized) ? 'true' : 'false';
};

export default function MaterialCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增料號"
      content={Content}
      onSubmit={(data) => formPost(API_MAP.MATERIAL_CREATE, { ...data, canSell: normalizeCanSell((data as any).canSell) })}
      redirectPath="/Material"
    />
  );
}
