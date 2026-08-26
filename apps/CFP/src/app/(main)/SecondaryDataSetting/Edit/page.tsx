'use client';

import React, { useCallback } from 'react';
import Content from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function SecondaryDataSettingEditPage() {
  const { post, formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => {
    return post(API_MAP.SECONDARY_DATA_SETTING_GET_MODEL, { params: { id } });
  }, [post]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.secondaryDataSetting.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.SECONDARY_DATA_SETTING_EDIT, data)}
      redirectPath="/SecondaryDataSetting"
      successMessage={LANGUAGE_KEYS.common.saved}
    />
  );
}
