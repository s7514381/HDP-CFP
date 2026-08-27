'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface ManagerRow {
  id: string | number;
  name?: string;
  account?: string;
  taxID?: string;
  email?: string;
}

export default function ManagerPage() {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle<ManagerRow>>(null);

  const handleDelete = async (id: number | string) => {
    if (await confirm(translate(LANGUAGE_KEYS.common.confirm))) {
      try {
        await formPost(`${API_MAP.MANAGER_MST}/Delete`, { id });
        success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
        tableRef.current?.reload();
      } catch {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
      }
    }
  };

  const columns: Column<ManagerRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.manager.name),
      key: "name"
    },
    {
      header: translate(LANGUAGE_KEYS.manager.account),
      key: "account"
    },
    {
      header: translate(LANGUAGE_KEYS.manager.taxId),
      key: "taxID"
    },
    {
      header: translate(LANGUAGE_KEYS.auth.email),
      key: "email"
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: "text-center",
      style: { width: '120px' },
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer"
              onClick={() => router.push(`/Manager/Edit/?id=${item.id}`)}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.manager.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.MANAGER_GET_LIST}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
