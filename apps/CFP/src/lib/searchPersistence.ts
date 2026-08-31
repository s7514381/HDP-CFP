import { appStorage } from '@/lib/appStorage';

const SEARCH_PERSISTENCE_VERSION = 1;
const SEARCH_STORAGE_PREFIX = 'cfp.searchCriteria:';

interface PersistedSearchValue<T> {
  version: number;
  value: T;
}

export interface ParsedSearchValue<T> {
  value: T;
  valid: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStorageKey(pathname: string): string {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/';
  return `${SEARCH_STORAGE_PREFIX}${encodeURIComponent(normalizedPathname)}`;
}

function read<T>(
  storageKey: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
): ParsedSearchValue<T> {
  const rawValue = appStorage.get<unknown>(storageKey, null);
  if (rawValue === null) return { value: defaultValue, valid: true };

  if (
    !isRecord(rawValue)
    || rawValue.version !== SEARCH_PERSISTENCE_VERSION
    || !isValid(rawValue.value)
  ) {
    return { value: defaultValue, valid: false };
  }

  return { value: rawValue.value, valid: true };
}

function save<T>(
  storageKey: string,
  value: T,
  isValid: (value: unknown) => value is T,
): void {
  if (!isValid(value)) {
    console.error(`Unable to persist invalid search criteria for ${storageKey}`);
    return;
  }

  const payload: PersistedSearchValue<T> = {
    version: SEARCH_PERSISTENCE_VERSION,
    value,
  };
  appStorage.set(storageKey, payload);
}

export const searchPersistence = {
  getStorageKey,
  read,
  save,
  clear: (storageKey: string): void => {
    appStorage.remove(storageKey);
  },
} as const;
