'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { MenuItem } from '@/config/menus';
import { appStorage, sessionStorageKeys } from '@/lib/appStorage';

type MenuContextType = {
  menus: MenuItem[];
  setMenus: (menus: MenuItem[]) => void;
};

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenusState] = useState<MenuItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setMenusState(appStorage.get<MenuItem[]>(sessionStorageKeys.menus, []) ?? []);
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const setMenus = useCallback((newMenus: MenuItem[]) => {
    setMenusState(newMenus);
    appStorage.set(sessionStorageKeys.menus, newMenus);
  }, []);

  const value = useMemo(() => ({ menus, setMenus }), [menus, setMenus]);

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu 必須在 MenuProvider 內使用");
  return ctx;
}
