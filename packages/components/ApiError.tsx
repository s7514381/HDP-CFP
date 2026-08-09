"use client";
import { useRouter } from "next/navigation";
import { Toast } from "@packages/components/bootstrap5/Toasts";
import { ApiEvent } from "@packages/types/api";
import { useApi } from "@packages/hooks/useApi";
import { useEffect } from "react";
import { useApiContext } from "@packages/contexts/ApiContext";


/**
 * 錯誤訊息代理元件
 * @param param0 
 * @returns 
 */
const ErrorProxy = ({title, message, onClose}: {title:string, message:string, onClose?: () => void} ) => {

  return <Toast color="danger" title={title} active={true} position={2} onClose={onClose} autoHide={false}>
    {message}
  </Toast>;
}

export interface ApiErrorLabels {
  noMessage: string;
  loading: string;
  badRequest: string;
  forbidden: string;
  notFound: string;
  methodNotAllowed: string;
  lengthRequired: string;
  uriTooLong: string;
  unsupportedMediaType: string;
  tooManyRequests: string;
  serverError: string;
  badGateway: string;
  serviceUnavailable: string;
  gatewayTimeout: string;
  unknown: string;
}

const DEFAULT_LABELS: ApiErrorLabels = {
  noMessage: 'Request failed',
  loading: 'Network error',
  badRequest: 'Bad request',
  forbidden: 'Insufficient permissions',
  notFound: 'Resource not found',
  methodNotAllowed: 'Method not allowed',
  lengthRequired: 'Request length missing',
  uriTooLong: 'URI too long',
  unsupportedMediaType: 'Unsupported media type',
  tooManyRequests: 'Too many requests',
  serverError: 'Server error',
  badGateway: 'Invalid server response',
  serviceUnavailable: 'Service unavailable',
  gatewayTimeout: 'Server response timed out',
  unknown: 'Request error',
};

/**
 * 其中處理API錯誤訊息的元件，不含422的錯誤處理
 * @param param0 
 * @returns 
 */
export const ApiError = ({
  apiEvent,
  onClose,
  labels = DEFAULT_LABELS,
}: {
  apiEvent?: ApiEvent | null;
  onClose?: () => void;
  labels?: ApiErrorLabels;
}) => {
  const router = useRouter();
  const api = useApi();
  const {userLoginUrl, userLogoutUrl, useRedirectLogout} = useApiContext();
  const httpCode = apiEvent?.status?.toString() || '0';
  const message = `${apiEvent?.status} - ${apiEvent?.message || labels.noMessage}`;

  /** 呼叫API登出用戶．避免傳統登入的cookie還在，但 api token生命週期已經結束 */
  const logoutUser = async () => {
    if(userLogoutUrl){
      if(useRedirectLogout){
        router.push(userLogoutUrl as string);
      }else{
        // POST給API端的登出網址，清除token cookie
        //await api.post(userLogoutUrl);  
        if(userLoginUrl){
          // 轉跳到供應商平台的登出action，進行前端的token清除與轉跳到登入頁面
          router.push(userLoginUrl);
        }
      }
    }
  }

  // 如果是401未授權，直接登出用戶
  useEffect(() => {
    if(apiEvent?.status === 401 && userLogoutUrl && userLoginUrl){
      logoutUser();
    }
  }, [apiEvent?.status]);

  if(!apiEvent) return null;

  /** 關閉錯誤訊息 */
  const handleClose = () => {
    onClose?.();
  }

  // 網路異常
  if(apiEvent?.loadingStatus === 'error'){
    return <ErrorProxy title={`${httpCode} - ${labels.loading}`} message={message} onClose={handleClose} />;
  }
  
  // 解析需要統一處理的錯誤
  switch(apiEvent?.status){
    case 400:
      return <ErrorProxy title={`${httpCode} - ${labels.badRequest}`} message={message} onClose={handleClose} />;
    case 403:
      return <ErrorProxy title={`${httpCode} - ${labels.forbidden}`} message={message} onClose={handleClose} />;
    case 404:
      return <ErrorProxy title={`${httpCode} - ${labels.notFound}`} message={message} onClose={handleClose} />;
    case 405:
      return <ErrorProxy title={`${httpCode} - ${labels.methodNotAllowed}`} message={message} onClose={handleClose} />;
    case 411:
      return <ErrorProxy title={`${httpCode} - ${labels.lengthRequired}`} message={message} onClose={handleClose} />;
    case 414:
      return <ErrorProxy title={`${httpCode} - ${labels.uriTooLong}`} message={message} onClose={handleClose} />;
    case 415:
      return <ErrorProxy title={`${httpCode} - ${labels.unsupportedMediaType}`} message={message} onClose={handleClose} />;
    case 429:
      return <ErrorProxy title={`${httpCode} - ${labels.tooManyRequests}`} message={message} onClose={handleClose} />;
    case 500:
      return <ErrorProxy title={`${httpCode} - ${labels.serverError}`} message={message} onClose={handleClose} />;
    case 502:
      return <ErrorProxy title={`${httpCode} - ${labels.badGateway}`} message={message} onClose={handleClose} />;
    case 503:
      return <ErrorProxy title={`${httpCode} - ${labels.serviceUnavailable}`} message={message} onClose={handleClose} />;
    case 504:
      return <ErrorProxy title={`${httpCode} - ${labels.gatewayTimeout}`} message={message} onClose={handleClose} />;
    default:
      break;
  }
  // 嘗試捕捉非預期的錯誤，排除422與401
  if(apiEvent?.status && apiEvent.status >= 400 && apiEvent.status < 600 && apiEvent.status !== 422){
    return <ErrorProxy title={`${httpCode} - ${labels.unknown}`} message={message} onClose={handleClose} />;
  }
  return null;
}
