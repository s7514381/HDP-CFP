import React, { Fragment } from 'react';
// 根據您的檔案結構，導入 Pagination 元件
import { Links, Pagination } from './bootstrap5/Pagination';
import Container, { ContainerProps } from './bootstrap5/Container';
import { loadingType } from '@packages/types/useApi';
import { SpinnerGrow } from './bootstrap5/Spinner';


/**
 * 提供可以自定義內容的DataGrid元件
 */

// --- 1. 定義資料結構型別 ---
/**
 * @description 欄位定義介面。用於告訴 DataGrid 如何渲染每一欄資料。
 * @template T - 數據行物件的型別
 */
export interface ColumnDef<T> {
  /** 數據物件中對應的鍵 (key) */
  key: keyof T;
  /** 顯示在表頭的名稱 */
  header: string;
  /** 無值時的佔位符，預設為 "--" */
  noValuePlaceholder?: string;
  /** 傳遞給 <th> 元素的額外屬性 */
  options?: React.ThHTMLAttributes<HTMLTableCellElement>;
  /** 傳遞給 <td> 元素的額外屬性 */
  tdOptions?: React.TdHTMLAttributes<HTMLTableCellElement>;
  /** 可選的自定義渲染函數。用於在單元格中顯示按鈕、連結或特殊格式。
   * @param rowData - 當前行數據物件
   * @returns React.ReactNode - 渲染結果
   */
  render?: (rowData: T) => React.ReactNode;
}

/**
 * @description DataGrid 元件的 Props 介面。
 * @template T - 數據行物件的型別 (修正: 必須包含唯一的 id 屬性)
 */
export interface CustomDataGridProps<T extends { readonly id: string | number }> {
  readonly loading: loadingType,
  /** 傳入的原始數據陣列 (例如: User[] 或 Product[]) */
  readonly data: T[];
  /** 傳入自己定義的元件 */
  body: ({key, item}: {key: string | number, item: T}) => React.ReactNode;
  /** 分頁輸入（在此明確為 number，避免 unknown 型別滲入） */
  pagination?: { currentPage: number; totalCount: number; pageCount: number };
  /** 分頁連結資訊 (可選) */
  links?: Links;
  /** 傳遞給外層 Container 元件的選項 */
  readonly containerOptions?: ContainerProps;
  readonly bodyOptions?: React.HTMLAttributes<HTMLDivElement>;
  /** 頁碼變更時的回調函數 */
  onPageChange?: (page: number) => void;
}

/**
 * @description DataGrid 元件。
 * 負責處理數據分頁、欄位渲染邏輯，並使用 TableComponents 建立結構。
 * @param {DataGridProps<T>} props - 元件屬性
 * @returns React.FC
 */
// 修正泛型約束：要求數據 T 必須擁有一個 id 屬性作為 key
export function CustomDataGrid<T extends { readonly id: string | number }>({
  loading,
  data,
  body,
  pagination,
  containerOptions,
  bodyOptions,
  onPageChange,
}: Readonly<CustomDataGridProps<T>>): React.ReactElement {

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  }
  const {className, ...rest} = containerOptions ?? {};
  const _className = ['w-100 h-100 d-flex flex-column overflow-hidden', className || '',].filter(Boolean).join(' ');
  const {className: bodyClassName, ...bodyRest } = bodyOptions ?? {};
  const _bodyClassName = ['h-100 overflow-auto', bodyClassName || '',].filter(Boolean).join(' ');

  return (
    <Container {...rest} className={_className} fluid>
      {/* 加載資料時顯示的過度樣式 */}
      { loading === 'loading' && <SpinnerGrow size="lg" color="primary" full={true} /> }
      <div className={_bodyClassName} {...bodyRest}>
      { data.map((item) => 
        <Fragment key={item.id}>
          { body({key: item.id, item}) }
        </Fragment>
        )}
      </div>

      {/* 渲染獨立分頁控制器，傳遞正確的 Props */}
      {
        pagination &&
        <Pagination
          className="mt-auto ms-auto"
          currentPage={pagination.currentPage}
          totalCount={pagination.totalCount} // 總項目數
          pageCount={pagination.pageCount} // 總頁數
          onPageChange={handlePageChange}
        />
      }
    </Container>
  );
}