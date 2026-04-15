"use client";
import Container from "@packages/components/bootstrap5/Container";
import { usePathname } from "next/navigation";
import { menus, MenuItem } from "@/config/menus";

type ActionBarProps = {
    readonly title?: string;
    readonly children?: React.ReactNode;
}

/**
 * 根據路徑查找菜單標題
 */
const findMenuTitle = (pathname: string, items: MenuItem[]): string | undefined => {
  for (const item of items) {
    // 清理路徑進行比較
    const cleanPathname = pathname.replace(/^\/|\/$/g, "");
    const cleanHref = item.href?.replace(/^\/|\/$/g, "");
    
    if (cleanHref && cleanPathname === cleanHref) {
      return item.label;
    }
    
    // 遞歸查找子菜單
    if (item.children) {
      const found = findMenuTitle(pathname, item.children);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * 功能列元件，以及額外的操作功能
 * 如果沒有傳入 title，會自動從路由路徑獲取對應的菜單標題
 */
export default function ActionBar({title, children}: ActionBarProps) {
  const pathname = usePathname();
  
  // 如果有傳入 title，優先使用；否則從路由獲取
  const displayTitle = title ?? findMenuTitle(pathname, menus);
  
  return (
    <Container className="action-bar no-print" fluid>
        <p className="action-bar-title">{displayTitle}</p>
        {children}
    </Container>
  );
}
