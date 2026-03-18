import React, { Fragment } from 'react';
// 根據您的檔案結構，使用相對路徑導入 Table 相關元件
import { Table, THead, TBody, Tr, Th, Td } from './bootstrap5/Table'; 
// 根據您的檔案結構，導入 Pagination 元件
import { Links, Pagination } from './bootstrap5/Pagination';
import Container, { ContainerProps } from './bootstrap5/Container';
import { loadingType } from '@packages/types/useApi';
import { SpinnerGrow } from './bootstrap5/Spinner';
import StringHelper from './StringHelper';
import { TableProps } from '@packages/types/bootstrap5';

// --- 1. 定義資料結構型別 ---

// 配置th檔頭的html屬性

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
export interface DataGridProps<T extends { readonly id: string | number }> {
  readonly loading: loadingType,
  /** 傳入的原始數據陣列 (例如: User[] 或 Product[]) */
  readonly data: T[];
  /** 欄位配置，決定哪些欄位要顯示以及如何顯示 */
  readonly columns: ColumnDef<T>[];
  /** 表格的標題 (可選) */
  readonly caption?: string;
  /** 是否顯示表頭，預設為 true */
  readonly showHeader?: boolean;
  /** 分頁輸入（在此明確為 number，避免 unknown 型別滲入） */
  pagination?: { currentPage: number; totalCount: number; pageCount: number };
  /** 分頁連結資訊 (可選) */
  links?: Links;
  /** 是否啟用表格滾動，預設為 true */
  scroll?: boolean;
  /** 傳遞給外層 Container 元件的選項 */
  readonly containerOptions?: ContainerProps;
  /** 傳遞給 <table> 元素的選項 */
  readonly tableOptions?: TableProps;
  /** 提供一行額外的Tr可以客制額外的內容 */
  extraRow?: (rowData: T) => React.ReactNode;
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
export function DataGrid<T extends { readonly id: string | number, [key: string]: any }>({
  loading,
  data,
  columns,
  caption,
  showHeader = true,
  pagination,
  scroll = true,
  containerOptions,
  tableOptions,
  extraRow,
  onPageChange,
}: Readonly<DataGridProps<T>>): React.ReactElement {

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  }
  const {className, ...rest} = containerOptions ?? {};
  const _className = [
    'w-100 h-100 d-flex flex-column overflow-hidden', 
    className || '',
  ].filter(Boolean).join(' ');
  const respDivProps =  scroll ? {className: `h-100 flex-grow-1 overflow-auto my-3`} : {};

  return (
    <Container {...rest} className={_className} fluid>
      {/* 加載資料時顯示的過度樣式 */}
      { loading === 'loading' && <SpinnerGrow size="lg" color="primary" full={true} /> }

      <Table responsiveProps={respDivProps} striped bordered hover caption={caption} {...tableOptions}>
        {/* 表頭 (THead) 渲染邏輯 */}
        {showHeader && (
          <THead dark>
            <Tr>
              {/* 修正：使用 col.key 作為 key */}
              {columns.map((col) => (
                <Th key={String(col.key)} {...col.options} scope="col" >
                  {col.header}
                </Th>
              ))}
            </Tr>
          </THead>
        )}
        
        {/* 表身 (TBody) 渲染邏輯 */}
        <TBody>
          {data.length > 0 ? (
            // 修正：使用 row.id 作為 key
            data.map((row) => (
              <Fragment key={row.id}>
              <Tr>
                {/* 修正：使用 col.key 作為 key */}
                {columns.map((col) => (
                  <Td key={String(col.key)} className={col.tdOptions?.className} {...col.tdOptions}>
                    {/* 優先使用自定義渲染函數，否則顯示數據鍵值 */}
                    {col.render ? col.render(row) : <StringHelper.FormatString value={row[col.key]} />}
                  </Td>
                ))}
              </Tr>
              {/* 額外的行列 */}
              {extraRow && <Tr><Td className='p-0 border-0' colSpan={columns.length}>{extraRow(row)}</Td></Tr>}
              </Fragment>
            ))
          ) : (
            // 無資料時的顯示訊息
            <Tr>
              <Td colSpan={columns.length} className="text-center text-muted">
                無資料
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
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