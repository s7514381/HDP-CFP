type FormDataObject = Record<string, unknown>;

function appendValue(formData: FormData, key: string, value: unknown): void {
  if (value == null) return;

  if (isFileValue(value)) {
    formData.append(key, value as Blob);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendValue(formData, isFileValue(item) ? key : `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value as FormDataObject).forEach(([childKey, childValue]) => {
      appendValue(formData, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  formData.append(key, String(value));
}

function isFileValue(value: unknown): boolean {
  if (typeof Blob !== 'undefined' && value instanceof Blob) return true;

  if (typeof value !== 'object' || value === null) return false;

  const fileLike = value as { arrayBuffer?: unknown; name?: unknown; size?: unknown };
  return typeof fileLike.arrayBuffer === 'function'
    && typeof fileLike.name === 'string'
    && typeof fileLike.size === 'number';
}

export function toFormData(data: FormDataObject): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendValue(formData, key, value));
  return formData;
}
