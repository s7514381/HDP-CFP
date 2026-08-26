export interface MaterialMaintenanceSource {
  id: string;
  materialId: string;
  supplierName: string;
  productName: string;
  allocationPercentage: number;
  carbonFactor?: number | null;
  thirdPartyCertification: boolean;
  consultantApprovalCount: number;
  buyerApprovalCount: number;
  totalScore: number;
  opinionCount: number;
  accreditationLevelSettingId?: string | null;
  accreditationLevelSettingName?: string | null;
  accreditationLevelName?: string | null;
  accreditationLevelMeetsRequirement?: boolean | null;
  approvedQuantity: number;
  isAccredited: boolean;
}

export interface MaterialMaintenanceSecondaryDataOption {
  id: string;
  name: string;
  carbonFactor: number;
  unit: string;
  departmentName?: string | null;
  announcementYear?: number | null;
}

export interface MaterialMaintenanceYear {
  id: string;
  year: number;
  sources: MaterialMaintenanceSource[];
}

export interface MaterialMaintenanceItem {
  id: string;
  item: string;
  years: MaterialMaintenanceYear[];
}

export interface MaterialMaintenanceCategory {
  id: string;
  item: string;
  items: MaterialMaintenanceItem[];
}

export interface MaterialMaintenanceModel {
  materialId: string;
  materialNumber?: string | null;
  productName?: string | null;
  supplierName?: string | null;
  productSubcategoryId?: string | null;
  productSubcategoryName?: string | null;
  categories: MaterialMaintenanceCategory[];
}

export interface SupplierOption {
  value: string | number;
  text?: string;
  name?: string;
}
