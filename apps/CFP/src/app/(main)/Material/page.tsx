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
import { useConfirm } from '@packages/hooks/useConfirm';
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { downloadFile } from '@packages/lib/downloadFlie';

export default function MaterialPage() {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger, warning } = useToast();
  const { confirm } = useConfirm();
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
    const response = await get<Blob>(API_MAP.MATERIAL_IMPORT_TEMPLATE, { responseType: 'blob' } as any);
    if (response.success && response.data) {
      downloadFile({
        blob: response.data,
        defaultFileName: 'MaterialImportTemplate.xlsx'
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

      const result = await post<{ totalCount: number; successCount: number; failureCount: number; errors: string[] }>(API_MAP.MATERIAL_IMPORT, {
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

  const handleDelete = async (id: number | string) => {
    if (await confirm('確定要刪除此料號嗎？')) {
      const fd = new FormData();
      fd.append('id', String(id));
      const result = await api.post(`${API_URL}/Material/Delete`, { body: fd });
      if (result.success) {
        success({ message: <span>刪除成功！</span> });
        tableRef.current?.reload();
      } else {
        danger({ message: <span>刪除失敗。</span> });
      }
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
      header: "群組", 
      key: "materialGroupName" 
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
      header: "是否可銷售",
      className: "text-center",
      style: { width: '120px' },
      render: (item) => {
        const value = item.canSell ?? item.CanSell;
        const isCanSell = value === '1' || value === 1 || value === true || value === 'true';
        return isCanSell ? '可銷售' : '不可銷售';
      }
    },
    { 
      header: "供應商", 
      key: "supplierName" 
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
              onClick={() => router.push(`/Material/Edit/?id=${item.id}`)}
            />
          )}
          {hasPermission('Delete') && (
            <FontAwesome 
              icon="fa-regular fa-trash-can" 
              className="text-danger cursor-pointer" 
              onClick={() => handleDelete(item.id)}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar title="料號管理">
      </ActionBar>

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
                <Btn color="success" icon="add" outline={false} onClick={() => router.push('/Material/Create')}>新增</Btn>
            </div>
        </Container>

        <Container fluid>
            <CommonTable 
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.MATERIAL_GET_LIST}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
