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
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { usePagePermissions } from '@/hooks/usePagePermissions';

interface LanguageItem {
  id: string;
  name: string;
  code: string;
  isBaseLanguage: boolean;
}

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

export default function LanguageResourcePage() {
  const router = useRouter();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { Row, Col } = Grid;
  const { formPost } = useAppApi();
  const { hasPermission } = usePagePermissions();
  const tableRef = React.useRef<CommonTableHandle>(null);
  const [searchBaseText, setSearchBaseText] = useState('');
  const [searchSerialNumber, setSearchSerialNumber] = useState('');
  const [searchMenuId, setSearchMenuId] = useState('');
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [menus, setMenus] = useState<AdminMenuData[]>([]);
  const [showLanguageCreateModal, setShowLanguageCreateModal] = useState(false);
  const { languageCode, translate } = useLanguage();
  const canAddLanguage = hasPermission('Language:Create');
  const canAddTranslation = hasPermission('LanguageResource:Create');

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
      { label: translate(LANGUAGE_KEYS.common.all, 'All'), value: '' },
      { label: translate(LANGUAGE_KEYS.common.common, '通用'), value: COMMON_MENU_FILTER_VALUE },
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

  const getSearchParams = () => ({
    BaseText: searchBaseText,
    SerialNumber: searchSerialNumber,
    AdminMenuId: searchMenuId === COMMON_MENU_FILTER_VALUE ? undefined : searchMenuId,
    IsCommon: searchMenuId === COMMON_MENU_FILTER_VALUE ? 'true' : undefined,
  });

  const handleSearch = () => {
    tableRef.current?.search(getSearchParams());
  };

  const handleClear = () => {
    setSearchBaseText('');
    setSearchSerialNumber('');
    setSearchMenuId('');
    tableRef.current?.search({});
  };

  const handleAddLanguage = async ({ name, code: rawCode }: { name: string; code: string }) => {
    const code = rawCode.trim();
    const languageName = name.trim();
    if (!languageName || !/^[A-Za-z]{2,8}(?:-[A-Za-z]{2,8})?$/.test(code)) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.languageResource.invalidLanguageCode, '請輸入語言名稱及正確格式的語言代碼，例如 ja-JP。')}</span> });
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
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.languageResource.addLanguageFailed, '新增語言失敗。')}</span> });
      return false;
    }

    await loadLanguages();
    success({ message: <span>{translate(LANGUAGE_KEYS.languageResource.languageAdded, '語言新增成功！')}</span> });
    return true;
  };

  const handleDelete = async (id: string) => {
    if (!await confirm(translate(LANGUAGE_KEYS.languageResource.deleteConfirm, '確定要刪除此多語言資料嗎？'))) return;
    const result = await formPost(`${API_MAP.LANGUAGE_RESOURCE_MST}/Delete`, { id });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.common.deleteSuccess, '刪除成功！')}</span> });
      tableRef.current?.reload();
    } else {
      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed, '刪除失敗。')}</span> });
    }
  };

  const columns: Column<unknown>[] = [
    { header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'), className: 'text-center', style: { width: '70px' }, render: (_, index) => index + 1 },
    { header: translate(LANGUAGE_KEYS.common.resourceCode, languageCode === 'en-US' ? 'Code' : '代號'), key: 'serialNumber' },
    {
      header: translate(LANGUAGE_KEYS.languageResource.menuCode, '英文代號'),
      render: item => {
        const menuCode = (item as LanguageResourceListItem).menuCode;
        if (menuCode === COMMON_MENU_CODE) return translate(LANGUAGE_KEYS.common.common, 'Common');
        if (menuCode === UNCONFIGURED_MENU_CODE) return translate(LANGUAGE_KEYS.common.notConfigured, 'Not configured');
        return menuCode || '';
      }
    },
    { header: translate(LANGUAGE_KEYS.common.functionName, '功能'), key: 'menuName' },
    { header: translate(LANGUAGE_KEYS.common.baseLanguageContent, '基礎語言'), key: 'baseText' },
    { header: translate(LANGUAGE_KEYS.common.status, '狀態'), render: item => (item as LanguageResourceListItem).status === 1 ? translate(LANGUAGE_KEYS.common.enabled, '啟用') : translate(LANGUAGE_KEYS.common.disabled, '停用') },
    {
      header: translate(LANGUAGE_KEYS.common.actions, '操作'),
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
      <ActionBar title={translate(LANGUAGE_KEYS.common.multilingualSettings, '多語言設定')} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}><Input label={translate(LANGUAGE_KEYS.common.resourceCode, languageCode === 'en-US' ? 'Code' : '代號')} value={searchSerialNumber} onChange={event => setSearchSerialNumber(event.target.value)} /></Col>
            <Col md={3}><Select label={translate(LANGUAGE_KEYS.common.functionName, '功能名稱')} options={menuOptions} value={searchMenuId} onChange={event => setSearchMenuId(event.target.value)} /></Col>
            <Col md={3}><Input label={translate(LANGUAGE_KEYS.common.baseLanguageContent, '基礎語言內容')} value={searchBaseText} onChange={event => setSearchBaseText(event.target.value)} /></Col>
            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" onClick={handleSearch}>{translate(LANGUAGE_KEYS.common.search, '查詢')}</Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear, '清除')}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
          <div className="d-flex justify-content-end gap-2">
            {canAddLanguage && (
              <Btn type="button" color="primary" icon="add" onClick={() => setShowLanguageCreateModal(true)}>
                {translate(LANGUAGE_KEYS.languageResource.addLanguage, '新增語言')}
              </Btn>
            )}
            {canAddTranslation && (
              <Btn color="success" icon="add" onClick={() => router.push('/LanguageResource/Create')}>
                {translate(LANGUAGE_KEYS.languageResource.addTranslation, '新增翻譯資料')}
              </Btn>
            )}
          </div>
        </Container>
        <Container fluid>
          <CommonTable ref={tableRef} columns={columns} apiUrl={API_MAP.LANGUAGE_RESOURCE_GET_LIST} pageSize={10} />
        </Container>
      </WrapContent>
      <LanguageCreateModal
        show={showLanguageCreateModal}
        onClose={() => setShowLanguageCreateModal(false)}
        onSubmit={handleAddLanguage}
      />
    </>
  );
}
