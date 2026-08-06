'use client';

import React from 'react';
import Content, { DEFAULT_PRODUCT_SUBCATEGORY_FORM } from '../Content';
import FormPageWrapper from '@/components/common/FormPageWrapper';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { ProductSubcategoryFormData } from '@/types/productSubcategory';

export default function ProductSubcategoryCreatePage() {
  const { formPost } = useAppApi();

  return (
    <FormPageWrapper<ProductSubcategoryFormData>
      title={LANGUAGE_KEYS.productSubcategory.addTitle}
      content={Content}
      initialData={DEFAULT_PRODUCT_SUBCATEGORY_FORM}
      onSubmit={(data) => formPost(API_MAP.PRODUCT_SUBCATEGORY_CREATE, {
        ...data,
        name: data.name.trim(),
        developer: data.developer.trim(),
        applicableScope: data.applicableScope.trim(),
        cccCode: data.cccCode.trim(),
      })}
      redirectPath="/ProductSubcategory"
      successMessage={LANGUAGE_KEYS.productSubcategory.added}
    />
  );
}
