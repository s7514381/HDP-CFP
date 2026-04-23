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
import FontAwesome from '@packages/components/FontAwsome';

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
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();

  const handleAddSubFunction = () => {
    const newList: AdminFunctionData[] = [
      ...(formData.childList || []),
      { title: '', controller: '', action: '', parameter: '', actionFunctionSN: 0, status: '1', childList: [] }
    ];
    onChange({ target: { name: 'childList', value: newList } } as any);
  };

  const handleRemoveSubFunction = (index: number) => {
    const newList = [...(formData.childList || [])];
    newList.splice(index, 1);
    onChange({ target: { name: 'childList', value: newList } } as any);
  };

  const handleSubFunctionChange = (index: number, field: string, value: string) => {
    const newList = [...(formData.childList || [])];
    newList[index] = { ...newList[index], [field]: value };
    onChange({ target: { name: 'childList', value: newList } } as any);
  };

  const handleSetDefaultFunctions = () => {
    const controller = formData.controller || '';
    const defaultFunctions: AdminFunctionData[] = [
      { title: '新增', controller: controller, action: 'Create', parameter: '', actionFunctionSN: 0, status: '1', childList: [] },
      { title: '編輯', controller: controller, action: 'Edit', parameter: '', actionFunctionSN: 0, status: '1', childList: [] },
      { title: '刪除', controller: controller, action: 'Delete', parameter: '', actionFunctionSN: 0, status: '1', childList: [] }
    ];
    onChange({ target: { name: 'childList', value: defaultFunctions } } as any);
  };

  return (
    <>
      <ActionBar title={title}>
        <div className="ms-auto">
          <Btn color="secondary" outline onClick={() => router.back()} icon="cancel">
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
                    placeholder="請輸入功能標題"
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Select
                    label="狀態"
                    name="status"
                    value={formData?.status || ''}
                    onChange={onChange}
                    options={[
                      { label: '啟用', value: '1' },
                      { label: '停用', value: '0' }
                    ]}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label="Controller"
                    name="controller"
                    value={formData?.controller || ''}
                    onChange={onChange}
                    placeholder="例如: Companies"
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label="Action"
                    name="action"
                    value={formData?.action || ''}
                    onChange={onChange}
                    placeholder="例如: Index"
                    required
                  />
                </Grid.Col>

                <Grid.Col md={12}>
                  <Input
                    label="參數"
                    name="parameter"
                    value={formData?.parameter || ''}
                    onChange={onChange}
                    placeholder="請輸入參數"
                  />
                </Grid.Col>

                {/* 包含功能 (明細) */}
                <Grid.Col md={12}>
                  <div className="mt-4 mb-2 d-flex">
                    <h5 className="fw-bold mb-0">包含功能</h5>
                    <Btn
                      className="ms-3"
                      type="button"
                      color="info"
                      icon="add"
                      size="sm"
                      onClick={handleSetDefaultFunctions}
                    >
                      預設功能
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
                                  label="功能名稱"
                                  required
                                  value={sub.title}
                                  onChange={(e) => handleSubFunctionChange(index, 'title', e.target.value)}
                                  placeholder="例如: 新增"
                                />
                              </Grid.Col>
                              <Grid.Col md={4}>
                                <Input
                                  label="Controller"
                                  required
                                  value={sub.controller}
                                  onChange={(e) => handleSubFunctionChange(index, 'controller', e.target.value)}
                                  placeholder="例如: Companies"
                                />
                              </Grid.Col>
                              <Grid.Col md={4}>
                                <Input
                                  label="Action"
                                  required
                                  value={sub.action}
                                  onChange={(e) => handleSubFunctionChange(index, 'action', e.target.value)}
                                  placeholder="例如: Create"
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
                              刪除
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
                      更多
                    </Btn>
                  </div>
                </Grid.Col>

                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/AdminFunction')}>
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

// 設定靜態屬性以便 FormPageWrapper 讀取
//Content.defaultData = DEFAULT_ADMIN_FUNCTION_FORM;
