'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import FontAwesome from "@packages/components/FontAwsome";
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface AdminMenuRow {
  id: string | number;
  title?: string;
  englishCode?: string;
  status?: string | number;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle<AdminMenuRow>>(null);
  const [searchTitle, setSearchTitle] = useState('');

  const handleSearch = () => {
    tableRef.current?.search({
      Title: searchTitle
    });
  };

  const handleClear = () => {
    setSearchTitle('');
    tableRef.current?.search({});
  };

  const handleDelete = async (id: number | string) => {
    if (await confirm(translate(LANGUAGE_KEYS.common.confirm, '確定要刪除此選單嗎？'))) {
      try {
        await formPost(`${API_MAP.ADMIN_MENU_MST}/Delete`, { id });
        success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess, '刪除成功！')}</span> });
        tableRef.current?.reload();
      } catch {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed, '刪除失敗。')}</span> });
      }
    }
  };

  const columns: Column<AdminMenuRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.common.functionName, '功能名稱'),
      key: "title"
    },
    {
      header: translate(LANGUAGE_KEYS.common.itemCode, '英文代號'),
      render: (item) => item.englishCode || '—'
    },
    {
      header: translate(LANGUAGE_KEYS.common.status, '狀態'),
      key: "status"
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions, '操作'),
      className: "text-center",
      style: { width: '120px' },
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome
                icon="fa-regular fa-pen-to-square"
                className="text-warning cursor-pointer"
                onClick={() => router.push(`/AdminMenu/Edit/?id=${item.id}`)}
              />
          )}
          {hasPermission('Delete') && (
            <FontAwesome
                icon="fa-regular fa-trash-can"
                className="text-danger cursor-pointer"
                onClick={() => handleDelete(item.id)}
              />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.adminMenu.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.adminFunction.heading, '標題')} placeholder={translate(LANGUAGE_KEYS.adminFunction.heading, '標題')} value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} />
            </Col>
            <Col md={8} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search, '查詢')}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear, '清除')}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2">
                {hasPermission('Create') && (
                  <Btn color="success" icon="add" outline={false} onClick={() => router.push('/AdminMenu/Create')}>{translate(LANGUAGE_KEYS.common.add, '新增')}</Btn>
                )}
            </div>
        </Container>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.ADMIN_MENU_GET_LIST}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
