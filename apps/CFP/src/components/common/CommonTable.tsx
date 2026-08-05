import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Table, THead, TBody, Tr, Th, Td } from '@packages/components/bootstrap5/Table';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import {
  buildTableQuery,
  getPaginationItems,
  parseTableResponse,
  readTableCell,
  TableSearchParams,
  PaginationItem,
} from './tableUtils';

export interface Column<T> {
  header: string;
  key?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CommonTableHandle<T extends object = object> {
  reload: () => void;
  search: (params: TableSearchParams) => void;
  getData: () => Promise<T[]>;
}

export interface CommonTableProps<T extends object> {
  columns: Column<T>[];
  apiUrl?: string;
  searchParams?: TableSearchParams;
  pageSize?: number;
  rowKey?: (item: T) => string | number;
  data?: T[];
  totalRecords?: number;
  currentPage?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

function CommonTableInner<T extends object>(
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
  ref: React.ForwardedRef<CommonTableHandle<T>>
) {
  const { post } = useAppApi();
  const { translate } = useLanguage();
  const postRef = useRef(post);
  const requestIdRef = useRef(0);
  const [data, setData] = useState<T[]>(manualData ?? []);
  const [totalRecords, setTotalRecords] = useState(manualTotalRecords ?? 0);
  const [currentPage, setCurrentPage] = useState(manualCurrentPage ?? 1);
  const [currentSearchParams, setCurrentSearchParams] = useState<TableSearchParams>(externalSearchParams);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    postRef.current = post;
  }, [post]);

  const fetchList = useCallback(async (page: number, params: TableSearchParams) => {
    if (!apiUrl) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsFetching(true);
    setData([]);
    setTotalRecords(0);

    try {
      const response = await postRef.current<unknown>(`${apiUrl}?${buildTableQuery(page, pageSize, params)}`);
      if (requestId !== requestIdRef.current || !response.success) return;

      const parsed = parseTableResponse<T>(response);
      setData(parsed.data);
      setTotalRecords(parsed.totalRecords);
      setCurrentPage(page);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error('CommonTable fetch failed', error);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsFetching(false);
      }
    }
  }, [apiUrl, pageSize]);

  useEffect(() => {
    if (!apiUrl) return;

    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await fetchList(1, currentSearchParams);
    };

    void load();
    return () => { cancelled = true; };
  }, [apiUrl, currentSearchParams, fetchList]);

  const displayData = apiUrl ? data : (manualData ?? data);
  const displayTotalRecords = apiUrl ? totalRecords : (manualTotalRecords ?? totalRecords);
  const displayCurrentPage = apiUrl ? currentPage : (manualCurrentPage ?? currentPage);
  const isLoading = apiUrl ? isFetching : Boolean(manualIsLoading);
  const visibleData = useMemo(
    () => (isLoading && apiUrl ? [] : displayData),
    [apiUrl, displayData, isLoading]
  );

  useImperativeHandle(ref, () => ({
    reload: () => { void fetchList(displayCurrentPage, currentSearchParams); },
    search: (params) => {
      setCurrentSearchParams(params);
    },
    getData: () => Promise.resolve(visibleData),
  }), [currentSearchParams, displayCurrentPage, fetchList, visibleData]);

  const handlePageChange = (page: number) => {
    if (apiUrl) {
      void fetchList(page, currentSearchParams);
    } else {
      manualOnPageChange?.(page);
    }
  };

  const pageCount = Math.ceil(displayTotalRecords / pageSize);
  const paginationItems = getPaginationItems(displayCurrentPage, pageCount);

  return (
    <div>
      <Table hover bordered className={!apiUrl && isLoading ? 'opacity-50' : ''} aria-busy={isLoading}>
        <THead className="table-primary" style={{ backgroundColor: '#6cb4ee', color: 'white' }}>
          <Tr>
            {columns.map((column, columnIndex) => (
              <Th key={`header-${columnIndex}`} className={column.className} style={{ backgroundColor: '#6cb4ee', color: 'white', ...column.style }}>
                {column.header}
              </Th>
            ))}
          </Tr>
        </THead>
        <TBody>
          {visibleData.length > 0 ? visibleData.map((item, index) => (
            <Tr key={rowKey ? rowKey(item) : index}>
              {columns.map((column, columnIndex) => (
                <Td key={`cell-${columnIndex}`} className={column.className} style={column.style}>
                  {column.render
                    ? column.render(item, (displayCurrentPage - 1) * pageSize + index)
                    : column.key
                      ? String(readTableCell(item, column.key) ?? '-')
                      : '-'}
                </Td>
              ))}
            </Tr>
          )) : (
            <Tr>
              <Td colSpan={columns.length} className="text-center py-4">
                {isLoading ? translate(LANGUAGE_KEYS.common.loading) : translate(LANGUAGE_KEYS.common.noData)}
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {!isLoading && displayTotalRecords > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-3">
          <div className="flex-shrink-0">
            {translate(LANGUAGE_KEYS.common.total)} {displayTotalRecords} {translate(LANGUAGE_KEYS.common.records)}
          </div>
          <nav className="ms-auto" aria-label={`${translate(LANGUAGE_KEYS.common.previousPage)} / ${translate(LANGUAGE_KEYS.common.nextPage)}`} style={{ minWidth: 0, maxWidth: '100%' }}>
            <ul className="pagination flex-wrap justify-content-end mb-0">
              <li className={`page-item ${displayCurrentPage <= 1 ? 'disabled' : ''}`}>
                <button type="button" className="page-link" aria-label={translate(LANGUAGE_KEYS.common.previousPage)} disabled={displayCurrentPage <= 1} onClick={() => handlePageChange(displayCurrentPage - 1)}>«</button>
              </li>
              {paginationItems.map((item: PaginationItem) => typeof item === 'number' ? (
                <li className={`page-item ${displayCurrentPage === item ? 'active' : ''}`} key={item}>
                  <button type="button" className="page-link" onClick={() => handlePageChange(item)}>{item}</button>
                </li>
              ) : (
                <li className="page-item disabled" key={item}><span className="page-link" aria-hidden="true">…</span></li>
              ))}
              <li className={`page-item ${displayCurrentPage >= pageCount ? 'disabled' : ''}`}>
                <button type="button" className="page-link" aria-label={translate(LANGUAGE_KEYS.common.nextPage)} disabled={displayCurrentPage >= pageCount} onClick={() => handlePageChange(displayCurrentPage + 1)}>»</button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}

export const CommonTable = forwardRef(CommonTableInner) as <T extends object>(
  props: CommonTableProps<T> & { ref?: React.Ref<CommonTableHandle<T>> }
) => React.ReactElement;
