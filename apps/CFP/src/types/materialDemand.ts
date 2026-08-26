export interface MaterialDemandRow {
  id: string | number;
  carbonFactorMaintenancePlantId?: string;
  consultantId?: string;
  demandPrice?: number | string;
  consultantResponsePrice?: number | string | null;
  demandType?: number | string;
  isUrgent?: boolean | number | string;
  demandStatus?: number | string;
  materialNumber?: string;
  productName?: string;
  year?: number;
  supplierName?: string;
  plantName?: string;
}

export type MaterialDemandType = '0' | '1';
export type MaterialDemandStatus = '0' | '1' | '2' | '3';
