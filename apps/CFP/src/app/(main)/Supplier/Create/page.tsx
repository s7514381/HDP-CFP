'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function SupplierCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title="新增供應商"
      content={Content}
      onSubmit={(data) => formPost(API_MAP.SUPPLIER_CREATE, data)}
      redirectPath="/Supplier"
    />
  );
}
