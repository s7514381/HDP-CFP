import React from 'react';

export type FormUpdate<T> = (patch: Partial<T>) => void;

export interface FormContentProps<T> {
  title: string;
  formData: T;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  updateForm: FormUpdate<T>;
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
  submitLabel: string;
}
