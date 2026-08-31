'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { searchPersistence } from '@/lib/searchPersistence';

interface SearchPersistenceResult<T> {
  restoredValue: T;
  isReady: boolean;
  save: (value: T) => void;
  clear: () => void;
}

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function useSearchPersistence<T>(
  defaultValue: T,
  isValid: (value: unknown) => value is T,
): SearchPersistenceResult<T> {
  const pathname = usePathname();
  const storageKey = searchPersistence.getStorageKey(pathname);
  const isReady = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  const parsedValue = useMemo(
    () => {
      if (!isReady) return { value: defaultValue, valid: true };

      return searchPersistence.read(
        storageKey,
        defaultValue,
        isValid,
      );
    },
    [defaultValue, isReady, isValid, storageKey],
  );

  useEffect(() => {
    if (parsedValue.valid) return;

    console.warn(`Ignoring invalid persisted search criteria for ${storageKey}`);
    searchPersistence.clear(storageKey);
  }, [parsedValue.valid, storageKey]);

  const save = useCallback((value: T) => {
    searchPersistence.save(storageKey, value, isValid);
  }, [isValid, storageKey]);

  const clear = useCallback(() => {
    searchPersistence.clear(storageKey);
  }, [storageKey]);

  return { restoredValue: parsedValue.value, isReady, save, clear };
}
