type FormDataObject = Record<string, unknown>;

function appendValue(formData: FormData, key: string, value: unknown): void {
  if (value == null) return;

  if (value instanceof Blob) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendValue(formData, `${key}[${index}]`, item));
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

export function toFormData(data: FormDataObject): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => appendValue(formData, key, value));
  return formData;
}
