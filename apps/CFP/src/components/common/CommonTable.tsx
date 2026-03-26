import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Table, THead, TBody, Tr, Th, Td } from "@packages/components/bootstrap5/Table";
import { Pagination } from "@packages/components/bootstrap5/Pagination";
import { useAppApi } from "@/hooks/useAppApi";

export interface Column<T> {
  header: string;
  key?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface CommonTableHandle {
  reload: () => void;
  search: (params: Record<string, string>) => void;
}

interface CommonTableProps<T> {
  columns: Column<T>[];
  apiUrl?: string;
  searchParams?: Record<string, string>;
  pageSize?: number;
  rowKey?: (item: T) => string | number;
  // 以下為相容舊版或手動傳入資料的情況
  data?: T[];
  totalRecords?: number;
  currentPage?: number;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

export const CommonTable = forwardRef(<T extends any>(
  {
    columns,
    apiUrl,
    searchParams: externalSearchParams = {},
    pageSize = 10,
    rowKey = (item: any) => item.id || item.uuid,
    data: manualData,
    totalRecords: manualTotalRecords,
    currentPage: manualCurrentPage,
    isLoading: manualIsLoading,
    onPageChange: manualOnPageChange,
  }: CommonTableProps<T>,
  ref: React.Ref<CommonTableHandle>
) => {
  const { post, loading } = useAppApi();
  const [data, setData] = useState<T[]>(manualData || []);
  const [totalRecords, setTotalRecords] = useState(manualTotalRecords || 0);
  const [currentPage, setCurrentPage] = useState(manualCurrentPage || 1);
  const [searchParams, setSearchParams] = useState<Record<string, string>>(externalSearchParams);

  const isLoading = apiUrl ? loading === 'loading' : manualIsLoading;

  const fetchList = useCallback(async (page: number, currentSearchParams: Record<string, string>) => {
    if (!apiUrl) return;

    const startNum = (page - 1) * pageSize;
    const params = new URLSearchParams({
      order: JSON.stringify({ column: 0, dir: 'asc' }),
      start: startNum.toString(),
      length: pageSize.toString(),
      draw: '1',
      Status: '1',
      ...currentSearchParams
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
  }, [apiUrl, searchParams]); // 移除 fetchList 依賴，避免 Hook 穩定性問題導致重複請求

  // 當外部資料更新時同步 (如果不是透過 API)
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
    search: (params: Record<string, string>) => {
      setSearchParams(params);
      fetchList(1, params);
    }
  }));

  const handlePageChange = (page: number) => {
    if (apiUrl) {
      fetchList(page, searchParams);
    } else if (manualOnPageChange) {
      manualOnPageChange(page);
    }
  };

  const pageCount = Math.ceil(totalRecords / pageSize);

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
            data.map((item, index) => (
              <Tr key={rowKey(item)}>
                {columns.map((col, colIndex) => (
                  <Td key={colIndex} className={col.className} style={col.style}>
                    {col.render ? col.render(item, (currentPage - 1) * pageSize + index) : (col.key ? (item as any)[col.key] : '-')}
                  </Td>
                ))}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={columns.length} className="text-center py-4">
                {isLoading ? '載入中...' : '暫無資料'}
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>

      {!isLoading && totalRecords > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            共 {totalRecords} 筆資料
          </div>
          <Pagination 
            currentPage={currentPage}
            totalCount={totalRecords}
            pageCount={pageCount}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
});
