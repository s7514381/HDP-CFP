export interface SourceFormState {
  yearId: string;
  year: number;
  materialId: string;
  allocationPercentage: string;
  thirdPartyCertification: boolean;
  consultantApprovalCount: string;
  buyerApprovalCount: string;
  totalScore: string;
}

export const emptySourceForm: SourceFormState = {
  yearId: '',
  year: 0,
  materialId: '',
  allocationPercentage: '',
  thirdPartyCertification: false,
  consultantApprovalCount: '0',
  buyerApprovalCount: '0',
  totalScore: '0',
};

export type SourceValidationError = 'required' | 'allocation' | 'accreditation' | null;

export function parseMaintenanceYear(value: string): number | null {
  const year = Number(value.trim());
  return Number.isInteger(year) && year >= 1900 && year <= 2100 ? year : null;
}

export function validateSourceForm(form: SourceFormState): SourceValidationError {
  if (!form.materialId) return 'required';

  const allocationPercentage = Number(form.allocationPercentage);
  if (!Number.isFinite(allocationPercentage) || allocationPercentage <= 0 || allocationPercentage > 100) {
    return 'allocation';
  }

  const counts = [form.consultantApprovalCount, form.buyerApprovalCount, form.totalScore].map(Number);
  if (
    counts.some((value) => !Number.isInteger(value) || value < 0)
  ) {
    return 'accreditation';
  }

  return null;
}
