/**
 * 對應醫院資料表的Model CrHmpy
 */
export interface CrHmpy {
  /** 唯一碼 (string) */
  id: string;
  /** 狀態 (number) */
  status: number;
  /** 醫院統編 (string) */
  CrHmpy: string;
  /** 醫院類別 (string) */
  CrHmpyType: string;
  /** 使用類別 (string) */
  CrUseType: string;
  /** 醫院簡稱 (string) */
  CrHmpyAbbr: string;
  /** 醫院中文名稱 (string) */
  CrHmpyName: string;
  /** 醫院英文名稱 (string) */
  CrHmpyEame: string;
  /** 醫院地址 (string) */
  CrHmpyAddr: string;
  /** 醫院電話 (string) */
  CrHmpyTel: string;
  /** 醫院傳真 (string) */
  CrHmpyFax: string;
  /** 醫院代碼/ID (string) */
  CrHmpyId: string;
  /** 上級醫院統編 (string) */
  CrParentHmpy: string;
}