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
import { appStorage, useStoredValue } from '@/lib/appStorage';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';
import { PCR_TEMPLATE_CATEGORY_OPTIONS } from '@/lib/pcrTemplateCategories';
import {
  isPcrTemplateCategory,
  PcrTemplateCategory,
} from '@/types/pcrTemplate';
import { PcrPatternRow, PCR_PATTERN_CATEGORY_STORAGE_KEY } from '@/types/pcrPattern';

interface PcrPatternSearchCriteria {
  category: PcrTemplateCategory;
  item: string;
}

const DEFAULT_SEARCH_CRITERIA: PcrPatternSearchCriteria = {
  category: PcrTemplateCategory.Material,
  item: '',
};

function isPcrPatternSearchCriteria(value: unknown): value is PcrPatternSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;
  return isPcrTemplateCategory(record.category)
    && typeof record.item === 'string';
}

export default function PcrPatternPage() {
  const storedCategory = useStoredValue<PcrTemplateCategory | null>(PCR_PATTERN_CATEGORY_STORAGE_KEY, null);
  const [categoryReady, setCategoryReady] = useState(false);
  const defaultCriteria = React.useMemo<PcrPatternSearchCriteria>(() => ({
    category: isPcrTemplateCategory(storedCategory)
      ? storedCategory
      : DEFAULT_SEARCH_CRITERIA.category,
    item: DEFAULT_SEARCH_CRITERIA.item,
  }), [storedCategory]);
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(defaultCriteria, isPcrPatternSearchCriteria);

  React.useEffect(() => {
    setCategoryReady(true);
  }, []);

  if (!isSearchPersistenceReady || !categoryReady) return null;

  return (
    <PcrPatternContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

interface PcrPatternContentProps {
  initialCriteria: PcrPatternSearchCriteria;
  saveSearchCriteria: PcrPatternSaveSearchCriteria;
  clearSearchCriteria: () => void;
}

type PcrPatternSaveSearchCriteria = ReturnType<
  typeof useSearchPersistence<PcrPatternSearchCriteria>
>['save'];

function PcrPatternContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: PcrPatternContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { languageCode, translate } = useLanguage();
  const { hasPermission } = usePagePermissions();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const tableRef = React.useRef<CommonTableHandle<PcrPatternRow>>(null);
  const previousLanguageCode = React.useRef<string | null>(null);
  const [category, setCategory] = useState(initialCriteria.category);
  const [searchItem, setSearchItem] = useState(initialCriteria.item);

  React.useEffect(() => {
    if (previousLanguageCode.current === null) {
      previousLanguageCode.current = languageCode;
      return;
    }

    if (previousLanguageCode.current === languageCode) return;
    previousLanguageCode.current = languageCode;
    tableRef.current?.reload();
  }, [languageCode]);

  const handleSearch = () => {
    saveSearchCriteria({ category, item: searchItem });
    tableRef.current?.search({
      Category: category,
      Item: searchItem.trim(),
    });
  };

  const selectCategory = (value: PcrTemplateCategory) => {
    setCategory(value);
    appStorage.set(PCR_PATTERN_CATEGORY_STORAGE_KEY, value);
    saveSearchCriteria({ category: value, item: searchItem });
    tableRef.current?.search({
      Category: value,
      Item: searchItem.trim(),
    });
  };

  const handleClear = () => {
    setCategory(PcrTemplateCategory.Material);
    appStorage.set(PCR_PATTERN_CATEGORY_STORAGE_KEY, PcrTemplateCategory.Material);
    setSearchItem('');
    clearSearchCriteria();
    tableRef.current?.search({
      Category: PcrTemplateCategory.Material,
      Item: '',
    });
  };

  const handleDelete = async (id: string | number) => {
    if (!await confirm(translate(LANGUAGE_KEYS.pcrPattern.deleteConfirm))) return;

    const result = await formPost(`${API_MAP.PCR_PATTERN_MST}/Delete`, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.deleted)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    }
  };

  const columns: Column<PcrPatternRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.pcrTemplate.item),
      key: 'item',
      render: (row) => row.item,
    },
    {
      header: translate(LANGUAGE_KEYS.pcrTemplate.subItems),
      key: 'subItems',
      render: (row) => row.subItems || '',
    },
    {
      header: '',
      className: 'text-center',
      style: { width: '120px' },
      render: (row) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer"
              onClick={() => router.push(`/PcrPattern/Edit/?id=${row.id}`)}
            />
          )}
          {hasPermission('Delete') && (
            <FontAwesome
              icon="fa-regular fa-trash-can"
              className="text-danger cursor-pointer"
              onClick={() => void handleDelete(row.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.pcrPattern.title} />
      <WrapContent className="p-3">
        <div className="border-bottom mb-3">
          <div className="nav nav-tabs" role="tablist" aria-label={translate(LANGUAGE_KEYS.pcrPattern.title)}>
            {PCR_TEMPLATE_CATEGORY_OPTIONS.map(option => {
              const isActive = category === option.value;
              return (
                <div className="nav-item flex-fill" key={option.value}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`nav-link w-100 ${isActive ? 'active fw-semibold' : 'text-secondary'}`}
                    onClick={() => selectCategory(option.value)}
                  >
                    {translate(option.languageKey)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={8}>
              <Input
                label={translate(LANGUAGE_KEYS.pcrTemplate.item)}
                placeholder={translate(LANGUAGE_KEYS.pcrTemplate.item)}
                value={searchItem}
                onChange={(event) => setSearchItem(event.target.value)}
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
              <Btn color="success" icon="add" outline={false} onClick={() => router.push('/PcrPattern/Create')}>
                {translate(LANGUAGE_KEYS.common.add)}
              </Btn>
            )}
          </div>
        </Container>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.PCR_PATTERN_GET_LIST}
            searchParams={{
              Category: initialCriteria.category,
              Item: initialCriteria.item.trim(),
            }}
            pageSize={10}
          />
        </Container>
      </WrapContent>
    </>
  );
}
