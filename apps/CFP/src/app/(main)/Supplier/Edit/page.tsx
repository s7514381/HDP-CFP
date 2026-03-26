'use client';

import React, { useCallback } from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function SupplierEditPage() {
  const { post, formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => {
    return post(API_MAP.SUPPLIER_GET_MODEL, { params: { id } });
  }, [post]);

  return (
    <FormPageWrapper
      title="編輯供應商"
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.SUPPLIER_EDIT, data)}
      redirectPath="/Supplier"
    />
  );
}
