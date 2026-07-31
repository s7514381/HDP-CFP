'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { appStorage, clearSession, sessionStorageKeys } from '@/lib/appStorage';


type UserContextType = {
  user: Pick<User, "username"> | null;
  setUser: (user: Pick<User, "username"> | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);
/**
 * 提供全域可配置head資訊的Context Provider。
 * @param param0 
 * @returns 
 */
export function UserProvider({ user: initialUser, children }: Readonly<{ user: Pick<User, "username"> | null, children: React.ReactNode }>) {
  const [user, setUserState] = useState<Pick<User, "username"> | null>(
    () => initialUser ?? null
  );

  useEffect(() => {
    if (initialUser) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setUserState(appStorage.get<Pick<User, "username">>(sessionStorageKeys.userInfo));
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [initialUser]);

  const setUser = useCallback((nextUser: Pick<User, "username"> | null) => {
    setUserState(nextUser);
    if (nextUser) {
      appStorage.set(sessionStorageKeys.userInfo, nextUser);
      return;
    }
    clearSession();
  }, []);

  const value = useMemo(() => ({ user, setUser }), [setUser, user]);

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
