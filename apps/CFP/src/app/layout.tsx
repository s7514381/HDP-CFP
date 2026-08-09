'use client';
import { useEffect } from "react";
// 只引入BS5的CSS
import "../../public/css/bootstrap.min.css";
// 只引入fontawsone的css與字型
import "../../public/css/all.min.css";
import "@/styles/globals.scss";
import { ApiProvider } from "@packages/contexts/ApiContext";
import { HeadProvider, useHead } from "@packages/contexts/HeadContext";
import { ToastProvider } from "@packages/contexts/ToastContext";
import { UserProvider } from "@/contexts/UserContext";
import { MenuProvider } from "@/contexts/MenuContext";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { useApiContext } from "@packages/contexts/ApiContext";
import { ApiError, ApiErrorLabels } from "@packages/components/ApiError";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

/**
 * 接收全域Head Context，並更新head內容
 * @returns
 */
const UpdateHead = () => {
  const { head } = useHead();
  const { languageCode, translate } = useLanguage();
  const defaultTitle = `${translate(LANGUAGE_KEYS.common.supplierPlatform, 'Supplier platform')} - aHOP`;

  useEffect(() => {
    document.documentElement.lang = languageCode;
  }, [languageCode]);

  return (
    <head>
      <title>{head.title || defaultTitle}</title>
      <meta name="description" content={head.description} />
    </head>
  );
}

const LocalizedApiError = () => {
  const { apiEvent, setApiEvent } = useApiContext();
  const { translate } = useLanguage();
  const labels: ApiErrorLabels = {
    noMessage: translate(LANGUAGE_KEYS.apiError.noMessage, 'Please sign in again'),
    loading: translate(LANGUAGE_KEYS.apiError.loading, 'Network error'),
    badRequest: translate(LANGUAGE_KEYS.apiError.badRequest, 'Bad request'),
    forbidden: translate(LANGUAGE_KEYS.apiError.forbidden, 'Insufficient permissions'),
    notFound: translate(LANGUAGE_KEYS.apiError.notFound, 'Resource not found'),
    methodNotAllowed: translate(LANGUAGE_KEYS.apiError.methodNotAllowed, 'Method not allowed'),
    lengthRequired: translate(LANGUAGE_KEYS.apiError.lengthRequired, 'Request length missing'),
    uriTooLong: translate(LANGUAGE_KEYS.apiError.uriTooLong, 'URI too long'),
    unsupportedMediaType: translate(LANGUAGE_KEYS.apiError.unsupportedMediaType, 'Unsupported media type'),
    tooManyRequests: translate(LANGUAGE_KEYS.apiError.tooManyRequests, 'Too many requests'),
    serverError: translate(LANGUAGE_KEYS.apiError.serverError, 'Server error'),
    badGateway: translate(LANGUAGE_KEYS.apiError.badGateway, 'Invalid server response'),
    serviceUnavailable: translate(LANGUAGE_KEYS.apiError.serviceUnavailable, 'Service unavailable'),
    gatewayTimeout: translate(LANGUAGE_KEYS.apiError.gatewayTimeout, 'Server response timed out'),
    unknown: translate(LANGUAGE_KEYS.apiError.unknown, 'Request error'),
  };

  return <ApiError apiEvent={apiEvent} onClose={() => setApiEvent(null)} labels={labels} />;
};

/**
 * 需要帳號通過驗證的模板
 * @param param0
 * @returns
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="zh-Hant">
      <HeadProvider>
        <body>
          <ToastProvider>
            <UserProvider user={null}>
              <MenuProvider>
                <ApiProvider>
                  <LanguageProvider>
                    <UpdateHead />
                    <LocalizedApiError />
                    {children}
                  </LanguageProvider>
                </ApiProvider>
              </MenuProvider>
            </UserProvider>
          </ToastProvider>
        </body>
      </HeadProvider>
    </html>
  );
}
