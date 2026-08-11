'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import BuyerAccreditationLevelContent, { DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM } from '../Content';
import { BuyerAccreditationLevelFormData } from '@/types/buyerAccreditationLevel';

function toRequest(data: BuyerAccreditationLevelFormData, materialId: string) {
  return {
    ...data,
    materialId,
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

  React.useEffect(() => {
    if (!materialId) router.replace('/DataMaintenance');
  }, [materialId, router]);

  if (!materialId) return null;

  return (
    <FormPageWrapper<BuyerAccreditationLevelFormData>
      title={LANGUAGE_KEYS.buyerAccreditation.addTitle}
      content={BuyerAccreditationLevelContent}
      initialData={{ ...DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM, materialId }}
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
