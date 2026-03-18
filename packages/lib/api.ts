import { ApiEvent, ApiRequest, ApiResponse, ApiResponseList } from "@packages/types/api";
import { Links, PaginationProps } from "@packages/components/bootstrap5/Pagination";


/** 計數器 */
let seq = 0;
/** 創建request id */
const createId = () => {
    return `api-request-${Date.now()}-${++seq}`;
}
/** 全域處理API事件的回調函數 */
let handler: ((event: ApiEvent) => void) | undefined = undefined;
/** 提供ApiContext的回調 */
export const setApiEventHandler = (fn?: (event: ApiEvent) => void) => {
    handler = fn;
}
/** 發出API事件 */
export function emitApiEvent(e: ApiEvent) {
  handler?.(e);
}
const defaultOptions: ApiRequest<unknown> = {
    method: 'GET',
    headers: {},
    params: {},
    body: undefined
};
/**
 * 封裝 fetch 提供API請求的核心函數
 * @param url 
 * @param options 
 * @returns 
 */
export async function apiRequest<TResponse, TRequest = unknown>(
    url: string,
    options: ApiRequest<TRequest> = defaultOptions as ApiRequest<TRequest>
): Promise<ApiResponse<TResponse> | ApiResponseList<TResponse[]>> {

    /** 替每個訪問創建一個ID */
    const requestId = createId();
    const apiEvent = {
        requestId: requestId,
        status: 0,
        loadingStatus: "start",
        isLoading: true,
        message: null,
        request: options,
    } as ApiEvent;
    /** 傳遞給ApiContext */
    emitApiEvent(apiEvent);

    // 如果有params，將其物件轉成查詢參數並與URL結合
    if (options.params) {
        const paramsString = new URLSearchParams(options.params as Record<string, string>).toString();
        url += (url.includes("?") ? "&" : "?") + paramsString;
    };

    // 判斷是否為表單FormData
    const isFormData = options.body instanceof FormData;
    const method = (options.method || "GET").toUpperCase();
    const hasBody = options.body != null && !/^(GET|HEAD)$/i.test(method);

    // 配置Headers
    const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers as Record<string, string>),
    };
    // 僅在需要時設定 Content-Type
    if (!isFormData && hasBody) {
        headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    }
    // 配置Fetch選項
    const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        body: hasBody ? prepareRequestBody(options.body) : undefined,
        credentials: "include",
    };

    // 統一回傳格式
    const responseFormat = {
        success: false,
        status: 0,
        message: null,
        data: null as unknown as TResponse,
        pagination: null as unknown as PaginationProps,
        links: null as unknown as Links,
    } as ApiResponse<TResponse> | ApiResponseList<TResponse[]>;

    // 查詢API
    try {
        let result = await fetch(url, fetchOptions);
        // 如果是401嘗試更新令牌，如果更新成功就在重新呼叫一遍API
        if(result.status === 401 && options?.tokenRefreshUrl){
            const retry = await tryRefreshToken(options.tokenRefreshUrl, fetchOptions);
            if(retry){
                result = await fetch(url, fetchOptions);
            }
        }
        // ---  判斷回傳格式是否為檔案型態  ---
        if (options.responseType === 'blob') {
            const blob = await result.blob();
            // 更新 ApiEvent 狀態
            apiEvent.status = result.status;
            apiEvent.loadingStatus = "final";
            apiEvent.isLoading = false;
            emitApiEvent(apiEvent);
            // 直接回傳 Blob 物件
            responseFormat.success = true;
            responseFormat.status = 200;
            responseFormat.message = 'File download successful';
            responseFormat.data = blob;
            return responseFormat; 
        }
        // --- 處理Json ---
        const data = await result.json();
        responseFormat.success = data?.success ?? result.ok;
        responseFormat.status = data?.status ?? result.status;
        responseFormat.message = data?.message ?? result.statusText;
        responseFormat.data = data?.data ?? null;
        // 如果是列表回傳，處理分頁與連結資訊
        if ('pagination' in data && 'links' in data) {
          (responseFormat as ApiResponseList<TResponse[]>).pagination = data.pagination;
          (responseFormat as ApiResponseList<TResponse[]>).links = data.links;
        }
        // 更新apiEvent狀態
        apiEvent.status = result.status;
        apiEvent.loadingStatus = "final";
        apiEvent.isLoading = false;
        apiEvent.message = responseFormat.message;
        emitApiEvent(apiEvent);
        return responseFormat;
    }catch (error) {
        
        apiEvent.loadingStatus = "error";
        apiEvent.isLoading = false;
        apiEvent.message = (error as Error).message;
        emitApiEvent(apiEvent);
        responseFormat.message = (error as Error).message;
        return responseFormat;
    }
}

/**
 * @param url 更新令牌URL
 * @param fetchOptions 
 * @returns 
 */
const tryRefreshToken = async (refshUrl: string, fetchOptions: RequestInit): Promise<boolean> => {
    const result = await fetch(refshUrl, fetchOptions);
    return result.status === 200
}

/**
 * 判斷body是否為表單物件，或是物件，如果是FormData回傳物件本身，如果不是則使用JSON.stringify轉成字串
 */
function prepareRequestBody<T>(body: T): string | FormData | undefined {
    if (!body) return undefined;
    if (body instanceof FormData) {
        return body;
    }
    return JSON.stringify(body);
}
