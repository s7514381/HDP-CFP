'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import Badge from '@packages/components/bootstrap5/Badges';
import { SpinnerBorder } from '@packages/components/bootstrap5/Spinner';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';

// 買方料號狀態 (與 API 一致：0=停用, 1=啟用)
type BuyerStatus = 0 | 1;

// 規格碼介面 (左側) - 對應後端 MaterialSpec
interface MaterialSpec {
  id: string;
  materialCompareId: string;  
  materialId: string;  
  name: string;          // 對應後端 Name = sellerProductName
  specNumber: string;   // 對應後端 SpecNumber = materialNumber + 流水號
  productModel: string; // 供顯示用的產品型號
  status: BuyerStatus;
  selected: boolean;
}

// 買方料號介面 (右側) - 來自 API 回應
interface BuyerMaterialItem {
  supplierId: string;
  materialNumber: string;
  sellerMaterialNumber: string;
  productModel: string;
  productName: string;
  sellerProductName: string;
  id: string;
  status: BuyerStatus;
  sequence: number | null;
  selected: boolean;
}

// 表單資料格式 (用於 FormPageWrapper)
export interface BuyerCompareFormData {
  id: string;
  materialNumber: string;
  productName: string;
  productModel: string;
  supplierName: string;
  materialSpecList: MaterialSpec[];
}

interface ContentProps {
  title: string;
  formData: BuyerCompareFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  submitLabel?: string;
}

// 預設空陣列
const EMPTY_MATERIALS: BuyerMaterialItem[] = [];
const EMPTY_SPECS: MaterialSpec[] = [];

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('id');

  // 右側料號資料 (來自 API)
  const [materials, setMaterials] = useState<BuyerMaterialItem[]>(EMPTY_MATERIALS);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  // 左側規格碼資料
  const [specs, setSpecs] = useState<MaterialSpec[]>(EMPTY_SPECS);

  // ✅ 用 ref 追蹤上次同步的 specs（用於判斷是否真正改變）
  const lastSyncedRef = useRef<string>('[]');

  // 取得買方料號列表
  const fetchBuyerMaterials = useCallback(async () => {
    if (!materialId) return;

    setMaterialsLoading(true);
    setMaterialsError(null);

    try {
      // BUYER_MATERIAL_LIST 是完整路徑，直接使用
      const url = `${API_MAP.BUYER_MATERIAL_LIST}?id=${materialId}`;
      const res = await api.post(url);

      if (res.success && res.data) {
        const mappedItems: BuyerMaterialItem[] = res.data.map((item: BuyerMaterialItem) => ({
          ...item,
          selected: false,
        }));
        setMaterials(mappedItems);
      } else {
        setMaterialsError(res.message || '取得料號資料失敗');
      }
    } catch {
      setMaterialsError('網路錯誤，請稍後再試');
    } finally {
      setMaterialsLoading(false);
    }
  }, [materialId]);

  // ✅ 初始化：只在初次 mount 且 formData 有資料時執行一次
  useEffect(() => {
    if (formData?.materialSpecList) {
      const initialSpecs = formData.materialSpecList.map((spec) => ({
        ...spec,
        selected: false,
      }));
      setSpecs(initialSpecs);
      // 更新 ref 避免初始化後觸發同步
      lastSyncedRef.current = JSON.stringify(initialSpecs.map(({ selected: _s, ...rest }) => rest));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在 mount 時執行一次

  useEffect(() => {
    fetchBuyerMaterials();
  }, []);

  // ✅ 自動同步：當 specs 真正改變時，自動同步到 formData（不含 selected 欄位）
  // 使用 JSON.stringify 比對，避免因 onChange 函式實體改變而觸發
  useEffect(() => {
    // 排除 selected 後的資料
    const specsForSync = specs.map(({ selected: _ignored, ...rest }) => rest);
    const currentJson = JSON.stringify(specsForSync);

    // 只有當資料真正改變時才同步
    if (currentJson !== lastSyncedRef.current) {
      lastSyncedRef.current = currentJson;
      onChange({ target: { name: 'materialSpecList', value: specsForSync } });
    }
  }, [specs, onChange]);

  // 產生規格碼 - 對應後端 MaterialSpec
  // Name = sellerProductName, SpecNumber = materialNumber + 流水號
  const handleGenerateSpec = useCallback((item: BuyerMaterialItem) => {
    // 檢查是否已存在相同 specNumber 的規格碼
    if (specs.some((s) => s.materialCompareId === item.id)) {
      alert('此料號已產生規格碼，請勿重複產生');
      return;
    }

    const sequenceNum = String(specs.length + 1).padStart(3, '0');
    const newSpecNumber = `${item.materialNumber}-${sequenceNum}`;

    // ✅ 產生新的 GUID 作為 id
    const newSpec: MaterialSpec = {
      id: crypto.randomUUID(),
      materialCompareId: item.id, // 對應後端 MaterialId = BuyerMaterialItem.id
      materialId: materialId ?? '', // 新增 materialId 欄位，對應後端 MaterialId
      name: item.sellerProductName,           // 對應後端 Name
      specNumber: newSpecNumber, // 對應後端 SpecNumber
      productModel: item.productModel, // 顯示用產品型號
      status: 1 as BuyerStatus,
      selected: false,
    };

    // ✅ 直接更新 local state，useEffect 會自動同步到 formData
    setSpecs((prev) => [...prev, newSpec]);
  }, [specs]);

  // 批次操作：全選/取消選取
  const toggleAll = useCallback((type: 'left' | 'right', selected: boolean) => {
    if (type === 'left') {
      setSpecs((prev) => prev.map((s) => ({ ...s, selected })));
    } else {
      setMaterials((prev) => prev.map((m) => ({ ...m, selected })));
    }
  }, []);

  // 批次操作：變更狀態
  const changeStatus = useCallback((type: 'left' | 'right', status: BuyerStatus) => {
    if (type === 'left') {
      // ✅ 直接更新 local state，useEffect 會自動同步到 formData
      setSpecs((prev) => prev.map((s) => (s.selected ? { ...s, status } : s)));
    } else {
      setMaterials((prev) =>
        prev.map((m) => (m.selected ? { ...m, status } : m))
      );
    }
  }, []);

  // 刪除選中的規格碼
  const handleDeleteSelectedSpecs = useCallback(() => {
    // ✅ 直接更新 local state，useEffect 會自動同步到 formData
    setSpecs((prev) => prev.filter((s) => !s.selected));
  }, []);

  return (
    <>
      <ActionBar title={title || '買方料號對照'}>
        <div className="ms-auto">
          <Btn
            color="secondary"
            outline
            onClick={() => router.back()}
            icon="cancel"
          >
            返回列表
          </Btn>
        </div>
      </ActionBar>

      <Container className="py-4">
        <form onSubmit={onSubmit}>
          {/* 標題與資訊 */}
          <div className="mb-3">
            <h4 className="mb-0">
              料號 {formData?.materialNumber}
              <span className="text-primary ms-5">{formData?.productName}</span>
            </h4>
            <div className="text-muted small">
              <i className="bi bi-people me-1"></i> {formData?.supplierName}
            </div>
          </div>

          <Grid.Row gutter={3}>
          {/* 左側：規格碼區塊 */}
          <Grid.Col md={6}>
            <Card className="h-100">
              <div className="p-3">
                <div className="d-flex gap-1 mb-3 flex-wrap">
                  <Btn
                    size="sm"
                    color="warning"
                    onClick={() => toggleAll('left', true)}
                  >
                    全選
                  </Btn>
                  <Btn
                    size="sm"
                    color="secondary"
                    onClick={() => toggleAll('left', false)}
                  >
                    取消選取
                  </Btn>
                  <Btn
                    size="sm"
                    color="danger"
                    onClick={() => changeStatus('left', 0 as BuyerStatus)}
                  >
                    停用
                  </Btn>
                  <Btn
                    size="sm"
                    color="success"
                    onClick={() => changeStatus('left', 1 as BuyerStatus)}
                  >
                    啟用
                  </Btn>
                  <Btn
                    size="sm"
                    color="danger"
                    outline
                    disabled={!specs.some((s) => s.selected)}
                    onClick={handleDeleteSelectedSpecs}
                  >
                    刪除選中
                  </Btn>
                </div>

                <div className="list-group">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      className={`list-group-item border rounded mb-2 p-3 cursor-pointer ${
                        spec.status === 0
                          ? 'bg-light text-muted'
                          : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div style={{ width: '70%' }}>
                          <div className="fw-bold d-flex align-items-center">
                            <i className="bi bi-caret-right-fill me-1"></i>
                            {formData?.productModel}
                          </div>
                          <input
                            type="text"
                            className={`form-control form-control-sm my-1 ${
                              spec.status === 0 ? '' : 'text-primary'
                            }`}
                            value={spec.name}
                            onChange={(e) =>
                              setSpecs((prev) =>
                                prev.map((s) =>
                                  s.id === spec.id
                                    ? { ...s, name: e.target.value }
                                    : s
                                )
                              )
                            }
                          />
                          <div className="text-muted small">
                            {spec.specNumber}
                          </div>
                        </div>
                        <div className="d-flex flex-column align-items-end">
                          <input
                            type="checkbox"
                            className="form-check-input mb-3"
                            checked={spec.selected}
                            onChange={(e) =>
                              setSpecs((prev) =>
                                prev.map((s) =>
                                  s.id === spec.id
                                    ? { ...s, selected: e.target.checked }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {specs.length === 0 && (
                    <div className="text-center text-muted py-5">
                      尚無規格碼，請由右側產生
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Grid.Col>

          {/* 右側：料號區塊 */}
          <Grid.Col md={6}>
            <Card className="h-100">
              <div className="p-3">
                <div className="d-flex gap-1 mb-3 flex-wrap">
                  <Btn
                    size="sm"
                    color="warning"
                    onClick={() => toggleAll('right', true)}
                  >
                    全選
                  </Btn>
                  <Btn
                    size="sm"
                    color="secondary"
                    onClick={() => toggleAll('right', false)}
                  >
                    取消選取
                  </Btn>
                  <Btn
                    size="sm"
                    color="danger"
                    onClick={() => changeStatus('right', 0 as BuyerStatus)}
                  >
                    停用
                  </Btn>
                  <Btn
                    size="sm"
                    color="success"
                    onClick={() => changeStatus('right', 1 as BuyerStatus)}
                  >
                    啟用
                  </Btn>
                </div>

                <div className="list-group">
                  {materialsLoading && (
                    <div className="text-center py-5">
                      <SpinnerBorder full={false} />
                      <div className="mt-2 text-muted small">載入料號資料...</div>
                    </div>
                  )}

                  {materialsError && (
                    <div className="text-center py-5">
                      <div className="text-danger small">{materialsError}</div>
                      <Btn
                        size="sm"
                        color="primary"
                        outline
                        className="mt-2"
                        onClick={fetchBuyerMaterials}
                      >
                        重新載入
                      </Btn>
                    </div>
                  )}

                  {!materialsLoading && !materialsError && materials.length === 0 && (
                    <div className="text-center text-muted py-5">
                      尚無料號資料
                    </div>
                  )}

                  {!materialsLoading &&
                    !materialsError &&
                    materials.map((item) => (
                      <div
                        key={item.id}
                        className={`list-group-item border rounded mb-2 p-3 ${
                          item.status === 0
                            ? 'bg-light text-muted opacity-75'
                            : ''
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between">
                              <span className="fw-bold">
                                {item.productModel}
                              </span>
                              <span className="text-muted small">
                                {item.productName}
                              </span>
                            </div>
                            <div
                              className={`small my-1 ${
                                item.status === 0 ? '' : 'text-primary'
                              }`}
                            >
                              {item.sellerProductName}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted small">{formData?.materialNumber}</span>
                              <span className="small">
                                供 {item.sellerMaterialNumber}
                              </span>
                            </div>
                          </div>
                          <div className="d-flex flex-column align-items-end ms-3">
                            <input
                              type="checkbox"
                              className="form-check-input mb-3"
                              checked={item.selected}
                              onChange={(e) =>
                                setMaterials((prev) =>
                                  prev.map((m) =>
                                    m.id === item.id
                                      ? { ...m, selected: e.target.checked }
                                      : m
                                  )
                                )
                              }
                            />
                            <Btn
                              size="sm"
                              color={item.status === 0 ? 'secondary' : 'success'}
                              className="py-0 px-1"
                              style={{ fontSize: '0.75rem' }}
                              disabled={item.status === 0}
                              onClick={() => handleGenerateSpec(item)}
                            >
                              + 產生規格碼
                            </Btn>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </Grid.Col>
          </Grid.Row>

          {/* 提交按鈕 */}
          <div className="d-flex justify-content-end mt-4 gap-2">
            <Btn type="submit" color="primary" loading={loading} icon="save">
              {submitLabel}
            </Btn>
          </div>
        </form>
      </Container>
    </>
  );
}

// 導出 defaultData 供 FormPageWrapper 使用
//Content.defaultData = DEFAULT_BuyerCompare;
