'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function SupplierCreatePage() {
  const { formPost } = useAppApi();
  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.supplier.add}
      content={Content}
      onSubmit={(data) => formPost(API_MAP.SUPPLIER_CREATE, data)}
      redirectPath="/Supplier"
    />
  );
}
