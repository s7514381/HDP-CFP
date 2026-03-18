/**
 * 提供一個浮動的側邊欄，用於包裹需要浮動顯示的內容。
 * 允許透過 ID 註冊和調用多個側邊欄內容。
 * 必須搭配 SidebarLayout、SidebarChild 使用。
 */

import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from "react";

// SidebarContext 介面
interface SidebarContextType {
  // 側邊欄唯一識別 (用於 DOM 唯一性)
  id: string;
  // 側邊欄是否打開
  isOpen: boolean;
  // 當前顯示的側邊欄內容的 ID
  activeId: string | null; 
  // 儲存所有註冊內容的 Map (供 SidebarLayout 查詢)
  contentMap: string[];
  // 註冊子元件ID (由 SidebarChild 調用)
  registerId: (id: string) => void;
  // 註銷子元件內容 (由 SidebarChild 調用)
  unregisterId: (id: string) => void;
  // 打開指定的側邊欄內容
  open: (id: string) => void;
  // 切換指定 ID 的側邊欄開關
  toggle: (id: string) => void;
  // 關閉側邊欄
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar 必須在 SidebarProvider中使用");
  return ctx;
}

/**
 * 簡易 ID 生成器，用於確保疊層唯一性
 */
let nextId = 0;
const getUniqueId = () => `sidebar-${nextId++}`;

export const SidebarProvider = ({ children }: Readonly<PropsWithChildren>) => {
  // 決定哪個內容應該顯示
  const [activeId, setActiveId] = useState<string | null>(null);
  // 儲存所有透過 SidebarChild 註冊的內容
  const [contentMap, setContentMap] = useState<string[]>([]);
  // 側邊欄唯一識別 ID
  const [id] = useState(() => getUniqueId());
  // 側邊欄狀態
  const isOpen = !!activeId;
  /** 註冊ID */
  const registerId = useCallback((contentId: string) => {
    setContentMap(prev => [...prev, contentId]);
  }, [])
  /** 註銷ID */
  const unregisterId = useCallback((contentId: string) => {
    setContentMap(prev => prev.filter(id => id !== contentId));
    // 如果註銷的內容剛好是當前開啟的，則關閉側邊欄
    if (activeId === contentId) {
      setActiveId(null);
    }
  }, [activeId])
  
  /** 關閉側邊欄 */
  const close = useCallback(() => {
    setActiveId(null);
  }, []) 

  /**
   * 打開指定的側邊欄內容
   * @param id - 要顯示的 SidebarChild 的 ID
   */
  const open = useCallback((contentId: string) => {
    if (!contentMap.includes(contentId)) {
      console.warn(`Sidebar: ID '${contentId}' 未註冊內容。`);
      return;
    }
    setActiveId(contentId);
  }, [contentMap])

  /**
   * 切換側邊欄開關
   * @param id - 要切換的 SidebarChild 的 ID
   */
  const toggle = useCallback((contentId: string) => {
    if (activeId === contentId) {
      close();
    } else {
      open(contentId);
    }
  }, [activeId, open, close])

  const value = useMemo(() => ({
    id,
    isOpen,
    activeId,
    contentMap,
    registerId,
    unregisterId,
    open,
    close,
    toggle,
  }), [id, isOpen, activeId, contentMap, registerId, unregisterId, open, close, toggle]);

  return (
  <SidebarContext.Provider value={value}>
    {children}
  </SidebarContext.Provider>
  )
}
