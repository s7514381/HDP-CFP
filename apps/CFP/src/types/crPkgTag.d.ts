/**
 * 盤包標牌表 (CrPkgTag) 類型定義
 */
export interface CrPkgTag {
  /** 唯一值 (string) */
  id: string;
  /** 狀態 (1:啟用, 0:停用) (number) */
  status: 1 | 0;
  /** 建立時間 (string - ISO 8601 或日期時間字串) */
  created_at: string;
  /** 更新時間 (string - ISO 8601 或日期時間字串) */
  updated_at: string;
  /** 建立者ID (number) */
  created_by: number;
  /** 更新者ID (number) */
  updated_by: number;
  /** 供應商統編 (string) */
  CrVmpy: string;
  /** 盤包ID (string) */
  CrPkgId: string;
  /** 標牌號碼 (string) */
  Code: string;
  /** 備註 (string | null) */
  Memo: string | null;
}