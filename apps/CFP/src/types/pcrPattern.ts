import { PcrTemplateCategory } from './pcrTemplate';

export interface PcrPatternRow {
  id: string | number;
  productSubcategoryId?: string | null;
  item?: string;
  subItems?: string;
}

export interface PcrPatternChildFormData {
  id?: string | number;
  parentId?: string | null;
  item: string;
  status?: string | number;
  sequence?: number | null;
}

export interface PcrPatternFormData {
  id?: string | number;
  productSubcategoryId: string;
  category: PcrTemplateCategory;
  item: string;
  status: number;
  childList: PcrPatternChildFormData[];
}

export const PCR_PATTERN_CATEGORY_STORAGE_KEY = 'pcrPattern.lastCategory';
