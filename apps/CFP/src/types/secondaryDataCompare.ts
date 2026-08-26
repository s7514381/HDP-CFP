export interface SecondaryDataCompareRow {
  id: string;
  carbonFactorMaintenancePlantId: string;
  secondaryDataSettingId: string;
  name: string;
  carbonFactor: number;
  unit: string;
  departmentName?: string | null;
  announcementYear?: number | null;
  percentage: number;
}

export type SecondaryDataCompareDraftRow = Omit<SecondaryDataCompareRow, 'id'> & {
  id: string | null;
  clientId: string;
};

export interface SecondaryDataCompareOption {
  id: string;
  name: string;
  carbonFactor: number;
  unit: string;
  departmentName?: string | null;
  announcementYear?: number | null;
}

export interface CarbonFactorMaintenancePlantSummary {
  id: string;
  materialNumber: string;
  productName: string;
  buyerName: string;
  year: number;
  plantName: string;
  carbonFactor: number;
  pcrEvidenceCategories?: CarbonFactorMaintenancePcrEvidenceCategory[];
}

export interface CarbonFactorMaintenancePcrEvidenceCategory {
  category: number;
  items: CarbonFactorMaintenancePcrEvidenceItem[];
}

export interface CarbonFactorMaintenancePcrEvidenceItem {
  pcrPatternId: string;
  category: number;
  item: string;
  childItems: string[];
  attachment: CarbonFactorMaintenanceAttachment | null;
}

export interface CarbonFactorMaintenanceAttachment {
  uploadFileId: string;
  attachmentType: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
}
