'use client';

import React, { useState, useRef } from 'react';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input, Checkbox } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import { useAppApi } from '@/hooks/useAppApi';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { API_MAP } from '@/lib/apiRoutes';
import { MaterialNotifyItem } from '@/types/materialNotify';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

export default function MaterialNotifyPage() {
  const api = useAppApi();
  const { success, danger } = useToast();
  const { Row, Col } = Grid;
  const { translate } = useLanguage();
  const { hasPermission } = usePagePermissions();

  const tableRef = useRef<CommonTableHandle<MaterialNotifyItem>>(null);

  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState({
    updateDateFrom: '',
    updateDateTo: '',
    materialGroupName: '',
    productModel: '',
    supplierName: ''
  });

  // 選取的項目狀態
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    tableRef.current?.search({
      ...searchForm
    });
  };

  const handleClear = () => {
    setSearchForm({
      updateDateFrom: '',
      updateDateTo: '',
      materialGroupName: '',
      productModel: '',
      supplierName: ''
    });
    tableRef.current?.search({});
  };

  const handleToggleSelect = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddNotify = async () => {
    if (selectedIds.size === 0) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.notify.check)}</span> });
      return;
    }

    try {
      // 將選取的 ID 轉換為 Guid 陣列
      const ids = Array.from(selectedIds).map(id => id as string);

      // 使用 useAppApi 的 post 方法
      const result = await api.post(API_MAP.MATERIAL_NOTIFY_ADD, {
        body: ids
      });

      if (result.status === 200) {
        success({ message: <span>{translate(LANGUAGE_KEYS.notify.addRecord)}</span> });
        setSelectedIds(new Set());
      } else {
        danger({ message: <span>{translate(LANGUAGE_KEYS.common.saveFailed)}</span> });
      }
    } catch (error) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.saveFailed)}</span> });
    }
  };

  // 全選功能
  const handleSelectAll = () => {
    if (selectedIds.size > 0) {
      // 取消全選
      setSelectedIds(new Set());
    } else {
      // 全選 - 從表格取得所有資料的 ID
      tableRef.current?.getData().then((data) => {
        const typedData = data as MaterialNotifyItem[];
        const allIds = new Set(typedData.map((item) => item.id));
        setSelectedIds(allIds);
      });
    }
  };

  const columns: Column<MaterialNotifyItem>[] = [
    {
      header: translate(LANGUAGE_KEYS.notify.selectRecord),
      className: "text-center",
      style: { width: '60px' },
      render: (item) => (
        <Checkbox
          checked={selectedIds.has(item.id)}
          onChange={() => handleToggleSelect(item.id)}
        />
      )
    },
    { header: translate(LANGUAGE_KEYS.notify.group), key: "materialGroupName" },
    { header: translate(LANGUAGE_KEYS.common.materialNumber), key: "materialNumber" },
    { header: translate(LANGUAGE_KEYS.common.productModel), key: "productModel" },
    { header: translate(LANGUAGE_KEYS.common.productName), key: "productName" },
    { header: translate(LANGUAGE_KEYS.common.supplier), key: "supplierName" }
  ];

  return (
    <>
      <ActionBar></ActionBar>

      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Row align="center" gutter={3}>
            <Col md={3}>
              <Input
                type="date"
                label={translate(LANGUAGE_KEYS.notify.changeStart)}
                name="updateDateFrom"
                value={searchForm.updateDateFrom}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="date"
                label={translate(LANGUAGE_KEYS.notify.changeEnd)}
                name="updateDateTo"
                value={searchForm.updateDateTo}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={1}>
              <Input
                label={translate(LANGUAGE_KEYS.notify.group)}
                name="materialGroupName"
                placeholder=""
                value={searchForm.materialGroupName}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={2}>
              <Input
                label={translate(LANGUAGE_KEYS.common.productModel)}
                name="productModel"
                placeholder=""
                value={searchForm.productModel}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={1}>
              <Input
                label={translate(LANGUAGE_KEYS.common.supplier)}
                name="supplierName"
                placeholder=""
                value={searchForm.supplierName}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={2} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                {translate(LANGUAGE_KEYS.common.filter)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>{translate(LANGUAGE_KEYS.common.clear)}</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-start gap-2">
                <Btn onClick={handleSelectAll}>
                  {selectedIds.size > 0 ? translate(LANGUAGE_KEYS.common.deselectAll) : translate(LANGUAGE_KEYS.common.selectAll)}
                </Btn>
            </div>
        </Container>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.MATERIAL_NOTIFY_GET_LIST}
              pageSize={10}
            />
        </Container>

        {hasPermission('Edit') && (
          <Container fluid className="mt-3 d-flex justify-content-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} onClick={handleAddNotify}>
                {translate(LANGUAGE_KEYS.notify.addRecord)}
              </Btn>
          </Container>
        )}
      </WrapContent>
    </>
  );
}
