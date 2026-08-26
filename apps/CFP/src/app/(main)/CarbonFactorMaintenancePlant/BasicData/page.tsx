'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FontAwesome from '@packages/components/FontAwsome';
import Modal from '@packages/components/bootstrap5/Modal';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import {
  CarbonFactorMaintenancePlantSummary,
  CarbonFactorMaintenancePcrEvidenceCategory,
  SecondaryDataCompareDraftRow,
  SecondaryDataCompareOption,
  SecondaryDataCompareRow,
} from '@/types/secondaryDataCompare';

interface SecondaryDataCompareListResponse {
  data: SecondaryDataCompareRow[];
  recordsFiltered: number;
}

interface DraftCompareValue {
  secondaryDataSettingId: string;
  name: string;
  carbonFactor: number;
  unit: string;
  departmentName?: string | null;
  announcementYear?: number | null;
  percentage: number;
}

export default function BasicDataPage() {
  return (
    <Suspense fallback={<BasicDataLoading />}>
      <BasicDataContent />
    </Suspense>
  );
}

function BasicDataLoading() {
  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.dataQualityManagement.basicData} />
      <WrapContent className="p-3">
        <div className="d-flex justify-content-center py-5">
          <span className="spinner-border text-primary" role="status" />
        </div>
      </WrapContent>
    </>
  );
}

function createClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toDraftRow(row: SecondaryDataCompareRow): SecondaryDataCompareDraftRow {
  return { ...row, clientId: row.id };
}

function getRowSignature(rows: SecondaryDataCompareDraftRow[]): string {
  return JSON.stringify(rows.map((row) => ({
    id: row.id,
    secondaryDataSettingId: row.secondaryDataSettingId,
    percentage: row.percentage,
  })));
}

function formatResult(value: number | null): string {
  return value == null || !Number.isFinite(value) ? '-' : value.toFixed(2);
}

const PCR_CATEGORY_LANGUAGE_KEYS: Record<number, { key: string; fallback: string }> = {
  0: { key: LANGUAGE_KEYS.pcrTemplate.material, fallback: '原料' },
  1: { key: LANGUAGE_KEYS.pcrTemplate.process, fallback: '製程' },
  2: { key: LANGUAGE_KEYS.pcrTemplate.transport, fallback: '運輸' },
  3: { key: LANGUAGE_KEYS.pcrTemplate.waste, fallback: '廢棄' },
};

function BasicDataContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get('id') || '';
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('MaterialMaintenance:GetModel');
  const [plant, setPlant] = useState<CarbonFactorMaintenancePlantSummary | null>(null);
  const [savedRows, setSavedRows] = useState<SecondaryDataCompareDraftRow[]>([]);
  const [draftRows, setDraftRows] = useState<SecondaryDataCompareDraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [editingRow, setEditingRow] = useState<SecondaryDataCompareDraftRow | null>(null);

  const dirty = useMemo(
    () => getRowSignature(savedRows) !== getRowSignature(draftRows),
    [draftRows, savedRows],
  );

  const calculation = useMemo(() => {
    if (draftRows.length === 0) {
      return { similarCarbonFactor: null, deviation: null };
    }

    const totalPercentage = draftRows.reduce((sum, row) => sum + Number(row.percentage), 0);
    if (!Number.isFinite(totalPercentage) || totalPercentage <= 0) {
      return { similarCarbonFactor: null, deviation: null };
    }

    const weightedTotal = draftRows.reduce(
      (sum, row) => sum + Number(row.carbonFactor) * Number(row.percentage),
      0,
    );
    const similarCarbonFactor = weightedTotal / totalPercentage;
    if (!Number.isFinite(similarCarbonFactor) || similarCarbonFactor === 0 || !plant) {
      return { similarCarbonFactor, deviation: null };
    }

    return {
      similarCarbonFactor,
      deviation: Math.abs(
        ((Number(plant.carbonFactor) - similarCarbonFactor) / similarCarbonFactor) * 100,
      ),
    };
  }, [draftRows, plant]);

  const missingEvidence = useMemo(
    () => (plant?.pcrEvidenceCategories || []).flatMap((category: CarbonFactorMaintenancePcrEvidenceCategory) => (
      category.items
        .filter((item) => !item.attachment)
        .map((item) => ({ category: category.category, item: item.item }))
    )),
    [plant],
  );

  const loadRows = useCallback(async (): Promise<SecondaryDataCompareRow[]> => {
    const rows: SecondaryDataCompareRow[] = [];
    let start = 0;
    const length = 100;

    while (true) {
      const result = await formPost<SecondaryDataCompareListResponse>(
        API_MAP.SECONDARY_DATA_COMPARE_GET_LIST,
        {
          order: JSON.stringify({ column: 0, dir: 'asc' }),
          start,
          length,
          draw: 0,
          CarbonFactorMaintenancePlantId: plantId,
        },
      );

      if (!result.success || !result.data) {
        throw new Error(result.message || translate(LANGUAGE_KEYS.secondaryDataCompare.loadFailed));
      }

      rows.push(...result.data.data);
      start += result.data.data.length;
      if (result.data.data.length === 0 || start >= result.data.recordsFiltered) break;
    }

    return rows;
  }, [formPost, plantId, translate]);

  const loadPage = useCallback(async () => {
    if (!plantId || !canAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [plantResult, rows] = await Promise.all([
        formPost<CarbonFactorMaintenancePlantSummary>(
          API_MAP.CARBON_FACTOR_MAINTENANCE_PLANT_GET_EDIT_MODEL,
          { id: plantId },
        ),
        loadRows(),
      ]);

      if (!plantResult.success || !plantResult.data) {
        throw new Error(plantResult.message || translate(LANGUAGE_KEYS.secondaryDataCompare.loadFailed));
      }

      const draft = rows.map(toDraftRow);
      setPlant(plantResult.data);
      setSavedRows(draft);
      setDraftRows(draft);
    } catch (loadError) {
      setPlant(null);
      setError(loadError instanceof Error ? loadError.message : translate(LANGUAGE_KEYS.secondaryDataCompare.loadFailed));
    } finally {
      setLoading(false);
    }
  }, [canAccess, formPost, loadRows, plantId, translate]);

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/CarbonFactorMaintenancePlant/');
  }, [canAccess, isReady, router]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await loadPage();
    };
    void load();
    return () => { cancelled = true; };
  }, [loadPage]);

  const applyDraftValue = useCallback((value: DraftCompareValue, row: SecondaryDataCompareDraftRow | null) => {
    const duplicate = draftRows.some((draft) => (
      draft.secondaryDataSettingId === value.secondaryDataSettingId
      && draft.clientId !== row?.clientId
    ));
    if (duplicate) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataCompare.duplicate)}</span> });
      return;
    }

    if (row) {
      setDraftRows((currentRows) => currentRows.map((current) => current.clientId === row.clientId
        ? { ...current, ...value }
        : current));
    } else {
      setDraftRows((currentRows) => [...currentRows, {
        ...value,
        id: null,
        clientId: createClientId(),
        carbonFactorMaintenancePlantId: plantId,
      }]);
    }
    setShowCompareModal(false);
    setEditingRow(null);
  }, [danger, draftRows, plantId, translate]);

  const handleDelete = useCallback(async (row: SecondaryDataCompareDraftRow) => {
    if (!await confirm(translate(LANGUAGE_KEYS.secondaryDataCompare.deleteConfirm))) return;

    setDraftRows((currentRows) => currentRows.filter((current) => current.clientId !== row.clientId));
  }, [confirm, translate]);

  const handleSave = useCallback(async () => {
    if (!dirty || saving) return;

    setSaving(true);
    try {
      const result = await formPost(API_MAP.SECONDARY_DATA_COMPARE_SAVE_BATCH, {
        carbonFactorMaintenancePlantId: plantId,
        items: draftRows.map((row) => ({
          id: row.id || undefined,
          secondaryDataSettingId: row.secondaryDataSettingId,
          percentage: row.percentage,
        })),
      });

      if (result.success) {
        success({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataCompare.batchSaved)}</span> });
        router.push('/CarbonFactorMaintenancePlant/');
      } else {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.secondaryDataCompare.batchSaveFailed)}</span> });
      }
    } catch (saveError) {
      danger({ message: <span>{saveError instanceof Error ? saveError.message : translate(LANGUAGE_KEYS.secondaryDataCompare.batchSaveFailed)}</span> });
    } finally {
      setSaving(false);
    }
  }, [dirty, draftRows, danger, formPost, plantId, router, saving, success, translate]);

  const columns: Column<SecondaryDataCompareDraftRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.name), key: 'name' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.carbonFactor), render: (row) => Number(row.carbonFactor).toFixed(2), className: 'text-center' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.unit), key: 'unit' },
    { header: translate(LANGUAGE_KEYS.secondaryDataCompare.percentage), render: (row) => `${row.percentage}%`, className: 'text-center' },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '150px' },
      render: (row) => (
        <div className="d-flex justify-content-center gap-3">
          <FontAwesome
            icon="fa-regular fa-pen-to-square"
            className="text-warning cursor-pointer align-self-center"
            onClick={() => {
              setEditingRow(row);
              setShowCompareModal(true);
            }}
          />
          <FontAwesome
            icon="fa-regular fa-trash-can"
            className="text-danger cursor-pointer align-self-center"
            onClick={() => void handleDelete(row)}
          />
        </div>
      ),
    },
  ];

  if (isReady && !canAccess) return null;

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.dataQualityManagement.basicData}>
        <div className="ms-auto d-flex gap-2">
          <Btn type="button" color="primary" icon="save" onClick={() => void handleSave()} disabled={!dirty || saving} loading={saving}>
            {translate(LANGUAGE_KEYS.common.save)}
          </Btn>
          <Btn type="button" color="secondary" outline onClick={() => router.back()} disabled={saving}>
            {translate(LANGUAGE_KEYS.common.backToList)}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
          {loading ? (
            <div className="d-flex justify-content-center py-5"><span className="spinner-border text-primary" role="status" /></div>
          ) : error || !plant ? (
            <Card className="border-0 shadow-sm"><Card.Body className="text-center text-danger py-5">{error || translate(LANGUAGE_KEYS.secondaryDataCompare.loadFailed)}</Card.Body></Card>
          ) : (
            <>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Grid.Row className="g-3">
                    <Grid.Col md={3}><div className="small text-muted">{translate(LANGUAGE_KEYS.common.materialNumber)}</div><div className="fw-semibold">{plant.materialNumber || '-'}</div></Grid.Col>
                    <Grid.Col md={3}><div className="small text-muted">{translate(LANGUAGE_KEYS.common.productName)}</div><div className="fw-semibold">{plant.productName || '-'}</div></Grid.Col>
                    <Grid.Col md={2}><div className="small text-muted">{translate(LANGUAGE_KEYS.dataQualityManagement.year)}</div><div className="fw-semibold">{plant.year || '-'}</div></Grid.Col>
                    <Grid.Col md={2}><div className="small text-muted">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantName)}</div><div className="fw-semibold">{plant.plantName || '-'}</div></Grid.Col>
                    <Grid.Col md={2}><div className="small text-muted">{translate(LANGUAGE_KEYS.dataQualityManagement.carbonData)}</div><div className="fw-semibold">{formatResult(plant.carbonFactor)}</div></Grid.Col>
                  </Grid.Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header>
                  <Grid.Row className="align-items-center g-3">
                    <Grid.Col md={6}><span>{translate(LANGUAGE_KEYS.secondaryDataCompare.title)}</span></Grid.Col>
                    <Grid.Col md={3} className="text-center">
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.secondaryDataCompare.similarCarbonFactor)}</div>
                      <div className="fs-4 fw-semibold">{formatResult(calculation.similarCarbonFactor)}</div>
                    </Grid.Col>
                    <Grid.Col md={3} className="text-center">
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.secondaryDataCompare.deviation)}</div>
                      <div className="fs-4 fw-semibold">{calculation.deviation == null ? '-' : `${formatResult(calculation.deviation)}%`}</div>
                    </Grid.Col>
                  </Grid.Row>
                </Card.Header>
                <Card.Body>
                  {dirty && <div className="alert alert-warning py-2">{translate(LANGUAGE_KEYS.secondaryDataCompare.unsavedChanges)}</div>}
                  <div className="table-responsive">
                    <CommonTable
                      columns={columns}
                      data={draftRows}
                      totalRecords={draftRows.length}
                      currentPage={1}
                      pageSize={Math.max(draftRows.length, 1)}
                      rowKey={(row) => row.clientId}
                    />
                  </div>
                  <div className="d-flex justify-content-end mt-3">
                    <Btn type="button" color="success" icon="add" onClick={() => { setEditingRow(null); setShowCompareModal(true); }}>
                      {translate(LANGUAGE_KEYS.secondaryDataCompare.add)}
                    </Btn>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm mb-4">
                <Card.Header>{translate(LANGUAGE_KEYS.dataQualityManagement.documentCompliance)}</Card.Header>
                <Card.Body>
                  <div className="fw-semibold mb-2">
                    {translate(LANGUAGE_KEYS.dataQualityManagement.missingEvidence)}：{missingEvidence.length} {translate(LANGUAGE_KEYS.dataQualityManagement.countUnit)}
                  </div>
                  {missingEvidence.length === 0 ? (
                    <div className="text-muted border rounded p-3">
                      {translate(LANGUAGE_KEYS.dataQualityManagement.noMissingEvidence)}
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {missingEvidence.map((missing, index) => {
                        const categoryLabel = PCR_CATEGORY_LANGUAGE_KEYS[missing.category];
                        const categoryName = categoryLabel
                          ? translate(categoryLabel.key) || categoryLabel.fallback
                          : String(missing.category);
                        return (
                          <div className="list-group-item px-0" key={`${missing.category}-${missing.item}-${index}`}>
                            {categoryName}／{missing.item}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Container>
      </WrapContent>

      <SecondaryDataCompareModal
        key={`${showCompareModal ? 'open' : 'closed'}-${editingRow?.clientId || 'new'}`}
        show={showCompareModal}
        plantId={plantId}
        row={editingRow}
        onClose={() => { setShowCompareModal(false); setEditingRow(null); }}
        onApply={applyDraftValue}
      />
    </>
  );
}

interface SecondaryDataCompareModalProps {
  show: boolean;
  plantId: string;
  row: SecondaryDataCompareDraftRow | null;
  onClose: () => void;
  onApply: (value: DraftCompareValue, row: SecondaryDataCompareDraftRow | null) => void;
}

function SecondaryDataCompareModal({ show, plantId, row, onClose, onApply }: SecondaryDataCompareModalProps) {
  const { translate } = useLanguage();
  const { danger } = useToast();
  const tableRef = React.useRef<CommonTableHandle<SecondaryDataCompareOption>>(null);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [selected, setSelected] = useState<SecondaryDataCompareOption | null>(() => row ? {
    id: row.secondaryDataSettingId,
    name: row.name,
    carbonFactor: row.carbonFactor,
    unit: row.unit,
    departmentName: row.departmentName,
    announcementYear: row.announcementYear,
  } : null);
  const [percentage, setPercentage] = useState(() => row ? String(row.percentage) : '');

  const search = () => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataCompare.keywordTooShort)}</span> });
      return;
    }
    setSelected(null);
    setSubmittedKeyword(trimmed);
    tableRef.current?.search({ CarbonFactorMaintenancePlantId: plantId, Keyword: trimmed });
  };

  const apply = () => {
    if (!selected) return;
    const value = Number(percentage);
    if (!Number.isFinite(value) || value < 0.01 || value > 100) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataCompare.percentageInvalid)}</span> });
      return;
    }

    onApply({
      secondaryDataSettingId: selected.id,
      name: selected.name,
      carbonFactor: selected.carbonFactor,
      unit: selected.unit,
      departmentName: selected.departmentName,
      announcementYear: selected.announcementYear,
      percentage: Math.round(value * 100) / 100,
    }, row);
  };

  const columns: Column<SecondaryDataCompareOption>[] = [
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.name), key: 'name' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.carbonFactor), key: 'carbonFactor', className: 'text-center' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.unit), key: 'unit' },
    {
      header: translate(LANGUAGE_KEYS.common.select),
      className: 'text-center',
      style: { width: '100px' },
      render: (option) => (
        <Btn type="button" color={selected?.id === option.id ? 'primary' : 'secondary'} size="sm" outline={selected?.id !== option.id} onClick={() => setSelected(option)}>
          {selected?.id === option.id ? translate(LANGUAGE_KEYS.dataMaintenance.selected) : translate(LANGUAGE_KEYS.common.select)}
        </Btn>
      ),
    },
  ];

  return (
    <Modal show={show} size="xl" onClose={onClose}>
      <Modal.Title onClose={onClose}>{translate(row ? LANGUAGE_KEYS.secondaryDataCompare.edit : LANGUAGE_KEYS.secondaryDataCompare.add)}</Modal.Title>
      <Modal.Body>
        {row ? (
          <div className="border rounded p-3 mb-3">
            <div className="fw-semibold">{row.name}</div>
            <div className="small text-muted">{Number(row.carbonFactor).toFixed(2)} · {row.unit}</div>
          </div>
        ) : (
          <>
            <Input label={translate(LANGUAGE_KEYS.dataMaintenance.keyword)} placeholder={translate(LANGUAGE_KEYS.secondaryDataSetting.name)} value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); search(); } }} />
            <div className="d-flex justify-content-end gap-2 my-3">
              <Btn type="button" color="success" outline icon="search" onClick={search}>{translate(LANGUAGE_KEYS.common.search)}</Btn>
              <Btn type="button" color="light" className="text-primary border" onClick={() => { setKeyword(''); setSubmittedKeyword(''); setSelected(null); }}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </div>
            <CommonTable
              key={submittedKeyword ? 'searched' : 'empty'}
              ref={tableRef}
              columns={columns}
              apiUrl={submittedKeyword ? API_MAP.SECONDARY_DATA_COMPARE_GET_OPTIONS : undefined}
              searchParams={submittedKeyword ? { CarbonFactorMaintenancePlantId: plantId, Keyword: submittedKeyword } : {}}
              pageSize={5}
              rowKey={(option) => option.id}
            />
          </>
        )}
        <div className="mt-3">
          <Input label={translate(LANGUAGE_KEYS.secondaryDataCompare.percentage)} type="number" min="0.01" max="100" step="0.01" value={percentage} onChange={(event) => setPercentage(event.target.value)} required />
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Btn type="button" color="secondary" outline onClick={onClose}>{translate(LANGUAGE_KEYS.common.cancel)}</Btn>
          <Btn type="button" color="primary" onClick={apply} disabled={!selected}>{translate(LANGUAGE_KEYS.common.confirm)}</Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
