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
  const defaultTitle = `${translate(LANGUAGE_KEYS.common.supplierPlatform)} - aHOP`;

  useEffect(() => {
    document.documentElement.lang = languageCode;
    document.title = head.title || defaultTitle;

    let descriptionMeta = document.head.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', head.description || '');
  }, [defaultTitle, head.description, head.title, languageCode]);

  return null;
}

const LocalizedApiError = () => {
  const { apiEvent, setApiEvent } = useApiContext();
  const { translate } = useLanguage();
  const labels: ApiErrorLabels = {
    noMessage: translate(LANGUAGE_KEYS.apiError.noMessage),
    loading: translate(LANGUAGE_KEYS.apiError.loading),
    badRequest: translate(LANGUAGE_KEYS.apiError.badRequest),
    forbidden: translate(LANGUAGE_KEYS.apiError.forbidden),
    notFound: translate(LANGUAGE_KEYS.apiError.notFound),
    methodNotAllowed: translate(LANGUAGE_KEYS.apiError.methodNotAllowed),
    lengthRequired: translate(LANGUAGE_KEYS.apiError.lengthRequired),
    uriTooLong: translate(LANGUAGE_KEYS.apiError.uriTooLong),
    unsupportedMediaType: translate(LANGUAGE_KEYS.apiError.unsupportedMediaType),
    tooManyRequests: translate(LANGUAGE_KEYS.apiError.tooManyRequests),
    serverError: translate(LANGUAGE_KEYS.apiError.serverError),
    badGateway: translate(LANGUAGE_KEYS.apiError.badGateway),
    serviceUnavailable: translate(LANGUAGE_KEYS.apiError.serviceUnavailable),
    gatewayTimeout: translate(LANGUAGE_KEYS.apiError.gatewayTimeout),
    unknown: translate(LANGUAGE_KEYS.apiError.unknown),
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
