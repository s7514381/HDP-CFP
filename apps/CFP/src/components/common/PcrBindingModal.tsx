'use client';

import React, { useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Input } from '@packages/components/bootstrap5/Input';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Container from '@packages/components/bootstrap5/Container';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { API_MAP } from '@/lib/apiRoutes';
import { TableSearchParams } from '@/components/common/tableUtils';

export interface PcrBindingRow {
  id: string | number;
  name?: string;
  cccCode?: string;
  developer?: string;
  applicableScope?: string;
}

interface PcrBindingSearch extends TableSearchParams {
  Keyword: string;
}

interface PcrBindingModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: (row: PcrBindingRow) => Promise<boolean>;
}

const INITIAL_SEARCH: PcrBindingSearch = { Keyword: '' };

export default function PcrBindingModal({
  show,
  onClose,
  onConfirm,
}: PcrBindingModalProps) {
  const tableRef = React.useRef<CommonTableHandle<PcrBindingRow>>(null);
  const [keyword, setKeyword] = useState('');
  const [selectedRow, setSelectedRow] = useState<PcrBindingRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = () => {
    tableRef.current?.search({ Keyword: keyword.trim() });
  };

  const handleClear = () => {
    setKeyword('');
    setSelectedRow(null);
    tableRef.current?.search(INITIAL_SEARCH);
  };

  const handleClose = () => {
    if (submitting) return;
    setKeyword('');
    setSelectedRow(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!selectedRow || submitting) return;

    setSubmitting(true);
    try {
      if (await onConfirm(selectedRow)) {
        handleClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<PcrBindingRow>[] = [
    {
      header: '產品次類別',
      key: 'name',
    },
    {
      header: 'CCC code',
      key: 'cccCode',
    },
    {
      header: '制定者',
      key: 'developer',
    },
    {
      header: '適用範圍',
      key: 'applicableScope',
    },
    {
      header: '選擇',
      className: 'text-center',
      style: { width: '100px' },
      render: (row) => (
        <Btn
          type="button"
          color={selectedRow?.id === row.id ? 'primary' : 'secondary'}
          size="sm"
          outline={selectedRow?.id !== row.id}
          onClick={() => setSelectedRow(row)}
        >
          {selectedRow?.id === row.id ? '已選擇' : '選擇'}
        </Btn>
      ),
    },
  ];

  return (
    <Modal show={show} size="xl" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>綁定 PCR 模板</Modal.Title>
      <Modal.Body>
        <div className="mb-3">
          <Input
            label="關鍵字"
            placeholder="產品次類別、CCC code 或制定者"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
              }
            }}
          />
        </div>
        <div className="d-flex justify-content-end gap-2 mb-3">
          <Btn type="button" color="success" outline icon="search" onClick={handleSearch}>
            查詢
          </Btn>
          <Btn type="button" color="light" className="text-primary border" onClick={handleClear}>
            清除
          </Btn>
        </div>
        <Container fluid>
          <CommonTable
            ref={tableRef}
            columns={columns}
            apiUrl={API_MAP.PRODUCT_SUBCATEGORY_GET_LIST}
            searchParams={INITIAL_SEARCH}
            pageSize={5}
            rowKey={(row) => row.id}
          />
        </Container>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
            取消
          </Btn>
          <Btn
            type="button"
            color="primary"
            onClick={handleConfirm}
            disabled={!selectedRow || submitting}
            loading={submitting}
          >
            確認
          </Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
