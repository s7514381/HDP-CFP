'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { MenuItem } from '@/config/menus';
import { getLocalStorage, setLocalStorage } from '@packages/lib/localstorage';

type MenuContextType = {
  menus: MenuItem[];
  setMenus: (menus: MenuItem[]) => void;
};

const MenuContext = createContext<MenuContextType | null>(null);

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenusState] = useState<MenuItem[]>([]);

  useEffect(() => {
    const cachedMenus = getLocalStorage<MenuItem[]>('menus');
    if (cachedMenus && Array.isArray(cachedMenus)) {
      setMenusState(cachedMenus);
    }
  }, []);

  const setMenus = (newMenus: MenuItem[]) => {
    setMenusState(newMenus);
    setLocalStorage('menus', newMenus);
  };

  const value = useMemo(() => ({ menus, setMenus }), [menus]);

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
