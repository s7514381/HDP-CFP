'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import FormActionBar from '@/components/common/FormActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormContentProps } from '@/components/common/formTypes';
import { BuyerAccreditationLevelFormData } from '@/types/buyerAccreditationLevel';

export const DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM: BuyerAccreditationLevelFormData = {
  name: '',
  thirdPartyCertification: 'false',
  consultantApprovalCount: 0,
  buyerApprovalCount: 0,
  totalScore: 0,
  status: 1,
};

export default function BuyerAccreditationLevelContent({
  title,
  formData,
  onChange,
  onSubmit,
  loading = false,
  submitLabel = LANGUAGE_KEYS.common.save,
}: FormContentProps<BuyerAccreditationLevelFormData>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId')?.trim() || '';
  const { translate } = useLanguage();
  const listPath = materialId
    ? `/DataMaintenance/BuyerAccreditation/?materialId=${encodeURIComponent(materialId)}`
    : '/DataMaintenance';
  const displayTitle = title === LANGUAGE_KEYS.buyerAccreditation.addTitle
    ? translate(title)
    : title === LANGUAGE_KEYS.buyerAccreditation.editTitle
      ? translate(title)
      : title;

  return (
    <>
      <FormActionBar
        title={displayTitle}
        formId="buyer-accreditation-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.push(listPath)}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="buyer-accreditation-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.level)}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.buyerAccreditation.level)}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    label={translate(LANGUAGE_KEYS.common.sequencePlaceholder)}
                    name="sequence"
                    value={formData.sequence ?? ''}
                    onChange={onChange}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification)}
                    name="thirdPartyCertification"
                    value={String(formData.thirdPartyCertification)}
                    onChange={onChange}
                    options={[
                      { value: 'true', label: translate(LANGUAGE_KEYS.common.yes) },
                      { value: 'false', label: translate(LANGUAGE_KEYS.common.no) },
                    ]}
                  />
                </Grid.Col>
                <Grid.Col md={4}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount)}
                    name="consultantApprovalCount"
                    value={formData.consultantApprovalCount ?? 0}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={4}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.buyerApprovalCount)}
                    name="buyerApprovalCount"
                    value={formData.buyerApprovalCount ?? 0}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={4}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.totalScore)}
                    name="totalScore"
                    value={formData.totalScore ?? 0}
                    onChange={onChange}
                    required
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

BuyerAccreditationLevelContent.defaultData = DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM;
