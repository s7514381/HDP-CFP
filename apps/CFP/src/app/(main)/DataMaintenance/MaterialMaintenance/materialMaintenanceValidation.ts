export interface SourceFormState {
  yearId: string;
  year: number;
  supplierId: string;
  productName: string;
  allocationPercentage: string;
}

export const emptySourceForm: SourceFormState = {
  yearId: '',
  year: 0,
  supplierId: '',
  productName: '',
  allocationPercentage: '',
};

export type SourceValidationError = 'required' | 'allocation' | null;

export function parseMaintenanceYear(value: string): number | null {
  const year = Number(value.trim());
  return Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null;
}

export function validateSourceForm(form: SourceFormState): SourceValidationError {
  if (!form.supplierId || !form.productName.trim()) return 'required';

  const allocationPercentage = Number(form.allocationPercentage);
  if (!Number.isFinite(allocationPercentage) || allocationPercentage <= 0 || allocationPercentage > 100) {
    return 'allocation';
  }

  return null;
}
