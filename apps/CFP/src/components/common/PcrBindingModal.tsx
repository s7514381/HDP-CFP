'use client';

import React, { useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Input } from '@packages/components/bootstrap5/Input';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Container from '@packages/components/bootstrap5/Container';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { API_MAP } from '@/lib/apiRoutes';
import { TableSearchParams } from '@/components/common/tableUtils';
import { useToast } from '@packages/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

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
  currentSelectedRowId?: string | number | null;
}

const INITIAL_SEARCH: PcrBindingSearch = { Keyword: '' };

const isSameId = (left: string | number | null | undefined, right: string | number | null | undefined) =>
  left != null && right != null && String(left) === String(right);

export default function PcrBindingModal({
  show,
  onClose,
  onConfirm,
  currentSelectedRowId = null,
}: PcrBindingModalProps) {
  const tableRef = React.useRef<CommonTableHandle<PcrBindingRow>>(null);
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedRow, setSelectedRow] = useState<PcrBindingRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { danger } = useToast();
  const { translate } = useLanguage();

  const handleSearch = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length < 2) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.dataMaintenance.keywordTooShort, 'Enter at least 2 characters.')}</span> });
      return;
    }

    setSelectedRow(null);
    setSubmittedKeyword(trimmedKeyword);
    setHasSearched(true);
    tableRef.current?.search({ Keyword: trimmedKeyword });
  };

  const handleClear = () => {
    setKeyword('');
    setSubmittedKeyword('');
    setHasSearched(false);
    setSelectedRow(null);
  };

  const handleClose = () => {
    if (submitting) return;
    setKeyword('');
    setSubmittedKeyword('');
    setHasSearched(false);
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
      header: translate(LANGUAGE_KEYS.productSubcategory.productSubcategory, 'Product subcategory'),
      key: 'name',
    },
    {
      header: 'CCC code',
      key: 'cccCode',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.developer, 'Developer'),
      key: 'developer',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.applicableScope, 'Applicable scope'),
      key: 'applicableScope',
    },
    {
      header: translate(LANGUAGE_KEYS.common.select, 'Select'),
      className: 'text-center',
      style: { width: '100px' },
      render: (row) => {
        const isSelected = selectedRow
          ? isSameId(selectedRow.id, row.id)
          : isSameId(currentSelectedRowId, row.id);

        return (
          <Btn
            type="button"
            color={isSelected ? 'primary' : 'secondary'}
            size="sm"
            outline={!isSelected}
            onClick={() => setSelectedRow(row)}
          >
            {isSelected
              ? translate(LANGUAGE_KEYS.dataMaintenance.selected, 'Selected')
              : translate(LANGUAGE_KEYS.common.select, 'Select')}
          </Btn>
        );
      },
    },
  ];

  return (
    <Modal show={show} size="xl" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>
        {translate(LANGUAGE_KEYS.dataMaintenance.bindModalTitle, 'Bind PCR template')}
      </Modal.Title>
      <Modal.Body>
        <div className="mb-3">
          <Input
            label={translate(LANGUAGE_KEYS.dataMaintenance.keyword, 'Keyword')}
            placeholder={translate(LANGUAGE_KEYS.dataMaintenance.keywordPlaceholder, 'Product subcategory, CCC code, or developer')}
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
            {translate(LANGUAGE_KEYS.common.search, 'Search')}
          </Btn>
          <Btn type="button" color="light" className="text-primary border" onClick={handleClear}>
            {translate(LANGUAGE_KEYS.common.clear, 'Clear')}
          </Btn>
        </div>
        <Container fluid>
          <CommonTable
            key={hasSearched ? 'searched' : 'not-searched'}
            ref={tableRef}
            columns={columns}
            apiUrl={hasSearched ? API_MAP.PRODUCT_SUBCATEGORY_GET_LIST : undefined}
            searchParams={hasSearched ? { Keyword: submittedKeyword } : INITIAL_SEARCH}
            pageSize={5}
            rowKey={(row) => row.id}
          />
        </Container>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.cancel, 'Cancel')}
          </Btn>
          <Btn
            type="button"
            color="primary"
            onClick={handleConfirm}
            disabled={!selectedRow || submitting}
            loading={submitting}
          >
            {translate(LANGUAGE_KEYS.common.confirm, 'Confirm')}
          </Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
