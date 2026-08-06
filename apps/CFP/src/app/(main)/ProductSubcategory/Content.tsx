'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, Textarea } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
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
      <ActionBar title={translate(title, '產品次類別')}>
        <div className="ms-auto">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel" disabled={loading}>
            {translate(LANGUAGE_KEYS.common.backToList, '返回列表')}
          </Btn>
        </div>
      </ActionBar>

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, '產品次類別')}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, '請輸入產品次類別')}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.developer, '制定者')}
                    name="developer"
                    value={formData.developer || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.developer, '請輸入制定者')}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <Textarea
                    label={translate(LANGUAGE_KEYS.productSubcategory.applicableScope, '適用範圍')}
                    name="applicableScope"
                    value={formData.applicableScope || ''}
                    onChange={onChange}
                    rows={4}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.applicableScope, '請輸入適用範圍')}
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <Input
                    label={translate(LANGUAGE_KEYS.productSubcategory.cccCode, 'CCC code')}
                    name="cccCode"
                    value={formData.cccCode || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.productSubcategory.cccCode, '請輸入 CCC code')}
                  />
                </Grid.Col>
                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/ProductSubcategory')}>
                    {translate(LANGUAGE_KEYS.common.cancel, '取消')}
                  </Btn>
                  <Btn type="submit" color="primary" loading={loading} icon="save">
                    {translate(submitLabel, '儲存')}
                  </Btn>
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
