import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Table, THead, TBody, Tr, Th, Td } from "@packages/components/bootstrap5/Table";
import { useAppApi } from "@/hooks/useAppApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_KEYS } from "@/config/languageKeys";

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

const getPaginationItems = (currentPage: number, pageCount: number): PaginationItem[] => {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const visiblePages = new Set<number>([1, pageCount, currentPage]);
  for (let offset = -2; offset <= 2; offset += 1) {
    const page = currentPage + offset;
    if (page > 1 && page < pageCount) {
      visiblePages.add(page);
    }
  }

  const sortedPages = Array.from(visiblePages).sort((left, right) => left - right);
  const items: PaginationItem[] = [];

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push(page <= currentPage ? 'ellipsis-left' : 'ellipsis-right');
    }
    items.push(page);
  });

  return items;
};

export interface Column<T> {
  header: string;
  key?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CommonTableHandle<T = unknown> {
  reload: () => void;
  search: (params: Record<string, any>) => void;
  getData: () => Promise<T[]>;
}

interface CommonTableProps<T> {
  columns: Column<T>[];
  apiUrl?: string;
  searchParams?: Record<string, any>;
  pageSize?: number;
  rowKey?: (item: T) => string | number;
  // Supports legacy callers and manually supplied data.
  data?: T[];
  totalRecords?: number;
  currentPage?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export const CommonTable = forwardRef(<T extends any,>(
  {
    columns,
    apiUrl,
    searchParams: externalSearchParams = {},
    pageSize = 10,
    rowKey,
    data: manualData,
    totalRecords: manualTotalRecords,
    currentPage: manualCurrentPage,
    isLoading: manualIsLoading,
    onPageChange: manualOnPageChange,
  }: CommonTableProps<T>,
  ref: React.Ref<CommonTableHandle<T>>
) => {
  const { post, loading } = useAppApi();
  const { translate } = useLanguage();
  const [data, setData] = useState<T[]>(manualData || []);
  const [totalRecords, setTotalRecords] = useState(manualTotalRecords || 0);
  const [currentPage, setCurrentPage] = useState(manualCurrentPage || 1);
  const [searchParams, setSearchParams] = useState<Record<string, any>>(externalSearchParams);

  const isLoading = apiUrl ? loading === 'loading' : manualIsLoading;

  const fetchList = useCallback(async (page: number, currentSearchParams: Record<string, any>) => {
    if (!apiUrl) return;

    const startNum = (page - 1) * pageSize;
    const params = new URLSearchParams({
      order: JSON.stringify({ column: 0, dir: 'asc' }),
      start: startNum.toString(),
      length: pageSize.toString(),
      draw: '1'
    });

    Object.keys(currentSearchParams).forEach(key => {
      const val = currentSearchParams[key];
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, val.toString());
      }
    });

    try {
      const res = await post(`${apiUrl}?${params.toString()}`);
      if (res.success) {
        const responseData = (res as any).data || res;
        const list = Array.isArray(responseData.data) ? responseData.data : (Array.isArray(responseData) ? responseData : []);
        setData(list);
        const total = responseData.recordsTotal ?? (res as any).recordsTotal ?? (responseData.data ? responseData.data.length : list.length);
        setTotalRecords(total);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('CommonTable fetch failed', err);
    }
  }, [apiUrl, pageSize, post]);

  useEffect(() => {
    if (apiUrl) {
      fetchList(1, searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUrl, searchParams]); // Keep fetchList out to avoid unstable-hook refetches.

  // Synchronize external data when the table is not API-backed.
  useEffect(() => {
    if (!apiUrl) {
      if (manualData !== undefined) setData(manualData);
      if (manualTotalRecords !== undefined) setTotalRecords(manualTotalRecords);
      if (manualCurrentPage !== undefined) setCurrentPage(manualCurrentPage);
    }
  }, [apiUrl, manualData, manualTotalRecords, manualCurrentPage]);

  useImperativeHandle(ref, () => ({
    reload: () => {
      fetchList(currentPage, searchParams);
    },
    search: (params: Record<string, any>) => {
      setSearchParams(params);
      fetchList(1, params);
    },
    getData: () => Promise.resolve(data)
  }), [data]);

  const handlePageChange = (page: number) => {
    if (apiUrl) {
      fetchList(page, searchParams);
    } else if (manualOnPageChange) {
      manualOnPageChange(page);
    }
  };

  const pageCount = Math.ceil(totalRecords / pageSize);
  const paginationItems = getPaginationItems(currentPage, pageCount);

  return (
    <div>
      <Table hover bordered className={isLoading ? 'opacity-50' : ''}>
        <THead className="table-primary" style={{ backgroundColor: '#6cb4ee', color: 'white' }}>
          <Tr>
            {columns.map((col, index) => (
              <Th
                key={index}
                className={col.className}
                style={{ backgroundColor: '#6cb4ee', color: 'white', ...col.style }}
              >
                {col.header}
              </Th>
            ))}
          </Tr>
        </THead>
        <TBody>
          {data.length > 0 ? (
            data.map((item, index) => {
              const key = rowKey ? (rowKey(item) || index) : index;
              return (
                <Tr key={key}>
                  {columns.map((col, colIndex) => (
                  <Td key={colIndex} className={col.className} style={col.style}>
                    {col.render ? col.render(item, (currentPage - 1) * pageSize + index) : (col.key ? (item as any)[col.key] : '-')}
                  </Td>
                ))}
              </Tr>
              );
            })
          ) : (
            <Tr>
              <Td colSpan={columns.length} className="text-center py-4">
                {isLoading ? translate(LANGUAGE_KEYS.common.loading) : translate(LANGUAGE_KEYS.common.noData)}
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {!isLoading && totalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
          <div className="flex-shrink-0">
            {translate(LANGUAGE_KEYS.common.total)} {totalRecords} {translate(LANGUAGE_KEYS.common.records)}
          </div>
          <nav
            className="ms-auto"
            aria-label={`${translate(LANGUAGE_KEYS.common.previousPage)} / ${translate(LANGUAGE_KEYS.common.nextPage)}`}
            style={{ minWidth: 0, maxWidth: '100%' }}
          >
            <ul className="pagination flex-wrap justify-content-end mb-0">
              <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  aria-label={translate(LANGUAGE_KEYS.common.previousPage)}
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  «
                </button>
              </li>
              {paginationItems.map(item => {
                if (typeof item !== 'number') {
                  return (
                    <li className="page-item disabled" key={item}>
                      <span className="page-link" aria-hidden="true">…</span>
                    </li>
                  );
                }

                return (
                  <li className={`page-item ${currentPage === item ? 'active' : ''}`} key={item}>
                    <button type="button" className="page-link" onClick={() => handlePageChange(item)}>
                      {item}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${currentPage >= pageCount ? 'disabled' : ''}`}>
                <button
                  type="button"
                  className="page-link"
                  aria-label={translate(LANGUAGE_KEYS.common.nextPage)}
                  disabled={currentPage >= pageCount}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
});
