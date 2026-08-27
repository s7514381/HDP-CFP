'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FontAwesome from '@packages/components/FontAwsome';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { FileBtn, Input } from '@packages/components/bootstrap5/Input';
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
import {
  isPcrTemplateCategory,
  PcrTemplateCategory,
} from '@/types/pcrTemplate';
import { PcrPatternRow, PCR_PATTERN_CATEGORY_STORAGE_KEY } from '@/types/pcrPattern';
import { downloadFile } from '@packages/lib/downloadFlie';
import { PCR_TEMPLATE_CATEGORY_OPTIONS } from '@/lib/pcrTemplateCategories';

type PageLoadState = {
  id: string | null;
  status: 'loading' | 'ready' | 'error';
  message?: string;
};

interface PcrPatternImportResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

async function isValidXlsxBlob(blob: Blob): Promise<boolean> {
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return header.length === 4
    && header[0] === 0x50
    && header[1] === 0x4B
    && header[2] === 0x03
    && header[3] === 0x04;
}

function readProductSubcategoryName(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || !('name' in data)) return null;

  const name = (data as { name?: unknown }).name;
  if (typeof name !== 'string') return null;

  const normalizedName = name.trim();
  return normalizedName || null;
}

function formatTranslation(template: string, values: unknown[]): string {
  return values.reduce<string>(
    (result, value, index) => result.replaceAll(`{${index}}`, String(value)),
    template,
  );
}

function ProductSubcategoryPcrPatternPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productSubcategoryId = searchParams.get('id');
  const sourceManagerId = searchParams.get('sourceManagerId');
  const isSharedView = Boolean(sourceManagerId);
  const { formPost, get, post } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission } = usePagePermissions('/ProductSubcategory');
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const tableRef = React.useRef<CommonTableHandle<PcrPatternRow>>(null);
  const previousCategory = React.useRef<PcrTemplateCategory | null>(null);
  const storedCategory = useStoredValue<PcrTemplateCategory | null>(PCR_PATTERN_CATEGORY_STORAGE_KEY, null);
  const [categoryReady, setCategoryReady] = useState(false);
  const [searchItem, setSearchItem] = useState('');
  const [productSubcategoryName, setProductSubcategoryName] = useState<string | null>(null);
  const [productSubcategoryNameError, setProductSubcategoryNameError] = useState<string | null>(null);
  const [pageLoad, setPageLoad] = useState<PageLoadState>({ id: null, status: 'loading' });
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const category = !categoryReady
    ? null
    : isPcrTemplateCategory(storedCategory)
      ? storedCategory
      : PcrTemplateCategory.Material;
  const effectiveCategory = category ?? PcrTemplateCategory.Material;
  const pageReady = productSubcategoryId !== null
    && pageLoad.id === productSubcategoryId
    && pageLoad.status === 'ready'
    && category !== null;
  const pageError = productSubcategoryId !== null
    && pageLoad.id === productSubcategoryId
    && pageLoad.status === 'error'
    ? pageLoad.message
    : null;
  const initialSearchParams = React.useMemo(
    () => ({
      ProductSubcategoryId: productSubcategoryId,
      Category: effectiveCategory,
      Item: searchItem.trim(),
      ...(isSharedView ? { SourceManagerId: sourceManagerId } : {}),
    }),
    [effectiveCategory, isSharedView, productSubcategoryId, searchItem, sourceManagerId],
  );

  React.useEffect(() => {
    setCategoryReady(true);
  }, []);

  React.useEffect(() => {
    if (!productSubcategoryId) return;

    let cancelled = false;
    previousCategory.current = null;
    setPageLoad({ id: productSubcategoryId, status: 'loading' });
    setProductSubcategoryName(null);
    setProductSubcategoryNameError(null);

    const loadProductSubcategoryName = async () => {
      try {
        // Let the first Strict Mode effect cleanup before starting network work.
        await Promise.resolve();
        if (cancelled) return;

        const result = await formPost<{ name?: string }>(
          API_MAP.PRODUCT_SUBCATEGORY_GET_MODEL,
          { id: productSubcategoryId },
        );
        const name = result.success ? readProductSubcategoryName(result.data) : null;

        if (!name) {
          throw new Error(result.message || translate(
            LANGUAGE_KEYS.pcrPattern.productSubcategoryNameLoadFailed,
          ));
        }

        if (!cancelled) {
          setProductSubcategoryName(name);
        }
      } catch {
        if (!cancelled) {
          setProductSubcategoryNameError(translate(
            LANGUAGE_KEYS.pcrPattern.productSubcategoryNameLoadFailed,
          ));
        }
      }
    };

    const initializePatterns = async () => {
      try {
        await Promise.resolve();
        if (cancelled) return;

        if (isSharedView) {
          setPageLoad({ id: productSubcategoryId, status: 'ready' });
          return;
        }

        const ensureResult = await formPost(
          API_MAP.PRODUCT_SUBCATEGORY_ENSURE_PCR_PATTERN,
          { productSubcategoryId },
        );
        if (!ensureResult.success) {
          throw new Error(ensureResult.message || translate(
            LANGUAGE_KEYS.pcrPattern.initializationFailed,
          ));
        }

        if (!cancelled) {
          setPageLoad({ id: productSubcategoryId, status: 'ready' });
        }
      } catch {
        if (!cancelled) {
          setPageLoad({
            id: productSubcategoryId,
            status: 'error',
            message: translate(
              LANGUAGE_KEYS.pcrPattern.initializationFailed,
            ),
          });
        }
      }
    };

    void loadProductSubcategoryName();
    void initializePatterns();
    return () => {
      cancelled = true;
    };
  }, [formPost, isSharedView, productSubcategoryId, translate]);

  React.useEffect(() => {
    if (!pageReady || category === null) return;
    if (previousCategory.current === null) {
      previousCategory.current = category;
      return;
    }
    if (previousCategory.current === category) return;

    previousCategory.current = category;
    tableRef.current?.search(initialSearchParams);
  }, [category, initialSearchParams, pageReady]);

  const handleSearch = () => {
    tableRef.current?.search(initialSearchParams);
  };

  const selectCategory = (value: PcrTemplateCategory) => {
    appStorage.set(PCR_PATTERN_CATEGORY_STORAGE_KEY, value);
  };

  const handleClear = () => {
    appStorage.set(PCR_PATTERN_CATEGORY_STORAGE_KEY, PcrTemplateCategory.Material);
    setSearchItem('');
    if (category === PcrTemplateCategory.Material) {
      tableRef.current?.search({
        ProductSubcategoryId: productSubcategoryId,
        Category: PcrTemplateCategory.Material,
        Item: '',
        ...(isSharedView ? { SourceManagerId: sourceManagerId } : {}),
      });
    }
  };

  const handleAdd = () => {
    if (isSharedView) return;
    router.push(`/ProductSubcategory/PcrPattern/Create/?productSubcategoryId=${productSubcategoryId}&category=${effectiveCategory}`);
  };

  const handleDelete = async (id: string | number) => {
    if (!productSubcategoryId || isSharedView) return;
    if (!await confirm(translate(LANGUAGE_KEYS.pcrPattern.deleteConfirm))) return;

    const result = await formPost(API_MAP.PRODUCT_SUBCATEGORY_DELETE_PCR_PATTERN, {
      id,
      productSubcategoryId,
    });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.deleted)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    }
  };

  const handleSync = async () => {
    if (!productSubcategoryId || !sourceManagerId) return;
    if (!await confirm(translate(LANGUAGE_KEYS.pcrPattern.syncTemplateConfirm))) return;

    const result = await formPost(API_MAP.PRODUCT_SUBCATEGORY_SYNC_PCR_PATTERN, {
      productSubcategoryId,
      sourceManagerId,
    });
    if (!result.success) {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.pcrPattern.syncTemplateFailed)}</span> });
      return;
    }

    success({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.syncTemplateSucceeded)}</span> });
    router.replace(`/ProductSubcategory/PcrPattern/?id=${encodeURIComponent(productSubcategoryId)}`);
  };

  const handleDownloadTemplate = async () => {
    const response = await get<Blob>(API_MAP.PRODUCT_SUBCATEGORY_PCR_PATTERN_IMPORT_TEMPLATE, {
      responseType: 'blob',
    });

    if (response.success && response.data instanceof Blob && await isValidXlsxBlob(response.data)) {
      downloadFile({
        blob: response.data,
        defaultFileName: 'PcrPatternImportTemplate.xlsx',
      });
      return;
    }

    danger({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.downloadTemplateFailed)}</span> });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !productSubcategoryId) return;

    setImporting(true);
    setImportErrors([]);

    try {
      const formData = new FormData();
      formData.append('productSubcategoryId', productSubcategoryId);
      formData.append('file', file);

      const response = await post<PcrPatternImportResult, FormData>(
        API_MAP.PRODUCT_SUBCATEGORY_PCR_PATTERN_IMPORT,
        { body: formData },
      );
      const summary = response.data;

      if (response.success && summary) {
        if (summary.failureCount > 0 || summary.errors.length > 0) {
          setImportErrors(summary.errors);
          danger({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.importFailedUnchanged)}</span> });
        } else {
          success({ message: <span>{formatTranslation(translate(LANGUAGE_KEYS.pcrPattern.importSucceeded), [summary.successCount])}</span> });
          tableRef.current?.reload();
        }
        return;
      }

      danger({ message: <span>{response.message || translate(LANGUAGE_KEYS.pcrPattern.importFailed)}</span> });
    } catch (error) {
      console.error('PCR pattern import failed', error);
      danger({ message: <span>{translate(LANGUAGE_KEYS.pcrPattern.importFailed)}</span> });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  if (!productSubcategoryId) {
    return (
      <WrapContent className="p-3">
        <div className="alert alert-danger">
          {translate(
            LANGUAGE_KEYS.pcrPattern.missingProductSubcategoryId,
          )}
        </div>
      </WrapContent>
    );
  }

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
          {!isSharedView && hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer"
              onClick={() => router.push(`/ProductSubcategory/PcrPattern/Edit/?id=${row.id}&productSubcategoryId=${productSubcategoryId}`)}
            />
          )}
          {!isSharedView && hasPermission('Delete') && (
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
      <ActionBar
        title={`${translate(LANGUAGE_KEYS.pcrPattern.template)}${pageLoad.id === productSubcategoryId && productSubcategoryName ? ` - ${productSubcategoryName}` : ''}`}
      >
        <div className="ms-auto d-flex gap-2">
          {isSharedView && hasPermission('Create') && (
            <Btn color="success" outline onClick={() => void handleSync()} icon="check">
              {translate(LANGUAGE_KEYS.pcrPattern.syncTemplate)}
            </Btn>
          )}
          <Btn color="secondary" outline onClick={() => router.push('/ProductSubcategory')} icon="cancel">
            {translate(LANGUAGE_KEYS.common.backToList)}
          </Btn>
        </div>
      </ActionBar>
      <WrapContent className="p-3">
        {productSubcategoryNameError && (
          <div className="alert alert-warning">{productSubcategoryNameError}</div>
        )}
        <div className="border-bottom mb-3">
          <div className="nav nav-tabs" role="tablist" aria-label={translate(LANGUAGE_KEYS.pcrTemplate.title)}>
            {PCR_TEMPLATE_CATEGORY_OPTIONS.map(option => {
              const isActive = category !== null && category === option.value;
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
            {!isSharedView && hasPermission('Create') && (
              <>
                <Btn color="secondary" outline onClick={() => void handleDownloadTemplate()}>
                  {translate(LANGUAGE_KEYS.pcrPattern.importTemplate)}
                </Btn>
                <FileBtn
                  label={importing
                    ? translate(LANGUAGE_KEYS.common.importing)
                    : translate(LANGUAGE_KEYS.pcrPattern.import)}
                  accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleImport}
                  btnProps={{ color: 'primary', disabled: importing }}
                />
                <Btn color="success" icon="add" onClick={handleAdd}>
                  {translate(LANGUAGE_KEYS.common.add)}
                </Btn>
              </>
            )}
          </div>
        </Container>
        {importErrors.length > 0 && (
          <Container fluid className="mb-3">
            <div className="alert alert-danger mb-0" role="alert">
              <div className="fw-semibold mb-2">{translate(LANGUAGE_KEYS.pcrPattern.importErrorsTitle)}</div>
              <ul className="mb-0 ps-3">
                {importErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          </Container>
        )}
        <Container fluid>
          {pageError ? (
            <div className="alert alert-danger">{pageError}</div>
          ) : !pageReady ? (
            <div className="text-center py-4">
              <span className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={isSharedView
                ? API_MAP.PRODUCT_SUBCATEGORY_GET_SHARED_PCR_PATTERN
                : API_MAP.PRODUCT_SUBCATEGORY_GET_PCR_PATTERN}
              searchParams={initialSearchParams}
              pageSize={10}
            />
          )}
        </Container>
      </WrapContent>
    </>
  );
}

export default function ProductSubcategoryPcrPatternPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center"><span className="spinner-border text-primary" role="status" /></div>}>
      <ProductSubcategoryPcrPatternPageContent />
    </Suspense>
  );
}
