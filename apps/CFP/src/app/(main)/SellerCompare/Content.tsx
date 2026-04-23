'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, DropdownInput, DropdownItem } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP,API_URL } from '@/lib/apiRoutes';


interface MaterialCompare {
  materialId: string,
  supplierName: string,
  supplierTaxID: string,
  buyerMaterialId: string,
  buyerMaterialNumber?: string,
};

export const DEFAULT_BuyerCompare = {
  materialCompareList: [] as MaterialCompare[],
};

export type FormModel = typeof DEFAULT_BuyerCompare;

export interface SupplierSelectItem {
  id: string;
  label: string;
  value: string | number;
}

interface ContentProps {
  title: string;
  formData: FormModel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('id');
  const [selectedSuppliers, setSelectedSuppliers] = useState<SupplierSelectItem[]>([]);

  // 當 formData.materialCompareList 從外部載入時（初始化），同步到 selectedSuppliers
  // 使用 ref 確保只在初始載入時同步一次，避免覆蓋使用者已選的資料
  const isInitialized = useRef(false);
  
  useEffect(() => {
    // 只有當 selectedSuppliers 為空且有資料時才初始化（首次載入）
    if (selectedSuppliers.length === 0 && formData.materialCompareList && formData.materialCompareList.length > 0) {
      const mapped = formData.materialCompareList.map((item: MaterialCompare) => ({
        id: item.buyerMaterialId,
        value: item.buyerMaterialId,
        label: `${item.supplierName}(${item.supplierTaxID}) - ${item.buyerMaterialNumber}`, 
      }));
      setSelectedSuppliers(mapped);
      isInitialized.current = true;
    }
  }, [formData.materialCompareList]);

  // 將 supplierSelectItem[] 轉換為 MaterialCompare[] 的統一函數
  const syncMaterialCompareList = (suppliers: SupplierSelectItem[]) => {
    const materialCompareList: MaterialCompare[] = suppliers.map(sm => ({
      materialId: String(parentId),
      buyerMaterialId: String(sm.id),
      supplierName: '',
      supplierTaxID: '',
    }));
    onChange({ target: { name: 'materialCompareList', value: materialCompareList } } as any);
  };

  const handleRemoveSupplier = (id: string | number) => {
    const updated = selectedSuppliers.filter(sm => String(sm.id) !== String(id));
    setSelectedSuppliers(updated);
    syncMaterialCompareList(updated);
  };

  const handleMaterialSelect = (item: DropdownItem) => {
    // 檢查是否已選過
    if (selectedSuppliers.some(sm => String(sm.value) === item.value)) {
      return;
    }

    const newItem: SupplierSelectItem = {
      id: item.value,
      value: item.value,
      label: item.label,
    };
    const updated = [...selectedSuppliers, newItem];
    setSelectedSuppliers(updated);
    syncMaterialCompareList(updated);
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

                <Grid.Col md={12}>
                  <Card className="bg-light">
                    <Card.Body>
                      <div className="mb-3">
                        <DropdownInput
                          label="選擇供應商/料號"
                          placeholder="輸入統編、料號或名稱關鍵字搜尋..."
                          fetchItems={async (input: string) => {
                            // 根據輸入關鍵字搜尋料號，使用 params 傳遞 keyword
                            // 當 input 為空字串時，也呼叫 API 取得完整列表
                            const res = await api.post(`${API_URL}/Material/GetKeywordSelectListItems`, {
                              params: { keyword: input || "" }
                            });
                            if (res.success && res.data) {
                              return res.data.map((m: any) => ({
                                label: m.text,
                                value: m.value
                              }));
                            }
                            return [];
                          }}
                          onItemSelect={handleMaterialSelect}
                          debounce={300}
                        />
                      </div>

                      {selectedSuppliers.length > 0 && (
                        <div className="mt-3">
                          <label className="form-label fw-bold">已選取料號 ({selectedSuppliers.length})</label>
                          <div className="border rounded p-3 bg-white">
                            {selectedSuppliers.map((supplier, index) => (
                              <div
                                key={supplier.id}
                                className="d-flex align-items-center justify-content-between py-2 px-2 mb-2 bg-light rounded"
                              >
                                <div className="d-flex align-items-center flex-grow-1 me-3 gap-2">
                                  <span >
                                    {supplier.label}
                                  </span>
                                  
                                </div>
                                <Btn
                                  type="button"
                                  color="danger"
                                  size="sm"
                                  icon="delete"
                                  onClick={() => handleRemoveSupplier(supplier.id)}
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

                <Grid.Col md={12} className="col-md-12 d-flex justify-content-end gap-2 mt-4">

                  <div className="d-flex justify-content-end gap-2">
                    <Btn type="submit" color="primary" loading={loading} icon="save">
                      {submitLabel}
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

Content.defaultData = DEFAULT_BuyerCompare;
