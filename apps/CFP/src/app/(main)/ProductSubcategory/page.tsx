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
import { PcrPatternOwnerRow, ProductSubcategoryRow } from '@/types/productSubcategory';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';
import PcrPatternOwnerModal from './PcrPatternOwnerModal';

interface ProductSubcategorySearchCriteria {
  name: string;
}

const DEFAULT_SEARCH_CRITERIA: ProductSubcategorySearchCriteria = { name: '' };

function isProductSubcategorySearchCriteria(value: unknown): value is ProductSubcategorySearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  return typeof (value as Record<string, unknown>).name === 'string';
}

export default function ProductSubcategoryPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(DEFAULT_SEARCH_CRITERIA, isProductSubcategorySearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <ProductSubcategoryContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

interface ProductSubcategoryContentProps {
  initialCriteria: ProductSubcategorySearchCriteria;
  saveSearchCriteria: ProductSubcategorySaveSearchCriteria;
  clearSearchCriteria: () => void;
}

type ProductSubcategorySaveSearchCriteria = ReturnType<
  typeof useSearchPersistence<ProductSubcategorySearchCriteria>
>['save'];

function ProductSubcategoryContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: ProductSubcategoryContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { languageCode, translate } = useLanguage();
  const { hasPermission } = usePagePermissions();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const tableRef = React.useRef<CommonTableHandle<ProductSubcategoryRow>>(null);
  const previousLanguageCode = React.useRef(languageCode);
  const [name, setName] = useState(initialCriteria.name);
  const [ownerModalProduct, setOwnerModalProduct] = useState<ProductSubcategoryRow | null>(null);

  React.useEffect(() => {
    if (previousLanguageCode.current === languageCode) return;

    previousLanguageCode.current = languageCode;
    tableRef.current?.reload();
  }, [languageCode]);

  const handleSearch = () => {
    saveSearchCriteria({ name });
    tableRef.current?.search({ Name: name.trim() });
  };

  const handleClear = () => {
    setName('');
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleDelete = async (id: string | number) => {
    if (!await confirm(translate(LANGUAGE_KEYS.productSubcategory.deleteConfirm))) return;

    const result = await formPost(`${API_MAP.PRODUCT_SUBCATEGORY_MST}/Delete`, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.productSubcategory.deleted)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    }
  };

  const columns: Column<ProductSubcategoryRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.productSubcategory),
      key: 'name',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.developer),
      key: 'developer',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.applicableScope),
      key: 'applicableScope',
    },
    {
      header: translate(LANGUAGE_KEYS.productSubcategory.cccCode),
      key: 'cccCode',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.template),
      className: 'text-center',
      style: { width: '190px' },
      render: (row) => (
        <div className="d-flex flex-column align-items-center gap-1">
          <Btn
            color="primary"
            size="sm"
            outline
            onClick={() => router.push(`/ProductSubcategory/PcrPattern/?id=${row.id}`)}
          >
            {translate(LANGUAGE_KEYS.common.view)}
          </Btn>
          <Btn
            color="secondary"
            size="sm"
            outline
            onClick={() => setOwnerModalProduct(row)}
          >
            {translate(LANGUAGE_KEYS.pcrPattern.viewOtherTemplates)}
          </Btn>
        </div>
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
      <ActionBar title={translate(LANGUAGE_KEYS.pcrPattern.template)} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={8}>
              <Input
                label={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory)}
                placeholder={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory)}
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
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
          <div className="d-flex justify-content-end gap-2">
            {hasPermission('Create') && (
              <Btn color="success" icon="add" onClick={() => router.push('/ProductSubcategory/Create')}>
                {translate(LANGUAGE_KEYS.common.add)}
              </Btn>
            )}
          </div>
        </Container>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.PRODUCT_SUBCATEGORY_GET_LIST}
            searchParams={{ Name: initialCriteria.name.trim() }}
            pageSize={10}
          />
        </Container>
      </WrapContent>
      {ownerModalProduct && (
        <PcrPatternOwnerModal
          show
          productSubcategoryId={String(ownerModalProduct.id)}
          onClose={() => setOwnerModalProduct(null)}
          onView={(owner: PcrPatternOwnerRow) => {
            const productId = String(ownerModalProduct.id);
            setOwnerModalProduct(null);
            router.push(
              `/ProductSubcategory/PcrPattern/?id=${encodeURIComponent(productId)}&sourceManagerId=${encodeURIComponent(String(owner.id))}`,
            );
          }}
        />
      )}
    </>
  );
}
