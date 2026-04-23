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

export const DEFAULT_SUPPLIER_FORM = {
  name: '',
  taxID: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  status: '1' as string | number,
  note: '',
  id: undefined as string | undefined
};

export type SupplierData = typeof DEFAULT_SUPPLIER_FORM & {
  id?: string | number;
};

interface ContentProps {
  title: string;
  formData: SupplierData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = '儲存' }: ContentProps) {
  const router = useRouter();

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
                  label="供應商名稱"
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                  placeholder="請輸入供應商全名"
                  required
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label="統一編號"
                  name="taxID"
                  value={formData.taxID || ''}
                  onChange={onChange}
                  placeholder="請輸入 8 位統一編號"
                  required
                />
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Input
                  label="聯絡人"
                  name="contactName"
                  value={formData.contactName || ''}
                  onChange={onChange}
                  placeholder="請輸入主要聯絡人姓名"
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label="聯絡電話"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={onChange}
                  placeholder="例：02-12345678"
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Input
                  label="電子郵件"
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={onChange}
                  placeholder="example@domain.com"
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

              {/* <Grid.Col md={12}>
                <Input
                  label="通訊地址"
                  name="address"
                  value={formData.address || ''}
                  onChange={onChange}
                  placeholder="請輸入原始地址"
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
              </Grid.Col> */}

              <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                <Btn type="button" color="secondary" outline onClick={() => router.push('/Supplier')}>
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

Content.defaultData = DEFAULT_SUPPLIER_FORM;
