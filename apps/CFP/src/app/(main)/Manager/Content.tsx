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
import { API_MAP, API_URL } from '@/lib/apiRoutes';
import { SelectListItem } from '@/types/SelectListItem';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export const DEFAULT_MANAGER_FORM = {
  account: '',
  password: '',
  name: '',
  email: '',
  phone: '',
  taxID: '',
  roleId: '',
  status: '1' as string | number,
  note: ''
};

export type ManagerData = typeof DEFAULT_MANAGER_FORM & {
  id?: string | number;
};

interface ContentProps {
  title: string;
  formData: ManagerData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const { translate } = useLanguage();
  const [selectItem, setSelectItem] = React.useState<SelectListItem[]>([]);


  React.useEffect(() => {
    api.post<SelectListItem[]>(`${API_URL}/Role/GetSelectListItems`, {}).then(res => {
      if (res.success && res.data) {
        setSelectItem(res.data);
      }
    });
  }, []);

  // 將 SelectListItem[] 轉換為 Select 元件所需的 options 格式
  const roleOptions = selectItem.map(item => ({
    label: item.text,
    value: item.value
  }));

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
                    label={translate(LANGUAGE_KEYS.manager.name, '姓名')}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.manager.name, '請輸入姓名')}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.account, '帳號')}
                    name="account"
                    value={formData.account || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.auth.accountPlaceholder, '請輸入帳號')}
                    required
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.password, '密碼')}
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={onChange}
                    placeholder={formData.id ? translate(LANGUAGE_KEYS.manager.passwordKeep, '若不修改請留空') : translate(LANGUAGE_KEYS.auth.passwordPlaceholder, '請輸入密碼')}
                    required={!formData.id}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.auth.email, '電子郵件')}
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={onChange}
                    placeholder="example@domain.com"
                  />
                </Grid.Col>

                {/* <Grid.Col md={6}>
                <Input
                  label="聯絡電話"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.phonePlaceholder, '例：0912345678')}
                />
              </Grid.Col> */}

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.taxId, '統一編號')}
                    name="taxID"
                    value={formData.taxID || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.auth.taxIdPlaceholder, '請輸入統編')}
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.manager.role, '角色')}
                    name="roleId"
                    value={formData.roleId || ''}
                    onChange={onChange}
                    options={roleOptions}
                    required
                  />
                </Grid.Col>

                {/* <Grid.Col md={6}>
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
              </Grid.Col> */}

                {/* <Grid.Col md={12}>
                <div className="mb-3">
                  <label className="form-label">{translate(LANGUAGE_KEYS.manager.note, '備註')}</label>
                  <textarea
                    className="form-control"
                    name="note"
                    rows={3}
                    value={formData.note || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.notePlaceholder, '其他補充說明')}
                  />
                </div>
              </Grid.Col> */}

                <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
                  <Btn type="button" color="secondary" outline onClick={() => router.push('/Manager')}>
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

Content.defaultData = DEFAULT_MANAGER_FORM;
