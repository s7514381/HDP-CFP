export type FormModelNormalizer<T> = (model: unknown, initialData: T) => T;

export function normalizeFormModel<T extends object>(model: unknown, initialData: T): T {
  if (!model || typeof model !== 'object') return initialData;

  const normalized = Object.fromEntries(
    Object.entries(model).map(([key, value]) => [
      key,
      value === null ? '' : typeof value === 'object' ? value : String(value),
    ])
  );

  return { ...initialData, ...normalized } as T;
}

export function normalizeStatusModel<T extends object>(model: unknown, initialData: T): T {
  const normalized = normalizeFormModel(model, initialData) as Record<string, unknown>;
  const status = normalized.status ?? normalized.Status;
  if (status === 200) normalized.status = 1;
  return normalized as T;
}
