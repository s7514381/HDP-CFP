'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export const DEFAULT_SUPPLIER_FORM = {
  name: '',
  taxID: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  status: '1' as string | number,
  note: '',
  id: undefined as string | undefined
};

export type SupplierData = typeof DEFAULT_SUPPLIER_FORM & {
  id?: string | number;
};

interface ContentProps {
  title: string;
  formData: SupplierData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { translate } = useLanguage();
  const displayTitle = translate(title);

  return (
    <>
      <ActionBar title={displayTitle}>
        <div className="ms-auto">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel">
            {translate(LANGUAGE_KEYS.common.backToList)}
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
                  label={translate(LANGUAGE_KEYS.supplier.name)}
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                  placeholder={translate(LANGUAGE_KEYS.supplier.namePlaceholder)}
                  required
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label={translate(LANGUAGE_KEYS.supplier.taxId)}
                  name="taxID"
                  value={formData.taxID || ''}
                  onChange={onChange}
                  placeholder={translate(LANGUAGE_KEYS.supplier.taxIdPlaceholder)}
                  required
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Input
                  label={translate(LANGUAGE_KEYS.supplier.contactName)}
                  name="contactName"
                  value={formData.contactName || ''}
                  onChange={onChange}
                  placeholder={translate(LANGUAGE_KEYS.supplier.contactNamePlaceholder)}
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label={translate(LANGUAGE_KEYS.supplier.contactPhone)}
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={onChange}
                  placeholder={translate(LANGUAGE_KEYS.supplier.contactPhonePlaceholder)}
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Input
                  label={translate(LANGUAGE_KEYS.supplier.email)}
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={onChange}
                  placeholder="example@domain.com"
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Select
                  label={translate(LANGUAGE_KEYS.common.status)}
                  name="status"
                  value={formData.status || ''}
                  onChange={onChange}
                  options={[
                    { label: translate(LANGUAGE_KEYS.common.enabled), value: '1' },
                    { label: translate(LANGUAGE_KEYS.common.disabled), value: '0' }
                  ]}
                />
              </Grid.Col>

              <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                <Btn type="button" color="secondary" outline onClick={() => router.push('/Supplier')}>
                  {translate(LANGUAGE_KEYS.common.cancel)}
                </Btn>
                <Btn type="submit" color="primary" loading={loading} icon="save">
                  {translate(submitLabel)}
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

Content.defaultData = DEFAULT_SUPPLIER_FORM;
