'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, Checkbox } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
import { API_URL } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';

export interface AdminMenuData {
  id?: string | number;
  parentId?: string | null;
  title?: string;
  languageResourceId?: string | null;
  englishCode?: string;
  adminFunctionId?: string | null;
  iconClass?: string;
  sequence?: number | null;
  status?: string | number;
  url?: string;
  isSystemSetting?: boolean;
  childList?: AdminMenuData[];
}

interface ContentProps {
  title: string;
  formData: AdminMenuData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<AdminMenuData>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

interface AdminFunctionOptionResponse {
  text?: string;
  value?: string | number;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const [functionOptions, setFunctionOptions] = useState<{ label: string, value: string }[]>([{ label: translate(LANGUAGE_KEYS.common.noOption), value: '' }]);

  useEffect(() => {
    // Fetch AdminFunctions for dropdown
    const fetchFunctions = async () => {
      try {
        const res = await formPost<AdminFunctionOptionResponse[]>(`${API_URL}/AdminFunction/GetSelectListItems`, {});
        if (res.success && Array.isArray(res.data)) {
          const options = (res.data as AdminFunctionOptionResponse[]).map(item => ({
            label: item.text ?? '',
            value: String(item.value ?? '')
          }));

          setFunctionOptions([{ label: translate(LANGUAGE_KEYS.common.noOption), value: '' }, ...options]);
        }
      } catch (err) {
        console.error("Failed to load functions", err);
      }
    };
    fetchFunctions();
  }, [formPost, translate]);

  const handleAddSubMenu = () => {
    const newList: AdminMenuData[] = [
      ...(formData?.childList || []),
      { title: '', adminFunctionId: '', sequence: 0, status: '1', childList: [] }
    ];
    updateForm({ childList: newList });
  };

  const handleRemoveSubMenu = (index: number) => {
    const newList = [...(formData?.childList || [])];
    newList.splice(index, 1);
    updateForm({ childList: newList });
  };

  const handleSubMenuChange = (index: number, field: keyof AdminMenuData, value: string) => {
    const newList = [...(formData?.childList || [])];
    const currentChild = { ...newList[index] };

    // 如果選擇系統功能且選單名稱為空，自動填入功能名稱
    if (field === 'adminFunctionId' && !currentChild.title && value) {
      const selectedOption = functionOptions.find(opt => opt.value === value);
      if (selectedOption && selectedOption.value !== '') {
        currentChild.title = selectedOption.label;
      }
      currentChild.adminFunctionId = value;
    } else {
    if (field === 'title') currentChild.title = value;
    if (field === 'adminFunctionId') currentChild.adminFunctionId = value;
    if (field === 'iconClass') currentChild.iconClass = value;
    if (field === 'url') currentChild.url = value;
    if (field === 'status') currentChild.status = value;
    }

    newList[index] = currentChild;
    updateForm({ childList: newList });
  };

  return (
    <>
      <FormActionBar
        title={title}
        formId="admin-menu-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="admin-menu-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.adminFunction.heading)}
                    name="title"
                    value={formData?.title || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.adminMenu.title)}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.common.itemCode)}
                    name="englishCode"
                    value={formData?.englishCode || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.itemCode)}
                    maxLength={2}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.status)}
                    name="status"
                    value={formData?.status?.toString() || ''}
                    onChange={onChange}
                    options={[
                      { label: translate(LANGUAGE_KEYS.common.enabled), value: '1' },
                      { label: translate(LANGUAGE_KEYS.common.disabled), value: '0' }
                    ]}
                  />
                </Grid.Col>
                <Grid.Col md={6} className="d-flex align-items-end">
                  <Checkbox
                    name="isSystemSetting"
                    label={translate(LANGUAGE_KEYS.adminMenu.systemSetting)}
                    checked={Boolean(formData?.isSystemSetting)}
                    onChange={onChange}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.adminMenu.systemFunction)}
                    name="adminFunctionId"
                    value={formData?.adminFunctionId || ''}
                    onChange={onChange}
                    options={functionOptions}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.adminMenu.order)}
                    name="sequence"
                    type="number"
                    value={formData?.sequence?.toString() || '0'}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.adminMenu.iconClass)}
                    name="iconClass"
                    value={formData?.iconClass || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.adminMenu.iconClass)}
                  />
                </Grid.Col>

                <Grid.Col md={12}>
                  <label className="form-label fw-bold mt-3">{translate(LANGUAGE_KEYS.adminMenu.includeMenus)}</label>
                  <div className="d-flex flex-column gap-3">
                    {formData?.childList?.map((child, index) => (
                      <Card key={index} className="bg-light">
                        <Card.Body className="p-3 position-relative d-flex align-items-center">

                          <Grid.Row className="g-3 flex-grow-1 align-items-end">
                            <Grid.Col md={2}>
                              <Select
                                label={translate(LANGUAGE_KEYS.adminMenu.systemFunction)}
                                value={child.adminFunctionId || ''}
                                onChange={(e) => handleSubMenuChange(index, 'adminFunctionId', e.target.value)}
                                options={functionOptions}
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Input
                                label={translate(LANGUAGE_KEYS.common.menuName)}
                                value={child.title || ''}
                                onChange={(e) => handleSubMenuChange(index, 'title', e.target.value)}
                                placeholder={translate(LANGUAGE_KEYS.common.menuNamePlaceholder)}
                                required
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Input
                                label={translate(LANGUAGE_KEYS.common.itemCode)}
                                value={child.englishCode || ''}
                                onChange={(e) => handleSubMenuChange(index, 'englishCode', e.target.value.toUpperCase())}
                                placeholder={translate(LANGUAGE_KEYS.common.itemCode)}
                                maxLength={2}
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Input
                                label={translate(LANGUAGE_KEYS.adminMenu.order)}
                                value={child.sequence?.toString() || '0'}
                                onChange={(e) => handleSubMenuChange(index, 'sequence', e.target.value)}
                                placeholder={translate(LANGUAGE_KEYS.adminMenu.order)}
                                required
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Select
                                label={translate(LANGUAGE_KEYS.common.status)}
                                value={child.status?.toString() || ''}
                                onChange={(e) => handleSubMenuChange(index, 'status', e.target.value)}
                                options={[
                                  { label: translate(LANGUAGE_KEYS.common.enabled), value: '1' },
                                  { label: translate(LANGUAGE_KEYS.common.disabled), value: '0' }
                                ]}
                              />
                            </Grid.Col>
                            <Grid.Col md={2} className="text-end">
                              <Btn color="danger" onClick={() => handleRemoveSubMenu(index)}>
                                {translate(LANGUAGE_KEYS.common.delete)}
                              </Btn>
                            </Grid.Col>
                          </Grid.Row>
                        </Card.Body>
                      </Card>
                    ))}

                    <div className="text-center mt-2">
                      <Btn color="primary" onClick={handleAddSubMenu} icon="add">
                        {translate(LANGUAGE_KEYS.adminFunction.more)}
                      </Btn>
                    </div>
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
