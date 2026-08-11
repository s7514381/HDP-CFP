'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  pcrTemplateName?: string;
  pcrTemplateId?: string | number | null;
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
  const router = useRouter();
  const { translate } = useLanguage();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { success, danger } = useToast();
  const tableRef = React.useRef<CommonTableHandle<DataMaintenanceRow>>(null);
  const [searchValues, setSearchValues] = React.useState(INITIAL_SEARCH);
  const [bindingMaterial, setBindingMaterial] = React.useState<DataMaintenanceRow | null>(null);

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
    if (bindingMaterial === null) return false;

    const result = await formPost(API_MAP.MATERIAL_BIND_PCR, {
      materialId: String(bindingMaterial.id),
      productSubcategoryId: String(row.id),
    });

    if (!result.success) {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.dataMaintenance.bindFailed, 'PCR binding failed.')}</span> });
      return false;
    }

    success({ message: <span>{translate(LANGUAGE_KEYS.dataMaintenance.bindSucceeded, 'PCR binding succeeded.')}</span> });
    tableRef.current?.update(
      (item) => String(item.id) === String(bindingMaterial.id),
      (item) => ({
        ...item,
        pcrTemplateName: row.name || translate(LANGUAGE_KEYS.dataMaintenance.bound, 'Bound'),
      }),
    );
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
      header: translate(LANGUAGE_KEYS.dataMaintenance.pendingBuild, 'Pending build'),
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
      header: translate(LANGUAGE_KEYS.pcrPattern.template, 'PCR template'),
      key: 'pcrTemplateName',
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.buildRate, 'Build rate'),
      className: 'text-center',
      render: () => '',
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.carbonFactor, 'Carbon emission factor'),
      className: 'text-center',
      render: () => '',
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.reviewResult, 'Review result'),
      className: 'text-center',
      render: () => '',
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions, 'Actions'),
      className: 'text-center',
      style: { width: '170px' },
      render: (row) => (
        <div className="d-flex flex-column align-items-center gap-1">
          <Btn type="button" color="secondary" size="sm" outline onClick={() => setBindingMaterial(row)}>
            {translate(LANGUAGE_KEYS.dataMaintenance.bindPcr, 'Bind PCR')}
          </Btn>
          <Btn
            type="button"
            color="secondary"
            size="sm"
            outline
            onClick={() => router.push(`/DataMaintenance/MaterialMaintenance/?id=${encodeURIComponent(String(row.id))}`)}
          >
            {translate(LANGUAGE_KEYS.dataMaintenance.rawMaterialMaintenance, 'Material maintenance')}
          </Btn>
          <Btn
            type="button"
            color="secondary"
            size="sm"
            outline
            onClick={() => router.push(`/DataMaintenance/BuyerAccreditation/?materialId=${encodeURIComponent(String(row.id))}`)}
          >
            {translate(LANGUAGE_KEYS.buyerAccreditation.title, '買方認可依據')}
          </Btn>
          <Btn type="button" color="secondary" size="sm" outline>
            {translate(LANGUAGE_KEYS.dataMaintenance.carbonInformationMaintenance, 'Carbon information maintenance')}
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
      {bindingMaterial !== null && (
        <PcrBindingModal
          show
          onClose={() => setBindingMaterial(null)}
          onConfirm={handlePcrBinding}
          currentSelectedRowId={bindingMaterial.pcrTemplateId}
        />
      )}
    </>
  );
}
