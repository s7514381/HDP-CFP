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

/**
 * 其中處理API錯誤訊息的元件，不含422的錯誤處理
 * @param param0 
 * @returns 
 */
export const ApiError = ({ apiEvent, onClose}: {apiEvent?: ApiEvent | null, onClose?: () => void}) => {
  const router = useRouter();
  const api = useApi();
  const {userLoginUrl, userLogoutUrl, useRedirectLogout} = useApiContext();
  const httpCode = apiEvent?.status?.toString() || '0';
  const message = `${apiEvent?.status} - ${apiEvent?.message || '請重新登入'}`;

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
    return <ErrorProxy title={`${httpCode} - 網路異常`} message={message} onClose={handleClose} />;
  }
  
  // 解析需要統一處理的錯誤
  switch(apiEvent?.status){
    case 400:
      return <ErrorProxy title={`${httpCode} - 錯誤的請求`} message={message} onClose={handleClose} />;
    case 403:
      return <ErrorProxy title={`${httpCode} - 權限不足`} message={message} onClose={handleClose} />;
    case 404:
      return <ErrorProxy title={`${httpCode} - 資源不存在`} message={message} onClose={handleClose} />;
    case 405:
      return <ErrorProxy title={`${httpCode} - 錯誤的訪問方式`} message={message} onClose={handleClose} />;
    case 411:
      return <ErrorProxy title={`${httpCode} - 請求長度缺失`} message={message} onClose={handleClose} />;
    case 414:
      return <ErrorProxy title={`${httpCode} - 請求URI過長`} message={message} onClose={handleClose} />;
    case 415:
      return <ErrorProxy title={`${httpCode} - 不支援的媒體類型`} message={message} onClose={handleClose} />;
    case 429:
      return <ErrorProxy title={`${httpCode} - 請求過於頻繁`} message={message} onClose={handleClose} />;
    case 500:
      return <ErrorProxy title={`${httpCode} - 伺服器錯誤`} message={message} onClose={handleClose} />;
    case 502:
      return <ErrorProxy title={`${httpCode} - 伺服器無效回應`} message={message} onClose={handleClose} />;
    case 503:
      return <ErrorProxy title={`${httpCode} - 服務不可用`} message={message} onClose={handleClose} />;
    case 504:
      return <ErrorProxy title={`${httpCode} - 伺服器回應超時`} message={message} onClose={handleClose} />;
    default:
      break;
  }
  // 嘗試捕捉非預期的錯誤，排除422與401
  if(apiEvent?.status && apiEvent.status >= 400 && apiEvent.status < 600 && apiEvent.status !== 422){
    return <ErrorProxy title={`${httpCode} - 發生錯誤`} message={message} onClose={handleClose} />;
  }
  return null;
}