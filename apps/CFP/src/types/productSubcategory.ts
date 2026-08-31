
export interface ProductSubcategoryRow {
  id: string | number;
  nameLRID?: string;
  developerLRID?: string;
  applicableScopeLRID?: string;
  name?: string;
  developer?: string;
  applicableScope?: string;
  cccCode?: string;
}

export interface ProductSubcategoryFormData {
  id?: string | number;
  nameLRID?: string;
  developerLRID?: string;
  applicableScopeLRID?: string;
  name: string;
  developer: string;
  applicableScope: string;
  cccCode: string;
  status: number;
}

export interface PcrPatternOwnerRow {
  id: string | number;
  account?: string;
  name?: string;
  patternCount?: number;
}
