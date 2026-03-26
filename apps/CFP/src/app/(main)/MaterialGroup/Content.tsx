'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, DropdownInput, DropdownItem } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { MaterialData } from '@/app/(main)/Material/Content';

export const DEFAULT_MATERIAL_GROUP_FORM = {
  name: '',
  status: '1' as string | number,
  note: '',
  id: undefined as string | undefined,
  materialList: [] as MaterialData[]
};


export type MaterialGroupData = typeof DEFAULT_MATERIAL_GROUP_FORM;


/** 料號下拉選項格式 */
export interface MaterialSelectItem {
  id: string | number;
  materialNumber?: string;
  productModel?: string;
  productName?: string;
  label: string;
  value: string | number;
}

  interface ContentProps {
  title: string;
  formData: MaterialGroupData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, data?: Partial<MaterialGroupData>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialSelectItem[]>([]);

  // 當 formData.materialList 有資料時（編輯模式載入），轉換並設定到 selectedMaterials 和 formData
  React.useEffect(() => {
    if (formData.materialList && formData.materialList.length > 0) {
      const mapped = formData.materialList.map((m: MaterialData) => {
        let labelText = String(m.id);
        if (m.materialNumber && m.productName) {
          labelText = `${m.materialNumber} - ${m.productName}`;
        } else if (m.materialNumber) {
          labelText = m.materialNumber;
        } else if (m.productName) {
          labelText = m.productName;
        }

        return {
          id: m.id ?? '',
          value: m.id ?? '',
          label: labelText,
          materialNumber: m.materialNumber,
          productModel: m.productModel,
          productName: m.productName,
        };
      });
      setSelectedMaterials(mapped);
    }
  }, [formData.materialList]);

  // 刪除料號區塊
  const handleRemoveMaterial = (id: string | number) => {
    const updated = selectedMaterials.filter(sm => String(sm.id) !== String(id));
    setSelectedMaterials(updated);
    // 同步更新 formData
    onChange({ target: { name: 'materialList', value: updated } } as any);
  };

  // 選擇料號時立即更新 formData
  const handleMaterialSelect = (item: DropdownItem) => {
    // 檢查是否已選過
    if (selectedMaterials.some(sm => String(sm.value) === item.value)) {
      return;
    }
    const newItem: MaterialSelectItem = {
      id: item.value,
      value: item.value,
      label: item.label,
    };
    const updated = [...selectedMaterials, newItem];
    setSelectedMaterials(updated);
    // 立即同步到 formData
    onChange({ target: { name: 'materialList', value: updated } } as any);
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
                  label="群組名稱"
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                  placeholder="請輸入群組名稱"
                  required
                />
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Select
                  label="狀態"
                  name="status"
                  value={formData.status || ''}
                  onChange={onChange}
                  options={[
                    { label: '啟用', value: '1' },
                    { label: '停用', value: '0' }
                  ]}
                />
              </Grid.Col>

              <Grid.Col md={12}>
                <div className="mb-3">
                  <label className="form-label">備註</label>
                  <textarea
                    className="form-control"
                    name="note"
                    rows={3}
                    value={formData.note || ''}
                    onChange={onChange}
                    placeholder="其他補充說明"
                  />
                </div>
              </Grid.Col>

              {/* 料號選擇區塊 */}
              <Grid.Col md={12}>
                <Card className="bg-light">
                  <Card.Body>
                    <div className="mb-3">
                      <DropdownInput
                        label="選擇料號"
                        placeholder="輸入料號或名稱關鍵字搜尋..."
                        fetchItems={async (input: string) => {
                          // 根據輸入關鍵字搜尋料號，使用 params 傳遞 keyword
                          // 當 input 為空字串時，也呼叫 API 取得完整列表
                          const res = await api.post<any[]>(`${API_MAP.MATERIAL_MST}/GetSelectListItems`, { 
                            params: { keyword: input || "" }
                          });
                          if (res.success && res.data) {
                            return res.data.map((m: any) => ({
                              label: m.text || m.label || String(m.value),
                              value: m.value
                            }));
                          }
                          return [];
                        }}
                        onItemSelect={handleMaterialSelect}
                        debounce={300}
                      />
                    </div>

                    {/* 已選取的料號列表 */}
                    {selectedMaterials.length > 0 && (
                      <div className="mt-3">
                        <label className="form-label fw-bold">已選取料號 ({selectedMaterials.length})</label>
                        <div className="border rounded p-3 bg-white">
                          {selectedMaterials.map((material, index) => (
                            <div
                              key={material.id}
                              className="d-flex align-items-center justify-content-between py-2 px-2 mb-2 bg-light rounded"
                            >
                              <span className="text-truncate flex-grow-1 me-3">
                                {material.label}
                              </span>
                              <Btn
                                type="button"
                                color="danger"
                                size="sm"
                                icon="delete"
                                onClick={() => handleRemoveMaterial(material.id)}
                              >
                                刪除
                              </Btn>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Grid.Col>

              <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                <Btn type="button" color="secondary" outline onClick={() => router.push('/MaterialGroup')}>
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

Content.defaultData = DEFAULT_MATERIAL_GROUP_FORM;
