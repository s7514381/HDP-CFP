'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import ActionBar from '@/components/layouts/ActionBar';
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
    ? translate(title, '新增買方認可依據')
    : title === LANGUAGE_KEYS.buyerAccreditation.editTitle
      ? translate(title, '編輯買方認可依據')
      : title;

  return (
    <>
      <ActionBar title={displayTitle}>
        <div className="ms-auto">
          <Btn color="secondary" outline onClick={() => router.push(listPath)} icon="cancel" disabled={loading}>
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
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.level, '供應來源等級')}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.buyerAccreditation.level, '例如：Level I')}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification, '第三方認證')}
                    name="thirdPartyCertification"
                    value={String(formData.thirdPartyCertification)}
                    onChange={onChange}
                    options={[
                      { value: 'true', label: translate(LANGUAGE_KEYS.common.yes, '有') },
                      { value: 'false', label: translate(LANGUAGE_KEYS.common.no, '無') },
                    ]}
                  />
                </Grid.Col>
                <Grid.Col md={4}>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount, '顧問認可數')}
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
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.buyerApprovalCount, '買方認可數')}
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
                    label={translate(LANGUAGE_KEYS.buyerAccreditation.totalScore, '總分')}
                    name="totalScore"
                    value={formData.totalScore ?? 0}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push(listPath)}>
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

BuyerAccreditationLevelContent.defaultData = DEFAULT_BUYER_ACCREDITATION_LEVEL_FORM;
