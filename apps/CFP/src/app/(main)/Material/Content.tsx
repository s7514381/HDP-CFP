'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import { Checkbox } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';

export const DEFAULT_MATERIAL_FORM = {
  supplierId: null as string | null,
  materialNumber: '',
  productModel: '',
  productName: '',
  canSell: 'false',
};

export type MaterialData = typeof DEFAULT_MATERIAL_FORM & {
  id?: string | number;
  CanSell?: string | number | boolean;
};

interface SupplierOption {
  text?: string;
  name?: string;
  value?: string | number;
  id?: string | number;
}

interface ContentProps {
  title: string;
  formData: MaterialData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<MaterialData>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { post } = useAppApi();
  const { translate } = useLanguage();
  const [suppliers, setSuppliers] = React.useState<SupplierOption[]>([]);
  const canSellValue = formData.canSell ?? formData.CanSell ?? '0';
  const normalizedCanSellValue = String(canSellValue).trim().toLowerCase();
  const isCanSell = ['1', 'true', 'yes', 'y', '是', '可'].includes(normalizedCanSellValue);

  React.useEffect(() => {
    post<SupplierOption[]>(API_MAP.SUPPLIER_GET_SELECT_LIST, { body: {} }).then(res => {
      if (res.success && Array.isArray(res.data)) {
        setSuppliers(res.data);
      }
    });
  }, [post]);

  const handleCanSellChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateForm({ canSell: event.target.checked ? 'true' : 'false' });
  };

  return (
    <>
      <FormActionBar
        title={title}
        formId="material-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="material-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.supplier)}
                    name="supplierId"
                    value={formData.supplierId || ''}
                    onChange={onChange}
                    options={[
                      { label: translate(LANGUAGE_KEYS.material.selectSupplier), value: '' },
                      ...suppliers.map((supplier) => ({ label: supplier.text || supplier.name || '', value: supplier.value ?? supplier.id ?? '' }))
                    ]}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.materialNumber)}
                    name="materialNumber"
                    value={formData.materialNumber || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.materialNumber)}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.productModel)}
                    name="productModel"
                    value={formData.productModel || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.productModel)}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.productName)}
                    name="productName"
                    value={formData.productName || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.productName)}
                  />
                </Grid.Col>

                <Grid.Col md={6} className="d-flex align-items-end">
                  <Checkbox
                    name="canSell"
                    label={translate(LANGUAGE_KEYS.material.canSell)}
                    checked={isCanSell}
                    onChange={handleCanSellChange}
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

Content.defaultData = DEFAULT_MATERIAL_FORM;
