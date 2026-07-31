'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP,API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function MaterialEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(`${API_URL}/SellerCompare/GetModel`, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.sellerCompare.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(`${API_URL}/SellerCompare/Edit`, data)}
      redirectPath="/SellerCompare"
    />
  );
}
