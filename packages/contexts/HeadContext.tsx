'use client';

import { createContext, useContext, useState } from "react";

type HeadState = {
  title?: string;
  description?: string;
};

type HeadContextType = {
  head: HeadState;
  setHead: (h: HeadState) => void;
};

const HeadContext = createContext<HeadContextType | null>(null);
/**
 * 提供全域可配置head資訊的Context Provider。
 * @param param0 
 * @returns 
 */
export function HeadProvider({ children }: { children: React.ReactNode }) {

  const [head, setHead] = useState<HeadState>({
    title: "供應商平台 - aHOP",
    description: ""
  });

  return (
    <HeadContext.Provider value={{ head, setHead }}>
      {children}
    </HeadContext.Provider>
  );
}

export function useHead() {
  const ctx = useContext(HeadContext);
  if (!ctx) throw new Error("useHead 必須在 HeadProvider 內使用");
  return ctx;
}
