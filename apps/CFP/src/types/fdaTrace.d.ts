/**
 * 來源流向追蹤資料表檔頭類型定義
 */
export interface FdaTrace {
  /** 耗用紀錄ID(醫院端OpSchItmId作為PK) (string) */
  id: string;
  /** 狀態(1:有效, 0:刪除) (number) */
  status: 1 | 0;
  /** 建立時間 (string) */
  created_at: string;
  /** 更新時間 (string) */
  updated_at: string;
  /** 應用程式ID (string) */
  created_by: string;
  /** 應用程式ID (string) */
  updated_by: string;
  /** 醫院統編+A(醫院端資料來源) (string) */
  CrHmpy: string;
  CrHmpyName?: string | null;
  CrHmpyAbbr?: string | null;
  /** 收貨日期(醫院端資料來源) (string) */
  RcvDate: string;
  /** 耗用、帳單日期(醫院端資料來源) (string) */
  BillDate: string;
  /** 供應商統編+A(醫院端資料來源) (string | null) */
  CrVmpy: string | null;
  /** 供應商統編不加A (string | null) */
  VndTaxId: string | null;
  VndName?: string | null;
  VndEnName?: string | null;
  VndAbbr?: string | null;
  /** 耗用日期 (string | null) */
  UseDate: string | null;
  /** 規格碼 (string | null) */
  WmSku: string | null;
  /** 就醫序號 (string | null) */
  PatSn: string | null;
  /** 病例號末三碼３碼 (string | null) */
  PatNo: string | null;
  /** 病患姓名 (string | null) */
  PatName: string | null;
  /** 成本中心 (string | null) */
  CostCenter: string | null;
  /** 型號 (string | null) */
  Model: string | null;
  /** 許可證號 (string | null) */
  FdaCode: string | null;
  /** 數量 (number) */
  Qty: number;
  /** 單位 (string | null) */
  Unit: string | null;
  
  /** 編輯日誌 */
  items: FdaTraceEditLog[];
}

/**
 * 來源流向追蹤異動紀錄類型定義
 */
export interface FdaTraceEditLog {
  /** 唯一值 (string) */
  id: string;
  /** 資料狀態 (1:有效, 0:刪除) (number) */
  status: 1 | 0;
  /** 建立時間 (string - ISO 8601 或日期時間字串) */
  created_at: string;
  /** 更新時間 (string - ISO 8601 或日期時間字串) */
  updated_at: string;
  /** 醫院端人員帳號ID，0為初始狀態由系統建立 (number) */
  created_by: number;
  /** 醫院端人員帳號ID，0為初始狀態由系統建立 (number) */
  updated_by: number;
  /** 耗用紀錄ID (OpSchItmId作為外鍵來源) (string) */
  fda_trace_id: string;
  /** 收貨日期，資料源為空複製BillDate (string | null) */
  RcvDate: string | null;
  /** UDI DI碼 (string | null) */
  DI: string | null;
  /** 型號 (string | null) */
  Model: string | null;
  /** 許可證號 (string | null) */
  FdaCode: string | null;
  /** 產品批號 (string | null) */
  Lot: string | null;
  /** 產品序號 (string | null) */
  Seno: string | null;
  /** 產品製造日期 (string | null) */
  MFDate: string | null;
  /** 有效日期(天) (string | null) */
  ValidDate: string | null;
  /** 產品有效期限 (string | null) */
  EXP: string | null;
  /** 廠商料號ID (string | null) */
  ItmId: string | null;
  /** 數量 (number) */
  Qty: number;
  /** 單位 (string | null) */
  Unit: string | null;
  /** * 是否經過核准 
   * (0:初始狀態, 10:醫院端修改資料, 11:醫院端核准供應商修改, 20:供應商修改等待核准) 
   */
  Approved: 0 | 10 | 11 | 20;
  /** 來源流向追蹤主檔 */
  fdaTrace?: FdaTrace;
}
/**
 * 整合檔頭與明細的View類型定義
 */
export interface FdaTraceView {
  /** 主檔ID(醫院端OpSchItmId作為PK) (string) */
  id: string;
  /** 明細id */
  FdaTraceEditLogId: string;
  /** 明細狀態(1:有效, 0:刪除) (number) */
  status: 1 | 0;
  /** 明細建立時間 (string) */
  created_at: string;
  /** 明細更新時間 (string) */
  updated_at: string;
  /** 明細應用程式ID (string) */
  created_by: string;
  /** 明細user ID (string) */
  updated_by: string;
  /** 醫院統編+A(醫院端資料來源) (string) */
  CrHmpy: string;
  CrHmpyName?: string | null;
  CrHmpyAbbr?: string | null;
  /** 收貨日期(醫院端資料來源) (string) */
  RcvDate: string;
  /** 耗用、帳單日期(醫院端資料來源) (string) */
  BillDate: string;
  /** 供應商統編+A(醫院端資料來源) (string | null) */
  CrVmpy: string | null;
  /** 供應商統編不加A (string | null) */
  VndTaxId: string | null;
  VndName?: string | null;
  VndEnName?: string | null;
  VndAbbr?: string | null;
  /** 耗用日期 (string | null) */
  UseDate: string | null;
  /** 規格碼 (string | null) */
  WmSku: string | null;
  /** 就醫序號 (string | null) */
  PatSn: string | null;
  /** 病例號末三碼３碼 (string | null) */
  PatNo: string | null;
  /** 病患姓名 (string | null) */
  PatName: string | null;
  /** 成本中心 (string | null) */
  CostCenter: string | null;
  /** UDI DI碼 (string | null) */
  DI: string | null;
  /** 型號 (string | null) */
  Model: string | null;
  /** 許可證號 (string | null) */
  FdaCode: string | null;
  /** 產品批號 (string | null) */
  Lot: string | null;
  /** 產品序號 (string | null) */
  Seno: string | null;
  /** 產品製造日期 (string | null) */
  MFDate: string | null;
  /** 有效日期(天) (string | null) */
  ValidDate: string | null;
  /** 產品有效期限 (string | null) */
  EXP: string | null;
  /** 數量 (number) */
  Qty: number;
  /** 單位 (string | null) */
  Unit: string | null;
  Approved: 0 | 10 | 11 | 20;
  /** 編輯日誌 */
  items: FdaTraceEditLog[];
}
/**
 * 可以編輯的來源流向追蹤表單類型定義
 */
export interface FdaTraceEditForm {
  // 明細ID
  id: string;
  /** 醫院統編 */
  CrVmpy: string | null;
  /** 收貨日期，資料源為空複製BillDate (string | null) */
  RcvDate: string | null;
  /** UDI DI碼 (string | null) */
  DI: string | null;
  /** 型號 (string | null) */
  Model: string | null;
  /** 許可證號 (string | null) */
  FdaCode: string | null;
  /** 產品批號 (string | null) */
  Lot: string | null;
  /** 產品序號 (string | null) */
  Seno: string | null;
  /** 產品製造日期 (string | null) */
  MFDate: string | null;
  /** 有效日期(天) (string | null) */
  ValidDate: string | null;
  /** 產品有效期限 (string | null) */
  EXP: string | null;
  /** 廠商料號ID (string | null) */
  ItmId: string | null;
  /** 數量 (number) */
  Qty: number;
  /** 單位 (string | null) */
  Unit: string | null;
}