'use client';

import React, { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, DropdownInput, DropdownItem } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';


interface MaterialCompare {
  materialId: string,
  supplierName: string,
  supplierTaxID: string,
  buyerMaterialId: string,
  buyerMaterialNumber?: string,
  buyerSpecNumber?: string,
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

const formatSupplierMaterialLabel = (payload: {
  supplierName?: unknown;
  supplierTaxID?: unknown;
  materialNumber?: unknown;
  fallbackText?: unknown;
}) => {
  const supplierName = String(payload.supplierName ?? '').trim();
  const supplierTaxID = String(payload.supplierTaxID ?? '').trim();
  const materialNumber = String(payload.materialNumber ?? '').trim();
  const fallbackText = String(payload.fallbackText ?? '').replace(/\s*-\s*未對照$/, '').trim();

  if (supplierName || supplierTaxID || materialNumber) {
    const left = `${supplierName}${supplierTaxID ? `(${supplierTaxID})` : ''}`.trim();
    if (left && materialNumber) {
      return `${left} - ${materialNumber}`;
    }
    if (left) {
      return left;
    }
    return materialNumber;
  }

  return fallbackText;
};

interface KeywordSelectItem {
  value?: string | number;
  id?: string | number;
  materialId?: string | number;
  buyerMaterialId?: string | number;
  text?: string;
  Text?: string;
  label?: string;
  name?: string;
  supplierName?: string;
  supplierTaxID?: string;
  taxID?: string;
  materialNumber?: string;
  buyerMaterialNumber?: string;
  materialNo?: string;
  number?: string;
  supplier?: { name?: string; taxID?: string };
}

const resolveKeywordSelectItemLabel = (item: KeywordSelectItem) => formatSupplierMaterialLabel({
  supplierName: item.supplierName ?? item.name ?? item.supplier?.name,
  supplierTaxID: item.supplierTaxID ?? item.taxID ?? item.supplier?.taxID,
  materialNumber: item.materialNumber ?? item.buyerMaterialNumber ?? item.materialNo ?? item.number,
  fallbackText: item.label ?? item.text ?? item.name ?? item.materialNumber ?? item.buyerMaterialNumber,
});

interface ContentProps {
  title: string;
  formData: FormModel;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<FormModel>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('id');
  const [selectedSuppliers, setSelectedSuppliers] = useState<SupplierSelectItem[] | undefined>();
  const { translate } = useLanguage();

  const mappedFormSuppliers = useMemo(() => formData.materialCompareList.map((item) => ({
    id: item.buyerMaterialId,
    value: item.buyerMaterialId,
    label: formatSupplierMaterialLabel({
      supplierName: item.supplierName,
      supplierTaxID: item.supplierTaxID,
      materialNumber: item.buyerMaterialNumber,
    }),
  })), [formData.materialCompareList]);
  const displayedSuppliers = selectedSuppliers ?? mappedFormSuppliers;

  // 將 supplierSelectItem[] 轉換為 MaterialCompare[] 的統一函數
  const syncMaterialCompareList = (suppliers: SupplierSelectItem[]) => {
    const materialCompareList: MaterialCompare[] = suppliers.map(sm => ({
      materialId: String(parentId),
      buyerMaterialId: String(sm.id),
      supplierName: '',
      supplierTaxID: '',
    }));
    updateForm({ materialCompareList });
  };

  const handleRemoveSupplier = (id: string | number) => {
    const updated = displayedSuppliers.filter(sm => String(sm.id) !== String(id));
    setSelectedSuppliers(updated);
    syncMaterialCompareList(updated);
  };

  const handleMaterialSelect = (item: DropdownItem) => {
    // 檢查是否已選過
    if (displayedSuppliers.some(sm => String(sm.value) === item.value)) {
      return;
    }

    const newItem: SupplierSelectItem = {
      id: item.value,
      value: item.value,
      label: item.label,
    };
    const updated = [...displayedSuppliers, newItem];
    setSelectedSuppliers(updated);
    syncMaterialCompareList(updated);
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

                <Grid.Col md={12}>
                  <Card className="bg-light">
                    <Card.Body>
                      <div className="mb-3">
                        <DropdownInput
                          label={translate(LANGUAGE_KEYS.sellerCompare.selectSupplierMaterial, '選擇供應商/料號')}
                          placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '輸入統編、料號或名稱關鍵字搜尋...')}
                          fetchItems={async (input: string) => {
                            const res = await api.post<KeywordSelectItem[]>(`${API_URL}/Material/GetKeywordSelectListItems`, {
                              params: { keyword: input || "" }
                            });
                            if (res.success && Array.isArray(res.data)) {
                              return (res.data as KeywordSelectItem[]).map((item) => ({
                                value: String(item.value ?? item.id ?? item.materialId ?? item.buyerMaterialId ?? ''),
                                label: item.text ?? item.Text ?? resolveKeywordSelectItemLabel(item),
                              }));
                            }
                            return [];
                          }}
                          onItemSelect={handleMaterialSelect}
                          debounce={300}
                        />
                      </div>

                      {displayedSuppliers.length > 0 && (
                        <div className="mt-3">
                          <label className="form-label fw-bold">{translate(LANGUAGE_KEYS.common.selectedItems, '已選取料號')} ({displayedSuppliers.length})</label>
                          <div className="border rounded p-3 bg-white">
                            {displayedSuppliers.map((supplier) => (
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

                <Grid.Col md={12} className="col-md-12 d-flex justify-content-end gap-2 mt-4">

                  <div className="d-flex justify-content-end gap-2">
                    <Btn type="submit" color="primary" loading={loading} icon="save">
                      {translate(submitLabel, submitLabel)}
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
