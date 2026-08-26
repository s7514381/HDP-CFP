'use client';

import ActionBar from '@/components/layouts/ActionBar';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { Btn } from '@packages/components/bootstrap5/Btn';

interface FormActionBarProps {
  title: string;
  formId: string;
  submitLabel?: string;
  loading?: boolean;
  showSubmit?: boolean;
  onBack: () => void;
  backLabel?: string;
}

export default function FormActionBar({
  title,
  formId,
  submitLabel = LANGUAGE_KEYS.common.save,
  loading = false,
  showSubmit = true,
  onBack,
  backLabel = LANGUAGE_KEYS.common.backToList,
}: FormActionBarProps) {
  const { translate } = useLanguage();
  const displaySubmitLabel = /^[A-Z]{2}\d{4}$/.test(submitLabel)
    ? translate(submitLabel)
    : submitLabel;

  return (
    <ActionBar title={title}>
      <div className="ms-auto d-flex gap-2">
        {showSubmit && (
          <Btn type="submit" form={formId} color="primary" loading={loading} icon="save">
            {displaySubmitLabel}
          </Btn>
        )}
        <Btn color="secondary" outline onClick={onBack} icon="cancel" disabled={loading}>
          {translate(backLabel)}
        </Btn>
      </div>
    </ActionBar>
  );
}
