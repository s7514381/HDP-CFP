export interface MaterialNotifyItem {
  id: string | number;
  groupName: string;      // 群組
  materialNo: string;     // 料號
  productModel: string;   // 產品型號
  productName: string;    // 產品名稱
  supplierName: string;   // 供應商
}

export interface MaterialNotifySearchForm {
  startDate: string;      // 異動紀錄開始日期
  endDate: string;        // 異動紀錄結束日期
  group: string;          // 群組
  productModel: string;   // 產品型號
  supplier: string;       // 供應商
}
