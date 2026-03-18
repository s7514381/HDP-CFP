'use client';

import { createContext, useContext, useMemo } from "react";


type UserContextType = {
  user: User | null;
};

const UserContext = createContext<UserContextType | null>(null);
/**
 * 提供全域可配置head資訊的Context Provider。
 * @param param0 
 * @returns 
 */
export function UserProvider({ user, children }: Readonly<{ user: User | null, children: React.ReactNode }>) {
  const value = useMemo(() => ({ user }), [user]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser 必須在 UserProvider 內使用");
  return ctx;
}
