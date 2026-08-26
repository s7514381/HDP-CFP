'use client';

import React from 'react';
import Content from '../Content';
import { API_MAP } from '@/lib/apiRoutes';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { normalizeFormModel } from '@/lib/formModel';
import { ManagerData } from '../Content';

export default function ManagerEditPage() {
  const { formPost } = useAppApi();
  const handleFetchModel = React.useCallback(async (id: string) => {
    return formPost(API_MAP.MANAGER_GET_MODEL, { id });
  }, [formPost]);

  const normalizeManagerModel = React.useCallback((model: unknown, initialData: ManagerData): ManagerData => {
    const normalized = normalizeFormModel(model, initialData);
    const source = model && typeof model === 'object' ? model as Record<string, unknown> : {};

    return {
      ...normalized,
      isCurrentManager: source.isCurrentManager === true || source.IsCurrentManager === true,
    };
  }, []);

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.manager.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      normalizeModel={normalizeManagerModel}
      onSubmit={(data) => formPost(API_MAP.MANAGER_EDIT, data)}
      redirectPath="/Manager"
    />
  );
}
