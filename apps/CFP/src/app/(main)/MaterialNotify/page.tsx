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
import { useToast } from '@packages/contexts/ToastContext';
import { API_MAP } from '@/lib/apiRoutes';
import { MaterialNotifyItem } from '@/types/materialNotify';

export default function MaterialNotifyPage() {
  const api = useAppApi();
  const { success, danger } = useToast();
  const { Row, Col } = Grid;

  const tableRef = useRef<CommonTableHandle>(null);
  
  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState({
    startDate: '',
    endDate: '',
    group: '',
    productModel: '',
    supplier: ''
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
      startDate: '',
      endDate: '',
      group: '',
      productModel: '',
      supplier: ''
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
      danger({ message: <span>請至少勾選一項。</span> });
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
        success({ message: <span>已加入通知紀錄！</span> });
        setSelectedIds(new Set());
      } else {
        danger({ message: <span>加入通知紀錄失敗</span> });
      }
    } catch (error) {
      danger({ message: <span>加入通知紀錄失敗</span> });
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

  const columns: Column<any>[] = [
    {
      header: "勾選",
      className: "text-center",
      style: { width: '60px' },
      render: (item) => (
        <Checkbox 
          checked={selectedIds.has(item.id)}
          onChange={() => handleToggleSelect(item.id)}
        />
      )
    },
    { header: "群組", key: "materialGroupName" },
    { header: "料號", key: "materialNumber" },
    { header: "產品型號", key: "productModel" },
    { header: "產品名稱", key: "productName" },
    { header: "供應商", key: "supplierName" }
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
                label="異動紀錄開始日期" 
                name="startDate"
                value={searchForm.startDate} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={3}>
              <Input 
                type="date"
                label="異動紀錄結束日期" 
                name="endDate"
                value={searchForm.endDate} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={1}>
              <Input 
                label="群組" 
                name="group"
                placeholder="CPU" 
                value={searchForm.group} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={2}>
              <Input 
                label="產品型號" 
                name="productModel"
                placeholder="2815-1041" 
                value={searchForm.productModel} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={1}>
              <Input 
                label="供應商" 
                name="supplier"
                placeholder="QCOM" 
                value={searchForm.supplier} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={2} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                篩選
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>清除</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid className="mb-3">
            <div className="d-flex justify-content-start gap-2">
                <Btn onClick={handleSelectAll}>
                  {selectedIds.size > 0 ? '取消全選' : '全選'}
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

        <Container fluid className="mt-3 d-flex justify-content-end">
            <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} onClick={handleAddNotify}>
              加入通知紀錄
            </Btn>
        </Container>
      </WrapContent>
    </>
  );
}
