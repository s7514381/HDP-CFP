export interface MaterialNotifyItem {
  id: string | number;
  materialGroupName: string;  // 群組
  materialNumber: string;     // 料號
  productModel: string;       // 產品型號
  productName: string;        // 產品名稱
  supplierName: string;       // 供應商
}

export interface MaterialNotifySearchForm {
  updateDateFrom: string;        // 異動紀錄開始日期
  updateDateTo: string;          // 異動紀錄結束日期
  materialGroupName: string;     // 群組
  productModel: string;          // 產品型號
  supplierName: string;          // 供應商
}
