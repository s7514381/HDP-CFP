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

export const DEFAULT_ADMIN_FUNCTION_FORM = {
  name: '',
  code: '',
  url: '',
  icon: '',
  sortOrder: 0,
  status: '1' as string | number,
  note: ''
};

export type AdminFunctionData = typeof DEFAULT_ADMIN_FUNCTION_FORM & {
  id?: string | number;
};

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
                  label="功能名稱"
                  name="name"
                  value={formData.name || ''}
                  onChange={onChange}
                  placeholder="請輸入功能名稱"
                  required
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label="功能代碼"
                  name="code"
                  value={formData.code || ''}
                  onChange={onChange}
                  placeholder="請輸入功能代碼"
                  required
                />
              </Grid.Col>
              
              <Grid.Col md={6}>
                <Input
                  label="網址 (URL)"
                  name="url"
                  value={formData.url || ''}
                  onChange={onChange}
                  placeholder="請輸入頁面網址"
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <Input
                  label="圖示 (Icon Class)"
                  name="icon"
                  value={formData.icon || ''}
                  onChange={onChange}
                  placeholder="例如: fa-solid fa-house"
                />
              </Grid.Col>

              <Grid.Col md={6}>
                <Input
                  label="排序"
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder ?? 0}
                  onChange={onChange}
                  placeholder="數字越小越前面"
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
Content.defaultData = DEFAULT_ADMIN_FUNCTION_FORM;
