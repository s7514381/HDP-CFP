import { useState } from 'react';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Modal from '@packages/components/bootstrap5/Modal';
import { CommonTable, Column } from '@/components/common/CommonTable';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import { BuyerAccreditationLevelRow } from '@/types/buyerAccreditationLevel';
import { MaterialMaintenanceSource } from '@/types/materialMaintenance';

interface MaterialMaintenanceAccreditationLevelModalProps {
  show: boolean;
  materialId: string;
  source: MaterialMaintenanceSource | null;
  submitting: boolean;
  onClose(): void;
  onApply(accreditationLevelId: string): void;
}

export function MaterialMaintenanceAccreditationLevelModal({
  show,
  materialId,
  source,
  submitting,
  onClose,
  onApply,
}: MaterialMaintenanceAccreditationLevelModalProps) {
  const { translate } = useLanguage();
  const [selected, setSelected] = useState<BuyerAccreditationLevelRow | null>(() => (
    source?.accreditationLevelSettingId
      ? {
        id: source.accreditationLevelSettingId,
        name: source.accreditationLevelSettingName || '',
      }
      : null
  ));

  const columns: Column<BuyerAccreditationLevelRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.common.sequencePlaceholder),
      className: 'text-end',
      key: 'sequence',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.level),
      key: 'name',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification),
      className: 'text-center',
      render: (level) => (
        level.thirdPartyCertification === true
        || String(level.thirdPartyCertification).toLowerCase() === 'true'
          ? translate(LANGUAGE_KEYS.common.yes)
          : translate(LANGUAGE_KEYS.common.no)
      ),
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount),
      className: 'text-end',
      key: 'consultantApprovalCount',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.buyerApprovalCount),
      className: 'text-end',
      key: 'buyerApprovalCount',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.totalScore),
      className: 'text-end',
      key: 'totalScore',
    },
    {
      header: translate(LANGUAGE_KEYS.common.select),
      className: 'text-center',
      style: { width: '100px' },
      render: (level) => (
        <Btn
          type="button"
          color={String(selected?.id) === String(level.id) ? 'primary' : 'secondary'}
          size="sm"
          outline={String(selected?.id) !== String(level.id)}
          onClick={() => setSelected(level)}
        >
          {String(selected?.id) === String(level.id)
            ? translate(LANGUAGE_KEYS.dataMaintenance.selected)
            : translate(LANGUAGE_KEYS.common.select)}
        </Btn>
      ),
    },
  ];

  return (
    <Modal show={show} size="xl" onClose={onClose}>
      <Modal.Title onClose={onClose}>
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.setAccreditationLevelTitle)}
      </Modal.Title>
      <Modal.Body>
        {source ? (
          <div className="small text-muted mb-3">
            {source.supplierName} · {source.productName}
          </div>
        ) : null}
        <CommonTable
          columns={columns}
          apiUrl={API_MAP.BUYER_ACCREDITATION_LEVEL_GET_LIST}
          searchParams={{ materialId }}
          pageSize={10}
          rowKey={(level) => level.id}
        />
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Btn type="button" color="secondary" outline onClick={onClose} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.cancel)}
          </Btn>
          <Btn
            type="button"
            color="primary"
            onClick={() => selected && onApply(String(selected.id))}
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
