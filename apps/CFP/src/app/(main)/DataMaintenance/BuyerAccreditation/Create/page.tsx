'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@packages/contexts/ToastContext';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import BuyerAccreditationLevelContent, { DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM } from '../Content';
import { BuyerAccreditationLevelFormData } from '@/types/buyerAccreditationLevel';
import { usePagePermissions } from '@/hooks/usePagePermissions';

function toRequest(data: BuyerAccreditationLevelFormData, materialId: string) {
  return {
    ...data,
    materialId,
    sequence: data.sequence === '' || data.sequence == null ? null : Number(data.sequence),
    name: data.name.trim(),
    thirdPartyCertification: data.thirdPartyCertification === true || String(data.thirdPartyCertification).toLowerCase() === 'true',
    consultantApprovalCount: Number(data.consultantApprovalCount),
    buyerApprovalCount: Number(data.buyerApprovalCount),
    totalScore: Number(data.totalScore),
  };
}

function BuyerAccreditationLevelCreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId')?.trim() || '';
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { danger } = useToast();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('BuyerAccreditationLevel:Index');
  const [initialData, setInitialData] = React.useState<BuyerAccreditationLevelFormData | null>(null);

  React.useEffect(() => {
    if (!materialId) router.replace('/DataMaintenance');
  }, [materialId, router]);

  React.useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  React.useEffect(() => {
    if (!materialId) return;

    let isMounted = true;
    const loadInitialData = async () => {
      const result = await formPost<BuyerAccreditationLevelFormData>(
        API_MAP.BUYER_ACCREDITATION_LEVEL_GET_NEW_MODEL,
        { materialId },
      );

      if (!isMounted) return;

      if (result.success && result.data) {
        setInitialData({
          ...DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM,
          ...result.data,
          materialId,
          thirdPartyCertification: String(result.data.thirdPartyCertification ?? false),
        });
        return;
      }

      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
      router.replace('/DataMaintenance');
    };

    void loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [danger, formPost, materialId, router, translate]);

  if (!materialId || !initialData) return null;

  return (
    <FormPageWrapper<BuyerAccreditationLevelFormData>
      title={LANGUAGE_KEYS.buyerAccreditation.addTitle}
      content={BuyerAccreditationLevelContent}
      initialData={initialData}
      onSubmit={(data) => formPost(API_MAP.BUYER_ACCREDITATION_LEVEL_CREATE, toRequest(data, materialId))}
      redirectPath={`/DataMaintenance/BuyerAccreditation/?materialId=${encodeURIComponent(materialId)}`}
      successMessage={LANGUAGE_KEYS.buyerAccreditation.added}
    />
  );
}

export default function BuyerAccreditationLevelCreatePage() {
  return (
    <React.Suspense fallback={null}>
      <BuyerAccreditationLevelCreatePageContent />
    </React.Suspense>
  );
}
