'use client';

import { useApi } from "@packages/hooks/useApi";
import { getLocalStorage, removeLocalStorage } from "@packages/lib/localstorage";
import { UseApiRequest, UseApiResult } from "@packages/types/useApi";
import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

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
      const token = getLocalStorage<string>("token");
      if (token) {
        reqOptions.headers = {
          ...reqOptions.headers,
          Authorization: `${token}`,
        };
      }

      const result = await originalRequest<TRes, TReq>(url, reqOptions);

      // 如果收到 401，表示未登入或 token 過期，跳轉到首頁
      if (result.status === 401) {
        removeLocalStorage("token");
        removeLocalStorage("userInfo");
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
    ) => appRequest<TRes, TReq>(url, { ...options, method: "GET" } as any),
    [appRequest]
  );

  const post = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
    ) => appRequest<TRes, TReq>(url, { ...options, method: "POST" } as any),
    [appRequest]
  );

  const put = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
    ) => appRequest<TRes, TReq>(url, { ...options, method: "PUT" } as any),
    [appRequest]
  );

  const del = useCallback(
    <TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method">
    ) => appRequest<TRes, TReq>(url, { ...options, method: "DELETE" } as any),
    [appRequest]
  );

  /**
   * 將物件轉為 FormData 並發送 POST 請求
   * @param url API 路徑
   * @param data 物件資料
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formPost = useCallback(<TRes = any>(url: string, data?: Record<string, any> | null) => {
      // 防禦性檢查：確保 data 存在
      if (!data) {
        console.warn('formPost: data is undefined or null');
        return Promise.resolve({ success: false, message: 'No data provided' } as any);
      }

      const fd = new FormData();

      const appendValue = (key: string, value: any, parentKey?: string) => {
        if (value == null) return;
        
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            appendValue(String(index), item, fullKey);
          });
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            appendValue(subKey, subValue, fullKey);
          });
        } else {
          fd.append(fullKey, String(value));
        }
      };

      Object.entries(data).forEach(([key, value]) => {
        appendValue(key, value);
      });

      return appRequest<TRes, FormData>(url, {
        method: "POST",
        body: fd,
      });
    }, [appRequest]);

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