'use client';

import { useApi } from "@packages/hooks/useApi";
import { UseApiRequest, UseApiResult } from "@packages/types/useApi";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { appStorage, clearSession, sessionStorageKeys } from '@/lib/appStorage';
import { toFormData } from '@/lib/formData';

/**
 * 繼承自 @packages/hooks/useApi 的 Hook
 * 自動在所有請求中加入 LocalStorage 的 token
 */
export const useAppApi = (): UseApiResult => {
  const api = useApi();
  const router = useRouter();

  const { request: originalRequest } = api;

  // 封裝核心 request，確保內部邏輯一致
  const appRequest = useCallback(
    async <TRes, TReq = unknown>(
      url: string,
      options?: UseApiRequest<TRes, TReq>
    ) => {
      // 複製 options 以避免修改到原始物件
      const reqOptions = { ...options } as UseApiRequest<TRes, TReq>;

      // 從 LocalStorage 取得 token 並加入 header
      const token = appStorage.get<string>(sessionStorageKeys.token);
      if (token) {
        reqOptions.headers = {
          ...reqOptions.headers,
          Authorization: `${token}`,
        };
      }

      const languageCode = appStorage.get<string>(sessionStorageKeys.languageCode);
      if (languageCode) {
        reqOptions.headers = {
          ...reqOptions.headers,
          "X-Language-Code": languageCode,
        };
      }

      const result = await originalRequest<TRes, TReq>(url, reqOptions);

      // 如果收到 401，表示未登入或 token 過期，跳轉到首頁
      if (result.status === 401) {
        clearSession();
        router.push("/login");
      }

      return result;
    },
    [originalRequest, router] // 僅依賴於穩定的 originalRequest
  );

  const get = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method" | "body">
      ) => appRequest<TRes, TReq>(url, { ...options, method: "GET" } as unknown as UseApiRequest<TRes, TReq>),
    [appRequest]
  );

  const post = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
      ) => appRequest<TRes, TReq>(url, { ...options, method: "POST" } as unknown as UseApiRequest<TRes, TReq>),
    [appRequest]
  );

  const put = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
      ) => appRequest<TRes, TReq>(url, { ...options, method: "PUT" } as unknown as UseApiRequest<TRes, TReq>),
    [appRequest]
  );

  const del = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
      ) => appRequest<TRes, TReq>(url, { ...options, method: "DELETE" } as unknown as UseApiRequest<TRes, TReq>),
    [appRequest]
  );

  /**
   * 將物件轉為 FormData 並發送 POST 請求
   * @param url API 路徑
   * @param data 物件資料
   */
  const formPost = useCallback(async <TRes,>(url: string, data: Parameters<UseApiResult['formPost']>[1]) => {
      // 防禦性檢查：確保 data 存在
      if (!data) {
        console.warn('formPost: data is undefined or null');
        return Promise.resolve({ success: false, message: 'No data provided' } as Awaited<ReturnType<UseApiResult['formPost']>>);
      }

       const fd = toFormData(data);

      return appRequest<TRes, FormData>(url, {
        method: "POST",
        body: fd,
      });
    }, [appRequest]) as UseApiResult['formPost'];

  return useMemo(
    () => ({
      ...api,
      request: appRequest,
      get,
      post,
      put,
      delete: del,
      formPost,
    }),
    [api, appRequest, get, post, put, del, formPost]
  );
};
