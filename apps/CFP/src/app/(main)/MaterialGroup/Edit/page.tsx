'use client';

import React, { useCallback } from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function MaterialGroupEditPage() {
  const { post, formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => {
    return post(API_MAP.MATERIAL_GROUP_GET_MODEL, { params: { id } });
  }, [post]);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.materialGroup.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.MATERIAL_GROUP_EDIT, data)}
      redirectPath="/MaterialGroup"
    />
  );
}
