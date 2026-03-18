/**
 * 供應商通用訊息管理介面類型定義
 */
export interface CrMsg {
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
  /** 類別 Msg(訊息) (string | null) */
  Type: 'Msg' | string | null;
  /** 訊息內容 (string) */
  Content: string;
}
