/**
 * 設備序號表
 */
export interface CrEQPSN {
  /** 唯一值 (string) */
  id: string;
  /** 狀態 (1:啟用, 0:停用) (number) */
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
  /** 設備ID (string) */
  EQPId: string;
  /** 設備序號 (string) */
  SN: string;
}

/**
 * 設備醫院對照檔
 */
export interface CrEQPMap {
  /** 唯一值 (string) */
  id: string;
  /** 狀態 (1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 設備ID (string) */
  EQPId: string;
  /** 供應商統編 (string) */
  CrVmpy: string;
  /** 醫院端統編 (string) */
  CrHmpy: string;
  /** 醫院端設備編號 (string) */
  CrHmpyCode: string;
  /** 醫院簡稱 */
  CrHmpyAbbr?: string;
  /** 醫院名稱 */
  CrHmpyName?: string;
}
/**
 * 設備主檔型別
 */
export interface CrEQP {
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
  /** 類別 Sku(設備) */
  Type: string | null;
  /** 設備編號 */
  Code: string;
  /** 廠牌 */
  Brand: string;
  /** 型號 */
  Mdl: string;
  /** 規格 */
  Spec: string | null;
  /** 許可證字號 */
  Fda: string | null;
  /** 健保碼 */
  Nhi: string | null;
  /** 單位 */
  Unit: string;
  /** 中文名稱 */
  ZhName: string;
  /** 英文名稱 */
  EnName: string | null;
  /** 備註 */
  Memo: string | null;
  /** 醫院對照 */
  hmpyMap: CrEQPMap[];
  /** 序號 */
  sn: CrEQPSN[];
}
