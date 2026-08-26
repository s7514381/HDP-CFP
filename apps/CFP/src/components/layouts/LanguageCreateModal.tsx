'use client';

import React, { useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Input } from '@packages/components/bootstrap5/Input';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';

interface LanguageCreateData {
  name: string;
  code: string;
}

interface LanguageCreateModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: LanguageCreateData) => Promise<boolean>;
}

export default function LanguageCreateModal({ show, onClose, onSubmit }: LanguageCreateModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { translate } = useLanguage();

  const handleClose = () => {
    setName('');
    setCode('');
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const submitted = await onSubmit({ name, code });
      if (submitted) handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} size="sm" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>{translate(LANGUAGE_KEYS.languageResource.addLanguageTitle)}</Modal.Title>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <Input
              label={translate(LANGUAGE_KEYS.common.languageName)}
              labelMark
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder={translate(LANGUAGE_KEYS.common.languageNamePlaceholder)}
              autoFocus
              required
            />
          </div>
          <div className="mb-3">
            <Input
              label={translate(LANGUAGE_KEYS.common.languageCode)}
              labelMark
              value={code}
              onChange={event => setCode(event.target.value)}
              placeholder={translate(LANGUAGE_KEYS.common.languageCodePlaceholder)}
              required
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
              {translate(LANGUAGE_KEYS.common.cancel)}
            </Btn>
            <Btn type="submit" color="primary" icon="add" loading={submitting}>
              {translate(LANGUAGE_KEYS.languageResource.addLanguage)}
            </Btn>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
