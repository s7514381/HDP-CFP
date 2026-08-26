'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormContentProps } from '@/components/common/formTypes';
import { SecondaryDataSettingFormData } from '@/types/secondaryDataSetting';

export const DEFAULT_SECONDARY_DATA_SETTING_FORM: SecondaryDataSettingFormData = {
  name: '',
  carbonFactor: '',
  unit: '',
  departmentName: '',
  announcementYear: '',
};

export default function SecondaryDataSettingContent({
  title,
  formData,
  onChange,
  onSubmit,
  loading = false,
}: FormContentProps<SecondaryDataSettingFormData>) {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <>
      <FormActionBar
        title={translate(title)}
        formId="secondary-data-setting-form"
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="secondary-data-setting-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.secondaryDataSetting.name)}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.secondaryDataSetting.carbonFactor)}
                    name="carbonFactor"
                    type="number"
                    min="0"
                    step="0.000001"
                    value={formData.carbonFactor ?? ''}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.secondaryDataSetting.unit)}
                    name="unit"
                    value={formData.unit || ''}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.secondaryDataSetting.departmentName)}
                    name="departmentName"
                    value={formData.departmentName || ''}
                    onChange={onChange}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.secondaryDataSetting.announcementYear)}
                    name="announcementYear"
                    type="number"
                    min="1900"
                    max="2100"
                    value={formData.announcementYear ?? ''}
                    onChange={onChange}
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

SecondaryDataSettingContent.defaultData = DEFAULT_SECONDARY_DATA_SETTING_FORM;
