'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import FontAwesome from '@packages/components/FontAwsome';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';

export interface AdminFunctionData {
  id?: string | number;
  parentId?: string | null;
  title?: string;
  controller?: string;
  action?: string;
  parameter?: string;
  actionFunctionSN?: number | null;
  status?: string | number;
  childList?: AdminFunctionData[];
}

interface ContentProps {
  title: string;
  formData: AdminFunctionData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<AdminFunctionData>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { translate } = useLanguage();

  const handleAddSubFunction = () => {
    const newList: AdminFunctionData[] = [
      ...(formData.childList || []),
      { title: '', controller: '', action: '', parameter: '', actionFunctionSN: 0, status: '1', childList: [] }
    ];
    updateForm({ childList: newList });
  };

  const handleRemoveSubFunction = (index: number) => {
    const newList = [...(formData.childList || [])];
    newList.splice(index, 1);
    updateForm({ childList: newList });
  };

  const handleSubFunctionChange = (index: number, field: string, value: string) => {
    const newList = [...(formData.childList || [])];
    newList[index] = { ...newList[index], [field]: value };
    updateForm({ childList: newList });
  };

  const handleSetDefaultFunctions = () => {
    const controller = formData.controller || '';
    const defaultFunctions: AdminFunctionData[] = [
      { title: translate(LANGUAGE_KEYS.common.add), controller: controller, action: 'Create', parameter: '', actionFunctionSN: 0, status: '1', childList: [] },
      { title: translate(LANGUAGE_KEYS.common.edit), controller: controller, action: 'Edit', parameter: '', actionFunctionSN: 0, status: '1', childList: [] },
      { title: translate(LANGUAGE_KEYS.common.delete), controller: controller, action: 'Delete', parameter: '', actionFunctionSN: 0, status: '1', childList: [] }
    ];
    updateForm({ childList: defaultFunctions });
  };

  return (
    <>
      <FormActionBar
        title={title}
        formId="admin-function-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="admin-function-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.adminFunction.heading)}
                    name="title"
                    value={formData?.title || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.adminFunction.heading)}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.status)}
                    name="status"
                    value={formData?.status || ''}
                    onChange={onChange}
                    options={[
                      { label: translate(LANGUAGE_KEYS.common.enabled), value: '1' },
                      { label: translate(LANGUAGE_KEYS.common.disabled), value: '0' }
                    ]}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.controller)}
                    name="controller"
                    value={formData?.controller || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.controllerExample)}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.action)}
                    name="action"
                    value={formData?.action || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.actionExample)}
                  />
                </Grid.Col>

                <Grid.Col md={12}>
                  <Input
                    label={translate(LANGUAGE_KEYS.adminFunction.parameter)}
                    name="parameter"
                    value={formData?.parameter || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.adminFunction.parameter)}
                  />
                </Grid.Col>

                {/* 包含功能 (明細) */}
                <Grid.Col md={12}>
                  <div className="mt-4 mb-2 d-flex">
                    <h5 className="fw-bold mb-0">{translate(LANGUAGE_KEYS.adminFunction.includeFunctions)}</h5>
                    <Btn
                      className="ms-3"
                      type="button"
                      color="info"
                      icon="add"
                      size="sm"
                      onClick={handleSetDefaultFunctions}
                    >
                      {translate(LANGUAGE_KEYS.adminFunction.defaultFunction)}
                    </Btn>
                  </div>

                  {(formData?.childList || []).map((sub, index) => (
                    <Card key={index} className="mb-3 bg-light shadow-sm border-0">
                      <Card.Body className="py-3">
                        <div className="d-flex align-items-center gap-3">

                          <div className="flex-grow-1">
                            <Grid.Row className="g-3">
                              <Grid.Col md={4}>
                                <Input
                                  label={translate(LANGUAGE_KEYS.common.functionName)}
                                  required
                                  value={sub.title}
                                  onChange={(e) => handleSubFunctionChange(index, 'title', e.target.value)}
                                  placeholder={translate(LANGUAGE_KEYS.common.functionName)}
                                />
                              </Grid.Col>
                              <Grid.Col md={4}>
                                <Input
                                  label={translate(LANGUAGE_KEYS.common.controller)}
                                  required
                                  value={sub.controller}
                                  onChange={(e) => handleSubFunctionChange(index, 'controller', e.target.value)}
                                  placeholder={translate(LANGUAGE_KEYS.common.controllerExample)}
                                />
                              </Grid.Col>
                              <Grid.Col md={4}>
                                <Input
                                  label={translate(LANGUAGE_KEYS.common.action)}
                                  required
                                  value={sub.action}
                                  onChange={(e) => handleSubFunctionChange(index, 'action', e.target.value)}
                                  placeholder={translate(LANGUAGE_KEYS.common.actionExample)}
                                />
                              </Grid.Col>
                            </Grid.Row>
                          </div>

                          <div className="align-self-end pb-1">
                            <Btn
                              type="button"
                              color="danger"
                              size="sm"
                              onClick={() => handleRemoveSubFunction(index)}
                            >
                              {translate(LANGUAGE_KEYS.common.delete)}
                            </Btn>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}

                  <div className="d-flex justify-content-center mt-3">
                    <Btn
                      type="button"
                      color="primary"
                      icon="add"
                      onClick={handleAddSubFunction}
                    >
                      {translate(LANGUAGE_KEYS.adminFunction.more)}
                    </Btn>
                  </div>
                </Grid.Col>

              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

// 設定靜態屬性以便 FormPageWrapper 讀取
//Content.defaultData = DEFAULT_ADMIN_FUNCTION_FORM;
