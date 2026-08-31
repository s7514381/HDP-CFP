'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Grid from '@packages/components/bootstrap5/Grid';
import ListPageLayout from '@/components/layouts/ListPageLayout';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { TableSearchParams } from '@/components/common/tableUtils';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useAppApi } from '@/hooks/useAppApi';
import { useToast } from '@packages/contexts/ToastContext';
import { MaterialDemandRow } from '@/types/materialDemand';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';
import MaterialDemandNegotiationModal from './MaterialDemandNegotiationModal';

interface MaterialDemandSearchCriteria extends TableSearchParams {
  DemandType: string;
  IsUrgent: string;
  DemandStatus: string;
  Year: string;
}

const INITIAL_SEARCH: MaterialDemandSearchCriteria = { DemandType: '0', IsUrgent: '', DemandStatus: '', Year: '' };

function isMaterialDemandSearchCriteria(value: unknown): value is MaterialDemandSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;
  return typeof record.DemandType === 'string'
    && typeof record.IsUrgent === 'string'
    && typeof record.DemandStatus === 'string'
    && typeof record.Year === 'string';
}

interface MaterialDemandContentProps {
  initialCriteria: MaterialDemandSearchCriteria;
  saveSearchCriteria: MaterialDemandSaveSearchCriteria;
  clearSearchCriteria: () => void;
}

type MaterialDemandSaveSearchCriteria = ReturnType<
  typeof useSearchPersistence<MaterialDemandSearchCriteria>
>['save'];

function asBoolean(value: MaterialDemandRow['isUrgent']): boolean {
  return value === true || value === 1 || String(value).toLowerCase() === 'true';
}

function normalizeStatus(value: MaterialDemandRow['demandStatus']): string {
  return String(value ?? '');
}

export default function MaterialDemandPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(INITIAL_SEARCH, isMaterialDemandSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <MaterialDemandContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function MaterialDemandContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: MaterialDemandContentProps) {
  const router = useRouter();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();
  const { formPost } = useAppApi();
  const { success, danger } = useToast();
  const { hasPermission, isReady } = usePagePermissions('/MaterialDemand');
  const tableRef = React.useRef<CommonTableHandle<MaterialDemandRow>>(null);
  const [demandType, setDemandType] = useState(initialCriteria.DemandType);
  const [isUrgent, setIsUrgent] = useState(initialCriteria.IsUrgent);
  const [demandStatus, setDemandStatus] = useState(initialCriteria.DemandStatus);
  const [year, setYear] = useState(initialCriteria.Year);
  const [negotiationDemandId, setNegotiationDemandId] = useState<string | null>(null);
  const [accreditingId, setAccreditingId] = useState<string | null>(null);

  const canAccess = hasPermission('MaterialDemand:Index');

  React.useEffect(() => {
    if (isReady && !canAccess) router.replace('/');
  }, [canAccess, isReady, router]);

  const getSearchCriteria = (nextDemandType = demandType): MaterialDemandSearchCriteria => ({
    DemandType: nextDemandType,
    IsUrgent: isUrgent,
    DemandStatus: demandStatus,
    Year: year,
  });

  const accredit = async (id: string) => {
    if (accreditingId) return;
    setAccreditingId(id);
    try {
      const result = await formPost<boolean>(API_MAP.MATERIAL_DEMAND_ACCREDIT, { id });
      if (!result.success) {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.operationFailed)}</span> });
        return;
      }
      success({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.accreditSucceeded)}</span> });
      tableRef.current?.reload();
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.materialDemand.operationFailed)}</span> });
    } finally {
      setAccreditingId(null);
    }
  };

  const columns: Column<MaterialDemandRow>[] = [
    { header: translate(LANGUAGE_KEYS.common.rowNumber), className: 'text-center', style: { width: '64px' }, render: (_, index) => index + 1 },
    {
      header: translate(LANGUAGE_KEYS.materialDemand.urgency),
      className: 'text-center',
      render: (row) => asBoolean(row.isUrgent) ? translate(LANGUAGE_KEYS.materialDemand.urgent) : translate(LANGUAGE_KEYS.materialDemand.normal),
    },
    { header: translate(LANGUAGE_KEYS.materialDemand.demandPrice), className: 'text-end', render: (row) => row.demandPrice ?? '-' },
    { header: translate(LANGUAGE_KEYS.materialDemand.consultantResponsePrice), className: 'text-end', render: (row) => row.consultantResponsePrice ?? '-' },
    { header: translate(LANGUAGE_KEYS.materialDemand.demandStatus), className: 'text-center', render: (row) => translate(statusLanguageKey(normalizeStatus(row.demandStatus))) },
    { header: translate(LANGUAGE_KEYS.common.materialNumber), key: 'materialNumber' },
    { header: translate(LANGUAGE_KEYS.common.productName), key: 'productName' },
    { header: translate(LANGUAGE_KEYS.dataQualityManagement.year), key: 'year', className: 'text-center' },
    { header: translate(LANGUAGE_KEYS.common.supplier), key: 'supplierName' },
    { header: translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantName), key: 'plantName' },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { minWidth: '270px' },
      render: (row) => {
        const status = normalizeStatus(row.demandStatus);
        const id = String(row.id);
        const busy = accreditingId === id;
        return (
          <div className="d-flex flex-wrap justify-content-center gap-1">
            <Btn type="button" color="secondary" size="sm" outline onClick={() => viewData(row)}>{translate(LANGUAGE_KEYS.materialDemand.viewData)}</Btn>
            <Btn type="button" color="success" size="sm" outline disabled={status !== '0' || busy} onClick={() => setNegotiationDemandId(id)}>{translate(LANGUAGE_KEYS.materialDemand.replyNegotiation)}</Btn>
            <Btn type="button" color="primary" size="sm" outline disabled={status !== '2' || busy} loading={busy} onClick={() => void accredit(id)}>{translate(LANGUAGE_KEYS.materialDemand.accredit)}</Btn>
          </div>
        );
      },
    },
  ];

  const handleSearch = () => {
    const criteria = getSearchCriteria();
    saveSearchCriteria(criteria);
    tableRef.current?.search(criteria);
  };
  const handleClear = () => {
    setDemandType(INITIAL_SEARCH.DemandType);
    setIsUrgent('');
    setDemandStatus('');
    setYear('');
    clearSearchCriteria();
    tableRef.current?.search(INITIAL_SEARCH);
  };
  const selectDemandType = (nextDemandType: string) => {
    setDemandType(nextDemandType);
    const criteria = getSearchCriteria(nextDemandType);
    saveSearchCriteria(criteria);
    tableRef.current?.search(criteria);
  };

  const viewData = (row: MaterialDemandRow) => {
    const plantId = row.carbonFactorMaintenancePlantId;
    if (!plantId) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed)}</span> });
      return;
    }
    router.push(`/MaterialDemand/Plant/Edit/?id=${encodeURIComponent(plantId)}&readonly=true`);
  };

  if (isReady && !canAccess) return null;

  return (
    <>
      <ListPageLayout
        title={LANGUAGE_KEYS.materialDemand.title}
        tabs={(
          <div className="nav nav-tabs" role="tablist" aria-label={translate(LANGUAGE_KEYS.materialDemand.title)}>
            <div className="nav-item flex-fill"><button type="button" role="tab" aria-selected={demandType === '0'} className={`nav-link w-100 ${demandType === '0' ? 'active fw-semibold' : 'text-secondary'}`} onClick={() => selectDemandType('0')}>{translate(LANGUAGE_KEYS.materialDemand.accreditationDemand)}</button></div>
            <div className="nav-item flex-fill"><button type="button" role="tab" aria-selected={demandType === '1'} className={`nav-link w-100 ${demandType === '1' ? 'active fw-semibold' : 'text-secondary'}`} onClick={() => selectDemandType('1')}>{translate(LANGUAGE_KEYS.materialDemand.guidanceDemand)}</button></div>
          </div>
        )}
        searchContent={(
          <Row align="center" gutter={3}>
            <Col md={3}><Select label={translate(LANGUAGE_KEYS.materialDemand.urgency)} value={isUrgent} onChange={(event) => setIsUrgent(event.target.value)} options={[{ value: '', label: translate(LANGUAGE_KEYS.common.all) }, { value: 'false', label: translate(LANGUAGE_KEYS.materialDemand.normal) }, { value: 'true', label: translate(LANGUAGE_KEYS.materialDemand.urgent) }]} /></Col>
            <Col md={3}><Select label={translate(LANGUAGE_KEYS.materialDemand.demandStatus)} value={demandStatus} onChange={(event) => setDemandStatus(event.target.value)} options={[{ value: '', label: translate(LANGUAGE_KEYS.common.all) }, { value: '0', label: translate(LANGUAGE_KEYS.materialDemand.waiting) }, { value: '1', label: translate(LANGUAGE_KEYS.materialDemand.consultantReplied) }, { value: '2', label: translate(LANGUAGE_KEYS.materialDemand.sellerReplied) }, { value: '3', label: translate(LANGUAGE_KEYS.materialDemand.accredited) }]} /></Col>
            <Col md={3}><Input type="number" label={translate(LANGUAGE_KEYS.dataQualityManagement.year)} value={year} onChange={(event) => setYear(event.target.value)} /></Col>
            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end"><Btn color="success" outline icon="search" onClick={handleSearch}>{translate(LANGUAGE_KEYS.common.search)}</Btn><Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn></Col>
          </Row>
        )}
      >
        {isReady && !canAccess ? <div className="alert alert-warning" role="alert">{translate(LANGUAGE_KEYS.apiError.forbidden)}</div> : <div className="table-responsive"><CommonTable ref={tableRef} columns={columns} apiUrl={API_MAP.MATERIAL_DEMAND_GET_LIST} searchParams={initialCriteria} pageSize={10} /></div>}
      </ListPageLayout>
      {negotiationDemandId && <MaterialDemandNegotiationModal show demandId={negotiationDemandId} onClose={() => setNegotiationDemandId(null)} onSuccess={() => tableRef.current?.reload()} />}
    </>
  );
}

function statusLanguageKey(status: string): string {
  return ({ '0': LANGUAGE_KEYS.materialDemand.waiting, '1': LANGUAGE_KEYS.materialDemand.consultantReplied, '2': LANGUAGE_KEYS.materialDemand.sellerReplied, '3': LANGUAGE_KEYS.materialDemand.accredited } as Record<string, string>)[status] || LANGUAGE_KEYS.materialDemand.demandStatus;
}
