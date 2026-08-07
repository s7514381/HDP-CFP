'use client';

import React from 'react';
import { Input } from '@packages/components/bootstrap5/Input';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { useToast } from '@packages/contexts/ToastContext';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import PcrBindingModal, { PcrBindingRow } from '@/components/common/PcrBindingModal';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import { API_MAP } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { TableSearchParams } from '@/components/common/tableUtils';

interface DataMaintenanceRow {
  id: string | number;
  materialGroupName?: string;
  materialNumber?: string;
  productName?: string;
  supplierName?: string;
}

interface DataMaintenanceSearch extends TableSearchParams {
  MaterialNumber: string;
  ProductName: string;
  SupplierName: string;
}

const INITIAL_SEARCH: DataMaintenanceSearch = {
  MaterialNumber: '',
  ProductName: '',
  SupplierName: '',
};

export default function DataMaintenancePage() {
  const { translate } = useLanguage();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { success, danger } = useToast();
  const tableRef = React.useRef<CommonTableHandle<DataMaintenanceRow>>(null);
  const [searchValues, setSearchValues] = React.useState(INITIAL_SEARCH);
  const [bindingMaterialId, setBindingMaterialId] = React.useState<string | number | null>(null);

  const updateSearchValue = (field: keyof DataMaintenanceSearch, value: string) => {
    setSearchValues((current) => ({ ...current, [field]: value }));
  };

  const handleSearch = () => {
    tableRef.current?.search(searchValues);
  };

  const handleClear = () => {
    setSearchValues(INITIAL_SEARCH);
    tableRef.current?.search(INITIAL_SEARCH);
  };

  const handlePcrBinding = async (row: PcrBindingRow) => {
    if (bindingMaterialId === null) return false;

    const result = await formPost(API_MAP.MATERIAL_BIND_PCR, {
      materialId: String(bindingMaterialId),
      productSubcategoryId: String(row.id),
    });

    if (!result.success) {
      danger({ message: <span>{result.message || 'PCR 綁定失敗。'}</span> });
      return false;
    }

    success({ message: <span>PCR 綁定成功。</span> });
    tableRef.current?.reload();
    return true;
  };

  const columns: Column<DataMaintenanceRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: '待建置',
      className: 'text-center',
      style: { width: '90px' },
      render: () => '✓',
    },
    {
      header: translate(LANGUAGE_KEYS.material.group, '群組'),
      key: 'materialGroupName',
    },
    {
      header: translate(LANGUAGE_KEYS.common.materialNumber, '料號'),
      key: 'materialNumber',
    },
    {
      header: translate(LANGUAGE_KEYS.common.productName, '產品名稱'),
      key: 'productName',
    },
    {
      header: translate(LANGUAGE_KEYS.common.supplier, '供應商'),
      key: 'supplierName',
    },
    {
      header: '建置率',
      className: 'text-center',
      render: () => '',
    },
    {
      header: '碳排係數',
      className: 'text-center',
      render: () => '',
    },
    {
      header: '審查結果',
      className: 'text-center',
      render: () => '',
    },
    {
      header: '功能',
      className: 'text-center',
      style: { width: '170px' },
      render: (row) => (
        <div className="d-flex flex-column align-items-center gap-1">
          <Btn type="button" color="secondary" size="sm" outline onClick={() => setBindingMaterialId(row.id)}>
            PCR綁定
          </Btn>
          <Btn type="button" color="secondary" size="sm" outline>
            原料維護
          </Btn>
          <Btn type="button" color="secondary" size="sm" outline>
            碳排訊息維護
          </Btn>
        </div>
      ),
    },
  ];

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.pcrPattern.dataMaintenance} />

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.common.materialNumber, '料號')}
                placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '料號')}
                value={searchValues.MaterialNumber}
                onChange={(event) => updateSearchValue('MaterialNumber', event.target.value)}
              />
            </Col>
            <Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.common.productName, '產品名稱')}
                placeholder={translate(LANGUAGE_KEYS.common.productName, '產品名稱')}
                value={searchValues.ProductName}
                onChange={(event) => updateSearchValue('ProductName', event.target.value)}
              />
            </Col>
            <Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.report.supplierName, '供應商')}
                placeholder={translate(LANGUAGE_KEYS.report.supplierName, '供應商')}
                value={searchValues.SupplierName}
                onChange={(event) => updateSearchValue('SupplierName', event.target.value)}
              />
            </Col>
            <Col md={12} className="d-flex justify-content-end gap-2">
              <Btn color="success" outline icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search, '查詢')}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>
                {translate(LANGUAGE_KEYS.common.clear, '清除')}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.MATERIAL_GET_LIST}
            searchParams={INITIAL_SEARCH}
            pageSize={10}
          />
        </Container>
      </WrapContent>
      {bindingMaterialId !== null && (
        <PcrBindingModal
          show
          onClose={() => setBindingMaterialId(null)}
          onConfirm={handlePcrBinding}
        />
      )}
    </>
  );
}
