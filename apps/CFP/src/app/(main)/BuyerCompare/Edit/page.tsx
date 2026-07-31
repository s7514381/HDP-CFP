'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function MaterialEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(`${API_URL}/BuyerCompare/GetModel`, { id });
  }, [formPost]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.buyerCompare.title}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(`${API_URL}/BuyerCompare/Edit`, data)}
      redirectPath="/BuyerCompare"
    />
  );
}
