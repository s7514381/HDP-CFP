'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { createCarbonFactorMaintenanceService, CarbonFactorMaintenancePlantEditModel } from '../../carbonFactorMaintenanceService';
import PlantContent, { createEmptyPlantFormData, PlantFormData } from '../PlantContent';
import { toCarbonFactorMaintenancePlantRequest } from '../plantRequest';
import { usePagePermissions } from '@/hooks/usePagePermissions';

export default function CreatePlantPage() {
  return <Suspense fallback={null}><CreatePlantPageContent /></Suspense>;
}

function CreatePlantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const yearId = searchParams.get('yearId')?.trim() || '';
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('CarbonFactorMaintenance:GetModel');
  const service = useMemo(() => createCarbonFactorMaintenanceService(formPost), [formPost]);
  const [initialData, setInitialData] = useState<PlantFormData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!yearId) router.replace('/DataMaintenance/CarbonFactorMaintenance/');
  }, [router, yearId]);

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  const onSubmit = async (data: PlantFormData) => {
    const result = await service.addPlant(toCarbonFactorMaintenancePlantRequest(data));
    return { success: result.success, message: result.message || undefined };
  };

  const fetchContext = useCallback(async (): Promise<PlantFormData> => {
    const result = await service.getPlantCreateModel(yearId);
    const model = result.data as CarbonFactorMaintenancePlantEditModel | null;
    if (!result.success || !model) throw new Error(result.message || 'Year not found');
    return createEmptyPlantFormData({
      materialId: model.materialId,
      buyerMaterialId: model.buyerMaterialId,
      yearId: model.yearId,
      materialNumber: model.materialNumber,
      productName: model.productName,
      buyerName: model.buyerName,
      buyerMaterialNumber: model.buyerMaterialNumber,
      year: String(model.year),
      productUnit: model.productUnit,
      pcrEvidenceCategories: model.pcrEvidenceCategories || [],
    });
  }, [service, yearId]);

  useEffect(() => {
    if (!yearId) return;
    let cancelled = false;
    void fetchContext().then((data) => {
      if (!cancelled) setInitialData(data);
    }).catch((error: unknown) => {
      if (!cancelled) setLoadError(error instanceof Error ? error.message : translate(LANGUAGE_KEYS.common.loadFailed));
    });
    return () => { cancelled = true; };
  }, [fetchContext, translate, yearId]);

  if (!initialData) return <div className="p-5 text-center">{loadError || translate(LANGUAGE_KEYS.common.loadingData)}</div>;

  return (
    <FormPageWrapper
      title={LANGUAGE_KEYS.carbonFactorMaintenance.plantCreateTitle}
      content={PlantContent}
      initialData={initialData}
      onSubmit={onSubmit}
      redirectPath={`/DataMaintenance/CarbonFactorMaintenance/?materialId=${encodeURIComponent(initialData.materialId)}&buyerMaterialId=${encodeURIComponent(initialData.buyerMaterialId)}&yearId=${encodeURIComponent(initialData.yearId)}`}
      submitLabel={LANGUAGE_KEYS.common.save}
      successMessage={LANGUAGE_KEYS.carbonFactorMaintenance.plantAdded}
    />
  );
}
