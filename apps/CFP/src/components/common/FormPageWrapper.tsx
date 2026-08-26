'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormModelNormalizer, normalizeFormModel } from '@/lib/formModel';
import { FormContentProps, FormUpdate } from './formTypes';

const EMPTY_FORM_DATA: Record<string, never> = {};

interface FormPageWrapperProps<T extends object> {
  title: string;
  content: React.ComponentType<FormContentProps<T>> & { defaultData?: T };
  initialData?: T;
  onSubmit: (formData: T) => Promise<{ success: boolean; message?: string }>;
  onFetchModel?: (id: string) => Promise<unknown>;
  normalizeModel?: FormModelNormalizer<T>;
  redirectPath: string;
  submitLabel?: string;
  successMessage?: string;
  idParamName?: string;
}

// Loading fallback component
function FormPageLoading() {
  const { translate } = useLanguage();
  return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{translate(LANGUAGE_KEYS.common.loading)}</span>
      </div>
      <div className="mt-2 text-muted">{translate(LANGUAGE_KEYS.common.loading)}</div>
    </div>
  );
}

// Inner component that uses useSearchParams
function FormPageWrapperInner<T extends object>({
  title,
  content: Content,
  initialData,
  onSubmit,
  onFetchModel,
  normalizeModel = normalizeFormModel,
  redirectPath,
  submitLabel = LANGUAGE_KEYS.common.save,
  successMessage = LANGUAGE_KEYS.common.saved,
  idParamName = 'id',
}: FormPageWrapperProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get(idParamName);
  const { success, danger } = useToast();
  const { translate } = useLanguage();

  const defaultData = initialData ?? Content.defaultData ?? (EMPTY_FORM_DATA as T);
  const [formData, setFormData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!(id && onFetchModel));

  const fetchModel = useCallback(async () => {
    if (!id || !onFetchModel) return;

    setFetching(true);
    try {
      const res = await onFetchModel(id);
      const data = typeof res === 'object' && res !== null && 'data' in res
        ? res.data || res
        : res;

      if (data && typeof data === 'object') {
        setFormData(prev => normalizeModel(data, { ...defaultData, ...prev }));
      }
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
    } finally {
      setFetching(false);
    }
  }, [defaultData, danger, id, normalizeModel, onFetchModel, translate]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateForm = useCallback<FormUpdate<T>>((patch) => {
    setFormData(prev => ({ ...prev, ...patch }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSubmit(formData);

      if (result.success) {
        success({ message: <span>{translate(successMessage)}</span> });
        router.push(redirectPath);
      } else {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.saveFailed)}</span> });
      }
    } catch (error) {
      console.error('Submit error:', error);
      const message = error instanceof Error && error.message
        ? error.message
        : translate(LANGUAGE_KEYS.common.saveError);
      danger({ message: <span>{message}</span> });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{translate(LANGUAGE_KEYS.common.loading)}</span>
      </div>
      <div className="mt-2 text-muted">{translate(LANGUAGE_KEYS.common.loadingData)}</div>
    </div>
  );

  return (
    <Content
      title={title}
      formData={formData}
      onChange={handleChange}
      updateForm={updateForm}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={translate(submitLabel)}
    />
  );
}

// Wrapper component with Suspense boundary
export default function FormPageWrapper<T extends object>(props: FormPageWrapperProps<T>) {
  return (
    <Suspense fallback={<FormPageLoading />}>
      <FormPageWrapperInner {...props} />
    </Suspense>
  );
}
