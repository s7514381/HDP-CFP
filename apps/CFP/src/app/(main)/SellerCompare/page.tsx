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
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { ImportListConfig, useImportList } from '@/hooks/useImportList';

interface SellerCompareRow {
  id: string | number;
  materialNumber?: string;
  productModel?: string;
  productName?: string;
  supplierName?: string;
  buyerName?: string;
}

interface SellerCompareSearch extends TableSearchParams {
  MaterialNumber: string;
  SupplierName: string;
}

const SELLER_IMPORT_CONFIG: ImportListConfig<SellerCompareSearch> = {
  importUrl: API_MAP.SELLER_IMPORT,
  templateUrl: API_MAP.SELLER_IMPORT_TEMPLATE,
  templateFileName: 'SellerCompareImportTemplate.xlsx',
  initialSearch: { MaterialNumber: '', SupplierName: '' },
};

export default function MaterialPage() {
  const router = useRouter();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;

  const tableRef = React.useRef<CommonTableHandle<SellerCompareRow>>(null);
  const { translate } = useLanguage();
  const importList = useImportList<SellerCompareRow, SellerCompareSearch>(tableRef, SELLER_IMPORT_CONFIG);

  const handleSearch = () => {
    importList.search();
  };

  const handleClear = () => {
    importList.clearSearch();
  };

  const columns: Column<SellerCompareRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.common.materialNumber),
      key: "materialNumber"
    },
    {
      header: translate(LANGUAGE_KEYS.common.productModel),
      key: "productModel"
    },
    {
      header: translate(LANGUAGE_KEYS.common.productName),
      key: "productName"
    },
    {
      header: translate(LANGUAGE_KEYS.common.supplier),
      key: "supplierName"
    },
    {
      header: translate(LANGUAGE_KEYS.sellerCompare.buyer),
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
              <Input label={translate(LANGUAGE_KEYS.common.materialNumber)} placeholder={translate(LANGUAGE_KEYS.common.materialNumber)} value={importList.searchValues.MaterialNumber} onChange={(e) => importList.updateSearchValue('MaterialNumber', e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.report.supplierName)} placeholder={translate(LANGUAGE_KEYS.report.supplierName)} value={importList.searchValues.SupplierName} onChange={(e) => importList.updateSearchValue('SupplierName', e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2 flex-wrap">
                {hasPermission('Create') && (
                  <>
                    <Btn color="secondary" outline onClick={importList.downloadTemplate}>{translate(LANGUAGE_KEYS.common.downloadTemplate)}</Btn>
                    <FileBtn
                      label={importList.importing ? translate(LANGUAGE_KEYS.common.importing) : translate(LANGUAGE_KEYS.common.import)}
                      accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                      onChange={importList.importFile}
                      btnProps={{ color: 'primary', disabled: importList.importing }}
                    />
                  </>
                )}
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
