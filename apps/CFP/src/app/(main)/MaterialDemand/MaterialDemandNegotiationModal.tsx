'use client';

import React, { FormEvent, useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';

interface Props {
  show: boolean;
  demandId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialDemandNegotiationModal({ show, demandId, onClose, onSuccess }: Props) {
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success } = useToast();
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const value = Number(price);
    if (!price.trim()) {
      setError(translate(LANGUAGE_KEYS.materialDemand.priceRequired));
      return;
    }
    if (!Number.isFinite(value) || value < 0) {
      setError(translate(LANGUAGE_KEYS.materialDemand.priceInvalid));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await formPost<boolean>(API_MAP.MATERIAL_DEMAND_REPLY_NEGOTIATION, {
        id: demandId,
        consultantResponsePrice: value,
      });
      if (!result.success) {
        setError(result.message || translate(LANGUAGE_KEYS.materialDemand.operationFailed));
        return;
      }
      success({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.replySucceeded)}</span> });
      onSuccess();
      onClose();
    } catch {
      setError(translate(LANGUAGE_KEYS.materialDemand.operationFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <Modal show={show} size="sm" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>{translate(LANGUAGE_KEYS.materialDemand.replyNegotiation)}</Modal.Title>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <Input
            type="number"
            label={translate(LANGUAGE_KEYS.materialDemand.consultantResponsePrice)}
            labelMark
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={submitting}
            required
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
              {translate(LANGUAGE_KEYS.common.cancel)}
            </Btn>
            <Btn type="submit" color="primary" loading={submitting} disabled={submitting}>
              {translate(LANGUAGE_KEYS.common.confirm)}
            </Btn>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
