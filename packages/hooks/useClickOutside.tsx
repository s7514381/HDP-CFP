import { useEffect, useRef } from "react";

/**
 * 監聽點擊元素外部的 Hook
 * @param handler 點擊外部時執行的回調函數
 */
export const useClickOutside = (handler: () => void) => {
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // 如果點擊的是 domRef 內部的元素，則不做任何事
      if (!domRef.current || domRef.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    // 監聽滑鼠點擊與觸控事件
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      // 清除監聽器，避免記憶體洩漏
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler]);

  return domRef;
};