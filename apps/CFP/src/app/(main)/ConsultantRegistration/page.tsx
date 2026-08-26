'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Grid from '@packages/components/bootstrap5/Grid';
import { Input } from '@packages/components/bootstrap5/Input';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import { ConsultantRegistrationForm, ConsultantRegistrationStatus } from '@/types/consultant';

const EMPTY_FORM: ConsultantRegistrationForm = {
  name: '',
  certificationMode: '',
  experienceIndustryCategory: '',
  customerRating: '',
  organizationGuidanceCount: '',
  organizationAuditCount: '',
  organizationReviewCount: '',
  organizationCertificationCount: '',
};

function numberOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed === '' ? undefined : Number(trimmed);
}

function countText(value: number | null | undefined) {
  return value == null ? '-' : `${value}+`;
}

function registrationFormFromStatus(status: ConsultantRegistrationStatus): ConsultantRegistrationForm {
  const consultant = status.consultant;
  return consultant ? {
    name: consultant.name || '',
    certificationMode: consultant.certificationMode || '',
    experienceIndustryCategory: consultant.experienceIndustryCategory || '',
    customerRating: consultant.customerRating == null ? '' : String(consultant.customerRating),
    organizationGuidanceCount: consultant.organizationGuidanceCount == null ? '' : String(consultant.organizationGuidanceCount),
    organizationAuditCount: consultant.organizationAuditCount == null ? '' : String(consultant.organizationAuditCount),
    organizationReviewCount: consultant.organizationReviewCount == null ? '' : String(consultant.organizationReviewCount),
    organizationCertificationCount: consultant.organizationCertificationCount == null ? '' : String(consultant.organizationCertificationCount),
  } : EMPTY_FORM;
}

export default function ConsultantRegistrationPage() {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission, isReady } = usePagePermissions('/ConsultantRegistration');
  const { success, danger } = useToast();
  const [status, setStatus] = useState<ConsultantRegistrationStatus | null>(null);
  const [formData, setFormData] = useState<ConsultantRegistrationForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canAccess = hasPermission('Consultant:Register');

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/');
  }, [canAccess, isReady, router]);

  useEffect(() => {
    if (!isReady || !canAccess) return;

    let active = true;
    const loadStatus = async () => {
      setLoading(true);
      try {
        const result = await formPost<ConsultantRegistrationStatus>(API_MAP.CONSULTANT_GET_REGISTRATION_STATUS, {});
        if (!active) return;

        if (result.success && result.data) {
          setStatus(result.data);
          setFormData(registrationFormFromStatus(result.data));
        } else {
          danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
        }
      } catch {
        if (active) danger({ message: <span>{translate(LANGUAGE_KEYS.common.loadFailed)}</span> });
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadStatus();
    return () => { active = false; };
  }, [canAccess, danger, formPost, isReady, translate]);

  const updateField = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const result = await formPost<ConsultantRegistrationStatus>(API_MAP.CONSULTANT_REGISTER, {
        name: formData.name.trim(),
        certificationMode: formData.certificationMode.trim(),
        experienceIndustryCategory: formData.experienceIndustryCategory.trim() || undefined,
        customerRating: numberOrUndefined(formData.customerRating),
        organizationGuidanceCount: numberOrUndefined(formData.organizationGuidanceCount),
        organizationAuditCount: numberOrUndefined(formData.organizationAuditCount),
        organizationReviewCount: numberOrUndefined(formData.organizationReviewCount),
        organizationCertificationCount: numberOrUndefined(formData.organizationCertificationCount),
      });

      if (result.success && result.data) {
        setStatus(result.data);
        setFormData(registrationFormFromStatus(result.data));
        success({
          message: <span>{result.message || translate(LANGUAGE_KEYS.consultant.registrationSucceeded)}</span>,
        });
      } else {
        danger({
          message: <span>{result.message || translate(LANGUAGE_KEYS.consultant.registrationFailed)}</span>,
        });
      }
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.consultant.registrationFailed)}</span> });
    } finally {
      setSubmitting(false);
    }
  };

  if (isReady && !canAccess) return null;

  const registered = status?.hasRegistration === true;
  const statusText = status?.status === 'accredited'
    ? translate(LANGUAGE_KEYS.consultant.registrationAccredited)
    : translate(LANGUAGE_KEYS.consultant.registrationPending);

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.consultant.registrationTitle)} />
      <WrapContent className="p-3">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : registered ? (
          <Card>
            <Card.Header>
              <div className="d-flex align-items-center justify-content-between gap-2">
                <Card.Title as="h5" className="mb-0">
                  {translate(LANGUAGE_KEYS.consultant.registrationTitle)}
                </Card.Title>
                <span className={`badge ${status?.status === 'accredited' ? 'text-bg-success' : 'text-bg-warning'}`}>
                  {statusText}
                </span>
              </div>
            </Card.Header>
            <Card.Body>
              <Grid.Row className="g-3">
                <Grid.Col md={6}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.name)} value={formData.name} /></Grid.Col>
                <Grid.Col md={6}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.certificationMode)} value={formData.certificationMode} /></Grid.Col>
                <Grid.Col md={12}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.experienceIndustryCategory)} value={formData.experienceIndustryCategory} /></Grid.Col>
                <Grid.Col md={3}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.customerRating)} value={formData.customerRating || '-'} /></Grid.Col>
                <Grid.Col md={3}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.organizationGuidanceCount)} value={countText(status?.consultant?.organizationGuidanceCount)} /></Grid.Col>
                <Grid.Col md={3}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.organizationAuditCount)} value={countText(status?.consultant?.organizationAuditCount)} /></Grid.Col>
                <Grid.Col md={3}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.organizationReviewCount)} value={countText(status?.consultant?.organizationReviewCount)} /></Grid.Col>
                <Grid.Col md={3}><ReadOnlyField label={translate(LANGUAGE_KEYS.consultant.organizationCertificationCount)} value={countText(status?.consultant?.organizationCertificationCount)} /></Grid.Col>
              </Grid.Row>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header>{translate(LANGUAGE_KEYS.consultant.registrationTitle)}</Card.Header>
            <Card.Body>
              <form onSubmit={submit}>
                <Grid.Row className="g-3">
                  <Grid.Col md={6}>
                    <Input label={translate(LANGUAGE_KEYS.consultant.name)} labelMark name="name" value={formData.name} onChange={updateField} required />
                  </Grid.Col>
                  <Grid.Col md={6}>
                    <Input label={translate(LANGUAGE_KEYS.consultant.certificationMode)} labelMark name="certificationMode" value={formData.certificationMode} onChange={updateField} required />
                  </Grid.Col>
                  <Grid.Col md={12}>
                    <Input label={translate(LANGUAGE_KEYS.consultant.experienceIndustryCategory)} name="experienceIndustryCategory" value={formData.experienceIndustryCategory} onChange={updateField} />
                  </Grid.Col>
                  <Grid.Col md={4}>
                    <Input type="number" min="0" max="5" step="0.1" label={translate(LANGUAGE_KEYS.consultant.customerRating)} name="customerRating" value={formData.customerRating} onChange={updateField} />
                  </Grid.Col>
                  <Grid.Col md={4}>
                    <Input type="number" min="0" step="1" label={translate(LANGUAGE_KEYS.consultant.organizationGuidanceCount)} name="organizationGuidanceCount" value={formData.organizationGuidanceCount} onChange={updateField} />
                  </Grid.Col>
                  <Grid.Col md={4}>
                    <Input type="number" min="0" step="1" label={translate(LANGUAGE_KEYS.consultant.organizationAuditCount)} name="organizationAuditCount" value={formData.organizationAuditCount} onChange={updateField} />
                  </Grid.Col>
                  <Grid.Col md={4}>
                    <Input type="number" min="0" step="1" label={translate(LANGUAGE_KEYS.consultant.organizationReviewCount)} name="organizationReviewCount" value={formData.organizationReviewCount} onChange={updateField} />
                  </Grid.Col>
                  <Grid.Col md={4}>
                    <Input type="number" min="0" step="1" label={translate(LANGUAGE_KEYS.consultant.organizationCertificationCount)} name="organizationCertificationCount" value={formData.organizationCertificationCount} onChange={updateField} />
                  </Grid.Col>
                </Grid.Row>
                <div className="d-flex justify-content-end mt-4">
                  <Btn type="submit" color="primary" icon="save" loading={submitting}>
                    {translate(LANGUAGE_KEYS.common.save)}
                  </Btn>
                </div>
              </form>
            </Card.Body>
          </Card>
        )}
      </WrapContent>
    </>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted small">{label}</div>
      <div className="fs-5">{value || '-'}</div>
    </div>
  );
}
