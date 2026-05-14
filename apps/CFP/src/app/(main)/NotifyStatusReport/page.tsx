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
import { downloadFile } from '@packages/lib/downloadFlie';

interface NotifyStatusReportItem {
  strDate: string;
  supplierName: string;
  sentCount: string | number;
  updateCount: string | number;
}

const TABLE_COLUMNS = [
  { header: "寄送時間", key: "strDate" },
  { header: "供應商", key: "supplierName" },
  { header: "收到筆數", key: "sentCount" },
  { header: "更新筆數", key: "updateCount" },
] as const;

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return '""';
  }

  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function toCsv(items: NotifyStatusReportItem[]) {
  const headers = TABLE_COLUMNS.map((col) => escapeCsvValue(col.header)).join(',');
  const rows = items.map((item) =>
    [
      escapeCsvValue(item.strDate),
      escapeCsvValue(item.supplierName),
      escapeCsvValue(item.sentCount),
      escapeCsvValue(item.updateCount),
    ].join(',')
  );

  return ['\uFEFF' + headers, ...rows].join('\n');
}

export default function MaterialNotifyPage() {
  const api = useAppApi();
  const { danger } = useToast();
  const { Row, Col } = Grid;

  const tableRef = useRef<CommonTableHandle>(null);

  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState({
    createDateFrom: '',
    createDateTo: '',
    supplierName: ''
  });
  const [exporting, setExporting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'radio') {
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
    }

    setSearchForm(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleRadioClick = (name: string, value: boolean) => {
    setSearchForm(prev => {
      const currentValue = (prev as any)[name];
      return {
        ...prev,
        [name]: currentValue === value ? null : value
      };
    });
  };

  const handleSearch = () => {
    tableRef.current?.search({
      ...searchForm
    });
  };

  const handleClear = () => {
    setSearchForm({
      createDateFrom: '',
      createDateTo: '',
      supplierName: ''
    });
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
        danger({ message: <span>匯出失敗。</span> });
        return;
      }

      const responseData = (response as any).data || response;
      const list = Array.isArray(responseData.data)
        ? responseData.data
        : (Array.isArray(responseData) ? responseData : []);

      if (list.length === 0) {
        danger({ message: <span>目前篩選條件沒有可匯出的資料。</span> });
        return;
      }

      const csv = toCsv(list as NotifyStatusReportItem[]);
      downloadFile({
        blob: new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
        defaultFileName: 'NotifyStatusReport.csv'
      });
    } catch (error) {
      console.error('Export failed', error);
      danger({ message: <span>匯出失敗。</span> });
    } finally {
      setExporting(false);
    }
  };

  const columns: Column<any>[] = [
    { header: "寄送時間", key: "strDate" },
    { header: "供應商", key: "supplierName" },
    { header: "收到筆數", key: "sentCount" },
    { header: "更新筆數", key: "updateCount" },
  ];

  return (
    <>
      <ActionBar></ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}>
              <Input
                type="date"
                label="寄送開始日期"
                name="createDateFrom"
                value={searchForm.createDateFrom}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="date"
                label="寄送結束日期"
                name="createDateTo"
                value={searchForm.createDateTo}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="text"
                label="供應商"
                name="supplierName"
                value={searchForm.supplierName}
                onChange={handleSearchChange}
                placeholder="請輸入供應商名稱"
              />
            </Col>

            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                篩選
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>清除</Btn>
              <Btn color="secondary" outline disabled={exporting} onClick={handleExport}>
                {exporting ? '匯出中...' : '匯出報表'}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={`${API_URL}/NotifyStatusReport/GetList`}
            pageSize={10}
          />
        </Container>

      </WrapContent>
    </>
  );
}