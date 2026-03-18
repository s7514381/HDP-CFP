'use client';

import { useApiContext } from "@packages/contexts/ApiContext";
import { apiRequest } from "@packages/lib/api";
import { ApiRequest, ApiResponse, ApiResponse422 } from "@packages/types/api";
import { loadingType, UseApiRequest, UseApiResult } from "@packages/types/useApi";
import { useCallback, useRef, useState } from "react";

/**
 * 提供一個API查詢的hook，並且自動處理loading與error狀態
 * @example
 * ```tsx
 * 方法一：
 * const api = useApi();
 * const result = await api.get<MyDataType>('/my-api-endpoint', {body: {...}});
 * if(result.success){
 *   // 處理成功邏輯
 * }
 * if(result.status === 422){
 *  // 處理驗證錯誤邏輯
 * }
 * if(api.loading === 'loading'){
 *  // 顯示載入中
 * }
 * 方法二：
 * const api = useApi();
 * const result = await api.post<MyDataType, MyRequestType>('/my-api-endpoint', {
 *   body: {...},
 *   handles: {
 *     onSuccess: (data) => { // 200 處理成功邏輯 },
 *     onValidateError: (errors) => { // 422 處理驗證錯誤邏輯 },
 *     onDefaultError: (message) => { // 處理其他錯誤邏輯 },
 *   }
 * });
 * ```
 * 
 */
export const useApi = (): UseApiResult => {
  
  const [loading, setLoading] = useState<loadingType>('idle');
  const [error, setError] = useState<string | null>(null);
  // 向useApiContext取得token更新的url
  const {tokenRefreshUrl} = useApiContext();
    

  // 並行計數避免 loading 閃爍
  const pending = useRef(0);
  /**
   * 建立一個計數器在開始請求時增加，結束請求時減少
   * 這樣可以避免多個並行請求時，loading狀態閃爍的問題
   */
  const begin = useCallback(() => {
    pending.current += 1;
    setLoading('loading');
  }, []);
  /**
   * 結束請求時減少計數器，當計數器為0時，表示所有請求都結束，將loading設為false
   */
  const end = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    if (pending.current === 0) {
      setLoading('success');
    }
  }, []);
  /**
   * 結束請求時減少計數器，當計數器為0時，表示所有請求都結束，將loading設為false
   */
  const apiError = useCallback(() => {
    pending.current = Math.max(0, pending.current - 1);
    if (pending.current === 0) {
      setLoading('error');
    }
  }, []);

  const setErrorState = useCallback(
    (msg: string | null) => {
      setError(msg);
    }, []);

  /** 核心方法 */
  const request = useCallback(async <TRes, TReq=unknown>(
    url: string, 
    options?: UseApiRequest<TRes, TReq>
  ) => {
    // 如果傳來的參數有tokenRefreshUrl已傳來的為主，如果沒有以上下文的為主
    const _tokenRefreshUrl = options?.tokenRefreshUrl ?? tokenRefreshUrl;
    const  {handlers, ...reqOptions } = options || {handlers: undefined};

    try {
      begin();
      setErrorState(null);
      const result = await apiRequest<TRes, TReq>(url, {...reqOptions, tokenRefreshUrl: _tokenRefreshUrl} as ApiRequest<TReq>);
      if(result.success){
        handlers?.onSuccess?.(result);
      }
      if(result.status === 422){
        handlers?.onValidateError?.(result.data as ApiResponse422);
      }
      end();
      return result;
    } catch (e) {
      setErrorState((e as Error).message);
      handlers?.onDefaultError?.((e as Error).message);
      apiError();
      return {
        success: false,
        status: 0,
        message: (e as Error).message,
        data: null,
      } as ApiResponse<TRes>;
    }
  }, [begin, end, setErrorState, apiError]);

  const get = useCallback(
    (<TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TRes, TReq>, "method" | "body">
    ) => request<TRes, TReq>(url, { ...options, method: "GET" })),
    [request]
  );

  const post = useCallback(
    (<TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TReq, TReq>, "method">
    ) => request<TRes, TReq>(url, { ...options, method: "POST" })),
    [request]
  );

  const put = useCallback(
    (<TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TReq, TReq>, "method">
    ) => request<TRes, TReq>(url, { ...options, method: "PUT" })),
    [request]
  );

  const del = useCallback(
    (<TRes, TReq = unknown>(
      url: string,
      options?: Omit<UseApiRequest<TReq, TReq>, "method">
    ) => request<TRes, TReq>(url, { ...options, method: "DELETE" })),
    [request]
  );
  
  return {
    loading,
    error,
    setError: setErrorState,
    request,
    get,
    post,
    put,
    delete: del,
  };
}