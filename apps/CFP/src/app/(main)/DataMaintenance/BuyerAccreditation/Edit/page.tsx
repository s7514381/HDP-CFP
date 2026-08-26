'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import BuyerAccreditationLevelContent from '../Content';
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

function BuyerAccreditationLevelEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId')?.trim() || '';
  const { formPost } = useAppApi();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('BuyerAccreditationLevel:Index');
  const handleFetchModel = React.useCallback(async (id: string) => (
    formPost(API_MAP.BUYER_ACCREDITATION_LEVEL_GET_MODEL, { id, materialId })
  ), [formPost, materialId]);

  React.useEffect(() => {
    if (!materialId) router.replace('/DataMaintenance');
  }, [materialId, router]);

  React.useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  if (!materialId) return null;

  return (
    <FormPageWrapper<BuyerAccreditationLevelFormData>
      title={LANGUAGE_KEYS.buyerAccreditation.editTitle}
      content={BuyerAccreditationLevelContent}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.BUYER_ACCREDITATION_LEVEL_EDIT, toRequest(data, materialId))}
      redirectPath={`/DataMaintenance/BuyerAccreditation/?materialId=${encodeURIComponent(materialId)}`}
      successMessage={LANGUAGE_KEYS.buyerAccreditation.saved}
    />
  );
}

export default function BuyerAccreditationLevelEditPage() {
  return (
    <React.Suspense fallback={null}>
      <BuyerAccreditationLevelEditPageContent />
    </React.Suspense>
  );
}
