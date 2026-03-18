import { ReactElement } from "react";

export interface PaginationProps {
  // 當前頁碼
  currentPage: number;
  // 總筆數
  totalCount: number;
  // 總頁數
  pageCount: number;
  // 頁碼變更回調函數
  onPageChange: (page: number) => void;
  [key: string]: number | ((page: number) => void) | undefined | string;
}

export interface Links {
  self: string;
  first: string;
  last: string;
  next?: string;
}

export const Pagination = ({ currentPage, totalCount, pageCount, onPageChange, ...props }: PaginationProps): ReactElement => {

  /**
   * 獲取可見的頁碼
   * @returns 可見的頁碼陣列
   */
  const getVisiblePages = (): number[] => {
    const delta = 3; // 前後顯示的頁數範圍
    const range: number[] = [];
    // 計算範圍
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(pageCount, currentPage + delta); i++) {
      range.push(i);
    }
    // 添加省略號
    if (range[0] > 1) {
      if (range[0] > 2) range.unshift(-1); // -1 表示省略號
      range.unshift(1); // 第一頁
    }
    if (range[range.length - 1] < pageCount) {
      if (range[range.length - 1] < pageCount - 1) range.push(-2); // -2 表示省略號
      range.push(pageCount); // 最後一頁
    }

    return range;
  };
  /** 要顯示的頁數 */
  const pages = getVisiblePages();

  return (
    <nav {...props}>
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button title="上一頁" type="button" className="page-link" onClick={() => onPageChange(currentPage - 1)}>
            <span aria-hidden="true">&laquo;</span>
          </button>
        </li>
        {/* 頁碼按鈕 */}
        {pages.map((page) =>
          [-1,-2].includes(page) ? (
            <li key={`ellipsis-${page}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(page)}>
                {page}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
          <button title="下一頁" type="button" className="page-link" onClick={() => onPageChange(currentPage + 1)}>
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};