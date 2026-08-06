'use client';

import React, { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Content from '@/app/(main)/PcrPattern/Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { PcrPatternFormData } from '@/types/pcrPattern';

function ProductSubcategoryPcrPatternEditContent() {
  const searchParams = useSearchParams();
  const productSubcategoryId = searchParams.get('productSubcategoryId') || '';
  const { formPost } = useAppApi();
  const handleFetchModel = useCallback(async (id: string) => (
    formPost(API_MAP.PRODUCT_SUBCATEGORY_GET_PCR_PATTERN_MODEL, {
      id,
      productSubcategoryId,
    })
  ), [formPost, productSubcategoryId]);

  return (
    <FormPageWrapper<PcrPatternFormData>
      title={LANGUAGE_KEYS.pcrPattern.editTitle}
      content={Content}
      onFetchModel={handleFetchModel}
      onSubmit={(data) => formPost(API_MAP.PRODUCT_SUBCATEGORY_EDIT_PCR_PATTERN, {
        ...data,
        productSubcategoryId,
        item: data.item.trim(),
        category: Number(data.category),
        childList: data.childList.map(child => ({
          ...child,
          item: child.item.trim(),
        })),
      })}
      redirectPath={`/ProductSubcategory/PcrPattern/?id=${productSubcategoryId}`}
      successMessage={LANGUAGE_KEYS.pcrPattern.saved}
    />
  );
}

export default function ProductSubcategoryPcrPatternEditPage() {
  return (
    <Suspense fallback={<div className="p-5 text-center"><span className="spinner-border text-primary" role="status" /></div>}>
      <ProductSubcategoryPcrPatternEditContent />
    </Suspense>
  );
}
