'use client';

import React, { useMemo, useState } from 'react';
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
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';

export const DEFAULT_MATERIAL_GROUP_FORM = {
  name: '',
  status: '1' as string | number,
  note: '',
  id: undefined as string | undefined,
  materialList: [] as MaterialGroupMaterial[]
};


export type MaterialGroupData = typeof DEFAULT_MATERIAL_GROUP_FORM;

type MaterialGroupMaterial = Partial<MaterialData> & {
  label?: string;
  value?: string | number;
  name?: string;
};


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
  updateForm: FormUpdate<MaterialGroupData>;
  onSubmit: (e: React.FormEvent, data?: Partial<MaterialGroupData>) => void;
  loading?: boolean;
  submitLabel?: string;
}

interface MaterialSelectApiItem {
  text?: string;
  value?: string | number;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const { translate } = useLanguage();
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialGroupMaterial[] | undefined>();
  const mappedFormMaterials = useMemo(() => formData.materialList.map((material) => {
    if (material.label && material.value && !material.materialNumber && !material.productName) {
      return { id: material.value, value: material.value, label: material.label };
    }

    return {
      id: material.id ?? '',
      value: material.id ?? '',
      label: material.materialNumber && material.productName
        ? `${material.materialNumber} - ${material.productName}`
        : (material.label || material.name || material.productName || material.materialNumber || translate(LANGUAGE_KEYS.common.unnamedItem, '未命名項目')),
    };
  }), [formData.materialList, translate]);
  const displayedMaterials = selectedMaterials ?? mappedFormMaterials;

  // 刪除料號區塊
  const handleRemoveMaterial = (id: string | number) => {
    const updated = displayedMaterials.filter(sm => String(sm.id) !== String(id));
    setSelectedMaterials(updated);
    updateForm({ materialList: updated });
  };

  // 選擇料號時立即更新 formData
  const handleMaterialSelect = (item: DropdownItem) => {
    // 檢查是否已選過
    if (displayedMaterials.some(sm => String(sm.value) === item.value)) {
      return;
    }

    const newItem: MaterialGroupMaterial = {
      id: item.value,
      value: item.value,
      label: item.label,
    };
    const updated = [...displayedMaterials, newItem];
    setSelectedMaterials(updated);
    updateForm({ materialList: updated });
  };

  return (
    <>
      <ActionBar title={title}>
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
                <Input
                  label={translate(LANGUAGE_KEYS.materialGroup.name, '群組名稱')}
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                  placeholder={translate(LANGUAGE_KEYS.materialGroup.name, '請輸入群組名稱')}
                  required
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Select
                  label={translate(LANGUAGE_KEYS.common.status, '狀態')}
                  name="status"
                  value={formData.status || ''}
                  onChange={onChange}
                  options={[
                    { label: translate(LANGUAGE_KEYS.common.enabled, '啟用'), value: '1' },
                    { label: translate(LANGUAGE_KEYS.common.disabled, '停用'), value: '0' }
                  ]}
                />
              </Grid.Col>

              {/* 料號選擇區塊 */}
              <Grid.Col md={12}>
                <Card className="bg-light">
                  <Card.Body>
                    <div className="mb-3">
                      <DropdownInput
                        label={translate(LANGUAGE_KEYS.materialGroup.selectMaterials, '選擇料號')}
                        placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '輸入料號或名稱關鍵字搜尋...')}
                        fetchItems={async (input: string) => {
                          // 根據輸入關鍵字搜尋料號，使用 params 傳遞 keyword
                          // 當 input 為空字串時，也呼叫 API 取得完整列表
                          const res = await api.post<MaterialSelectApiItem[]>(`${API_MAP.MATERIAL_MST}/GetSelectListItems`, {
                            params: { keyword: input || "" }
                          });
                          if (res.success && Array.isArray(res.data)) {
                            return (res.data as MaterialSelectApiItem[]).map((material) => ({
                              label: material.text || '',
                              value: String(material.value ?? '')
                            }));
                          }
                          return [];
                        }}
                        onItemSelect={handleMaterialSelect}
                        debounce={300}
                      />
                    </div>

                    {/* 已選取的料號列表 */}
                    {displayedMaterials.length > 0 && (
                      <div className="mt-3">
                        <label className="form-label fw-bold">{translate(LANGUAGE_KEYS.common.selectedItems, '已選取料號')} ({displayedMaterials.length})</label>
                        <div className="border rounded p-3 bg-white">
                          {displayedMaterials.map((material) => (
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
                                onClick={() => handleRemoveMaterial(material.id ?? material.value ?? '')}
                              >
                                {translate(LANGUAGE_KEYS.common.delete, '刪除')}
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
                  {translate(LANGUAGE_KEYS.common.cancel, '取消')}
                </Btn>
                <Btn type="submit" color="primary" loading={loading} icon="save">
                  {translate(submitLabel, submitLabel)}
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
