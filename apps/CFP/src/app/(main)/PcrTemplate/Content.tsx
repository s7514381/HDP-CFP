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
import { FormContentProps } from '@/components/common/formTypes';
import { PcrTemplateCategory, PcrTemplateChildFormData } from '@/types/pcrTemplate';

export interface PcrTemplateFormData {
  id?: string | number;
  category: PcrTemplateCategory;
  item: string;
  status: number;
  itemLRID?: string;
  childList: PcrTemplateChildFormData[];
}

export const DEFAULT_PCR_FORM: PcrTemplateFormData = {
  category: PcrTemplateCategory.Material,
  item: '',
  status: 1,
  childList: [],
};

const CATEGORY_OPTIONS = [
  { value: PcrTemplateCategory.Material, label: LANGUAGE_KEYS.pcrTemplate.material, fallback: '原料' },
  { value: PcrTemplateCategory.Process, label: LANGUAGE_KEYS.pcrTemplate.process, fallback: '製程' },
  { value: PcrTemplateCategory.Transport, label: LANGUAGE_KEYS.pcrTemplate.transport, fallback: '運輸' },
  { value: PcrTemplateCategory.Waste, label: LANGUAGE_KEYS.pcrTemplate.waste, fallback: '廢棄' },
];

export default function PcrTemplateContent({
  title,
  formData,
  onChange,
  updateForm,
  onSubmit,
  loading = false,
  submitLabel = LANGUAGE_KEYS.common.save,
}: FormContentProps<PcrTemplateFormData>) {
  const router = useRouter();
  const { translate } = useLanguage();
  const displayTitle = translate(title, 'PCR模板範本');
  const childList = formData.childList || [];

  const handleAddSubItem = () => {
    updateForm({
      childList: [
        ...childList,
        { item: '', status: 1, sequence: childList.length + 1 },
      ],
    });
  };

  const handleRemoveSubItem = (index: number) => {
    updateForm({ childList: childList.filter((_, childIndex) => childIndex !== index) });
  };

  const handleSubItemChange = (index: number, value: string) => {
    updateForm({
      childList: childList.map((child, childIndex) =>
        childIndex === index ? { ...child, item: value } : child
      ),
    });
  };

  return (
    <>
      <ActionBar title={displayTitle}>
        <div className="ms-auto">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel">
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
                  <Select
                    label={translate(LANGUAGE_KEYS.pcrTemplate.title, 'PCR 模板類別')}
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    options={CATEGORY_OPTIONS.map(option => ({
                      label: translate(option.label, option.fallback),
                      value: option.value,
                    }))}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.pcrTemplate.item, '項目')}
                    name="item"
                    value={formData.item || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.pcrTemplate.item, '請輸入項目')}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
                    <h5 className="fw-bold mb-0">
                      {translate(LANGUAGE_KEYS.pcrTemplate.item, '子項目')}
                    </h5>
                    <Btn type="button" color="primary" size="sm" icon="add" onClick={handleAddSubItem}>
                      {translate(LANGUAGE_KEYS.common.add, '新增')}
                    </Btn>
                  </div>

                  {childList.map((child, index) => (
                    <Card key={child.id ?? `new-${index}`} className="mb-3 bg-light shadow-sm border-0">
                      <Card.Body className="py-3">
                        <div className="d-flex align-items-end gap-3">
                          <div className="flex-grow-1">
                            <Input
                              label={`${translate(LANGUAGE_KEYS.pcrTemplate.item, '子項目')} ${index + 1}`}
                              value={child.item}
                              onChange={(event) => handleSubItemChange(index, event.target.value)}
                              placeholder={translate(LANGUAGE_KEYS.pcrTemplate.item, '請輸入子項目')}
                              required
                            />
                          </div>
                          <Btn
                            type="button"
                            color="danger"
                            size="sm"
                            onClick={() => handleRemoveSubItem(index)}
                          >
                            {translate(LANGUAGE_KEYS.common.delete, '刪除')}
                          </Btn>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Grid.Col>
                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/PcrTemplate')}>
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

PcrTemplateContent.defaultData = DEFAULT_PCR_FORM;
