'use client';

import React, { useState, useRef } from 'react';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import { useAppApi } from '@/hooks/useAppApi';
import { useToast } from '@packages/contexts/ToastContext';
import { API_URL } from '@/lib/apiRoutes';
import { TableSearchParams } from '@/components/common/tableUtils';
import { downloadFile } from '@packages/lib/downloadFlie';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface NotifyStatusReportItem {
  strDate: string;
  supplierName: string;
  sentCount: string | number;
  updateCount: string | number;
}

interface NotifyStatusReportSearchCriteria extends TableSearchParams {
  createDateFrom: string;
  createDateTo: string;
  supplierName: string;
}

const INITIAL_SEARCH: NotifyStatusReportSearchCriteria = {
  createDateFrom: '',
  createDateTo: '',
  supplierName: '',
};

function isNotifyStatusReportSearchCriteria(value: unknown): value is NotifyStatusReportSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;
  const criteria = value as Record<string, unknown>;
  return typeof criteria.createDateFrom === 'string'
    && typeof criteria.createDateTo === 'string'
    && typeof criteria.supplierName === 'string';
}

interface NotifyStatusReportContentProps {
  initialCriteria: NotifyStatusReportSearchCriteria;
  saveSearchCriteria: (criteria: NotifyStatusReportSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function toCsv(items: NotifyStatusReportItem[], headers: string[]) {
  const headerText = headers.map(escapeCsvValue).join(',');
  const rows = items.map((item) =>
    [
      escapeCsvValue(item.strDate),
      escapeCsvValue(item.supplierName),
      escapeCsvValue(item.sentCount),
      escapeCsvValue(item.updateCount),
    ].join(',')
  );

  return ['\uFEFF' + headerText, ...rows].join('\n');
}

export default function NotifyStatusReportPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(INITIAL_SEARCH, isNotifyStatusReportSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <NotifyStatusReportContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function NotifyStatusReportContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: NotifyStatusReportContentProps) {
  const api = useAppApi();
  const { danger } = useToast();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();
  const tableColumns: Column<NotifyStatusReportItem>[] = [
    { header: translate(LANGUAGE_KEYS.common.sendTime), key: 'strDate' },
    { header: translate(LANGUAGE_KEYS.common.supplier), key: 'supplierName' },
    { header: translate(LANGUAGE_KEYS.common.receiveCount), key: 'sentCount' },
    { header: translate(LANGUAGE_KEYS.common.updateCount), key: 'updateCount' },
  ] as const;

  const tableRef = useRef<CommonTableHandle<NotifyStatusReportItem>>(null);

  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState(initialCriteria);
  const [exporting, setExporting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    saveSearchCriteria(searchForm);
    tableRef.current?.search(searchForm);
  };

  const handleClear = () => {
    setSearchForm(INITIAL_SEARCH);
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams({
        order: JSON.stringify({ column: 0, dir: 'asc' }),
        start: '0',
        length: '1000000',
        draw: '1'
      });

      Object.entries(searchForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await api.post(`${API_URL}/NotifyStatusReport/GetList?${params.toString()}`);
      if (!response.success) {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.operationFailed)}</span> });
        return;
      }

      const responseData = response.data;
      const rawList = isRecord(responseData) && Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData) ? responseData : [];
      const list: NotifyStatusReportItem[] = rawList.filter(isRecord).map((item) => ({
        strDate: String(item.strDate ?? ''),
        supplierName: String(item.supplierName ?? ''),
        sentCount: String(item.sentCount ?? ''),
        updateCount: String(item.updateCount ?? ''),
      }));

      if (list.length === 0) {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.noData)}</span> });
        return;
      }

      const csv = toCsv(list, tableColumns.map(column => column.header));
      downloadFile({
        blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
        defaultFileName: 'NotifyStatusReport.csv'
      });
    } catch (error) {
      console.error('Export failed', error);
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.operationFailed)}</span> });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <ActionBar></ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}>
              <Input
                type="date"
                label={translate(LANGUAGE_KEYS.report.sendStart)}
                name="createDateFrom"
                value={searchForm.createDateFrom}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="date"
                label={translate(LANGUAGE_KEYS.report.sendEnd)}
                name="createDateTo"
                value={searchForm.createDateTo}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="text"
                label={translate(LANGUAGE_KEYS.common.supplier)}
                name="supplierName"
                value={searchForm.supplierName}
                onChange={handleSearchChange}
                placeholder={translate(LANGUAGE_KEYS.report.supplierName)}
              />
            </Col>

            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.filter)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
              <Btn color="secondary" outline disabled={exporting} onClick={handleExport}>
                {exporting ? translate(LANGUAGE_KEYS.common.exporting) : translate(LANGUAGE_KEYS.common.exportReport)}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={tableColumns}
            apiUrl={`${API_URL}/NotifyStatusReport/GetList`}
            searchParams={initialCriteria}
            pageSize={10}
          />
        </Container>

      </WrapContent>
    </>
  );
}
