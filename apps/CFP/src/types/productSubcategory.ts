export interface ProductSubcategoryRow {
  id: string | number;
  name?: string;
  developer?: string;
  applicableScope?: string;
  cccCode?: string;
}

export interface ProductSubcategoryFormData {
  id?: string | number;
  name: string;
  developer: string;
  applicableScope: string;
  cccCode: string;
  status: number;
}
