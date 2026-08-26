'use client';

import React from 'react';
import Content, { DEFAULT_SECONDARY_DATA_SETTING_FORM } from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function SecondaryDataSettingCreatePage() {
  const { formPost } = useAppApi();

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.secondaryDataSetting.addTitle}
      content={Content}
      initialData={DEFAULT_SECONDARY_DATA_SETTING_FORM}
      onSubmit={(data) => formPost(API_MAP.SECONDARY_DATA_SETTING_CREATE, data)}
      redirectPath="/SecondaryDataSetting"
      successMessage={LANGUAGE_KEYS.common.saved}
    />
  );
}
