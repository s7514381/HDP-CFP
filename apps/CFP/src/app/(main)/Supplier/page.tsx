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
import { useAppApi } from '@/hooks/useAppApi';
import { useToast } from '@packages/contexts/ToastContext';
import { API_URL, API_MAP } from '@/lib/apiRoutes';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useLanguage } from '@/contexts/LanguageContext';
import SupplierDeleteConfirm from '@/components/common/SupplierDeleteConfirm';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface SupplierRow {
  id: string | number;
  name?: string;
  taxID?: string;
  contactName?: string;
}

interface SupplierSearchCriteria {
  name: string;
  taxId: string;
}

const DEFAULT_SEARCH_CRITERIA: SupplierSearchCriteria = {
  name: '',
  taxId: '',
};

function isSupplierSearchCriteria(value: unknown): value is SupplierSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  const criteria = value as Record<string, unknown>;
  return typeof criteria.name === 'string' && typeof criteria.taxId === 'string';
}

interface SupplierContentProps {
  initialCriteria: SupplierSearchCriteria;
  saveSearchCriteria: (criteria: SupplierSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

export default function SupplierPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(DEFAULT_SEARCH_CRITERIA, isSupplierSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <SupplierContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function SupplierContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: SupplierContentProps) {
  const router = useRouter();
  const api = useAppApi();
  const { success, danger } = useToast();
  const { hasPermission } = usePagePermissions();
  const { translate } = useLanguage();
  const { Row, Col } = Grid;

  const tableRef = React.useRef<CommonTableHandle<SupplierRow>>(null);
  const [searchName, setSearchName] = useState(initialCriteria.name);
  const [searchTaxID, setSearchTaxID] = useState(initialCriteria.taxId);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | string | null>(null);

  const handleSearch = () => {
    saveSearchCriteria({ name: searchName, taxId: searchTaxID });
    tableRef.current?.search({
      Name: searchName,
      MaterialTaxID: searchTaxID
    });
  };

  const handleClear = () => {
    setSearchName(DEFAULT_SEARCH_CRITERIA.name);
    setSearchTaxID(DEFAULT_SEARCH_CRITERIA.taxId);
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleDelete = (id: number | string) => {
    setPendingDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteId === null) return;

    const result = await api.post(`${API_URL}/Supplier/Delete?id=${pendingDeleteId}`);
    setPendingDeleteId(null);
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.supplier.deleteSuccess)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{translate(LANGUAGE_KEYS.supplier.deleteFailed)}</span> });
    }
  };

  const columns: Column<SupplierRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: "text-center",
      style: { width: '80px' },
      render: (_, index) => index + 1
    },
    {
      header: translate(LANGUAGE_KEYS.supplier.name),
      key: "name"
    },
    {
      header: translate(LANGUAGE_KEYS.supplier.taxId),
      key: "taxID"
    },
    {
      header: translate(LANGUAGE_KEYS.supplier.contactName),
      key: "contactName"
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
              onClick={() => router.push(`/Supplier/Edit/?id=${item.id}`)}
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
      <ActionBar title={LANGUAGE_KEYS.supplier.title}>
      </ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.supplier.name)} placeholder={translate(LANGUAGE_KEYS.supplier.name)} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            </Col>
            <Col md={4}>
              <Input label={translate(LANGUAGE_KEYS.supplier.taxId)} placeholder={translate(LANGUAGE_KEYS.supplier.taxId)} value={searchTaxID} onChange={(e) => setSearchTaxID(e.target.value)} />
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
                <Btn color="success" icon="add" outline={false} onClick={() => router.push('/Supplier/Create')}>{translate(LANGUAGE_KEYS.supplier.add)}</Btn>
              )}
            </div>
        </Container>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.SUPPLIER_GET_LIST}
              searchParams={{
                Name: initialCriteria.name,
                MaterialTaxID: initialCriteria.taxId,
              }}
              pageSize={10}
            />
        </Container>
      </WrapContent>
      <SupplierDeleteConfirm
        show={pendingDeleteId !== null}
        message={translate(LANGUAGE_KEYS.supplier.deleteConfirm)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
