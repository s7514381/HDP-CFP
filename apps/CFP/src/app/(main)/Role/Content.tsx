'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input, Checkbox } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Container } from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { FormUpdate } from '@/components/common/formTypes';
import { API_URL } from '@/lib/apiRoutes';
import { useAppApi } from '@/hooks/useAppApi';

export interface RoleData {
  id?: string | number;
  name?: string;
  type?: number | null;
  selectedAdminFunctionIds?: string[];
  selectedAdminMenuIds?: string[];
  status?: string | number;
}

interface AdminFunction {
  id: string;
  title: string;
  controller: string;
  action: string;
  childList: AdminFunction[];
}

interface AdminMenu {
  id: string;
  title: string;
  parentId: string | null;
  adminFunctionId: string | null;
  adminFunction: AdminFunction | null;
  childList: AdminMenu[];
  iconClass: string | null;
}

const isLanguageQueryFunction = (fn: AdminFunction) =>
  fn.controller === 'LanguageResource' && fn.action === 'Index';

const getAllChildIds = (menu: AdminMenu, visited: Set<string>): string[] => {
  if (!menu.id || visited.has(menu.id)) return [];
  visited.add(menu.id);

  let ids: string[] = [];
  if (menu.adminFunctionId) ids.push(menu.adminFunctionId);
  menu.adminFunction?.childList.forEach((fn) => {
    if (fn.id && !isLanguageQueryFunction(fn)) ids.push(fn.id);
  });
  menu.childList.forEach((child) => {
    ids = ids.concat(getAllChildIds(child, visited));
  });
  return ids;
};

const getMenuFunctionIds = (menu: AdminMenu): string[] => [
  menu.adminFunctionId,
  ...menu.adminFunction?.childList
    .filter((fn) => !isLanguageQueryFunction(fn))
    .map((fn) => fn.id) || [],
].filter((id): id is string => Boolean(id));

interface ContentProps {
  title: string;
  formData: RoleData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  updateForm: FormUpdate<RoleData>;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function Content({ title, formData, onChange, updateForm, onSubmit, loading = false, submitLabel = LANGUAGE_KEYS.common.save }: ContentProps) {
  const router = useRouter();
  const { translate } = useLanguage();
  const { formPost } = useAppApi();
  const [menus, setMenus] = useState<AdminMenu[]>([]);

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const res = await formPost(`${API_URL}/AdminMenu/GetAdminMenus`, {});
        if (res && res.success && Array.isArray(res.data)) {
          setMenus(res.data);
        }
      } catch (err) {
        console.error("Failed to load functions", err);
      }
    };
    fetchFunctions();
  }, [formPost]);

  const allMenuFunctionIds = useMemo(() => {
    const ids: string[] = [];
    if (!Array.isArray(menus)) return ids;
    const visited = new Set<string>();
    menus.forEach(m => {
      if (m?.id) {
        const itemIds = getAllChildIds(m, visited);
        itemIds.forEach(id => { if (id) ids.push(id); });
      }
    });
    return Array.from(new Set(ids));
  }, [menus]);

  const menuMap = useMemo(() => {
    const map = new Map<string, AdminMenu>();
    if (Array.isArray(menus)) {
      menus.forEach((m) => {
        if (m && m.id) {
          const existing = map.get(m.id);
          if (!existing || (!existing.adminFunction && m.adminFunction)) {
            map.set(m.id, m);
          }
        }
      });
    }
    return map;
  }, [menus]);

  const isAllChecked = (ids: string[]) => {
    if (!ids || ids.length === 0) return false;
    const currentFunctions = formData?.selectedAdminFunctionIds || [];
    return ids.every(id => id && currentFunctions.includes(id));
  };

  // 檢查是否任一項目被勾選（用於 parentMenu 和 childItem）
  const isAnyChecked = (ids: string[]) => {
    if (!ids || ids.length === 0) return false;
    const currentFunctions = formData?.selectedAdminFunctionIds || [];
    return ids.some(id => id && currentFunctions.includes(id));
  };

  const calculateSelectedMenuIds = (functions: string[]) => {
    const selectedMenus = new Set<string>();

    const checkMenu = (menu: AdminMenu): boolean => {
      let isSelected = false;

      if (menu.adminFunctionId && functions.includes(menu.adminFunctionId)) {
        isSelected = true;
      }

      if (menu.adminFunction?.childList) {
        if (menu.adminFunction.childList.some(f => !isLanguageQueryFunction(f) && f.id && functions.includes(f.id))) {
          isSelected = true;
        }
      }

      if (Array.isArray(menu.childList)) {
        for (const child of menu.childList) {
          if (checkMenu(child)) {
            isSelected = true;
          }
        }
      }

      if (isSelected && menu.id) {
        selectedMenus.add(menu.id);
      }

      return isSelected;
    };

    if (Array.isArray(menus)) {
      menus.forEach(m => checkMenu(m));
    }

    return Array.from(selectedMenus);
  };

  const handleCheckboxChange = (id: string, checked: boolean, relatedIds: string[] = []) => {
    const currentFunctions = formData?.selectedAdminFunctionIds || [];
    let newFunctions = [...currentFunctions];
    const allIdsToToggle = [id, ...relatedIds].filter(tid => !!tid);

    if (checked) {
      allIdsToToggle.forEach(toggleId => {
        if (!newFunctions.includes(toggleId)) newFunctions.push(toggleId);
      });
    } else {
      newFunctions = newFunctions.filter(fid => !allIdsToToggle.includes(fid));
    }

    const newMenuIds = calculateSelectedMenuIds(newFunctions);

    updateForm({ selectedAdminFunctionIds: newFunctions, selectedAdminMenuIds: newMenuIds });
  };

  const handleMenuFunctionChange = (menu: AdminMenu, functionId: string, checked: boolean) => {
    const currentFunctions = formData?.selectedAdminFunctionIds || [];
    let newFunctions = [...currentFunctions];
    const parentFunctionId = menu.adminFunctionId;
    const directFunctionIds = (menu.adminFunction?.childList || [])
      .filter(fn => !isLanguageQueryFunction(fn))
      .map(fn => fn?.id)
      .filter((id): id is string => Boolean(id));

    if (checked) {
      if (!newFunctions.includes(functionId)) newFunctions.push(functionId);
      if (parentFunctionId && !newFunctions.includes(parentFunctionId)) {
        newFunctions.push(parentFunctionId);
      }
    } else {
      newFunctions = newFunctions.filter(id => id !== functionId);
      if (parentFunctionId && directFunctionIds.every(id => !newFunctions.includes(id))) {
        newFunctions = newFunctions.filter(id => id !== parentFunctionId);
      }
    }

    const newMenuIds = calculateSelectedMenuIds(newFunctions);

    updateForm({ selectedAdminFunctionIds: newFunctions, selectedAdminMenuIds: newMenuIds });
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <ActionBar title={title}>
          <div className="ms-auto">
            <Btn color="secondary" outline onClick={() => router.back()} icon="cancel">
              {translate(LANGUAGE_KEYS.common.backToList, '返回列表')}
            </Btn>
            <Btn className='ms-2' type="submit" color="primary" loading={loading} icon="save">
              {submitLabel}
            </Btn>
          </div>
        </ActionBar>

        <Container className="py-4">

          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Grid.Row className="g-3">
                <Grid.Col md={6}>
                  <Input
                    label={translate(LANGUAGE_KEYS.role.name, '角色名稱')}
                    name="name"
                    value={formData?.name || ''}
                    onChange={onChange}
                    placeholder={translate(LANGUAGE_KEYS.role.name, '請輸入角色名稱')}
                    required
                  />
                </Grid.Col>
                {/* <Grid.Col md={6}>
                  <Select
                    label={translate(LANGUAGE_KEYS.common.status, '狀態')}
                    name="status"
                    value={formData?.status || ''}
                    onChange={onChange}
                    options={[
                      { label: translate(LANGUAGE_KEYS.common.enabled, '啟用'), value: '1' },
                      { label: translate(LANGUAGE_KEYS.common.disabled, '停用'), value: '0' }
                    ]}
                  />
                </Grid.Col> */}
              </Grid.Row>
            </Card.Body>
          </Card>

          <div className="mb-3 d-flex align-items-center gap-2">
            <label className="fw-bold">{translate(LANGUAGE_KEYS.role.permissions, '權限*')}</label>
            <Checkbox
              id="select-all"
              name="select-all"
              label={translate(LANGUAGE_KEYS.common.selectAll, '全選')}
              checked={isAllChecked(allMenuFunctionIds)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxChange('', e.target.checked, allMenuFunctionIds)}
            />
          </div>

          {Array.isArray(menus) && menus.filter(m => m && m.parentId === null).map(parentMenu => {
            const parentFunctionIds = getAllChildIds(parentMenu, new Set<string>());
            const parentDirectFunctionIds = getMenuFunctionIds(parentMenu);

            return (
              <Card key={parentMenu.id} className="mb-3 border-light shadow-sm">
                <div className="p-3 border-bottom bg-light">
                  <Grid.Row className="align-items-center">
                    <Grid.Col md={3}>
                      <Checkbox
                        id={`menu-${parentMenu.id}`}
                        name={`menu-${parentMenu.id}`}
                        className="fw-bold text-primary"
                        label={parentMenu.title}
                        checked={isAnyChecked(parentFunctionIds)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxChange(
                          parentMenu.adminFunctionId || '',
                          e.target.checked,
                          parentFunctionIds.filter(id => id !== parentMenu.adminFunctionId)
                        )}
                      />
                    </Grid.Col>
                    {parentDirectFunctionIds.length > 1 && (
                      <Grid.Col md={9}>
                        <div className="d-flex flex-wrap gap-3">
                          {(parentMenu.adminFunction?.childList || [])
                            .filter(fn => !isLanguageQueryFunction(fn))
                            .map(fn => {
                              if (!fn?.id) return null;
                              return (
                                <Checkbox
                                  key={fn.id}
                                  id={`fn-${fn.id}`}
                                  name={`fn-${fn.id}`}
                                  label={fn.title}
                                  checked={(formData?.selectedAdminFunctionIds || []).includes(fn.id)}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMenuFunctionChange(parentMenu, fn.id, e.target.checked)}
                                />
                              );
                          })}
                        </div>
                      </Grid.Col>
                    )}
                  </Grid.Row>
                </div>
                <Card.Body className="p-3">
                  {(parentMenu.childList || []).map((childItem, childIndex, childItems) => {
                    if (!childItem || !childItem.id) return null;
                    const fullChild = menuMap.get(childItem.id) || childItem;
                    const childFnList = fullChild.adminFunction?.childList || [];
                    const childFnIds = childFnList.map(f => f?.id).filter(id => !!id) as string[];
                    const childFunctionIds = [fullChild.adminFunctionId || '', ...childFnIds].filter(id => !!id);
                    const isLastChild = childIndex === childItems.length - 1;

                    // 判斷 childItem 是否應被勾選
                    const isChildItemChecked = isAnyChecked(childFunctionIds);

                    return (
                      <div
                        key={childItem.id}
                        className={isLastChild ? 'mb-0 border-0 pb-0' : 'mb-3 border-bottom pb-2'}
                      >
                        <Grid.Row>
                          <Grid.Col md={3}>
                            <Checkbox
                              id={`submenu-${childItem.id}`}
                              name={`submenu-${childItem.id}`}
                              className="fw-bold"
                              label={fullChild.title}
                              checked={isChildItemChecked}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCheckboxChange(fullChild.adminFunctionId || '', e.target.checked, childFnIds)}
                            />
                          </Grid.Col>
                          <Grid.Col md={9}>
                            <div className="d-flex flex-wrap gap-3">
                              {childFnList.map(fn => {
                                if (!fn || !fn.id) return null;
                                return (
                                  <Checkbox
                                    key={fn.id}
                                    id={`fn-${fn.id}`}
                                    name={`fn-${fn.id}`}
                                    label={fn.title}
                                    checked={(formData?.selectedAdminFunctionIds || []).includes(fn.id)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMenuFunctionChange(fullChild, fn.id, e.target.checked)}
                                  />
                                );
                              })}
                            </div>
                          </Grid.Col>

                        </Grid.Row>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            );
          })}
          <Grid.Col md={12} className="d-flex justify-content-end gap-2 mt-4">
            <Btn type="button" color="secondary" outline onClick={() => router.push('/Role')}>
              {translate(LANGUAGE_KEYS.common.cancel, '取消')}
            </Btn>
            <Btn type="submit" color="primary" loading={loading} icon="save">
              {translate(submitLabel, submitLabel)}
            </Btn>
          </Grid.Col>
        </Container>
      </form>
    </>
  );
}
