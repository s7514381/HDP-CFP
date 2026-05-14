'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input, FileBtn } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { downloadFile } from '@packages/lib/downloadFlie';

export default function MaterialPage() {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger, warning } = useToast();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;

  const tableRef = React.useRef<CommonTableHandle>(null);
  const [searchMaterialNumber, setSearchMaterialNumber] = useState('');
  const [searchSupplierName, setSearchSupplierName] = useState('');
  const [importing, setImporting] = useState(false);
  const { post, get } = api;

  const handleSearch = () => {
    tableRef.current?.search({
      MaterialNumber: searchMaterialNumber,
      SupplierName: searchSupplierName
    });
  };

  const handleClear = () => {
    setSearchMaterialNumber('');
    setSearchSupplierName('');
    tableRef.current?.search({});
  };

  const handleDownloadTemplate = async () => {
    const response = await get<Blob>(API_MAP.SELLER_IMPORT_TEMPLATE, { responseType: 'blob' } as any);
    if (response.success && response.data) {
      downloadFile({
        blob: response.data,
        defaultFileName: 'SellerCompareImportTemplate.xlsx'
      });
      return;
    }

    danger({ message: <span>下載範本失敗。</span> });
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ignoreErrors', 'true');

      const result = await post<{ totalCount: number; successCount: number; failureCount: number; errors: string[] }>(API_MAP.SELLER_IMPORT, {
        body: formData
      } as any);

      const summary = result.data;
      if (result.success && summary) {
        if (summary.successCount > 0) {
          success({ message: <span>匯入完成，成功 {summary.successCount} 筆。</span> });
          tableRef.current?.reload();
        }

        if (summary.failureCount > 0) {
          const errorText = summary.errors?.slice(0, 3).join('；') || '部分資料未成功。';
          if (summary.successCount > 0) {
            warning({ message: <span>匯入部分失敗，{summary.failureCount} 筆未成功。{errorText}</span> });
          } else {
            danger({ message: <span>匯入失敗，{summary.failureCount} 筆未成功。{errorText}</span> });
          }
        }

        if (summary.totalCount === 0) {
          danger({ message: <span>沒有可匯入的資料。</span> });
        }
        return;
      }

      danger({ message: <span>{result.message || '匯入失敗，請確認檔案格式。'}</span> });
    } catch (error) {
      console.error('Import failed', error);
      danger({ message: <span>匯入失敗，請確認檔案格式。</span> });
    } finally {
      setImporting(false);
    }
  };

  const columns: Column<any>[] = [
    {
      header: "項次",
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    { 
      header: "料號", 
      key: "materialNumber" 
    },
    { 
      header: "產品型號", 
      key: "productModel" 
    },
    { 
      header: "產品名稱", 
      key: "productName" 
    },
    { 
      header: "供應商", 
      key: "supplierName" 
    },
    { 
      header: "買方", 
      key: "buyerName" 
    },
    {
      header: "",
      className: "text-center",
      style: { width: '120px' },
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome 
              icon="fa-regular fa-pen-to-square" 
              className="text-warning cursor-pointer" 
              onClick={() => router.push(`/SellerCompare/Edit/?id=${item.id}`)}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar></ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label="料號" placeholder="料號" value={searchMaterialNumber} onChange={(e) => setSearchMaterialNumber(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label="供應商名稱" placeholder="供應商名稱" value={searchSupplierName} onChange={(e) => setSearchSupplierName(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                查詢
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>清除</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
                <Btn color="secondary" outline onClick={handleDownloadTemplate}>下載範本</Btn>
                <FileBtn
                  label={importing ? '匯入中...' : '匯入'}
                  accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  onChange={handleImportFile}
                  btnProps={{ color: 'primary', disabled: importing }}
                />
            </div>
        </Container>

        <Container fluid>
            <CommonTable 
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/SellerCompare/GetList`}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
