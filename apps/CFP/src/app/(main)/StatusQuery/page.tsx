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
    updateDateFrom: '',
    updateDateTo: '',
    isSend: null as boolean | null,
    isUpdate: null as boolean | null
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
      updateDateFrom: '',
      updateDateTo: '',
      isSend: null,
      isUpdate: null
    });
    tableRef.current?.search({});
  };

  const columns: Column<any>[] = [
    { 
      header: "是否發送", 
      key: "isSend",
      render: (item) => (
        <span 
          className={`btn btn-sm ${item.isSend ? 'btn-success' : 'btn-danger'}`}
          style={{ pointerEvents: 'none', opacity: 0.85 }}
        >
          {item.isSend ? '已發送' : '未發送'}
        </span>
      )
    },
    { 
      header: "是否更新", 
      key: "isUpdate",
      render: (item) => (
        <span 
          className={`btn btn-sm ${item.isUpdate ? 'btn-success' : 'btn-danger'}`}
          style={{ pointerEvents: 'none', opacity: 0.85 }}
        >
          {item.isUpdate ? '資料已更新' : '資料未更新'}
        </span>
      )
    },
    { header: "寄送時間", key: "strCreateDate" },
    { header: "更新時間", key: "strUpdateDate" },
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
            <Col md={2}>
              <label className="form-label d-block">發送狀態</label>
              <Radio 
                label="已發送" 
                name="isSend"
                value="true"
                checked={searchForm.isSend === true} 
                onChange={() => {}} 
                onClick={() => handleRadioClick('isSend', true)}
                inline
              />
              <Radio 
                label="未發送" 
                name="isSend"
                value="false"
                checked={searchForm.isSend === false} 
                onChange={() => {}}
                onClick={() => handleRadioClick('isSend', false)}
                inline
              />
            </Col>
            <Col md={2}>
              <label className="form-label d-block">更新狀態</label>
              <Radio 
                label="資料已更新" 
                name="isUpdate"
                value="true"
                checked={searchForm.isUpdate === true} 
                onChange={() => {}}
                onClick={() => handleRadioClick('isUpdate', true)}
                inline
              />
              <Radio 
                label="資料未更新" 
                name="isUpdate"
                value="false"
                checked={searchForm.isUpdate === false} 
                onChange={() => {}}
                onClick={() => handleRadioClick('isUpdate', false)}
                inline
              />
            </Col>
            <Col md={3}>
              <Input 
                type="date"
                label="異動開始" 
                name="updateDateFrom"
                value={searchForm.updateDateFrom} 
                onChange={handleSearchChange} 
              />
            </Col>
            <Col md={3}>
              <Input 
                type="date"
                label="異動結束" 
                name="updateDateTo"
                value={searchForm.updateDateTo} 
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

        <Container fluid>
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={`${API_URL}/StatusQuery/GetList`}
              pageSize={10}
            />
        </Container>

      </WrapContent>
    </>
  );
}
