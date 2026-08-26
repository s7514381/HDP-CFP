'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import Select from '@packages/components/bootstrap5/Select';
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
import { usePagePermissions } from '@/hooks/usePagePermissions';

interface DataMaintenanceRow {
  id: string | number;
  materialGroupName?: string;
  materialNumber?: string;
  productName?: string;
  supplierName?: string;
  pcrTemplateName?: string;
  pcrTemplateId?: string | number | null;
  carbonFactor?: number | null;
  uploadedFileCount?: number | null;
  totalFileCount?: number | null;
  reviewPassed?: boolean | null;
}

interface DataMaintenanceSearch extends TableSearchParams {
  MaterialNumber: string;
  ProductName: string;
  SupplierName: string;
  IsPendingBuild: string;
}

const INITIAL_SEARCH: DataMaintenanceSearch = {
  MaterialNumber: '',
  ProductName: '',
  SupplierName: '',
  IsPendingBuild: '',
};

export default function DataMaintenancePage() {
  const router = useRouter();
  const { translate } = useLanguage();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const { success, danger } = useToast();
  const tableRef = React.useRef<CommonTableHandle<DataMaintenanceRow>>(null);
  const [searchValues, setSearchValues] = React.useState(INITIAL_SEARCH);
  const [bindingMaterial, setBindingMaterial] = React.useState<DataMaintenanceRow | null>(null);
  const canBindPcr = hasPermission('DataMaintenance:BindPcr');
  const canMaintainRawMaterial = hasPermission('MaterialMaintenance:GetModel');
  const canMaintainBuyerAccreditation = hasPermission('BuyerAccreditationLevel:Index');
  const canMaintainCarbonFactor = hasPermission('CarbonFactorMaintenance:GetModel');
  const canAccessDataMaintenance = hasPermission('DataMaintenance:Index');

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

    const result = await formPost(API_MAP.DATA_MAINTENANCE_BIND_PCR, {
      materialId: String(bindingMaterial.id),
      productSubcategoryId: String(row.id),
    });

    if (!result.success) {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.dataMaintenance.bindFailed)}</span> });
      return false;
    }

    success({ message: <span>{translate(LANGUAGE_KEYS.dataMaintenance.bindSucceeded)}</span> });
    tableRef.current?.update(
      (item) => String(item.id) === String(bindingMaterial.id),
      (item) => ({
        ...item,
        pcrTemplateName: row.name || translate(LANGUAGE_KEYS.dataMaintenance.bound),
      }),
    );
    return true;
  };

  const columns: Column<DataMaintenanceRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.pendingBuild),
      className: 'text-center',
      style: { width: '90px' },
      render: (row) => hasBuildRate(row.totalFileCount) ? '' : '✓',
    },
    {
      header: translate(LANGUAGE_KEYS.material.group),
      key: 'materialGroupName',
    },
    {
      header: translate(LANGUAGE_KEYS.common.materialNumber),
      key: 'materialNumber',
    },
    {
      header: translate(LANGUAGE_KEYS.common.productName),
      key: 'productName',
    },
    {
      header: translate(LANGUAGE_KEYS.common.supplier),
      key: 'supplierName',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.template),
      key: 'pcrTemplateName',
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.buildRate),
      className: 'text-center',
      render: (row) => formatBuildRate(row.uploadedFileCount, row.totalFileCount),
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.carbonFactor),
      className: 'text-center',
      render: (row) => formatCarbonFactor(row.carbonFactor),
    },
    {
      header: translate(LANGUAGE_KEYS.dataMaintenance.reviewResult),
      className: 'text-center',
      render: (row) => (
        <span className={row.reviewPassed === true ? 'text-success fw-semibold' : 'text-danger fw-semibold'}>
          {row.reviewPassed === true
            ? translate(LANGUAGE_KEYS.dataMaintenance.reviewPass)
            : translate(LANGUAGE_KEYS.dataMaintenance.reviewFail)}
        </span>
      ),
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '170px' },
      render: (row) => (
        <div className="d-flex flex-column align-items-center gap-1">
          {canBindPcr && <Btn type="button" color="secondary" size="sm" outline onClick={() => setBindingMaterial(row)}>
            {translate(LANGUAGE_KEYS.dataMaintenance.bindPcr)}
          </Btn>}
          {canMaintainRawMaterial && <Btn
            type="button"
            color="secondary"
            size="sm"
            outline
            onClick={() => router.push(`/DataMaintenance/MaterialMaintenance/?id=${encodeURIComponent(String(row.id))}`)}
          >
            {translate(LANGUAGE_KEYS.dataMaintenance.rawMaterialMaintenance)}
          </Btn>}
          {canMaintainBuyerAccreditation && <Btn
            type="button"
            color="secondary"
            size="sm"
            outline
            onClick={() => router.push(`/DataMaintenance/BuyerAccreditation/?materialId=${encodeURIComponent(String(row.id))}`)}
          >
            {translate(LANGUAGE_KEYS.buyerAccreditation.title)}
          </Btn>}
          {canMaintainCarbonFactor && <Btn
            type="button"
            color="secondary"
            size="sm"
            outline
            onClick={() => router.push(`/DataMaintenance/CarbonFactorMaintenance/?materialId=${encodeURIComponent(String(row.id))}`)}
          >
            {translate(LANGUAGE_KEYS.carbonFactorMaintenance.title)}
          </Btn>}
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
                label={translate(LANGUAGE_KEYS.common.materialNumber)}
                placeholder={translate(LANGUAGE_KEYS.common.materialNumber)}
                value={searchValues.MaterialNumber}
                onChange={(event) => updateSearchValue('MaterialNumber', event.target.value)}
              />
            </Col>
            <Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.common.productName)}
                placeholder={translate(LANGUAGE_KEYS.common.productName)}
                value={searchValues.ProductName}
                onChange={(event) => updateSearchValue('ProductName', event.target.value)}
              />
            </Col>
            <Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.report.supplierName)}
                placeholder={translate(LANGUAGE_KEYS.report.supplierName)}
                value={searchValues.SupplierName}
                onChange={(event) => updateSearchValue('SupplierName', event.target.value)}
              />
            </Col>
            <Col md={4}>
              <Select
                label={translate(LANGUAGE_KEYS.dataMaintenance.pendingBuildFilter)}
                value={searchValues.IsPendingBuild}
                onChange={(event) => updateSearchValue('IsPendingBuild', event.target.value)}
                options={[
                  { value: '', label: translate(LANGUAGE_KEYS.common.all) },
                  { value: 'true', label: translate(LANGUAGE_KEYS.common.yes) },
                  { value: 'false', label: translate(LANGUAGE_KEYS.common.no) },
                ]}
              />
            </Col>
            <Col md={12} className="d-flex justify-content-end gap-2">
              <Btn color="success" outline icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
          {isReady && !canAccessDataMaintenance ? (
            <div className="alert alert-warning" role="alert">{translate(LANGUAGE_KEYS.apiError.forbidden)}</div>
          ) : (
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.DATA_MAINTENANCE_GET_LIST}
              searchParams={INITIAL_SEARCH}
              pageSize={10}
            />
          )}
        </Container>
      </WrapContent>
      <PcrBindingModal
        show={bindingMaterial !== null}
        onClose={() => setBindingMaterial(null)}
        onConfirm={handlePcrBinding}
        currentSelectedRowId={bindingMaterial?.pcrTemplateId ?? null}
      />
    </>
  );
}

function formatCarbonFactor(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '-';

  return Number(value).toFixed(2).replace(/\.00$|(?<=\.[0-9])0$/, '');
}

function formatBuildRate(uploadedFileCount: number | null | undefined, totalFileCount: number | null | undefined): string {
  if (totalFileCount == null || !Number.isFinite(Number(totalFileCount)) || Number(totalFileCount) <= 0) return '-';
  if (uploadedFileCount == null || !Number.isFinite(Number(uploadedFileCount))) return '0%';

  return `${Math.round((Number(uploadedFileCount) / Number(totalFileCount)) * 100)}%`;
}

function hasBuildRate(totalFileCount: number | null | undefined): boolean {
  return totalFileCount != null && Number.isFinite(Number(totalFileCount)) && Number(totalFileCount) > 0;
}
