'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import FontAwesome from '@packages/components/FontAwsome';
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';

export interface AdminMenuData {
  id?: string | number;
  parentId?: string | null;
  title?: string;
  adminFunctionId?: string | null;
  iconClass?: string;
  sequence?: number | null;
  status?: string | number;
  url?: string;
  childList?: AdminMenuData[];
}

interface ContentProps {
  title: string;
  formData: AdminMenuData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const [functionOptions, setFunctionOptions] = useState<{ label: string, value: string }[]>([{ label: '無', value: '' }]);

  useEffect(() => {
    // Fetch AdminFunctions for dropdown
    const fetchFunctions = async () => {
      try {
        const res = await formPost(`${API_URL}/AdminFunction/GetSelectListItems`, {});
        if (res.success && res.data) {
          const options = res.data.map((item: any) => ({
            label: item.text,
            value: item.value
          }));

          setFunctionOptions([{ label: '無', value: '' }, ...options]);
        }
      } catch (err) {
        console.error("Failed to load functions", err);
      }
    };
    fetchFunctions();
  }, [formPost]);

  const handleAddSubMenu = () => {
    const newList: AdminMenuData[] = [
      ...(formData?.childList || []),
      { title: '', adminFunctionId: '', sequence: 0, status: '1', childList: [] }
    ];
    onChange({ target: { name: 'childList', value: newList } } as any);
  };

  const handleRemoveSubMenu = (index: number) => {
    const newList = [...(formData?.childList || [])];
    newList.splice(index, 1);
    onChange({ target: { name: 'childList', value: newList } } as any);
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
      (currentChild as any)[field] = value;
    }

    newList[index] = currentChild;
    onChange({ target: { name: 'childList', value: newList } } as any);
  };

  return (
    <>
      <ActionBar title={title}>
        <div className="ms-auto d-flex gap-2">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel" disabled={loading}>
            返回列表
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
                    label="標題"
                    name="title"
                    value={formData?.title || ''}
                    onChange={onChange}
                    placeholder="例如: 系統管理"
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label="狀態"
                    name="status"
                    value={formData?.status?.toString() || ''}
                    onChange={onChange}
                    options={[
                      { label: '啟用', value: '1' },
                      { label: '停用', value: '0' }
                    ]}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Select
                    label="系統功能"
                    name="adminFunctionId"
                    value={formData?.adminFunctionId || ''}
                    onChange={onChange}
                    options={functionOptions}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label="順序"
                    name="sequence"
                    type="number"
                    value={formData?.sequence?.toString() || '0'}
                    onChange={onChange}
                    required
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label="圖示Class"
                    name="iconClass"
                    value={formData?.iconClass || ''}
                    onChange={onChange}
                    placeholder="例如: fas fa-cog"
                  />
                </Grid.Col>

                <Grid.Col md={12}>
                  <label className="form-label fw-bold mt-3">包含選單</label>
                  <div className="d-flex flex-column gap-3">
                    {formData?.childList?.map((child, index) => (
                      <Card key={index} className="bg-light">
                        <Card.Body className="p-3 position-relative d-flex align-items-center">

                          <Grid.Row className="g-3 flex-grow-1 align-items-end">
                            <Grid.Col md={3}>
                              <Select
                                label="系統功能"
                                value={child.adminFunctionId || ''}
                                onChange={(e) => handleSubMenuChange(index, 'adminFunctionId', e.target.value)}
                                options={functionOptions}
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Input
                                label="選單名稱"
                                value={child.title || ''}
                                onChange={(e) => handleSubMenuChange(index, 'title', e.target.value)}
                                placeholder="選單名稱"
                                required
                              />
                            </Grid.Col>
                            <Grid.Col md={2}>
                              <Input
                                label="順序"
                                value={child.sequence?.toString() || '0'}
                                onChange={(e) => handleSubMenuChange(index, 'sequence', e.target.value)}
                                placeholder="順序"
                                required
                              />
                            </Grid.Col>
                            <Grid.Col md={3}>
                              <Select
                                label="狀態"
                                value={child.status?.toString() || ''}
                                onChange={(e) => handleSubMenuChange(index, 'status', e.target.value)}
                                options={[
                                  { label: '啟用', value: '1' },
                                  { label: '停用', value: '0' }
                                ]}
                              />
                            </Grid.Col>
                            <Grid.Col md={2} className="text-end">
                              <Btn color="danger" onClick={() => handleRemoveSubMenu(index)}>
                                刪除
                              </Btn>
                            </Grid.Col>
                          </Grid.Row>
                        </Card.Body>
                      </Card>
                    ))}

                    <div className="text-center mt-2">
                      <Btn color="primary" onClick={handleAddSubMenu} icon="add">
                        更多
                      </Btn>
                    </div>
                  </div>
                </Grid.Col>

                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/AdminMenu')}>
                    取消
                  </Btn>
                  <Btn type="submit" color="primary" loading={loading} icon="save">
                    {submitLabel}
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
