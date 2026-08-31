'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Modal from '@packages/components/bootstrap5/Modal';
import Grid from '@packages/components/bootstrap5/Grid';
import Container from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { API_MAP } from '@/lib/apiRoutes';
import { TableSearchParams } from '@/components/common/tableUtils';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppApi } from '@/hooks/useAppApi';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface MaterialPlantRow {
  id: string | number;
  materialNumber?: string;
  productName?: string;
  year?: number;
  plantName?: string;
  consultantApprovalCount?: number;
  buyerApprovalCount?: number;
  hasThirdPartyCertification?: boolean;
  carbonFactor?: number;
  similarCarbonFactor?: number | null;
}

interface MaterialPlantSearch extends TableSearchParams {
  MaterialNumber: string;
  ProductName: string;
  Year: string;
  HasThirdPartyCertification: string;
}

interface PendingSourceOpinion {
  id: string;
  sourceId: string;
  materialNumber: string;
  productName: string;
  year: number;
  content: string;
  createDate: string | null;
  createUserName: string;
}

interface PendingSourceOpinionPageModel {
  count: number;
  opinions: PendingSourceOpinion[];
}

const INITIAL_SEARCH: MaterialPlantSearch = {
  MaterialNumber: '',
  ProductName: '',
  Year: '',
  HasThirdPartyCertification: '',
};

function isMaterialPlantSearchCriteria(value: unknown): value is MaterialPlantSearch {
  if (typeof value !== 'object' || value === null) return false;
  const criteria = value as Record<string, unknown>;
  return typeof criteria.MaterialNumber === 'string'
    && typeof criteria.ProductName === 'string'
    && typeof criteria.Year === 'string'
    && typeof criteria.HasThirdPartyCertification === 'string';
}

interface DataQualityMaterialListContentProps {
  initialCriteria: MaterialPlantSearch;
  saveSearchCriteria: (criteria: MaterialPlantSearch) => void;
  clearSearchCriteria: () => void;
}

export default function DataQualityMaterialListPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(INITIAL_SEARCH, isMaterialPlantSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <DataQualityMaterialListContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function DataQualityMaterialListContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: DataQualityMaterialListContentProps) {
  const router = useRouter();
  const { Row, Col } = Grid;
  const { languageCode, translate } = useLanguage();
  const { formPost } = useAppApi();
  const { hasPermission, isReady } = usePagePermissions();
  const tableRef = React.useRef<CommonTableHandle<MaterialPlantRow>>(null);
  const [searchValues, setSearchValues] = React.useState(initialCriteria);
  const [pendingOpinions, setPendingOpinions] = React.useState<PendingSourceOpinionPageModel | null>(null);
  const [pendingOpinionsLoading, setPendingOpinionsLoading] = React.useState(false);
  const [pendingOpinionsError, setPendingOpinionsError] = React.useState<string | null>(null);
  const [showPendingOpinions, setShowPendingOpinions] = React.useState(false);

  const canAccess = hasPermission('CarbonFactorMaintenancePlant:GetList');
  const canShowBasicData = hasPermission('MaterialMaintenance:GetModel');
  const canShowAccreditationVerification = hasPermission('BuyerAccreditationLevel:Index');

  React.useEffect(() => {
    if (!isReady || !canAccess) return;

    let cancelled = false;
    const loadPendingOpinions = async () => {
      setPendingOpinionsLoading(true);
      setPendingOpinionsError(null);

      try {
        const result = await formPost<PendingSourceOpinionPageModel>(
          API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_PENDING_OPINIONS,
          {},
        );

        if (cancelled) return;

        if (result.success && result.data) {
          setPendingOpinions(result.data);
        } else {
          setPendingOpinions(null);
          setPendingOpinionsError(result.message || translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsLoadFailed));
        }
      } catch {
        if (!cancelled) {
          setPendingOpinions(null);
          setPendingOpinionsError(translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsLoadFailed));
        }
      } finally {
        if (!cancelled) setPendingOpinionsLoading(false);
      }
    };

    void loadPendingOpinions();
    return () => {
      cancelled = true;
    };
  }, [canAccess, formPost, isReady, translate]);

  const updateSearchValue = (field: keyof MaterialPlantSearch, value: string) => {
    setSearchValues((current) => ({ ...current, [field]: value }));
  };

  const handleSearch = () => {
    saveSearchCriteria(searchValues);
    tableRef.current?.search(searchValues);
  };

  const handleClear = () => {
    setSearchValues(INITIAL_SEARCH);
    clearSearchCriteria();
    tableRef.current?.search(INITIAL_SEARCH);
  };

  const yesNo = (value: boolean | undefined) => value
    ? translate(LANGUAGE_KEYS.rawMaterialMaintenance.yes)
    : translate(LANGUAGE_KEYS.rawMaterialMaintenance.no);

  const columns: Column<MaterialPlantRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '64px' },
      render: (_, index) => index + 1,
    },
    { header: translate(LANGUAGE_KEYS.common.materialNumber), key: 'materialNumber' },
    { header: translate(LANGUAGE_KEYS.common.productName), key: 'productName' },
    { header: translate(LANGUAGE_KEYS.dataQualityManagement.year), key: 'year', className: 'text-center' },
    { header: translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantName), key: 'plantName' },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount),
      className: 'text-center',
      render: (row) => row.consultantApprovalCount ?? 0,
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.buyerApprovalCount),
      className: 'text-center',
      render: (row) => row.buyerApprovalCount ?? 0,
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification),
      className: 'text-center',
      render: (row) => yesNo(row.hasThirdPartyCertification),
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.totalScore),
      className: 'text-center',
      render: () => '-',
    },
    {
      header: translate(LANGUAGE_KEYS.dataQualityManagement.carbonData),
      className: 'text-center',
      render: (row) => `${formatCarbonFactor(row.carbonFactor)}/${formatCarbonFactor(row.similarCarbonFactor)}`,
    },
    {
      header: translate(LANGUAGE_KEYS.dataQualityManagement.deviation),
      className: 'text-center',
      render: (row) => formatDeviation(row.carbonFactor, row.similarCarbonFactor),
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { minWidth: '180px' },
      render: (row) => (
        <div className="d-flex flex-column align-items-center gap-1">
          {canShowBasicData && (
            <Btn
              type="button"
              color="secondary"
              size="sm"
              outline
              onClick={() => router.push(`/CarbonFactorMaintenancePlant/BasicData/?id=${encodeURIComponent(String(row.id))}`)}
            >
              {translate(LANGUAGE_KEYS.dataQualityManagement.basicData)}
            </Btn>
          )}
          {canShowAccreditationVerification && (
            <Btn
              type="button"
              color="secondary"
              size="sm"
              outline
              onClick={() => router.push(`/CarbonFactorMaintenancePlant/AccreditationVerification/?id=${encodeURIComponent(String(row.id))}`)}
            >
              {translate(LANGUAGE_KEYS.dataQualityManagement.accreditationVerification)}
            </Btn>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.dataQualityManagement.materialList} />

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}>
              <Input
                label={translate(LANGUAGE_KEYS.common.materialNumber)}
                placeholder={translate(LANGUAGE_KEYS.common.materialNumber)}
                value={searchValues.MaterialNumber}
                onChange={(event) => updateSearchValue('MaterialNumber', event.target.value)}
              />
            </Col>
            <Col md={3}>
              <Input
                label={translate(LANGUAGE_KEYS.common.productName)}
                placeholder={translate(LANGUAGE_KEYS.common.productName)}
                value={searchValues.ProductName}
                onChange={(event) => updateSearchValue('ProductName', event.target.value)}
              />
            </Col>
            <Col md={2}>
              <Input
                type="number"
                label={translate(LANGUAGE_KEYS.dataQualityManagement.year)}
                placeholder={translate(LANGUAGE_KEYS.dataQualityManagement.year)}
                value={searchValues.Year}
                onChange={(event) => updateSearchValue('Year', event.target.value)}
              />
            </Col>
            <Col md={2}>
              <Select
                label={translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification)}
                options={[
                  { value: '', label: translate(LANGUAGE_KEYS.common.all) },
                  { value: 'true', label: translate(LANGUAGE_KEYS.rawMaterialMaintenance.yes) },
                  { value: 'false', label: translate(LANGUAGE_KEYS.rawMaterialMaintenance.no) },
                ]}
                value={searchValues.HasThirdPartyCertification}
                onChange={(event) => updateSearchValue('HasThirdPartyCertification', event.target.value)}
              />
            </Col>
            <Col md={2} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Col>
          </Row>
        </SearchBlock>

        {isReady && !canAccess ? null : (
          <Container fluid>
            <Row className="g-3 mb-3 align-items-stretch">
              <Col md={6}>
                <button
                  type="button"
                  className="card w-100 h-100 d-flex flex-row align-items-center justify-content-between gap-3 text-start border-0 shadow-sm py-2 px-3"
                  style={{ backgroundColor: '#fff9a8', minHeight: '56px' }}
                  onClick={() => setShowPendingOpinions(true)}
                  disabled={pendingOpinionsLoading || Boolean(pendingOpinionsError)}
                >
                  <span className="fw-semibold text-nowrap">{translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsTitle)}</span>
                  <span className="fs-5 flex-shrink-0">
                    {pendingOpinionsLoading ? (
                      <span className="spinner-border spinner-border-sm text-secondary" role="status" aria-label={translate(LANGUAGE_KEYS.common.loading)} />
                    ) : (
                      `${pendingOpinions?.count ?? 0}${translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsCountUnit)}`
                    )}
                  </span>
                </button>
              </Col>
              <Col md={6}>
                <div className="card w-100 h-100 d-flex flex-row align-items-center justify-content-between gap-3 border-0 shadow-sm py-2 px-3" style={{ backgroundColor: '#b7eee4', minHeight: '56px' }}>
                  <span className="fw-semibold text-nowrap">{translate(LANGUAGE_KEYS.dataQualityManagement.buyerLevelMismatch)}</span>
                  <span className="fs-5 flex-shrink-0">—{translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsCountUnit)}</span>
                </div>
              </Col>
            </Row>

            {pendingOpinionsError && (
              <div className="small text-danger mb-3" role="alert">{pendingOpinionsError}</div>
            )}
          </Container>
        )}

        <Container fluid>
          {isReady && !canAccess ? (
            <div className="alert alert-warning" role="alert">{translate(LANGUAGE_KEYS.apiError.forbidden)}</div>
          ) : (
            <div className="table-responsive">
              <CommonTable
                ref={tableRef}
                columns={columns}
                apiUrl={API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_LIST}
                searchParams={initialCriteria}
                pageSize={10}
              />
            </div>
          )}
        </Container>
      </WrapContent>

      <PendingOpinionsModal
        show={showPendingOpinions}
        model={pendingOpinions}
        languageCode={languageCode}
        onClose={() => setShowPendingOpinions(false)}
      />
    </>
  );
}

interface PendingOpinionsModalProps {
  show: boolean;
  model: PendingSourceOpinionPageModel | null;
  languageCode: string;
  onClose(): void;
}

function PendingOpinionsModal({ show, model, languageCode, onClose }: PendingOpinionsModalProps) {
  const { translate } = useLanguage();

  return (
    <Modal show={show} size="lg" onClose={onClose}>
      <Modal.Title onClose={onClose}>
        {translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsModalTitle)}
      </Modal.Title>
      <Modal.Body>
        {!model || model.opinions.length === 0 ? (
          <div className="text-center text-muted py-4">
            {translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionsEmpty)}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {model.opinions.map((opinion) => (
              <div key={opinion.id} className="border rounded p-3">
                <div className="fw-semibold">
                  {opinion.materialNumber || '-'} · {opinion.productName || '-'}
                </div>
                <div className="small text-muted mt-1">
                  {translate(LANGUAGE_KEYS.dataQualityManagement.year)}：{opinion.year}
                  <span className="mx-2">|</span>
                  {translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionCreatedBy)}：{opinion.createUserName || '-'}
                  <span className="mx-2">|</span>
                  {translate(LANGUAGE_KEYS.dataQualityManagement.pendingOpinionCreatedAt)}：{formatDate(opinion.createDate, languageCode)}
                </div>
                <div className="mt-2" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {opinion.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

function formatDate(value: string | null, languageCode: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(languageCode);
}

function formatCarbonFactor(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '-';

  return Number(value).toFixed(2).replace(/\.00$|(?<=\.[0-9])0$/, '');
}

function formatDeviation(carbonFactor: number | null | undefined, similarCarbonFactor: number | null | undefined): string {
  const currentValue = Number(carbonFactor);
  const similarValue = Number(similarCarbonFactor);
  if (!Number.isFinite(currentValue) || !Number.isFinite(similarValue) || similarValue === 0) return '-';

  const deviation = Math.abs(((currentValue - similarValue) / similarValue) * 100);
  return `${deviation.toFixed(2)}%`;
}
