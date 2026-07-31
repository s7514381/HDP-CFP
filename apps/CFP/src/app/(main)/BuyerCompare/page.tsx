'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function MaterialPage() {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle>(null);
  const [searchMaterialNumber, setSearchMaterialNumber] = useState('');
  const [searchSupplierName, setSearchSupplierName] = useState('');

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

  const getSpecCount = (item: any) => item.specCount ?? '-';
  const getNotCompareCount = (item: any) => item.notCompareCount ?? '-';

  const columns: Column<any>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
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
      header: translate(LANGUAGE_KEYS.common.supplier, '供應商'),
      key: "supplierName"
    },
    {
      header: translate(LANGUAGE_KEYS.buyerCompare.specCount, '規格碼筆數'),
      className: "text-center",
      style: { width: '120px' },
      key: "specCount",
    },
    {
      header: translate(LANGUAGE_KEYS.buyerCompare.unmappedCount, '未對照筆數'),
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
              <Input label={translate(LANGUAGE_KEYS.common.materialNumber, '料號')} placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '料號')} value={searchMaterialNumber} onChange={(e) => setSearchMaterialNumber(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.report.supplierName, '供應商名稱')} placeholder={translate(LANGUAGE_KEYS.report.supplierName, '供應商名稱')} value={searchSupplierName} onChange={(e) => setSearchSupplierName(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search, '查詢')}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear, '清除')}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/BuyerCompare/GetList`}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
