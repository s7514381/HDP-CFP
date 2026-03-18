"use client";
import { ApiError } from "@packages/components/ApiError";
import { setApiEventHandler } from "@packages/lib/api";
import { ApiContextConfig, ApiContextValue, ApiEvent } from "@packages/types/api";
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

const ApiContext = createContext<ApiContextValue | null>(null);

export function ApiProvider({ children, initialConfig }: Readonly<PropsWithChildren<{initialConfig?: ApiContextConfig}>>) {
  
  /** 儲存來自 API 事件的內容 */
  const [apiEvent, setApiEvent] = useState<ApiEvent | null>(null);
  /** 當發生401未授權時的狀態時，需要更新token的端點位置 */
  const [tokenRefreshUrl, setTokenRefreshUrl] = useState<string | null>(initialConfig?.tokenRefreshUrl || null);
  /** 當用戶未登入要導向的端點 */
  const [userLoginUrl, setUserLoginUrl] = useState<string | null>(initialConfig?.userLoginUrl || null);
  /** 當用戶未登入時轉跳到登入頁面時，呼叫清除cookie或session的端點 */
  const [userLogoutUrl, setUserLogoutUrl] = useState<string | null>(initialConfig?.userLogoutUrl || null);
  /** 是否使用轉跳的方式進行登出 */
  const [useRedirectLogout, setUseRedirectLogout] = useState<boolean>(initialConfig?.useRedirectLogout || false);
  
  /**
   * 關閉API錯誤訊息
   */
  const handleApiErrorClose = () => setApiEvent(null);

  /**
   * 初始化的時候註冊一個API事件的處理函數
   * 用來接收來自 apiRequest 發出的事件
   */
  useEffect(() => {
    setApiEventHandler((event) => {
      setApiEvent(() => {
        return {...event};
      });
    });
    // 清除註冊的事件處理函數
    return () => setApiEventHandler();
  }, []);

  /**
   * Memo化 Context 的值，避免不必要的重渲染
   */
  const value = useMemo(() => ({ 
    apiEvent,
    setApiEvent,
    tokenRefreshUrl,
    setTokenRefreshUrl,
    userLoginUrl,
    setUserLoginUrl,
    userLogoutUrl,
    setUserLogoutUrl,
    useRedirectLogout,
    setUseRedirectLogout
  }), [apiEvent, tokenRefreshUrl, userLoginUrl, userLogoutUrl, useRedirectLogout]);

  return (
    <ApiContext.Provider value={value}>
      <ApiError apiEvent={apiEvent} onClose={handleApiErrorClose} />
      {children}
    </ApiContext.Provider>
  );
}

export function useApiContext() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApiContext 必須在 ApiProvider中使用");
  return ctx;
}
