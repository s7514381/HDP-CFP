'use client';

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import Modal from '@packages/components/bootstrap5/Modal';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import {
  CarbonFactorMaintenanceModel,
  CarbonFactorMaintenancePlant,
  CarbonFactorMaintenanceYear,
  createCarbonFactorMaintenanceService,
} from './carbonFactorMaintenanceService';
import { usePagePermissions } from '@/hooks/usePagePermissions';

type YearDraft = { id?: string; year: string; productUnit: string };

export default function CarbonFactorMaintenancePage() {
  return (
    <Suspense fallback={<CarbonFactorMaintenanceLoading />}>
      <CarbonFactorMaintenancePageContent />
    </Suspense>
  );
}

function CarbonFactorMaintenanceLoading() {
  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.carbonFactorMaintenance.title} />
      <WrapContent className="p-3"><Container fluid><div className="d-flex justify-content-center py-5"><span className="spinner-border text-primary" role="status" /></div></Container></WrapContent>
    </>
  );
}

function CarbonFactorMaintenancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId')?.trim() || '';
  const buyerMaterialIdParam = searchParams.get('buyerMaterialId')?.trim() || '';
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('CarbonFactorMaintenance:GetModel');
  const service = useMemo(() => createCarbonFactorMaintenanceService(formPost), [formPost]);
  const [model, setModel] = useState<CarbonFactorMaintenanceModel | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearDraft, setYearDraft] = useState<YearDraft | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  const loadModel = useCallback(async (showLoading = true) => {
    if (!materialId) {
      router.replace('/DataMaintenance');
      return;
    }
    if (showLoading) setLoading(true);
    setError(null);
    const result = await service.getModel(materialId);
    if (result.success && result.data) {
      setModel(result.data);
      setSelectedBuyerId((current) => result.data!.buyers.some((buyer) => buyer.buyerMaterialId === current)
        ? current
        : result.data!.buyers.some((buyer) => buyer.buyerMaterialId === buyerMaterialIdParam)
          ? buyerMaterialIdParam
          : result.data!.buyers[0]?.buyerMaterialId || '');
    } else {
      setModel(null);
      setError(result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed));
    }
    if (showLoading) setLoading(false);
  }, [buyerMaterialIdParam, materialId, router, service, translate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await loadModel();
    };
    void load();
    return () => { cancelled = true; };
  }, [loadModel]);

  const selectedBuyer = model?.buyers.find((buyer) => buyer.buyerMaterialId === selectedBuyerId) || null;
  const saveYear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!yearDraft || !model || !selectedBuyer) return;
    const year = Number(yearDraft.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.yearInvalid)}</span> });
      return;
    }
    if (!yearDraft.productUnit.trim()) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.productUnitRequired)}</span> });
      return;
    }
    setSubmitting(true);
    const result = yearDraft.id
      ? await service.editYear({ id: yearDraft.id, materialId: model.materialId, buyerMaterialId: selectedBuyer.buyerMaterialId, year, productUnit: yearDraft.productUnit })
      : await service.addYear({ materialId: model.materialId, buyerMaterialId: selectedBuyer.buyerMaterialId, year, productUnit: yearDraft.productUnit });
    setSubmitting(false);
    if (!result.success) { danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.operationFailed)}</span> }); return; }
    setYearDraft(null);
    success({ message: <span>{translate(yearDraft.id ? LANGUAGE_KEYS.carbonFactorMaintenance.yearSaved : LANGUAGE_KEYS.carbonFactorMaintenance.yearAdded)}</span> });
    await loadModel(false);
  };

  const deleteYear = async (year: CarbonFactorMaintenanceYear) => {
    if (!await confirm(translate(LANGUAGE_KEYS.carbonFactorMaintenance.deleteYearConfirm))) return;
    setSubmitting(true);
    const result = await service.deleteYear(year.id);
    setSubmitting(false);
    if (!result.success) { danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.operationFailed)}</span> }); return; }
    success({ message: <span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.yearDeleted)}</span> });
    await loadModel(false);
  };

  const deletePlant = async (plant: CarbonFactorMaintenancePlant) => {
    if (!await confirm(translate(LANGUAGE_KEYS.carbonFactorMaintenance.deletePlantConfirm))) return;
    setSubmitting(true);
    const result = await service.deletePlant(plant.id);
    setSubmitting(false);
    if (!result.success) { danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.carbonFactorMaintenance.operationFailed)}</span> }); return; }
    success({ message: <span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantDeleted)}</span> });
    await loadModel(false);
  };

  const openPlantPage = (yearId: string, plantId?: string) => {
    const params = plantId
      ? new URLSearchParams({ id: plantId })
      : new URLSearchParams({ yearId });
    router.push(`/DataMaintenance/CarbonFactorMaintenance/Plant/${plantId ? 'Edit' : 'Create'}/?${params.toString()}`);
  };

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.carbonFactorMaintenance.title}>
        <div className="ms-auto"><Btn type="button" color="secondary" outline icon="cancel" onClick={() => router.push('/DataMaintenance')} disabled={submitting}>{translate(LANGUAGE_KEYS.common.backToList)}</Btn></div>
      </ActionBar>
      <WrapContent className="p-3">
        <Container fluid>
          {loading ? <div className="d-flex justify-content-center py-5"><span className="spinner-border text-primary" role="status" /></div> : error || !model ? <Card><Card.Body className="text-center text-danger py-5">{error || translate(LANGUAGE_KEYS.carbonFactorMaintenance.loadFailed)}</Card.Body></Card> : (
            <>
              <Card className="border-0 shadow-sm mb-3"><Card.Body><Grid.Row className="g-3"><Grid.Col md={6}><div className="small text-muted">{translate(LANGUAGE_KEYS.common.materialNumber)}</div><div className="fw-semibold">{model.materialNumber || '-'}</div></Grid.Col><Grid.Col md={6}><div className="small text-muted">{translate(LANGUAGE_KEYS.common.productName)}</div><div className="fw-semibold">{model.productName || '-'}</div></Grid.Col></Grid.Row></Card.Body></Card>
              {model.buyers.length === 0 ? <Card><Card.Body className="text-center text-muted py-5">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.noBuyers)}</Card.Body></Card> : (
                <>
                  <div className="d-flex flex-wrap gap-2 mb-3">{model.buyers.map((buyer) => <Btn key={buyer.buyerMaterialId} type="button" color={buyer.buyerMaterialId === selectedBuyerId ? 'success' : 'secondary'} outline={buyer.buyerMaterialId !== selectedBuyerId} onClick={() => setSelectedBuyerId(buyer.buyerMaterialId)}>{buyer.buyerName || '-'}{buyer.buyerMaterialNumber ? ` (${buyer.buyerMaterialNumber})` : ''}</Btn>)}</div>
                  {selectedBuyer && <>
                    <div className="d-flex justify-content-end mb-3">
                      <Btn type="button" color="primary" outline icon="add" onClick={() => setYearDraft({ year: String(new Date().getFullYear()), productUnit: '' })} disabled={submitting}>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.addYear)}</Btn>
                    </div>
                    {selectedBuyer.years.length === 0 ? <div className="text-center text-muted py-4">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.noYears)}</div> : <div className="d-flex flex-column gap-3">{selectedBuyer.years.map((year) => <YearCard key={year.id} year={year} submitting={submitting} onEdit={() => setYearDraft({ id: year.id, year: String(year.year), productUnit: year.productUnit })} onDelete={() => void deleteYear(year)} onAddPlant={() => openPlantPage(year.id)} onEditPlant={(plant) => openPlantPage(year.id, plant.id)} onDeletePlant={(plant) => void deletePlant(plant)} translate={translate} />)}</div>}
                  </>}
                </>
              )}
            </>
          )}
        </Container>
      </WrapContent>
      <YearModal draft={yearDraft} submitting={submitting} onChange={setYearDraft} onClose={() => setYearDraft(null)} onSubmit={saveYear} translate={translate} />
    </>
  );
}

function YearCard({ year, submitting, onEdit, onDelete, onAddPlant, onEditPlant, onDeletePlant, translate }: { year: CarbonFactorMaintenanceYear; submitting: boolean; onEdit: () => void; onDelete: () => void; onAddPlant: () => void; onEditPlant: (plant: CarbonFactorMaintenancePlant) => void; onDeletePlant: (plant: CarbonFactorMaintenancePlant) => void; translate: (key: string) => string }) {
  return <Card className="border"><Card.Header className="d-flex flex-wrap align-items-center justify-content-between gap-2"><span className="fw-semibold">{year.year}</span><span>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.carbonFactor)}: {year.carbonFactor ?? '-'} {year.productUnit}</span><div className="d-flex gap-1"><Btn type="button" color="warning" size="sm" outline onClick={onEdit} disabled={submitting}>{translate(LANGUAGE_KEYS.common.edit)}</Btn><Btn type="button" color="danger" size="sm" outline onClick={onDelete} disabled={submitting}>{translate(LANGUAGE_KEYS.common.delete)}</Btn><Btn type="button" color="primary" size="sm" outline icon="add" onClick={onAddPlant} disabled={submitting}>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.addPlant)}</Btn></div></Card.Header><Card.Body>{year.plants.length === 0 ? <div className="text-center text-muted py-3">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.noPlants)}</div> : <div className="table-responsive"><table className="table table-sm align-middle mb-0"><thead><tr><th>{translate(LANGUAGE_KEYS.carbonFactorMaintenance.plantName)}</th><th className="text-end">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.allocation)}</th><th className="text-end">{translate(LANGUAGE_KEYS.carbonFactorMaintenance.carbonFactor)}</th><th aria-label={translate(LANGUAGE_KEYS.common.actions)} /></tr></thead><tbody>{year.plants.map((plant) => <tr key={plant.id}><td>{plant.plantName}</td><td className="text-end">{plant.allocationPercentage}%</td><td className="text-end">{plant.carbonFactor}</td><td className="text-end"><Btn type="button" color="warning" size="sm" outline onClick={() => onEditPlant(plant)} disabled={submitting}>{translate(LANGUAGE_KEYS.common.edit)}</Btn> <Btn type="button" color="danger" size="sm" outline onClick={() => onDeletePlant(plant)} disabled={submitting}>{translate(LANGUAGE_KEYS.common.delete)}</Btn></td></tr>)}</tbody></table></div>}</Card.Body></Card>;
}

function YearModal({ draft, submitting, onChange, onClose, onSubmit, translate }: { draft: YearDraft | null; submitting: boolean; onChange: (draft: YearDraft) => void; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; translate: (key: string) => string }) {
  return <Modal show={draft !== null} size="sm" onClose={onClose}><Modal.Title onClose={onClose}>{draft?.id ? translate(LANGUAGE_KEYS.common.edit) : translate(LANGUAGE_KEYS.carbonFactorMaintenance.addYear)}</Modal.Title><Modal.Body>{draft && <form onSubmit={onSubmit}><Input type="number" min={1900} max={2100} label={translate(LANGUAGE_KEYS.carbonFactorMaintenance.year)} value={draft.year} readOnly={Boolean(draft.id)} onChange={(event) => onChange({ ...draft, year: event.target.value })} required /><Input label={translate(LANGUAGE_KEYS.carbonFactorMaintenance.productUnit)} value={draft.productUnit} onChange={(event) => onChange({ ...draft, productUnit: event.target.value })} required /><div className="d-flex justify-content-end gap-2 mt-3"><Btn type="button" color="secondary" outline onClick={onClose}>{translate(LANGUAGE_KEYS.common.cancel)}</Btn><Btn type="submit" color="primary" loading={submitting}>{translate(LANGUAGE_KEYS.common.save)}</Btn></div></form>}</Modal.Body></Modal>;
}
