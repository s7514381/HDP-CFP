'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TableSearchParams } from '@/components/common/tableUtils';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { API_URL } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface BuyerCompareRow {
  id: string | number;
  materialNumber?: string;
  productModel?: string;
  productName?: string;
  supplierName?: string;
  specCount?: string | number;
  notCompareCount?: string | number;
}

interface BuyerCompareSearchCriteria extends TableSearchParams {
  MaterialNumber: string;
  SupplierName: string;
}

const INITIAL_SEARCH: BuyerCompareSearchCriteria = {
  MaterialNumber: '',
  SupplierName: '',
};

function isBuyerCompareSearchCriteria(value: unknown): value is BuyerCompareSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;
  const criteria = value as Record<string, unknown>;
  return typeof criteria.MaterialNumber === 'string'
    && typeof criteria.SupplierName === 'string';
}

interface BuyerCompareContentProps {
  initialCriteria: BuyerCompareSearchCriteria;
  saveSearchCriteria: (criteria: BuyerCompareSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

export default function BuyerComparePage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(INITIAL_SEARCH, isBuyerCompareSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <BuyerCompareContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function BuyerCompareContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: BuyerCompareContentProps) {
  const router = useRouter();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle<BuyerCompareRow>>(null);
  const [searchMaterialNumber, setSearchMaterialNumber] = useState(initialCriteria.MaterialNumber);
  const [searchSupplierName, setSearchSupplierName] = useState(initialCriteria.SupplierName);

  const handleSearch = () => {
    const criteria = {
      MaterialNumber: searchMaterialNumber,
      SupplierName: searchSupplierName,
    };
    saveSearchCriteria(criteria);
    tableRef.current?.search(criteria);
  };

  const handleClear = () => {
    setSearchMaterialNumber('');
    setSearchSupplierName('');
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const columns: Column<BuyerCompareRow>[] = [
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
      header: translate(LANGUAGE_KEYS.buyerCompare.specCount),
      className: "text-center",
      style: { width: '120px' },
      key: "specCount",
    },
    {
      header: translate(LANGUAGE_KEYS.buyerCompare.unmappedCount),
      className: "text-center",
      style: { width: '120px' },
      key: "notCompareCount",
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
              onClick={() => router.push(`/BuyerCompare/Edit/?id=${item.id}`)}
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
              <Input label={translate(LANGUAGE_KEYS.common.materialNumber)} placeholder={translate(LANGUAGE_KEYS.common.materialNumber)} value={searchMaterialNumber} onChange={(e) => setSearchMaterialNumber(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.report.supplierName)} placeholder={translate(LANGUAGE_KEYS.report.supplierName)} value={searchSupplierName} onChange={(e) => setSearchSupplierName(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/BuyerCompare/GetList`}
              searchParams={initialCriteria}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
