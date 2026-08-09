export interface MaterialMaintenanceSource {
  id: string;
  supplierId: string;
  supplierName: string;
  productName: string;
  allocationPercentage: number;
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
