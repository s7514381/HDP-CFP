export interface SourceFormState {
  yearId: string;
  year: number;
  sourceMaterialId: string;
  allocationPercentage: string;
  carbonFactor: string;
  thirdPartyCertification: boolean;
  consultantApprovalCount: string;
  buyerApprovalCount: string;
  totalScore: string;
}

export const emptySourceForm: SourceFormState = {
  yearId: '',
  year: 0,
  sourceMaterialId: '',
  allocationPercentage: '',
  carbonFactor: '',
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
  if (!form.sourceMaterialId) return 'required';

  const allocationPercentage = Number(form.allocationPercentage);
  if (!Number.isFinite(allocationPercentage) || allocationPercentage <= 0 || allocationPercentage > 100) {
    return 'allocation';
  }

  const carbonFactor = Number(form.carbonFactor);
  const counts = [form.consultantApprovalCount, form.buyerApprovalCount, form.totalScore].map(Number);
  if (
    (form.carbonFactor.trim() !== '' && (!Number.isFinite(carbonFactor) || carbonFactor < 0))
    || counts.some((value) => !Number.isInteger(value) || value < 0)
  ) {
    return 'accreditation';
  }

  return null;
}
