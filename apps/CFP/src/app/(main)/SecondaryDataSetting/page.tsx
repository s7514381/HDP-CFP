'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import FontAwesome from '@packages/components/FontAwsome';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Grid from '@packages/components/bootstrap5/Grid';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { API_MAP } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { SecondaryDataSettingRow } from '@/types/secondaryDataSetting';
import { TableSearchParams } from '@/components/common/tableUtils';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface SecondaryDataSettingSearchCriteria extends TableSearchParams {
  name: string;
  unit: string;
  departmentName: string;
  announcementYear: string;
}

const INITIAL_SEARCH: SecondaryDataSettingSearchCriteria = {
  name: '',
  unit: '',
  departmentName: '',
  announcementYear: '',
};

function isSecondaryDataSettingSearchCriteria(value: unknown): value is SecondaryDataSettingSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;
  const criteria = value as Record<string, unknown>;
  return typeof criteria.name === 'string'
    && typeof criteria.unit === 'string'
    && typeof criteria.departmentName === 'string'
    && typeof criteria.announcementYear === 'string';
}

function toTableSearchParams(criteria: SecondaryDataSettingSearchCriteria) {
  return {
    Name: criteria.name.trim() || undefined,
    Unit: criteria.unit.trim() || undefined,
    DepartmentName: criteria.departmentName.trim() || undefined,
    AnnouncementYear: criteria.announcementYear ? Number(criteria.announcementYear) : undefined,
  };
}

interface SecondaryDataSettingContentProps {
  initialCriteria: SecondaryDataSettingSearchCriteria;
  saveSearchCriteria: (criteria: SecondaryDataSettingSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

export default function SecondaryDataSettingPage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(INITIAL_SEARCH, isSecondaryDataSettingSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <SecondaryDataSettingContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function SecondaryDataSettingContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: SecondaryDataSettingContentProps) {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission } = usePagePermissions();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const tableRef = React.useRef<CommonTableHandle<SecondaryDataSettingRow>>(null);
  const [name, setName] = useState(initialCriteria.name);
  const [unit, setUnit] = useState(initialCriteria.unit);
  const [departmentName, setDepartmentName] = useState(initialCriteria.departmentName);
  const [announcementYear, setAnnouncementYear] = useState(initialCriteria.announcementYear);
  const [syncing, setSyncing] = useState(false);

  const search = () => {
    const criteria = { name, unit, departmentName, announcementYear };
    saveSearchCriteria(criteria);
    tableRef.current?.search(toTableSearchParams(criteria));
  };

  const clear = () => {
    setName('');
    setUnit('');
    setDepartmentName('');
    setAnnouncementYear('');
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleDelete = async (id: string) => {
    if (!await confirm(translate(LANGUAGE_KEYS.common.confirm))) return;

    const result = await formPost(API_MAP.SECONDARY_DATA_SETTING_DELETE, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    }
  };

  const syncApi = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await formPost(API_MAP.SECONDARY_DATA_SETTING_SYNC_API, {});
      if (!result.success) {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.secondaryDataSetting.syncFailed)}</span> });
        return;
      }

      const data = result.data as { createdCount?: number; updatedCount?: number; deactivatedCount?: number } | undefined;
      const message = translate(LANGUAGE_KEYS.secondaryDataSetting.syncCompleted)
        .replace('{0}', String(data?.createdCount ?? 0))
        .replace('{1}', String(data?.updatedCount ?? 0))
        .replace('{2}', String(data?.deactivatedCount ?? 0));
      success({ message: <span>{message}</span> });
      tableRef.current?.reload();
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataSetting.syncFailed)}</span> });
    } finally {
      setSyncing(false);
    }
  };

  const columns: Column<SecondaryDataSettingRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.name), key: 'name' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.carbonFactor), key: 'carbonFactor' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.unit), key: 'unit' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.departmentName), key: 'departmentName' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.announcementYear), key: 'announcementYear' },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '170px' },
      render: (row) => (
        <div className="d-flex justify-content-center gap-3">
          {hasPermission('Edit') && (
            <FontAwesome
              icon="fa-regular fa-pen-to-square"
              className="text-warning cursor-pointer align-self-center"
              onClick={() => router.push(`/SecondaryDataSetting/Edit/?id=${row.id}`)}
            />
          )}
          {hasPermission('Delete') && (
            <FontAwesome
              icon="fa-regular fa-trash-can"
              className="text-danger cursor-pointer align-self-center"
              onClick={() => void handleDelete(row.id)}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.secondaryDataSetting.title)} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Grid.Row align="center" gutter={3}>
            <Grid.Col md={3}>
              <Input label={translate(LANGUAGE_KEYS.secondaryDataSetting.name)} value={name} onChange={(event) => setName(event.target.value)} />
            </Grid.Col>
            <Grid.Col md={3}>
              <Input label={translate(LANGUAGE_KEYS.secondaryDataSetting.unit)} value={unit} onChange={(event) => setUnit(event.target.value)} />
            </Grid.Col>
            <Grid.Col md={3}>
              <Input label={translate(LANGUAGE_KEYS.secondaryDataSetting.departmentName)} value={departmentName} onChange={(event) => setDepartmentName(event.target.value)} />
            </Grid.Col>
            <Grid.Col md={3}>
              <Input label={translate(LANGUAGE_KEYS.secondaryDataSetting.announcementYear)} type="number" value={announcementYear} onChange={(event) => setAnnouncementYear(event.target.value)} />
            </Grid.Col>
            <Grid.Col md={12} className="d-flex justify-content-end gap-2">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={search}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={clear}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Grid.Col>
          </Grid.Row>
        </SearchBlock>

        <div className="d-flex justify-content-end gap-2 mb-3">
          {hasPermission('Create') && (
            <Btn color="success" icon="add" onClick={() => router.push('/SecondaryDataSetting/Create')}>
              {translate(LANGUAGE_KEYS.common.add)}
            </Btn>
          )}
          {hasPermission('SyncApi') && (
            <Btn color="primary" outline disabled={syncing} onClick={() => void syncApi()}>
              {syncing ? translate(LANGUAGE_KEYS.common.loading) : translate(LANGUAGE_KEYS.secondaryDataSetting.syncApi)}
            </Btn>
          )}
        </div>

        <CommonTable
          ref={tableRef}
          columns={columns}
          apiUrl={API_MAP.SECONDARY_DATA_SETTING_GET_LIST}
          searchParams={toTableSearchParams(initialCriteria)}
          pageSize={10}
        />
      </WrapContent>
    </>
  );
}
