'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@packages/contexts/ToastContext';

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
  return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">載入中...</span>
      </div>
      <div className="mt-2 text-muted">正在載入...</div>
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
  submitLabel = '儲存',
  successMessage = '儲存成功！',
  idParamName = 'id',
}: FormPageWrapperProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get(idParamName);
  const { success, danger } = useToast();

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
        // 合併初始資料與 API 回傳資料
        // - 過濾掉 null 值
        // - 保留物件和陣列不做轉換
        // - 保留 Status 欄位為數值不做字串轉換（後端可能為 enum 或特定數值驗證）
        const processedData = Object.fromEntries(
          Object.entries(data).map(([k, v]) => {
            if (v === null) return [k, ''];
            if (typeof v === 'object') return [k, v];
            // Status 欄位：200 轉換為 1（啟用），保留為數值
            if (k === 'Status' || k === 'status') {
              const statusValue = v === 200 ? 1 : v;
              return [k, statusValue];
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
      danger({ message: <span>取得資料失敗，請稍後再試。</span> });
    } finally {
      setFetching(false);
    }
  }, [id, onFetchModel, danger]);

  useEffect(() => {
    fetchModel();
  }, [fetchModel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
    const { name, value } = e.target;
    // 如果 value 是物件或陣列（来自 Content.tsx 的自定義 onChange），直接使用
    // 否則使用原值（可能已被 HTML 元素轉換為字串）
    setFormData(prev => ({ ...prev, [name]: (typeof value === 'object' && value !== null) ? value : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await onSubmit(formData);

      if (result.success) {
        success({ message: <span>{successMessage}</span> });
        router.push(redirectPath);
      } else {
        danger({ message: <span>{result.message || '儲存失敗，請檢查輸入資料。'}</span> });
      }
    } catch (error) {
      console.error('Submit error:', error);
      danger({ message: <span>儲存發生錯誤，請稍後再試。</span> });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="p-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">載入中...</span>
      </div>
      <div className="mt-2 text-muted">正在載入資料...</div>
    </div>
  );

  return (
    <Content
      title={title}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={submitLabel}
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
