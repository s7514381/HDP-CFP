'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormContentProps } from '@/components/common/formTypes';
import { PcrPatternFormData } from '@/types/pcrPattern';
import { PcrTemplateCategory } from '@/types/pcrTemplate';
import { PCR_TEMPLATE_CATEGORY_OPTIONS } from '@/lib/pcrTemplateCategories';

export const DEFAULT_PCR_PATTERN_FORM: PcrPatternFormData = {
  productSubcategoryId: '',
  category: PcrTemplateCategory.Material,
  item: '',
  status: 1,
  childList: [],
};

export default function PcrPatternContent({
  title,
  formData,
  onChange,
  updateForm,
  onSubmit,
  loading = false,
  submitLabel = LANGUAGE_KEYS.common.save,
}: FormContentProps<PcrPatternFormData>) {
  const router = useRouter();
  const pathname = usePathname();
  const { translate } = useLanguage();
  const displayTitle = translate(title);
  const childList = formData.childList || [];
  const isProductSubcategoryPcrPattern = pathname.startsWith('/ProductSubcategory/PcrPattern');
  const listPath = isProductSubcategoryPcrPattern
    ? formData.productSubcategoryId
      ? `/ProductSubcategory/PcrPattern/?id=${encodeURIComponent(formData.productSubcategoryId)}`
      : '/ProductSubcategory'
    : '/PcrPattern';

  const handleCancel = () => {
    router.push(listPath);
  };

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
      <FormActionBar
        title={displayTitle}
        formId="pcr-pattern-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={handleCancel}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="pcr-pattern-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.pcrTemplate.title)}
                    name="category"
                    value={formData.category}
                    onChange={onChange}
                    options={PCR_TEMPLATE_CATEGORY_OPTIONS.map(option => ({
                      label: translate(option.languageKey),
                      value: option.value,
                    }))}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.pcrTemplate.item)}
                    name="item"
                    value={formData.item || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.pcrTemplate.item)}
                    required
                    autoFocus
                  />
                </Grid.Col>
                <Grid.Col md={12}>
                  <div className="d-flex align-items-center justify-content-between mt-3 mb-2">
                    <h5 className="fw-bold mb-0">
                      {translate(LANGUAGE_KEYS.pcrTemplate.subItems)}
                    </h5>
                    <Btn type="button" color="primary" size="sm" icon="add" onClick={handleAddSubItem}>
                      {translate(LANGUAGE_KEYS.common.add)}
                    </Btn>
                  </div>

                  {childList.map((child, index) => (
                    <Card key={child.id ?? `new-${index}`} className="mb-3 bg-light shadow-sm border-0">
                      <Card.Body className="py-3">
                        <div className="d-flex align-items-end gap-3">
                          <div className="flex-grow-1">
                            <Input
                              label={`${translate(LANGUAGE_KEYS.pcrTemplate.subItems)} ${index + 1}`}
                              value={child.item}
                              onChange={(event) => handleSubItemChange(index, event.target.value)}
                              placeholder={translate(LANGUAGE_KEYS.pcrTemplate.subItems)}
                              required
                            />
                          </div>
                          <Btn
                            type="button"
                            color="danger"
                            size="sm"
                            onClick={() => handleRemoveSubItem(index)}
                          >
                            {translate(LANGUAGE_KEYS.common.delete)}
                          </Btn>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </Grid.Col>
              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

PcrPatternContent.defaultData = DEFAULT_PCR_PATTERN_FORM;
