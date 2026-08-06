'use client';

import React, { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Content, { DEFAULT_PCR_PATTERN_FORM } from '@/app/(main)/PcrPattern/Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { PcrPatternFormData } from '@/types/pcrPattern';
import { isPcrTemplateCategory } from '@/types/pcrTemplate';

function ProductSubcategoryPcrPatternCreateContent() {
  const searchParams = useSearchParams();
  const productSubcategoryId = searchParams.get('productSubcategoryId') || '';
  const initialData = useMemo<PcrPatternFormData>(() => {
    const category = Number(searchParams.get('category'));
    return {
      ...DEFAULT_PCR_PATTERN_FORM,
      productSubcategoryId,
      category: isPcrTemplateCategory(category)
        ? category
        : DEFAULT_PCR_PATTERN_FORM.category,
    };
  }, [productSubcategoryId, searchParams]);
  const { formPost } = useAppApi();

  return (
    <FormPageWrapper<PcrPatternFormData>
      title={LANGUAGE_KEYS.pcrPattern.addTitle}
      content={Content}
      initialData={initialData}
      onSubmit={(data) => formPost(API_MAP.PRODUCT_SUBCATEGORY_CREATE_PCR_PATTERN, {
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
      successMessage={LANGUAGE_KEYS.pcrPattern.added}
    />
  );
}

export default function ProductSubcategoryPcrPatternCreatePage() {
  return (
    <Suspense fallback={<div className="p-5 text-center"><span className="spinner-border text-primary" role="status" /></div>}>
      <ProductSubcategoryPcrPatternCreateContent />
    </Suspense>
  );
}
