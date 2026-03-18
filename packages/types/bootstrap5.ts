/**
 * bootstrap5相關的型別、參數等宣告
 */

import { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";


/**
 * @description 高彈性表格元件 (<table>) 的 Props 介面，整合 Bootstrap 5 樣式選項。
 */
export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** 額外的 Bootstrap 5 或客製化 class (例如: align-middle, table-success) */
  className?: string;
  /** 是否啟用 Bootstrap 的 .table-responsive 容器，預設為 true */
  responsive?: boolean;
  /** 響應式div的html屬性 */
  responsiveProps?: HTMLAttributes<HTMLDivElement>;
  // --- Bootstrap 5 樣式屬性 ---
  /** 是否啟用斑馬條紋效果 (.table-striped) */
  striped?: boolean;
  /** 是否啟用欄位斑馬條紋效果 (.table-striped-columns) */
  stripedColumns?: boolean;
  /** 是否啟用邊框 (.table-bordered) */
  bordered?: boolean;
  /** 是否移除所有邊框 (.table-borderless) - 與 bordered 互斥 */
  borderless?: boolean;
  /** 是否啟用滑鼠懸停效果 (.table-hover) */
  hover?: boolean;
  /** 是否啟用小尺寸表格 (.table-sm) */
  small?: boolean;
  /** 表格的標題文字 (<caption>) */
  caption?: React.ReactNode;
  /** 是否將標題放置在表格上方 (.caption-top) */
  captionTop?: boolean;
}

/**
 * @description 表格頭部 (<thead>) 的 Props 介面。
 */
export interface THeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** 額外的 class */
  className?: string;
  /** 是否啟用深色表頭樣式 (.table-dark) */
  dark?: boolean;
  /** 是否啟用淺色表頭樣式 (.table-light) */
  light?: boolean;
}

/**
 * @description 表格行 (<tr>) 的 Props 介面。
 */
export interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
  /** 額外的 class (例如: table-primary, table-danger) */
  className?: string;
}

/**
 * @description 表格表頭單元格 (<th>) 的 Props 介面。
 */
export interface THProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** 額外的 class */
  className?: string;
  /** 定義表頭單元格的範圍 ('col' 或 'row') */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
}

/**
 * @description 表格資料單元格 (<td>) 的 Props 介面。
 */
export interface TDProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** 額外的 class */
  className?: string;
  /** 定義跨越的欄位數 */
  colSpan?: number;
  /** 定義跨越的行數 */
  rowSpan?: number;
}