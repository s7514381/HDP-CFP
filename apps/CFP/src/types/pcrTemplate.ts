export enum PcrTemplateCategory {
  Material = 0,
  Process = 1,
  Transport = 2,
  Waste = 3,
}

export const PCR_TEMPLATE_CATEGORY_STORAGE_KEY = 'pcrTemplate.lastCategory';

export function isPcrTemplateCategory(value: unknown): value is PcrTemplateCategory {
  return typeof value === 'number'
    && Number.isInteger(value)
    && value >= PcrTemplateCategory.Material
    && value <= PcrTemplateCategory.Waste;
}

export interface PcrTemplateRow {
  id: string | number;
  item?: string;
  subItems?: string;
}

export interface PcrTemplateChildFormData {
  id?: string | number;
  parentId?: string | null;
  item: string;
  itemLRID?: string | null;
  status?: string | number;
  sequence?: number | null;
}

export interface PcrTemplateModel {
  id?: string | number;
  category: PcrTemplateCategory;
  item: string;
  status?: number;
  itemLRID?: string;
  childList?: PcrTemplateChildFormData[];
}
