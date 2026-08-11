import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Grid from '@packages/components/bootstrap5/Grid';
import { Checkbox, DropdownInput, Input } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';
import { SourceFormState } from './materialMaintenanceValidation';
import { SourceSelectListItem } from './materialMaintenanceService';

export interface MaterialMaintenanceSourceModalProps {
  show: boolean;
  submitting: boolean;
  sourceForm: SourceFormState;
  sourceError: string | null;
  fetchSourceOptions(keyword: string): Promise<SourceSelectListItem[]>;
  onClose(): void;
  onDismissError(): void;
  onChange(changes: Partial<SourceFormState>): void;
  onSave(): void;
}

export function MaterialMaintenanceSourceModal({
  show,
  submitting,
  sourceForm,
  sourceError,
  fetchSourceOptions,
  onClose,
  onDismissError,
  onChange,
  onSave,
}: MaterialMaintenanceSourceModalProps) {
  const { translate } = useLanguage();

  return (
    <Modal show={show} size="lg" onClose={onClose}>
      <Modal.Title onClose={onClose}>
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addSourceTitle, 'Add supplier source')} · {sourceForm.year}
      </Modal.Title>
      <Modal.Body>
        <Grid.Row className="g-3">
          <Grid.Col md={12}>
            <DropdownInput
              label={translate(LANGUAGE_KEYS.sellerCompare.selectSupplierMaterial, '選擇供應商/料號')}
              placeholder={translate(LANGUAGE_KEYS.common.materialNumber, '輸入統編、料號或名稱關鍵字搜尋...')}
              fetchItems={async (keyword) => {
                const options = await fetchSourceOptions(keyword);
                return options.map((option) => ({
                  value: String(option.value),
                  label: option.text || String(option.value),
                }));
              }}
              onItemSelect={(item) => onChange({ sourceMaterialId: item.value })}
              debounce={300}
              clear={!show}
            />
          </Grid.Col>
          <Grid.Col md={12}>
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocation, 'Allocation (%)')}
              placeholder={translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocationPlaceholder, 'e.g. 50')}
              min={0.01}
              max={100}
              step={0.01}
              value={sourceForm.allocationPercentage}
              onChange={(event) => onChange({ allocationPercentage: event.target.value })}
            />
          </Grid.Col>
          <Grid.Col md={6}>
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.carbonFactor, 'Carbon factor (kg CO₂e)')}
              placeholder={translate(LANGUAGE_KEYS.rawMaterialMaintenance.carbonFactorPlaceholder, 'e.g. 1.81')}
              min={0}
              step={0.000001}
              value={sourceForm.carbonFactor}
              onChange={(event) => onChange({ carbonFactor: event.target.value })}
            />
          </Grid.Col>
          <Grid.Col md={6} className="d-flex align-items-end pb-2">
            <Checkbox
              name="thirdPartyCertification"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.thirdPartyCertification, 'Third-party certification')}
              checked={sourceForm.thirdPartyCertification}
              onChange={(event) => onChange({ thirdPartyCertification: event.target.checked })}
            />
          </Grid.Col>
          <Grid.Col md={4}>
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.consultantApprovalCount, 'Consultant approvals')}
              min={0}
              step={1}
              value={sourceForm.consultantApprovalCount}
              onChange={(event) => onChange({ consultantApprovalCount: event.target.value })}
            />
          </Grid.Col>
          <Grid.Col md={4}>
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.buyerApprovalCount, 'Buyer approvals')}
              min={0}
              step={1}
              value={sourceForm.buyerApprovalCount}
              onChange={(event) => onChange({ buyerApprovalCount: event.target.value })}
            />
          </Grid.Col>
          <Grid.Col md={4}>
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.totalScore, 'Total score')}
              min={0}
              step={1}
              value={sourceForm.totalScore}
              onChange={(event) => onChange({ totalScore: event.target.value })}
            />
          </Grid.Col>
        </Grid.Row>
        {sourceError ? (
          <div className="alert alert-danger mt-3 mb-0 d-flex align-items-start justify-content-between gap-3" role="alert">
            <span>{sourceError}</span>
            <button
              type="button"
              className="btn-close flex-shrink-0"
              aria-label="Close"
              onClick={onDismissError}
            />
          </div>
        ) : null}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <Btn type="button" color="secondary" outline onClick={onClose} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.cancel, 'Cancel')}
          </Btn>
          <Btn type="button" color="primary" icon="save" onClick={onSave} loading={submitting}>
            {translate(LANGUAGE_KEYS.common.save, 'Save')}
          </Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
