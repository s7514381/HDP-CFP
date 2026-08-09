import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Grid from '@packages/components/bootstrap5/Grid';
import { Input } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';
import { Select } from '@packages/components/bootstrap5/Select';
import { SourceFormState } from './materialMaintenanceValidation';

export interface MaterialMaintenanceSourceModalProps {
  show: boolean;
  submitting: boolean;
  sourceForm: SourceFormState;
  supplierOptions: { value: string; label: string }[];
  onClose(): void;
  onChange(changes: Partial<SourceFormState>): void;
  onSave(): void;
}

export function MaterialMaintenanceSourceModal({
  show,
  submitting,
  sourceForm,
  supplierOptions,
  onClose,
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
          <Grid.Col md={6}>
            <Select
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplier, 'Supplier')}
              prompt={translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplierPlaceholder, 'Select a supplier')}
              value={sourceForm.supplierId}
              onChange={(event) => onChange({ supplierId: event.target.value })}
              options={supplierOptions}
            />
          </Grid.Col>
          <Grid.Col md={6}>
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
          <Grid.Col md={12}>
            <Input
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.productName, 'Product name')}
              placeholder={translate(LANGUAGE_KEYS.rawMaterialMaintenance.productNamePlaceholder, 'Enter the supplied product name')}
              value={sourceForm.productName}
              onChange={(event) => onChange({ productName: event.target.value })}
              autoFocus
            />
          </Grid.Col>
        </Grid.Row>
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
