import React, { useEffect, useMemo, useState } from 'react';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import { PcrPatternOwnerRow } from '@/types/productSubcategory';

interface PcrPatternOwnerModalProps {
  show: boolean;
  productSubcategoryId: string;
  onClose(): void;
  onView(owner: PcrPatternOwnerRow): void;
}

export default function PcrPatternOwnerModal({
  show,
  productSubcategoryId,
  onClose,
  onView,
}: PcrPatternOwnerModalProps) {
  const { translate } = useLanguage();
  const tableRef = React.useRef<CommonTableHandle<PcrPatternOwnerRow>>(null);
  const [keyword, setKeyword] = useState('');
  const initialSearchParams = useMemo(
    () => ({ ProductSubcategoryId: productSubcategoryId, Keyword: '' }),
    [productSubcategoryId],
  );

  useEffect(() => {
    if (!show) return;
    tableRef.current?.search(initialSearchParams);
  }, [initialSearchParams, show]);

  const handleSearch = () => {
    tableRef.current?.search({
      ProductSubcategoryId: productSubcategoryId,
      Keyword: keyword.trim(),
    });
  };

  const columns: Column<PcrPatternOwnerRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.account),
      key: 'account',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.userName),
      key: 'name',
    },
    {
      header: translate(LANGUAGE_KEYS.pcrPattern.patternCount),
      className: 'text-center',
      key: 'patternCount',
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '100px' },
      render: (owner) => (
        <Btn type="button" color="primary" size="sm" outline onClick={() => onView(owner)}>
          {translate(LANGUAGE_KEYS.common.view)}
        </Btn>
      ),
    },
  ];

  return (
    <Modal show={show} size="lg" onClose={onClose}>
      <Modal.Title onClose={onClose}>
        {translate(LANGUAGE_KEYS.pcrPattern.selectOtherTemplate)}
      </Modal.Title>
      <Modal.Body>
        <div className="d-flex align-items-end gap-2 mb-3">
          <div className="flex-grow-1">
            <Input
              label={translate(LANGUAGE_KEYS.pcrPattern.account)}
              placeholder={translate(LANGUAGE_KEYS.pcrPattern.account)}
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
          <Btn type="button" color="success" outline icon="search" onClick={handleSearch}>
            {translate(LANGUAGE_KEYS.common.search)}
          </Btn>
        </div>
        <CommonTable
          ref={tableRef}
          columns={columns}
          apiUrl={API_MAP.PRODUCT_SUBCATEGORY_GET_PCR_PATTERN_OWNERS}
          searchParams={initialSearchParams}
          pageSize={10}
          rowKey={(owner) => owner.id}
        />
      </Modal.Body>
    </Modal>
  );
}
