/**
 * 器械主檔型別
 */
export interface CrSI {
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
  /** 類別 Dev(器械) (string | null) */
  Type: 'Dev' | string | null;
  /** 廠牌 (string | null) */
  Brand: string | null;
  /** 型號 (string | null) */
  Mdl: string | null;
  /** 規格 (string | null) */
  Spec: string | null;
  /** 主要材質 (string | null) */
  Mtl: string | null;
  /** 許可證字號 (string | null) */
  FDA: string | null;
  /** 製造國 (string | null) */
  Ctry: string | null;
  /** 單位 (string | null) */
  Unit: string | null;
  /** 器械功能 (string | null) */
  Func: string | null;
  /** 注意事項 (string | null) */
  Reminder: string | null;
  /** 中文名稱 (string) */
  ZhName: string;
  /** 英文名稱 (string | null) */
  EnName: string | null;
  /** 俗名 (string | null) */
  NickName: string | null;
  /** 備註 (string | null) */
  Memo: string | null;
}
