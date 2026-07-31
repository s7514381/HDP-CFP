'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useMenu } from '@/contexts/MenuContext';
import { MenuItem } from '@/config/menus';

export function usePagePermissions(permissionPath?: string) {
  const pathname = usePathname();
  const { menus } = useMenu();
  const targetPath = permissionPath || pathname;

  const permissions = useMemo(() => {
    const findMenuItem = (items: MenuItem[], targetPath: string): MenuItem | undefined => {
      for (const item of items) {
        if (item.href === targetPath) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetPath);
          if (found) return found;
        }
      }
      return undefined;
    };

    // 處理路徑，確保與選單配置匹配 (移除結尾斜線)
    const cleanPath = targetPath.replace(/\/$/, '') || '/';
    const currentItem = findMenuItem(menus, cleanPath);
    
    return currentItem?.permissions || [];
  }, [menus, targetPath]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  return {
    permissions,
    isReady: menus.length > 0,
    hasPermission
  };
}
