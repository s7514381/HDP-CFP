'use client';

import React, { useState, useRef } from 'react';
import ActionBar from "@/components/layouts/ActionBar";
import WrapContent from "@/components/layouts/WrapContent";
import { SearchBlock } from "@/components/layouts/SearchBlock";
import { Input, Radio } from "@packages/components/bootstrap5/Input";
import { Btn } from "@packages/components/bootstrap5/Btn";
import { CommonTable, Column, CommonTableHandle } from "@/components/common/CommonTable";
import Container from "@packages/components/bootstrap5/Container";
import Grid from "@packages/components/bootstrap5/Grid";
import { API_URL } from '@/lib/apiRoutes';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface StatusSearchForm {
  updateDateFrom: string;
  updateDateTo: string;
  isSend: boolean | null;
  isUpdate: boolean | null;
}

interface StatusRow {
  isSend?: boolean;
  isUpdate?: boolean;
  strCreateDate?: string;
  strUpdateDate?: string;
  materialNumber?: string;
  productModel?: string;
  productName?: string;
  supplierName?: string;
}

export default function MaterialNotifyPage() {
  const { Row, Col } = Grid;
  const { translate } = useLanguage();

  const tableRef = useRef<CommonTableHandle<StatusRow>>(null);

  // 搜尋表單狀態
  const [searchForm, setSearchForm] = useState<StatusSearchForm>({
    updateDateFrom: '',
    updateDateTo: '',
    isSend: null as boolean | null,
    isUpdate: null as boolean | null
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioClick = (name: 'isSend' | 'isUpdate', value: boolean) => {
    setSearchForm(prev => {
      const currentValue = prev[name];
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

  const columns: Column<StatusRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.statusQuery.sendStatus),
      key: "isSend",
      render: (item) => (
        <span
          className={`btn btn-sm ${item.isSend ? 'btn-success' : 'btn-danger'}`}
          style={{ pointerEvents: 'none', opacity: 0.85 }}
        >
          {item.isSend ? translate(LANGUAGE_KEYS.common.sent) : translate(LANGUAGE_KEYS.common.notSent)}
        </span>
      )
    },
    {
      header: translate(LANGUAGE_KEYS.statusQuery.updateStatus),
      key: "isUpdate",
      render: (item) => (
        <span
          className={`btn btn-sm ${item.isUpdate ? 'btn-success' : 'btn-danger'}`}
          style={{ pointerEvents: 'none', opacity: 0.85 }}
        >
          {item.isUpdate ? translate(LANGUAGE_KEYS.common.dataUpdated) : translate(LANGUAGE_KEYS.common.dataNotUpdated)}
        </span>
      )
    },
    { header: translate(LANGUAGE_KEYS.common.sendTime), key: "strCreateDate" },
    { header: translate(LANGUAGE_KEYS.common.updateTime), key: "strUpdateDate" },
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
            <Col md={2}>
              <label className="form-label d-block">{translate(LANGUAGE_KEYS.statusQuery.sendStatus)}</label>
              <Radio
                label={translate(LANGUAGE_KEYS.common.sent)}
                name="isSend"
                value="true"
                checked={searchForm.isSend === true}
                onChange={() => {}}
                onClick={() => handleRadioClick('isSend', true)}
                inline
              />
              <Radio
                label={translate(LANGUAGE_KEYS.common.notSent)}
                name="isSend"
                value="false"
                checked={searchForm.isSend === false}
                onChange={() => {}}
                onClick={() => handleRadioClick('isSend', false)}
                inline
              />
            </Col>
            <Col md={2}>
              <label className="form-label d-block">{translate(LANGUAGE_KEYS.statusQuery.updateStatus)}</label>
              <Radio
                label={translate(LANGUAGE_KEYS.common.dataUpdated)}
                name="isUpdate"
                value="true"
                checked={searchForm.isUpdate === true}
                onChange={() => {}}
                onClick={() => handleRadioClick('isUpdate', true)}
                inline
              />
              <Radio
                label={translate(LANGUAGE_KEYS.common.dataNotUpdated)}
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
                label={translate(LANGUAGE_KEYS.common.startDate)}
                name="updateDateFrom"
                value={searchForm.updateDateFrom}
                onChange={handleSearchChange}
              />
            </Col>
            <Col md={3}>
              <Input
                type="date"
                label={translate(LANGUAGE_KEYS.common.endDate)}
                name="updateDateTo"
                value={searchForm.updateDateTo}
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
