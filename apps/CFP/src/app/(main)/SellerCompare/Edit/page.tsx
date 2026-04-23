'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP,API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';

export default function MaterialEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(`${API_URL}/SellerCompare/GetModel`, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title="編輯料號"
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(`${API_URL}/SellerCompare/Edit`, data)}
      redirectPath="/SellerCompare"
    />
  );
}
