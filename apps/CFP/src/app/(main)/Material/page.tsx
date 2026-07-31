'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input, FileBtn } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import { TableSearchParams } from '@/components/common/tableUtils';
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { ImportListConfig, useImportList } from '@/hooks/useImportList';

interface MaterialRow {
  id: string | number;
  materialGroupName?: string;
  materialNumber?: string;
  productModel?: string;
  productName?: string;
  canSell?: string | number | boolean;
  CanSell?: string | number | boolean;
  supplierName?: string;
}

interface MaterialSearch extends TableSearchParams {
  MaterialNumber: string;
  SupplierName: string;
}

const MATERIAL_IMPORT_CONFIG: ImportListConfig<MaterialSearch> = {
  importUrl: API_MAP.MATERIAL_IMPORT,
  templateUrl: API_MAP.MATERIAL_IMPORT_TEMPLATE,
  templateFileName: 'MaterialImportTemplate.xlsx',
  initialSearch: { MaterialNumber: '', SupplierName: '' },
};

export default function MaterialPage() {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;

  const tableRef = React.useRef<CommonTableHandle<MaterialRow>>(null);
  const { translate } = useLanguage();
  const importList = useImportList<MaterialRow, MaterialSearch>(tableRef, MATERIAL_IMPORT_CONFIG);

  const handleSearch = () => {
    importList.search();
  };

  const handleClear = () => {
    importList.clearSearch();
  };

  const handleDelete = async (id: number | string) => {
    if (await confirm(translate(LANGUAGE_KEYS.common.confirm, '確定要刪除此料號嗎？'))) {
      const fd = new FormData();
      fd.append('id', String(id));
      const result = await api.post<unknown, FormData>(`${API_URL}/Material/Delete`, { body: fd });
      if (result.success) {
        success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess, '刪除成功！')}</span> });
        tableRef.current?.reload();
      } else {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed, '刪除失敗。')}</span> });
      }
    }
  };

  const columns: Column<MaterialRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.material.group, '群組'),
      key: "materialGroupName"
    },
    {
      header: translate(LANGUAGE_KEYS.common.materialNumber, '料號'),
      key: "materialNumber"
    },
    {
      header: translate(LANGUAGE_KEYS.common.productModel, '產品型號'),
      key: "productModel"
    },
    {
      header: translate(LANGUAGE_KEYS.common.productName, '產品名稱'),
      key: "productName"
    },
    {
      header: translate(LANGUAGE_KEYS.material.canSell, '是否可銷售'),
      className: "text-center",
      style: { width: '120px' },
      render: (item) => {
        const value = item.canSell ?? item.CanSell;
        const isCanSell = value === '1' || value === 1 || value === true || value === 'true';
        return isCanSell ? translate(LANGUAGE_KEYS.material.sellable, '可銷售') : translate(LANGUAGE_KEYS.material.notSellable, '不可銷售');
      }
    },
    {
      header: translate(LANGUAGE_KEYS.common.supplier, '供應商'),
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
      <ActionBar title={LANGUAGE_KEYS.material.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.common.materialNumber, '料號')} placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '料號')} value={importList.searchValues.MaterialNumber} onChange={(e) => importList.updateSearchValue('MaterialNumber', e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.report.supplierName, '供應商名稱')} placeholder={translate(LANGUAGE_KEYS.report.supplierName, '供應商名稱')} value={importList.searchValues.SupplierName} onChange={(e) => importList.updateSearchValue('SupplierName', e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search, '查詢')}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear, '清除')}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
                {hasPermission('Create') && (
                  <>
                    <Btn color="secondary" outline onClick={importList.downloadTemplate}>{translate(LANGUAGE_KEYS.common.downloadTemplate, '下載範本')}</Btn>
                    <FileBtn
                      label={importList.importing ? translate(LANGUAGE_KEYS.common.importing, '匯入中...') : translate(LANGUAGE_KEYS.common.import, '匯入')}
                      accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                      onChange={importList.importFile}
                      btnProps={{ color: 'primary', disabled: importList.importing }}
                    />
                    <Btn color="success" icon="add" outline={false} onClick={() => router.push('/Material/Create')}>{translate(LANGUAGE_KEYS.common.add, '新增')}</Btn>
                  </>
                )}
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
