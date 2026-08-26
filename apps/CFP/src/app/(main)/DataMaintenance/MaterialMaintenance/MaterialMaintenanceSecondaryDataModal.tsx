import { useState } from 'react';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import { Input } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';
import { CommonTable, Column } from '@/components/common/CommonTable';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { API_MAP } from '@/lib/apiRoutes';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import {
  MaterialMaintenanceSecondaryDataOption,
  MaterialMaintenanceSource,
} from '@/types/materialMaintenance';

interface MaterialMaintenanceSecondaryDataModalProps {
  show: boolean;
  source: MaterialMaintenanceSource | null;
  submitting: boolean;
  onClose(): void;
  onApply(secondaryDataSettingId: string): void;
}

export function MaterialMaintenanceSecondaryDataModal({
  show,
  source,
  submitting,
  onClose,
  onApply,
}: MaterialMaintenanceSecondaryDataModalProps) {
  const { translate } = useLanguage();
  const { danger } = useToast();
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [selected, setSelected] = useState<MaterialMaintenanceSecondaryDataOption | null>(null);

  const search = () => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      danger({ message: <span>{translate(LANGUAGE_KEYS.secondaryDataCompare.keywordTooShort)}</span> });
      return;
    }

    setSelected(null);
    setSubmittedKeyword(trimmed);
  };

  const clear = () => {
    setKeyword('');
    setSubmittedKeyword('');
    setSelected(null);
  };

  const columns: Column<MaterialMaintenanceSecondaryDataOption>[] = [
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.name), key: 'name' },
    {
      header: translate(LANGUAGE_KEYS.secondaryDataSetting.carbonFactor),
      render: (option) => Number(option.carbonFactor).toFixed(2),
      className: 'text-end text-nowrap',
    },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.unit), key: 'unit' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.departmentName), key: 'departmentName' },
    { header: translate(LANGUAGE_KEYS.secondaryDataSetting.announcementYear), key: 'announcementYear' },
    {
      header: translate(LANGUAGE_KEYS.common.select),
      className: 'text-center',
      style: { width: '100px' },
      render: (option) => (
        <Btn
          type="button"
          color={selected?.id === option.id ? 'primary' : 'secondary'}
          size="sm"
          outline={selected?.id !== option.id}
          onClick={() => setSelected(option)}
        >
          {selected?.id === option.id
            ? translate(LANGUAGE_KEYS.dataMaintenance.selected)
            : translate(LANGUAGE_KEYS.common.select)}
        </Btn>
      ),
    },
  ];

  return (
    <Modal show={show} size="xl" onClose={onClose}>
      <Modal.Title onClose={onClose}>
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.getSecondaryDataTitle)}
      </Modal.Title>
      <Modal.Body>
        {source ? (
          <div className="small text-muted mb-3">
            {source.supplierName} · {source.productName}
          </div>
        ) : null}
        <Input
          label={translate(LANGUAGE_KEYS.dataMaintenance.keyword)}
          placeholder={translate(LANGUAGE_KEYS.secondaryDataSetting.name)}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              search();
            }
          }}
        />
        <div className="d-flex justify-content-end gap-2 my-3">
          <Btn type="button" color="success" outline icon="search" onClick={search}>
            {translate(LANGUAGE_KEYS.common.search)}
          </Btn>
          <Btn type="button" color="light" className="text-primary border" onClick={clear}>
            {translate(LANGUAGE_KEYS.common.clear)}
          </Btn>
        </div>
        {submittedKeyword ? (
          <CommonTable
            key={submittedKeyword}
            columns={columns}
            apiUrl={API_MAP.MATERIAL_MAINTENANCE_GET_SECONDARY_DATA_OPTIONS}
            searchParams={{ Keyword: submittedKeyword }}
            pageSize={5}
            rowKey={(option) => option.id}
          />
        ) : null}
        {selected ? (
          <Card className="border-primary mt-3">
            <Card.Body className="py-2">
              <div className="fw-semibold">{selected.name}</div>
              <div className="small text-muted">
                {Number(selected.carbonFactor).toFixed(2)} · {selected.unit}
              </div>
            </Card.Body>
          </Card>
        ) : null}
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Btn type="button" color="secondary" outline onClick={onClose} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.cancel)}
          </Btn>
          <Btn
            type="button"
            color="primary"
            onClick={() => selected && onApply(selected.id)}
            disabled={!selected || submitting}
            loading={submitting}
          >
            {translate(LANGUAGE_KEYS.common.confirm)}
          </Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
