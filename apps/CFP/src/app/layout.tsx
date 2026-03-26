'use client';
// 只引入BS5的CSS
import "../../public/css/bootstrap.min.css";
// 只引入fontawsone的css與字型
import "../../public/css/all.min.css";
import "@/styles/globals.scss";
import { ApiProvider } from "@packages/contexts/ApiContext";
import { HeadProvider, useHead } from "@packages/contexts/HeadContext";
import { ToastProvider } from "@packages/contexts/ToastContext";
import { UserProvider } from "@/contexts/UserContext";

/**
 * 接收全域Head Context，並更新head內容
 * @returns 
 */
const UpdateHead = () => {
  const { head } = useHead();
  return (
    <head>
      <title>{head.title}</title>
      <meta name="description" content={head.description} />
    </head>
  );
}

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
        <UpdateHead />
        <body>
          <ToastProvider>
            <UserProvider user={null}>
              <ApiProvider>
                {children}
              </ApiProvider>
            </UserProvider>
          </ToastProvider>
        </body>
      </HeadProvider>
    </html>
  );
}
