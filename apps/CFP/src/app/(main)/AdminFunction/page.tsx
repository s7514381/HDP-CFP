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
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface AdminFunctionSearchCriteria {
  name: string;
  code: string;
}

const DEFAULT_SEARCH_CRITERIA: AdminFunctionSearchCriteria = {
  name: '',
  code: '',
};

function isAdminFunctionSearchCriteria(value: unknown): value is AdminFunctionSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  const criteria = value as Record<string, unknown>;
  return typeof criteria.name === 'string' && typeof criteria.code === 'string';
}

interface AdminFunctionContentProps {
  initialCriteria: AdminFunctionSearchCriteria;
  saveSearchCriteria: (criteria: AdminFunctionSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

export default function AdminFunctionPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(DEFAULT_SEARCH_CRITERIA, isAdminFunctionSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <AdminFunctionContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function AdminFunctionContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: AdminFunctionContentProps) {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission } = usePagePermissions();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { translate } = useLanguage();

  const tableRef = React.useRef<CommonTableHandle<{ id: string | number; title?: string; status?: string | number }>>(null);
  const [searchName, setSearchName] = useState(initialCriteria.name);
  const [searchCode, setSearchCode] = useState(initialCriteria.code);

  const handleSearch = () => {
    saveSearchCriteria({ name: searchName, code: searchCode });
    tableRef.current?.search({
      Name: searchName,
      Code: searchCode
    });
  };

  const handleClear = () => {
    setSearchName(DEFAULT_SEARCH_CRITERIA.name);
    setSearchCode(DEFAULT_SEARCH_CRITERIA.code);
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleDelete = async (id: number | string) => {
    if (await confirm(translate(LANGUAGE_KEYS.common.confirm))) {
      try {
        await formPost(`${API_MAP.ADMIN_FUNCTION_MST}/Delete`, { id });
        success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
        tableRef.current?.reload();
      } catch {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
      }
    }
  };

  const columns: Column<{ id: string | number; title?: string; status?: string | number }>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.common.functionName),
      key: "title"
    },
    {
      header: translate(LANGUAGE_KEYS.common.status),
      key: "status"
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
              onClick={() => router.push(`/AdminFunction/Edit/?id=${item.id}`)}
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
      <ActionBar title={LANGUAGE_KEYS.adminFunction.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.common.functionName)} placeholder={translate(LANGUAGE_KEYS.common.functionName)} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.common.itemCode)} placeholder={translate(LANGUAGE_KEYS.common.itemCode)} value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
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
                  <Btn color="success" icon="add" outline={false} onClick={() => router.push('/AdminFunction/Create')}>{translate(LANGUAGE_KEYS.common.add)}</Btn>
                )}
            </div>
        </Container>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.ADMIN_FUNCTION_GET_LIST}
              searchParams={{
                Name: initialCriteria.name,
                Code: initialCriteria.code,
              }}
              pageSize={10}
            />
        </Container>
      </WrapContent>
    </>
  );
}
