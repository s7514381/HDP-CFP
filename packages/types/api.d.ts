import { Links, PaginationProps } from "@/components/bootstrap5/Pagination";

/**
 * API method types
 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * fetch request headers 
 */
export type ApiHeaders = Record<string, string>;

/**
 * 後端422時的Body的回應格式
 */
export interface ApiResponse422 {
    [fieldName: string]: string[];
}

/**
 * fetch request parameters
 */
export interface ApiRequest<T> {
    method: ApiMethod;
    headers?: ApiHeaders;
    params?: Record<string, string | number>;
    body?: T;
    // 更新令牌的端點
    tokenRefreshUrl?: string;
    // 檔案型別
    responseType?: 'json' | 'blob';
}

/**
 * fetch API response types
 */
export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string | null;
    data: T | Blob | null;
}

export interface ApiResponseList<T> extends ApiResponse<T> {
  data: T[] | null;
  pagination: PaginationProps;
  links: Links;
}

/**
 * 要傳遞給ApiContext用來處理全域錯誤或是紀錄日誌的型別
 * @template TResponse 回傳的資料型別
 * @template TRequest 傳送的資料型別
 * @property requestId 每次請求的唯一識別碼
 * @property request 傳送的請求內容
 */
export interface ApiEvent {
  requestId: string;
  status: number;
  loadingStatus: 'start' | 'final' | 'error';
  isLoading: boolean;
  message: string | null;
  request?: ApiRequest<unknown>;
}

/**
 * 提供給 ApiProvider 的初始設定型別
 */
export interface ApiContextConfig {
  tokenRefreshUrl?: string | null;
  userLoginUrl?: string | null;
  userLogoutUrl?: string | null;
  // 使用301轉只方式轉跳到userLogoutUrl
  useRedirectLogout?: boolean;
}

/**
 * ApiContext使用的型別
 */
export interface ApiContextValue {
  apiEvent: ApiEvent | null;
  setApiEvent: (event: ApiEvent | null) => void;
  tokenRefreshUrl: string | null;
  setTokenRefreshUrl: (url: string | null) => void;
  userLoginUrl: string | null;
  setUserLoginUrl: (url: string | null) => void;
  userLogoutUrl: string | null;
  setUserLogoutUrl: (url: string | null) => void;
  useRedirectLogout: boolean;
  setUseRedirectLogout: (useRedirect: boolean) => void;
}
