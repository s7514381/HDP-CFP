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
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';

export const DEFAULT_MATERIAL_FORM = {
  supplierId: null as string | null,
  materialNumber: '',
  productModel: '',
  productName: '',
};

export type MaterialData = typeof DEFAULT_MATERIAL_FORM & {
  id?: string | number;
};

interface ContentProps {
  title: string;
  formData: MaterialData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const [suppliers, setSuppliers] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.post<any[]>(API_MAP.SUPPLIER_GET_SELECT_LIST, { body: {} }).then(res => {
      if (res.success && res.data) {
        setSuppliers(res.data);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <Select
                    label="供應商"
                    name="supplierId"
                    value={formData.supplierId || ''}
                    onChange={onChange}
                    options={[
                      { label: '請選擇供應商', value: '' },
                      ...(suppliers?.map((s: any) => ({ label: s.text || s.name, value: s.value || s.id })) || [])
                    ]}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label="料號"
                    name="materialNumber"
                    value={formData.materialNumber || ''}
                    onChange={onChange}
                    placeholder="請輸入料號"
                  />
                </Grid.Col>
                
                <Grid.Col md={6}>
                  <Input
                    label="產品型號"
                    name="productModel"
                    value={formData.productModel || ''}
                    onChange={onChange}
                    placeholder="請輸入產品型號"
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label="產品名稱"
                    name="productName"
                    value={formData.productName || ''}
                    onChange={onChange}
                    placeholder="請輸入產品名稱"
                  />
                </Grid.Col>

                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/Material')}>
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

Content.defaultData = DEFAULT_MATERIAL_FORM;
