'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { createCarbonFactorMaintenanceService, CarbonFactorMaintenancePlantEditModel } from '../carbonFactorMaintenanceService';
import PlantContent, { createEmptyPlantFormData, PlantContentProps, PlantFormData } from './PlantContent';
import { toCarbonFactorMaintenancePlantRequest } from './plantRequest';
import { usePagePermissions } from '@/hooks/usePagePermissions';

export interface PlantEditPageProps {
  allowFileUpload?: boolean;
}

function PlantContentWithoutFileUpload(props: PlantContentProps) {
  return <PlantContent {...props} allowFileUpload={false} allowOpinionEdit returnPath="/MaterialDemand/" />;
}

function PlantContentWithFileUpload(props: PlantContentProps) {
  return <PlantContent {...props} allowFileUpload />;
}

export default function PlantEditPage({ allowFileUpload = true }: PlantEditPageProps) {
  return <Suspense fallback={null}><EditPlantPageContent allowFileUpload={allowFileUpload} /></Suspense>;
}

function EditPlantPageContent({ allowFileUpload }: PlantEditPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plantId = searchParams.get('id')?.trim() || '';
  const { formPost, formPostWithErrorDetails } = useAppApi();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('CarbonFactorMaintenance:GetModel');
  const { translate } = useLanguage();
  const service = useMemo(() => createCarbonFactorMaintenanceService(formPost), [formPost]);
  const detailedService = useMemo(
    () => createCarbonFactorMaintenanceService(formPostWithErrorDetails),
    [formPostWithErrorDetails]
  );
  const [initialData, setInitialData] = useState<PlantFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!plantId) router.replace('/DataMaintenance/CarbonFactorMaintenance/');
  }, [plantId, router]);

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  const fetchPlant = useCallback(async (id: string): Promise<PlantFormData> => {
    const result = await service.getPlantEditModel(id);
    const model = result.data as CarbonFactorMaintenancePlantEditModel | null;
    if (!result.success || !model) throw new Error(result.message || 'Plant not found');
    return createEmptyPlantFormData({
      id: model.id,
      materialId: model.materialId,
      buyerMaterialId: model.buyerMaterialId,
      yearId: model.yearId,
      materialNumber: model.materialNumber,
      productName: model.productName,
      buyerName: model.buyerName,
      buyerMaterialNumber: model.buyerMaterialNumber,
      year: String(model.year),
      productUnit: model.productUnit,
      plantName: model.plantName,
      allocationPercentage: String(model.allocationPercentage),
      carbonFactor: String(model.carbonFactor),
      thirdPartyCertificationYear: model.thirdPartyCertificationYear ? String(model.thirdPartyCertificationYear) : String(new Date().getFullYear()),
      attachments: model.attachments || [],
      pcrEvidenceCategories: model.pcrEvidenceCategories || [],
    });
  }, [service]);

  useEffect(() => {
    if (!plantId) return;
    let cancelled = false;
    void fetchPlant(plantId).then((data) => {
      if (!cancelled) setInitialData(data);
    }).catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : translate(LANGUAGE_KEYS.common.loadFailed));
    });
    return () => { cancelled = true; };
  }, [fetchPlant, plantId, translate]);

  if (!initialData) return <div className="p-5 text-center">{loadError || translate(LANGUAGE_KEYS.common.loadingData)}</div>;

  const onSubmit = async (data: PlantFormData) => {
    const result = await detailedService.editPlant(toCarbonFactorMaintenancePlantRequest(data));
    return { success: result.success, message: result.message || undefined };
  };

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.carbonFactorMaintenance.plantEditTitle}
      content={allowFileUpload ? PlantContentWithFileUpload : PlantContentWithoutFileUpload}
      initialData={initialData}
      onSubmit={onSubmit}
      redirectPath={`/DataMaintenance/CarbonFactorMaintenance/?materialId=${encodeURIComponent(initialData.materialId)}&buyerMaterialId=${encodeURIComponent(initialData.buyerMaterialId)}&yearId=${encodeURIComponent(initialData.yearId)}`}
      submitLabel={LANGUAGE_KEYS.common.save}
      successMessage={LANGUAGE_KEYS.carbonFactorMaintenance.plantSaved}
    />
  );
}
