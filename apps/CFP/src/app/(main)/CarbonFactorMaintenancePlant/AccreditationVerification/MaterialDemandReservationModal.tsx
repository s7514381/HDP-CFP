'use client';

import React, { FormEvent, useState } from 'react';
import Modal from '@packages/components/bootstrap5/Modal';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { useToast } from '@packages/contexts/ToastContext';
import { API_MAP } from '@/lib/apiRoutes';
import { ConsultantRow } from '@/types/consultant';
import { MaterialDemandType } from '@/types/materialDemand';
import {
  renderConsultantCount,
  renderConsultantRating,
} from '@/components/common/consultantTableUtils';
import { reserveMaterialDemand } from './materialDemandReservationService';

interface MaterialDemandReservationModalProps {
  show: boolean;
  plantId: string;
  demandType: MaterialDemandType;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaterialDemandReservationModal({
  show,
  plantId,
  demandType,
  onClose,
  onSuccess,
}: MaterialDemandReservationModalProps) {
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success } = useToast();
  const tableRef = React.useRef<CommonTableHandle<ConsultantRow>>(null);
  const [name, setName] = useState('');
  const [certificationMode, setCertificationMode] = useState('');
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantRow | null>(null);
  const [demandPrice, setDemandPrice] = useState('');
  const [isUrgent, setIsUrgent] = useState('false');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchConsultants = () => {
    setSelectedConsultant(null);
    tableRef.current?.search({
      Name: name.trim() || undefined,
      CertificationMode: certificationMode.trim() || undefined,
    });
  };

  const clearConsultantSearch = () => {
    setName('');
    setCertificationMode('');
    setSelectedConsultant(null);
    tableRef.current?.search({});
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const price = Number(demandPrice);
    if (!selectedConsultant) {
      setError(translate(LANGUAGE_KEYS.materialDemand.consultantRequired));
      return;
    }
    if (!demandPrice.trim()) {
      setError(translate(LANGUAGE_KEYS.materialDemand.priceRequired));
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError(translate(LANGUAGE_KEYS.materialDemand.priceInvalid));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await reserveMaterialDemand(formPost, {
        carbonFactorMaintenancePlantId: plantId,
        consultantId: selectedConsultant.id,
        demandType,
        demandPrice: price,
        isUrgent: isUrgent === 'true',
      });

      if (!result.success) {
        setError(result.message || translate(LANGUAGE_KEYS.materialDemand.reservationFailed));
        return;
      }

      success({ message: <span>{result.message || translate(LANGUAGE_KEYS.materialDemand.reservationSucceeded)}</span> });
      onSuccess();
      onClose();
    } catch {
      setError(translate(LANGUAGE_KEYS.materialDemand.reservationFailed));
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<ConsultantRow>[] = [
    { header: translate(LANGUAGE_KEYS.consultant.name), key: 'name' },
    { header: translate(LANGUAGE_KEYS.consultant.certificationMode), key: 'certificationMode' },
    { header: translate(LANGUAGE_KEYS.consultant.experienceIndustryCategory), key: 'experienceIndustryCategory' },
    {
      header: translate(LANGUAGE_KEYS.consultant.customerRating),
      className: 'text-center',
      render: (row) => renderConsultantRating(row.customerRating),
    },
    {
      header: translate(LANGUAGE_KEYS.consultant.organizationGuidanceCount),
      className: 'text-center',
      render: (row) => renderConsultantCount(row.organizationGuidanceCount),
    },
    {
      header: translate(LANGUAGE_KEYS.consultant.organizationAuditCount),
      className: 'text-center',
      render: (row) => renderConsultantCount(row.organizationAuditCount),
    },
    {
      header: translate(LANGUAGE_KEYS.consultant.organizationReviewCount),
      className: 'text-center',
      render: (row) => renderConsultantCount(row.organizationReviewCount),
    },
    {
      header: translate(LANGUAGE_KEYS.consultant.organizationCertificationCount),
      className: 'text-center',
      render: (row) => renderConsultantCount(row.organizationCertificationCount),
    },
    {
      header: translate(LANGUAGE_KEYS.common.select),
      className: 'text-center',
      style: { width: '100px' },
      render: (row) => {
        const isSelected = selectedConsultant?.id === row.id;
        return (
          <Btn
            type="button"
            color={isSelected ? 'primary' : 'secondary'}
            size="sm"
            outline={!isSelected}
            onClick={() => setSelectedConsultant(row)}
          >
            {isSelected
              ? translate(LANGUAGE_KEYS.dataMaintenance.selected)
              : translate(LANGUAGE_KEYS.common.select)}
          </Btn>
        );
      },
    },
  ];

  const title = demandType === '0'
    ? LANGUAGE_KEYS.materialDemand.reserveAccreditation
    : LANGUAGE_KEYS.materialDemand.reserveGuidance;

  return (
    <Modal show={show} size="xl" onClose={handleClose}>
      <Modal.Title onClose={handleClose}>{translate(title)}</Modal.Title>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <Grid.Row align="center" gutter={3}>
            <Grid.Col md={5}>
              <Input
                label={translate(LANGUAGE_KEYS.consultant.name)}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col md={5}>
              <Input
                label={translate(LANGUAGE_KEYS.consultant.certificationMode)}
                value={certificationMode}
                onChange={(event) => setCertificationMode(event.target.value)}
              />
            </Grid.Col>
          </Grid.Row>
          <Grid.Row className="mt-2">
            <Grid.Col md={12} className="d-flex justify-content-end gap-2">
              <Btn type="button" color="success" outline icon="search" onClick={searchConsultants}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn type="button" color="light" className="text-primary border" onClick={clearConsultantSearch}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Grid.Col>
          </Grid.Row>

          <Container fluid className="mt-3 px-0">
            <CommonTable
              ref={tableRef}
              columns={columns}
              apiUrl={API_MAP.MATERIAL_DEMAND_GET_ACCREDITED_CONSULTANT_OPTIONS}
              searchParams={{}}
              pageSize={10}
              rowKey={(row) => row.id}
            />
          </Container>

          <div className="border-top mt-3 pt-3">
            <Grid.Row gutter={3}>
              <Grid.Col md={6}>
                <Input
                  type="number"
                  label={translate(LANGUAGE_KEYS.materialDemand.demandPrice)}
                  labelMark
                  min="0"
                  step="0.01"
                  value={demandPrice}
                  onChange={(event) => setDemandPrice(event.target.value)}
                  disabled={submitting}
                  required
                />
              </Grid.Col>
              <Grid.Col md={6}>
                <label className="form-label">{translate(LANGUAGE_KEYS.materialDemand.reservationUrgency)}</label>
                <select
                  className="form-select"
                  value={isUrgent}
                  onChange={(event) => setIsUrgent(event.target.value)}
                  disabled={submitting}
                >
                  <option value="false">{translate(LANGUAGE_KEYS.materialDemand.normal)}</option>
                  <option value="true">{translate(LANGUAGE_KEYS.materialDemand.urgent)}</option>
                </select>
              </Grid.Col>
            </Grid.Row>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Btn type="button" color="secondary" outline onClick={handleClose} disabled={submitting}>
              {translate(LANGUAGE_KEYS.common.cancel)}
            </Btn>
            <Btn type="submit" color="primary" loading={submitting} disabled={!selectedConsultant || submitting}>
              {translate(LANGUAGE_KEYS.common.confirm)}
            </Btn>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
