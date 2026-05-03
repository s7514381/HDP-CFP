'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Wrap from "@packages/components/layouts/Wrap";
import WrapMain from "@packages/components/layouts/WrapMain";
import Aside from "@/components/layouts/Aside";
import MainNavBar from "@/components/layouts/MainNavBar";
import { useMenu } from "@/contexts/MenuContext";

/**
 * 與原本供應商平台的 layout相同，但改用BS5來進行結構
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { menus } = useMenu();

  /** 檢查當前路徑是否在允許的 menus 中 */
  useEffect(() => {
    // 等待 menus 加載完成
    if (menus.length === 0) return;

    // 收集所有允許的 href
    const allowedHrefs = new Set<string>();
    const collectHrefs = (items: typeof menus) => {
      items.forEach((item) => {
        if (item.href) {
          // 移除前後斜線進行比對
          allowedHrefs.add(item.href.replace(/^\/|\/$/g, ""));
        }
        if (item.children) {
          collectHrefs(item.children);
        }
      });
    };
    collectHrefs(menus);

    // 檢查當前路徑是否允許
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    if (!allowedHrefs.has(cleanPathname)) {
      // 如果是子路徑（如 /Supplier/Edit），檢查父路徑是否允許
      const pathParts = cleanPathname.split("/");
      let hasPermission = false;
      for (let i = 1; i <= pathParts.length; i++) {
        const parentPath = pathParts.slice(0, i).join("/");
        if (allowedHrefs.has(parentPath)) {
          hasPermission = true;
          break;
        }
      }
      if (!hasPermission) {
        router.push("/");
      }
    }
  }, [pathname, menus, router]);

  return (
    <Wrap>
      <MainNavBar />
      <WrapMain>
        <div className="wrap-content order-1">
          <div className="content-scroll">
            {children}
          </div>
        </div>
        <Aside />
      </WrapMain>
    </Wrap>
  );
}
