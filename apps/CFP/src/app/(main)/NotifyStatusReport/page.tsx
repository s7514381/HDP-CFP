'use client';

import React, { useState, useRef } from 'react';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input, Checkbox, Radio } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import { useAppApi } from '@/hooks/useAppApi';
import { useToast } from '@packages/contexts/ToastContext';
import { API_MAP,API_URL } from '@/lib/apiRoutes';
import { MaterialNotifyItem } from '@/types/materialNotify';

export default function MaterialNotifyPage() {
  const api = useAppApi();
  const { success, danger } = useToast();
  const { Row, Col } = Grid;

  const tableRef = useRef<CommonTableHandle>(null);
  
  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState({
    createDateFrom: '',
    createDateTo: '',
    supplierName: ''
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let finalValue: any = value;
    
    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'radio') {
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
    }
    
    setSearchForm(prev => ({ 
      ...prev, 
      [name]: finalValue 
    }));
  };

  const handleRadioClick = (name: string, value: boolean) => {
    setSearchForm(prev => {
      const currentValue = (prev as any)[name];
      return {
        ...prev,
        [name]: currentValue === value ? null : value
      };
    });
  };

  const handleSearch = () => {
    tableRef.current?.search({
      ...searchForm
    });
  };

  const handleClear = () => {
    setSearchForm({
      createDateFrom: '',
      createDateTo: '',
      supplierName: ''
    });
    tableRef.current?.search({});
  };

  const columns: Column<any>[] = [
    { header: "寄送時間", key: "strDate" },
    { header: "供應商", key: "supplierName" },
    { header: "收到筆數", key: "sentCount" },
    { header: "更新筆數", key: "updateCount" },
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
                label="寄送開始日期" 
                name="createDateFrom"
                value={searchForm.createDateFrom} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={3}>
              <Input 
                type="date"
                label="寄送結束日期" 
                name="createDateTo"
                value={searchForm.createDateTo} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={3}>
              <Input 
                type="text"
                label="供應商" 
                name="supplierName"
                value={searchForm.supplierName} 
                onChange={handleSearchChange} 
                placeholder="請輸入供應商名稱"
              />
            </Col>
            
            <Col md={3} className="d-flex justify-content-end gap-2 align-items-end">
              <Btn color="success" outline className="bg-success-light text-success border-success" style={{ backgroundColor: '#d1e7dd' }} icon="search" onClick={handleSearch}>
                篩選
              </Btn>
              <Btn color="light" className="text-primary border" onClick={handleClear}>清除</Btn>
            </Col>
          </Row>
        </SearchBlock>

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/NotifyStatusReport/GetList`}
              pageSize={10}
            />
        </Container>

      </WrapContent>
    </>
  );
}
