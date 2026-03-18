import { CrEQPSN } from "./crEQP";
import { CrPkg } from "./crPkg";
import { CrPkgTag } from "./crPkgTag";

/**
 * 申領單異動紀錄
 */
export interface ApyOrdHistory {
  /** 唯一值 (string) */
  id: string;
  /** 狀態(1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 申領單ID (string) */
  CrApyOrdId: string;
  /** 申領單號 (string) */
  ApyNo: string;
  /** 異動類型 C、R、U、D (string) */
  Type: 'C' | 'R' | 'U' | 'D' | string;
  /** 供應商統編 (string) */
  CrVmpy: string;
  /** 醫院統編 (string) */
  CrHmpy: string;
  /** 單據內容含明細JSON (string | null) */
  Content: string | null;
}
/**
 * 申領單序號對照表
 */
export interface ApyOrdDtlSn {
  /** 唯一值 (string) */
  id: string;
  /** 狀態(1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 申領單號 (string) */
  ApyNo: string;
  /** 申領單明細ID (string) */
  ApyOrdDtlId: string;
  /** 類別 PKG(盤包) SKU(設備) WDI(物品) (string) */
  Type: 'PKG' | 'SKU' | 'WDI' | string;
  /** 供應商盤包或設備代號 (string | null) */
  CrCode: string | null;
  /** 供應商盤包標牌或設備序號 (string | null) */
  CrSN: string | null;
}
/**
 * 醫院端申領單明細
 */
export interface ApyOrdDtl {
  /** 唯一值 (string) */
  id: string;
  /** 狀態(1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 申領單ID (string) */
  ApyOrdId: string;
  /** 類別 PKG(盤包) SKU(設備) WDI(物品) (string) */
  Type: 'PKG' | 'SKU' | 'WDI' | string;
  /** 類別名稱 盤包 設備 物品 (string) */
  TypeName: string;
  /** 醫院端（盤包、設備）代號 (string) */
  CrHmpyCode: string;
  /** 醫院端 中文名稱 (string) */
  ZhName: string;
  /** 醫院端 英文名稱 (string | null) */
  EnName: string | null;
  /** 醫院端 規格描述 (string | null) */
  Spec: string | null;
  /** 醫院端 單位 (string | null) */
  Unit: string | null;
  /** 申領數量 (number) */
  Qty: number;
  /** 已對照的供應商端代號 (string) */
  MapCode: string;
  /** 已配置序號的數量 (number) */
  SetQty: number;
  /** 已配置的序號列表 */
  apyOrdDtlSns: ApyOrdDtlSn[];
  /** 可配置的盤包標牌列表 */
  pkgTag: CrPkgTag[];
  /** 可配置的設備序號列表 */
  eqpSn: CrEQPSN[];
}
/**
 * 醫院申領單主檔
 */
export interface ApyOrd {
  /** 唯一值 (string) */
  id: string;
  /** 狀態(1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 供應商統編 (string) */
  CrVmpy: string;
  /** 醫院統編 (string) */
  CrHmpy: string;
  /** 是否需要消毒滅菌 0:不需要 1:需要 (number) */
  IsDisinfect: 0 | 1;
  /** 申領單號 (string) */
  ApyNo: string;
  /** 申領人員 (string) */
  ApyUser: string;
  /** 申領部門 (string) */
  ApyDept: string;
  /** 申領日期 (string | null) */
  ApyDateTime: string | null;
  /** 預定使用日期 (string | null) */
  ApyUseDateTime: string | null;
  /** 醫師 (string | null) */
  Dr: string | null;
  /** 病人 (string | null) */
  PatName: string | null;
  /** 病例號末三碼 (string | null) */
  PatNo: string | null;
  /** 手術代碼 (string | null) */
  SurgCode: string | null;
  /** 申領備註 (string | null) */
  ApyMemo: string | null;
  /** 醫院簡稱 */
  CrHmpyAbbr: string;
  /** 醫院名稱 */
  CrHmpyName: string;
  /** 供應商名稱 */
  CrVmpyName: string;
  /** 供應商簡稱 */
  CrVmpyAbbName: string;
  /** 申請的盤包總量 */
  PkgQty: number;
  /** 已配置的盤包標牌數量*/
  PkgSetQty: number;
  /** 申請的設備總量 */
  SkuQty: number;
  /** 已配置的設備序號數量*/
  SkuSetQty: number;
  /**  盤包數量 */
  PkgCount: number;
  /** 已配置盤包標牌的數量 */
  PkgSetCount: number;
  /** 設備數量 */
  SkuCount: number;
  /** 已配置設備序號的數量 */
  SkuSetCount: number;
  /** 申領單明細資料 */
  items: ApyOrdDtl[];
}