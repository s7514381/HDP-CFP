import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Modal from '@packages/components/bootstrap5/Modal';

export interface MaterialMaintenanceYearModalProps {
  show: boolean;
  submitting: boolean;
  onClose(): void;
  onSave(year: string): Promise<boolean>;
}

export function MaterialMaintenanceYearModal({
  show,
  submitting,
  onClose,
  onSave,
}: MaterialMaintenanceYearModalProps) {
  const [year, setYear] = useState('');
  const { translate } = useLanguage();

  const handleClose = () => {
    if (submitting) return;
    setYear('');
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const added = await onSave(year);
    if (added) {
      setYear('');
      onClose();
    }
  };

  return (
    <Modal show={show} size="sm" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>
        {translate(LANGUAGE_KEYS.rawMaterialMaintenance.addYearTitle)}
      </Modal.Title>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Input
              type="number"
              label={translate(LANGUAGE_KEYS.rawMaterialMaintenance.addYear)}
              placeholder={translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearPlaceholder)}
              min={1900}
              max={2100}
              value={year}
              onChange={(event) => setYear(event.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
              {translate(LANGUAGE_KEYS.common.cancel)}
            </Btn>
            <Btn type="submit" color="primary" icon="add" loading={submitting}>
              {translate(LANGUAGE_KEYS.common.add)}
            </Btn>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
