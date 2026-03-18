import { CrMsg } from "./crMsg";
import { CrPkgTag } from "./crPkgTag";
import { CrSI } from "./crSI";

/**
 * 盤包明細
 */
export interface CrPkgDtl {
  /** 唯一值 */
  id: string;
  /** 狀態 (1: 啟用, 0: 停用) */
  status: number;
  /** 建立時間 */
  created_at: string;
  /** 更新時間 */
  updated_at: string;
  /** 建立者 ID */
  created_by: number;
  /** 更新者 ID */
  updated_by: number;
  /** 供應商統編 */
  CrVmpy: string;
  /** 盤包 ID */
  CrPkgId: string;
  /** 器械 ID */
  CrSIId: string;
  /** 數量 */
  Qty: number;
  /** 備註 */
  Memo: string | null;
  /** 對應的器械資料 */
  si: CrSI
}
/**
 * 盤包對照主檔
 */
export interface CrPkgMap {
    /** 唯一值 */
    id: string;
    /** 狀態(1:啟用, 0:停用) */
    status: number;
    /** 建立時間 */
    created_at: string;
    /** 更新時間 */
    updated_at: string;
    /** 建立者ID */
    created_by: number;
    /** 更新者ID */
    updated_by: number;
    /** 標牌號碼 */
    CrPkgId: string;
    /** 供應商統編 */
    CrVmpy: string;
    /** 醫院統編 */
    CrHmpy: string;
    /** 醫院端盤包編號 */
    CrHmpyCode: string;
    /** 醫院簡稱 */
    CrHmpyAbbr?: string;
    /** 醫院名稱 */
    CrHmpyName?: string;
    /** 備註 */
    Content: string;
}
/**
 * 供應商盤包訊息對照檔
 */
export interface CrPkgMsgMap {
    /** 唯一值 (string) */
  id: string;
  /** 狀態 (1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string - 通常是 ISO 8601 格式或日期時間字串) */
  created_at: string;
  /** 更新時間 (string - 通常是 ISO 8601 格式或日期時間字串) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 供應商統編 (string) */
  CrVmpy: string;
  /** 盤包ID (string) */
  PkgId: string;
  /** 訊息ID (string) */
  MsgId: string;
  /** 訊息內容 (string) */
  Content: string;
}

/**
 * 盤包檔案
 */
export interface CrPkg {
  /** 唯一值 */
  id: string;
  /** 狀態 (1: 啟用, 0: 停用) */
  status: number;
  /** 建立時間 */
  created_at: string;
  /** 更新時間 */
  updated_at: string;
  /** 建立者 ID */
  created_by: number;
  /** 更新者 ID */
  updated_by: number;
  /** 供應商統編 */
  CrVmpy: string;
  /** 盤包編號 */
  Code: string;
  /** 類別 Pkg(盤包) */
  Type: string;
  /** 中文名稱 */
  ZhName: string;
  /** 英文名稱 */
  EnName: string | null;
  /** 單位 */
  Unit: string;
  /** 是否需要滅菌 (0: 否, 1: 是) */
  NeedStz: number;
  /** 備註 */
  Memo: string | null;
  /** 明細資料 */
  items: CrPkgDtl[],
  /** 訊息資料 */
  msgs: CrPkgMsgMap[],
  /** 對照醫院 */
  hmpyMap: CrPkgMap[],
  /** 標籤資料 */
  tags: CrPkgTag[],
}
