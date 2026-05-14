'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "@packages/lib/localstorage";


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
  const [user, setUserState] = useState<Pick<User, "username"> | null>(initialUser);

  useEffect(() => {
    const cachedUser = getLocalStorage<Pick<User, "username">>("userInfo");
    if (cachedUser?.username) {
      setUserState(cachedUser);
    }
  }, []);

  const setUser = (nextUser: Pick<User, "username"> | null) => {
    setUserState(nextUser);
    if (nextUser) {
      setLocalStorage("userInfo", nextUser);
      return;
    }
    removeLocalStorage("userInfo");
  };

  const value = useMemo(() => ({ user, setUser }), [user]);

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
