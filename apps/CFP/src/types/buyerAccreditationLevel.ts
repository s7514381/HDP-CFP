export interface BuyerAccreditationLevelRow {
  id: string | number;
  materialId?: string;
  name?: string;
  thirdPartyCertification?: boolean | string | number;
  consultantApprovalCount?: number | string;
  buyerApprovalCount?: number | string;
  totalScore?: number | string;
}

export interface BuyerAccreditationLevelFormData {
  id?: string | number;
  materialId?: string;
  name: string;
  thirdPartyCertification: boolean | string;
  consultantApprovalCount: number | string;
  buyerApprovalCount: number | string;
  totalScore: number | string;
  status: number | string;
}
