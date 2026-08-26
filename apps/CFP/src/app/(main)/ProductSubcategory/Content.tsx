'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input, Textarea } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormContentProps } from '@/components/common/formTypes';
import { ProductSubcategoryFormData } from '@/types/productSubcategory';

export const DEFAULT_PRODUCT_SUBCATEGORY_FORM: ProductSubcategoryFormData = {
  name: '',
  developer: '',
  applicableScope: '',
  cccCode: '',
  status: 1,
};

export default function ProductSubcategoryContent({
  title,
  formData,
  onChange,
  onSubmit,
  loading = false,
  submitLabel = LANGUAGE_KEYS.common.save,
}: FormContentProps<ProductSubcategoryFormData>) {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <>
      <FormActionBar
        title={translate(title)}
        formId="product-subcategory-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="product-subcategory-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory)}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory)}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.developer)}
                    name="developer"
                    value={formData.developer || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.developer)}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <Textarea
                    label={translate(LANGUAGE_KEYS.productSubcategory.applicableScope)}
                    name="applicableScope"
                    value={formData.applicableScope || ''}
                    onChange={onChange}
                    rows={4}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.applicableScope)}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.cccCode)}
                    name="cccCode"
                    value={formData.cccCode || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.cccCode)}
                  />
                </Grid.Col>
              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

ProductSubcategoryContent.defaultData = DEFAULT_PRODUCT_SUBCATEGORY_FORM;
