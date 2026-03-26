import { ApiResponse } from "./api";

/**
 * 提供useApi的回傳定義
 * 
 */
export type loadingType = 'idle' | 'loading' | 'error' | 'success';

/**
 * 提供API請求時的快捷回調處理方法定義
 */
export type Handlers<T> = {
  // 當success為true時觸發
  onSuccess?: (data: ApiResponse<T> | ApiResponseList<T[]>) => void;
  // 當status為422時觸發
  onValidateError?: (errors: ApiResponse422) => void;
  // 當其他錯誤時觸發
  onDefaultError?: (message: string | null) => void;
}
/**
 * 
 */
export interface UseApiRequest<TRes, TReq = undefined> extends ApiRequest<TReq> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  method: ApiMethod;
  headers?: ApiHeaders;
  params?: Record<string, string | number>;
  body?: T;
  // 檔案型別
  responseType?: 'json' | 'blob';
  handlers?: Handlers<TRes>;
  tokenRefreshUrl?: string;
}

export interface UseApiResult {
  loading: loadingType;
  error: string | null;
  setError: (msg: string | null) => void;

  // 通用
  request: <TRes, TReq = unknown>(
    url: string,
    options?: UseApiRequest<TRes, TReq>
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;

  // 快捷方法
  get: <TRes, TReq = unknown>(
    url: string,
    options?: Omit<UseApiRequest<TRes, TReq>, "method" | "body">
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;

  post: <TRes, TReq = unknown>(
    url: string,
    options?: Omit<UseApiRequest<TRes, TReq>, "method">
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;

  put: <TRes, TReq = unknown>(
    url: string,
    options?: Omit<UseApiRequest<TRes, TReq>, "method">
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;

  // 允許使用 api.delete()
  ["delete"]: <TRes, TReq = unknown>(
    url: string,
    options?: Omit<UseApiRequest<TRes, TReq>, "method">
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;

  // 將物件轉為 FormData 並發送 POST 請求
  formPost: <TRes>(
    url: string,
    data: Record<string, any>
  ) => Promise<ApiResponse<TRes> | ApiResponseList<TRes[]>>;
};


