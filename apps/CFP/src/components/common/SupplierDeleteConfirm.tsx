'use client';

import React from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface SupplierDeleteConfirmProps {
  show: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SupplierDeleteConfirm({ show, message, onConfirm, onCancel }: SupplierDeleteConfirmProps) {
  const { translate } = useLanguage();

  return (
    <Modal show={show} size="sm" onClose={onCancel}>
      <Modal.Title onClose={onCancel}>{translate(LANGUAGE_KEYS.common.confirm)}</Modal.Title>
      <Modal.Body>
        <p>{message}</p>
        <div className="d-flex justify-content-end gap-2">
          <Btn type="button" color="secondary" outline onClick={onCancel}>
            {translate(LANGUAGE_KEYS.common.cancel)}
          </Btn>
          <Btn type="button" color="danger" onClick={onConfirm}>
            {translate(LANGUAGE_KEYS.common.confirm)}
          </Btn>
        </div>
      </Modal.Body>
    </Modal>
  );
}
