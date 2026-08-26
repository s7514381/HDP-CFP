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
import { useAppApi } from '@/hooks/useAppApi';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface MaterialGroupRow {
  id: string | number;
  name?: string;
}

export default function MaterialGroupPage() {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle<MaterialGroupRow>>(null);
  const [searchName, setSearchName] = useState('');

  const handleSearch = () => {
    tableRef.current?.search({
      Name: searchName
    });
  };

  const handleClear = () => {
    setSearchName('');
    tableRef.current?.search({});
  };

  const handleDelete = async (id: number | string) => {
    if (await confirm(translate(LANGUAGE_KEYS.common.confirm))) {
      const fd = new FormData();
      fd.append('id', String(id));
      const result = await api.post<unknown, FormData>(`${API_URL}/MaterialGroup/Delete`, { body: fd });
      if (result.success) {
        success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
        tableRef.current?.reload();
      } else {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
      }
    }
  };

  const columns: Column<MaterialGroupRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.materialGroup.name),
      key: "name"
    },
    {
      header: "",
      className: "text-center",
      style: { width: '120px' },
      render: (item) => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer"
              onClick={() => router.push(`/MaterialGroup/Edit/?id=${item.id}`)}
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
      <ActionBar title={LANGUAGE_KEYS.materialGroup.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.materialGroup.name)} placeholder={translate(LANGUAGE_KEYS.materialGroup.name)} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </Col>
            <Col md={4} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-end gap-2">
                {hasPermission('Create') && (
                  <Btn color="success" icon="add" outline={false} onClick={() => router.push('/MaterialGroup/Create')}>{translate(LANGUAGE_KEYS.common.add)}</Btn>
                )}
            </div>
        </Container>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.MATERIAL_GROUP_GET_LIST}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
