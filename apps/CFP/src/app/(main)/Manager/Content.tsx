'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import FormActionBar from '@/components/common/FormActionBar';
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
  note: '',
  isCurrentManager: false
};

export type ManagerData = typeof DEFAULT_MANAGER_FORM & {
  id?: string | number;
  isCurrentManager?: boolean;
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
      <FormActionBar
        title={title}
        formId="manager-form"
        submitLabel={submitLabel}
        loading={loading}
        onBack={() => router.back()}
      />

      <Container className="py-4">
        <Card>
          <Card.Body>
            <form id="manager-form" onSubmit={onSubmit}>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.name)}
                    name="name"
                    value={formData.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.manager.name)}
                    required
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.account)}
                    name="account"
                    value={formData.account || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.auth.accountPlaceholder)}
                    required
                  />
                </Grid.Col>

                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.password)}
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={onChange}
                    placeholder={formData.id ? translate(LANGUAGE_KEYS.manager.passwordKeep) : translate(LANGUAGE_KEYS.auth.passwordPlaceholder)}
                    required={!formData.id}
                  />
                </Grid.Col>
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.auth.email)}
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.common.emailPlaceholder)}
                  />
                </Grid.Col>

                  <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.manager.taxId)}
                    name="taxID"
                    value={formData.taxID || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.auth.taxIdPlaceholder)}
                  />
                </Grid.Col>

                {!formData.isCurrentManager && (
                  <Grid.Col md={6}>
                    <Select
                      label={translate(LANGUAGE_KEYS.manager.role)}
                      name="roleId"
                      value={formData.roleId || ''}
                      onChange={onChange}
                      options={roleOptions}
                      required
                    />
                  </Grid.Col>
                )}

              </Grid.Row>
            </form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

Content.defaultData = DEFAULT_MANAGER_FORM;
