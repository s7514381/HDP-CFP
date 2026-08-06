'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FontAwesome from '@packages/components/FontAwsome';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { ProductSubcategoryRow } from '@/types/productSubcategory';

export default function ProductSubcategoryPage() {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission } = usePagePermissions();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const tableRef = React.useRef<CommonTableHandle<ProductSubcategoryRow>>(null);
  const [name, setName] = useState('');

  const handleSearch = () => {
    tableRef.current?.search({ Name: name.trim() });
  };

  const handleClear = () => {
    setName('');
    tableRef.current?.search({});
  };

  const handleDelete = async (id: string | number) => {
    if (!await confirm(translate(LANGUAGE_KEYS.productSubcategory.deleteConfirm, '確定要刪除此產品次類別嗎？'))) return;

    const result = await formPost(`${API_MAP.PRODUCT_SUBCATEGORY_MST}/Delete`, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.productSubcategory.deleted, '刪除成功！')}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed, '刪除失敗。')}</span> });
    }
  };

  const columns: Column<ProductSubcategoryRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, '產品次類別'),
      key: 'name',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.developer, '制定者'),
      key: 'developer',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.applicableScope, '適用範圍'),
      key: 'applicableScope',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.cccCode, 'CCC code'),
      key: 'cccCode',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.template, 'PCR模板'),
      className: 'text-center',
      style: { width: '110px' },
      render: (row) => (
        <Btn
          color="primary"
          size="sm"
          outline
          onClick={() => router.push(`/ProductSubcategory/PcrPattern/?id=${row.id}`)}
        >
          查看
        </Btn>
      ),
    },
    {
      header: '',
      className: 'text-center',
      style: { width: '150px' },
      render: (row) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer align-self-center"
              onClick={() => router.push(`/ProductSubcategory/Edit/?id=${row.id}`)}
            />
          )}
          {hasPermission('Delete') && (
            <FontAwesome
              icon="fa-regular fa-trash-can"
              className="text-danger cursor-pointer align-self-center"
              onClick={() => void handleDelete(row.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.pcrPattern.template, 'PCR模板')} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={8}>
              <Input
                label={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, '產品次類別')}
                placeholder={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, '產品次類別')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search, '查詢')}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>
                {translate(LANGUAGE_KEYS.common.clear, '清除')}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
          <div className="d-flex justify-content-end gap-2">
            {hasPermission('Create') && (
              <Btn color="success" icon="add" onClick={() => router.push('/ProductSubcategory/Create')}>
                {translate(LANGUAGE_KEYS.common.add, '新增')}
              </Btn>
            )}
          </div>
        </Container>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.PRODUCT_SUBCATEGORY_GET_LIST}
            pageSize={10}
          />
        </Container>
      </WrapContent>
    </>
  );
}
