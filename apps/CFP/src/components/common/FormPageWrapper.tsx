'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface FormPageWrapperProps<T> {
  title: string;
  content: React.ComponentType<any> & { defaultData?: any };
  initialData?: T;
  onSubmit: (formData: T) => Promise<{ success: boolean; message?: string }>;
  onFetchModel?: (id: string) => Promise<any>;
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
function FormPageWrapperInner<T extends Record<string, any>>({
  title,
  content: Content,
  initialData,
  onSubmit,
  onFetchModel,
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

  const [formData, setFormData] = useState<T>(initialData || (Content.defaultData as T));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!(id && onFetchModel));

  const fetchModel = useCallback(async () => {
    if (!id || !onFetchModel) return;

    setFetching(true);
    try {
      const res = await onFetchModel(id);
      const data = res?.data || res;

      if (data && typeof data === 'object') {
        // Merge initial data with the API model.
        // - Filter null values.
        // - Preserve objects and arrays.
        // - Preserve status as a numeric value for backend validation.
        const processedData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => {
            if (v === null) return [k, ''];
            if (typeof v === 'object') return [k, v];
            // Normalize a backend status value of 200 to 1.
            if (k === 'Status' || k === 'status') {
              const statusValue = v === 200 ? 1 : v;
              return [k, statusValue];
            }
            if (k === 'CanSell' || k === 'canSell') {
              return ['canSell', String(v)];
            }
            return [k, String(v)];
          })
        );

        setFormData(prev => {
          const newData = {
            ...(Content.defaultData || {}),
            ...prev,
            ...processedData
          };
          return newData as T;
        });
      }
    } catch (error) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
    } finally {
      setFetching(false);
    }
  }, [id, onFetchModel, danger]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    // Preserve custom object values and native element values.
    setFormData(prev => ({ ...prev, [name]: (typeof value === 'object' && value !== null) ? value : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSubmit(formData);

      if (result.success) {
        success({ message: <span>{translate(successMessage)}</span> });
        router.push(redirectPath);
      } else {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.saveFailed)}</span> });
      }
    } catch (error) {
      console.error('Submit error:', error);
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.saveError)}</span> });
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
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={translate(submitLabel)}
    />
  );
}

// Wrapper component with Suspense boundary
export default function FormPageWrapper<T extends Record<string, any>>(props: FormPageWrapperProps<T>) {
  return (
    <Suspense fallback={<FormPageLoading />}>
      <FormPageWrapperInner {...props} />
    </Suspense>
  );
}
