/**
 * 一些通用的搜尋欄位表單型別
 */

export interface SearchStatusForm {
    status: string | number;
}
export interface SearchKeywordForm extends SearchStatusForm {
  keyword: string;
}

// 搜尋表單 裝態 + 關鍵字 + 日期區間
export interface SearchDateRangeForm extends SearchKeywordForm {
  startDate: string;
  endDate: string;
}
// 搜尋表單 裝態 + 關鍵字 + 日期區間 + 醫院
export interface SearchDateRangeHmpyForm extends SearchDateRangeForm {
  CrHmpy: string;
}