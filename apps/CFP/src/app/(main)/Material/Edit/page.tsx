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

export default function MaterialEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.MATERIAL_GET_MODEL, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title="編輯料號"
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.MATERIAL_EDIT, { ...data, canSell: normalizeCanSell((data as any).canSell) })}
      redirectPath="/Material"
    />
  );
}
