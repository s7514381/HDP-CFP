'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import FontAwesome from '@packages/components/FontAwsome';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { API_MAP } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';
import LanguageCreateModal from '@/components/layouts/LanguageCreateModal';
import LanguageManagementModal, { LanguageItem } from '@/components/layouts/LanguageManagementModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import type { TableSearchParams } from '@/components/common/tableUtils';
import { useSearchPersistence } from '@/hooks/useSearchPersistence';

interface LanguageResourceListItem {
  id: string;
  serialNumber?: string;
  menuName?: string;
  menuCode?: string;
  baseText?: string;
  status?: number;
}

interface AdminMenuData {
  id: string;
  title?: string;
  childList?: AdminMenuData[];
}

const COMMON_MENU_FILTER_VALUE = '__COMMON__';
const COMMON_MENU_CODE = '__COMMON_MENU__';
const UNCONFIGURED_MENU_CODE = '__UNCONFIGURED_MENU__';

interface LanguageResourceSearchCriteria {
  baseText: string;
  serialNumber: string;
  menuId: string;
}

const DEFAULT_SEARCH_CRITERIA: LanguageResourceSearchCriteria = {
  baseText: '',
  serialNumber: '',
  menuId: '',
};

function isLanguageResourceSearchCriteria(value: unknown): value is LanguageResourceSearchCriteria {
  if (typeof value !== 'object' || value === null) return false;

  const criteria = value as Record<string, unknown>;
  return typeof criteria.baseText === 'string'
    && typeof criteria.serialNumber === 'string'
    && typeof criteria.menuId === 'string';
}

interface LanguageResourceContentProps {
  initialCriteria: LanguageResourceSearchCriteria;
  saveSearchCriteria: (criteria: LanguageResourceSearchCriteria) => void;
  clearSearchCriteria: () => void;
}

export default function LanguageResourcePage() {
  const {
    restoredValue,
    isReady: isSearchPersistenceReady,
    save: saveSearchCriteria,
    clear: clearSearchCriteria,
  } = useSearchPersistence(DEFAULT_SEARCH_CRITERIA, isLanguageResourceSearchCriteria);

  if (!isSearchPersistenceReady) return null;

  return (
    <LanguageResourceContent
      initialCriteria={restoredValue}
      saveSearchCriteria={saveSearchCriteria}
      clearSearchCriteria={clearSearchCriteria}
    />
  );
}

function LanguageResourceContent({
  initialCriteria,
  saveSearchCriteria,
  clearSearchCriteria,
}: LanguageResourceContentProps) {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { hasPermission } = usePagePermissions();
  const tableRef = React.useRef<CommonTableHandle>(null);
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [menus, setMenus] = useState<AdminMenuData[]>([]);
  const [showLanguageCreateModal, setShowLanguageCreateModal] = useState(false);
  const [showLanguageManagementModal, setShowLanguageManagementModal] = useState(false);
  const { languageCode, translate } = useLanguage();
  const canAddLanguage = hasPermission('Language:Create');
  const canDeleteLanguage = hasPermission('Language:Delete')
    || hasPermission('LanguageResource:Delete');
  const canAddTranslation = hasPermission('LanguageResource:Create');
  const [searchBaseText, setSearchBaseText] = useState(initialCriteria.baseText);
  const [searchSerialNumber, setSearchSerialNumber] = useState(initialCriteria.serialNumber);
  const [searchMenuId, setSearchMenuId] = useState(initialCriteria.menuId);

  const loadLanguages = useCallback(async () => {
    const result = await formPost(API_MAP.LANGUAGE_RESOURCE_GET_ACTIVE_LANGUAGES, {});
    if (result.success && Array.isArray(result.data)) setLanguages(result.data);
  }, [formPost]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await loadLanguages();
    };
    void load().catch(error => console.error('Failed to load languages', error));
    return () => { cancelled = true; };
  }, [loadLanguages]);

  const loadMenus = useCallback(async () => {
    const result = await formPost(API_MAP.ADMIN_MENU_GET_ADMIN_MENUS, {});
    if (result.success && Array.isArray(result.data)) setMenus(result.data);
  }, [formPost]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await loadMenus();
    };
    void load().catch(error => console.error('Failed to load menu options', error));
    return () => { cancelled = true; };
  }, [loadMenus]);

  const menuOptions = React.useMemo(() => {
    const options = [
      { label: translate(LANGUAGE_KEYS.common.all), value: '' },
      { label: translate(LANGUAGE_KEYS.common.common), value: COMMON_MENU_FILTER_VALUE },
    ];
    const flatten = (items: AdminMenuData[], depth = 0) => {
      items.forEach(item => {
        if (item.title) {
          options.push({ label: `${'　'.repeat(depth)}${item.title}`, value: item.id });
        }
        if (item.childList?.length) flatten(item.childList, depth + 1);
      });
    };
    flatten(menus);
    return options;
  }, [languageCode, menus, translate]);

  const getSearchCriteria = (): LanguageResourceSearchCriteria => ({
    baseText: searchBaseText,
    serialNumber: searchSerialNumber,
    menuId: searchMenuId,
  });

  const toTableSearchParams = (criteria: LanguageResourceSearchCriteria): TableSearchParams => ({
    BaseText: criteria.baseText,
    SerialNumber: criteria.serialNumber,
    AdminMenuId: criteria.menuId === COMMON_MENU_FILTER_VALUE ? undefined : criteria.menuId,
    IsCommon: criteria.menuId === COMMON_MENU_FILTER_VALUE ? 'true' : undefined,
  });

  const handleSearch = () => {
    const criteria = getSearchCriteria();
    saveSearchCriteria(criteria);
    tableRef.current?.search(toTableSearchParams(criteria));
  };

  const handleClear = () => {
    setSearchBaseText(DEFAULT_SEARCH_CRITERIA.baseText);
    setSearchSerialNumber(DEFAULT_SEARCH_CRITERIA.serialNumber);
    setSearchMenuId(DEFAULT_SEARCH_CRITERIA.menuId);
    clearSearchCriteria();
    tableRef.current?.search({});
  };

  const handleAddLanguage = async ({ name, code: rawCode }: { name: string; code: string }) => {
    const code = rawCode.trim();
    const languageName = name.trim();
    if (!languageName || !/^[A-Za-z]{2,8}(?:-[A-Za-z]{2,8})?$/.test(code)) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.languageResource.invalidLanguageCode)}</span> });
      return false;
    }

    const result = await formPost(API_MAP.LANGUAGE_CREATE, {
      name: languageName,
      code,
      sequence: languages.length + 1,
      status: 1,
      isBaseLanguage: false
    });
    if (!result.success) {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.languageResource.addLanguageFailed)}</span> });
      return false;
    }

    await loadLanguages();
    success({ message: <span>{translate(LANGUAGE_KEYS.languageResource.languageAdded)}</span> });
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!await confirm(translate(LANGUAGE_KEYS.languageResource.deleteConfirm))) return;
    const result = await formPost(`${API_MAP.LANGUAGE_RESOURCE_MST}/Delete`, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess)}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed)}</span> });
    }
  };

  const columns: Column<unknown>[] = [
    { header: translate(LANGUAGE_KEYS.common.rowNumber), className: 'text-center', style: { width: '70px' }, render: (_, index) => index + 1 },
    { header: translate(LANGUAGE_KEYS.common.serialNumber), key: 'serialNumber' },
    {
      header: translate(LANGUAGE_KEYS.languageResource.menuCode),
      render: item => {
        const menuCode = (item as LanguageResourceListItem).menuCode;
        if (menuCode === COMMON_MENU_CODE) return translate(LANGUAGE_KEYS.common.common);
        if (menuCode === UNCONFIGURED_MENU_CODE) return translate(LANGUAGE_KEYS.common.notConfigured);
        return menuCode || '';
      }
    },
    { header: translate(LANGUAGE_KEYS.common.functionName), key: 'menuName' },
    { header: translate(LANGUAGE_KEYS.common.baseLanguageContent), key: 'baseText' },
    { header: translate(LANGUAGE_KEYS.common.status), render: item => (item as LanguageResourceListItem).status === 1 ? translate(LANGUAGE_KEYS.common.enabled) : translate(LANGUAGE_KEYS.common.disabled) },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '110px' },
      render: item => (
        <div className="d-flex justify-content-center gap-2">
          {hasPermission('Edit') && (
            <FontAwesome icon="fa-regular fa-pen-to-square" className="text-warning cursor-pointer" onClick={() => router.push(`/LanguageResource/Edit/?id=${(item as LanguageResourceListItem).id}`)} />
          )}
          {hasPermission('Delete') && (
            <FontAwesome icon="fa-regular fa-trash-can" className="text-danger cursor-pointer" onClick={() => handleDelete((item as LanguageResourceListItem).id)} />
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.common.multilingualSettings)} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}><Input label={translate(LANGUAGE_KEYS.common.serialNumber)} value={searchSerialNumber} onChange={event => setSearchSerialNumber(event.target.value)} /></Col>
            <Col md={3}><Select label={translate(LANGUAGE_KEYS.common.functionName)} options={menuOptions} value={searchMenuId} onChange={event => setSearchMenuId(event.target.value)} /></Col>
            <Col md={3}><Input label={translate(LANGUAGE_KEYS.common.baseLanguageContent)} value={searchBaseText} onChange={event => setSearchBaseText(event.target.value)} /></Col>
            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" onClick={handleSearch}>{translate(LANGUAGE_KEYS.common.search)}</Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
          <div className="d-flex justify-content-end gap-2">
            {(canAddLanguage || canDeleteLanguage) && (
              <Btn type="button" color="secondary" onClick={() => setShowLanguageManagementModal(true)}>
                {translate(LANGUAGE_KEYS.common.multilingualSettings)}
              </Btn>
            )}
            {canAddTranslation && (
              <Btn color="success" icon="add" onClick={() => router.push('/LanguageResource/Create')}>
                {translate(LANGUAGE_KEYS.languageResource.addTranslation)}
              </Btn>
            )}
          </div>
        </Container>
        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.LANGUAGE_RESOURCE_GET_LIST}
            searchParams={toTableSearchParams(initialCriteria)}
            pageSize={10}
          />
        </Container>
      </WrapContent>
      <LanguageCreateModal
        show={showLanguageCreateModal}
        onClose={() => setShowLanguageCreateModal(false)}
        onSubmit={handleAddLanguage}
      />
      <LanguageManagementModal
        show={showLanguageManagementModal}
        languages={languages}
        canAdd={canAddLanguage}
        canDelete={canDeleteLanguage}
        onClose={() => setShowLanguageManagementModal(false)}
        onAddLanguage={() => {
          setShowLanguageManagementModal(false);
          setShowLanguageCreateModal(true);
        }}
        onLanguagesChanged={setLanguages}
      />
    </>
  );
}
