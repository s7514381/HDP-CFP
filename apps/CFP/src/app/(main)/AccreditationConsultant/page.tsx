'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Btn } from '@packages/components/bootstrap5/Btn';
import { Input } from '@packages/components/bootstrap5/Input';
import { Select } from '@packages/components/bootstrap5/Select';
import Grid from '@packages/components/bootstrap5/Grid';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { SearchBlock } from '@/components/layouts/SearchBlock';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { useToast } from '@packages/contexts/ToastContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import { ConsultantRow } from '@/types/consultant';
import {
  isAccreditedConsultant,
  renderConsultantCount,
  renderConsultantRating,
} from '@/components/common/consultantTableUtils';

export default function AccreditationConsultantPage() {
  const router = useRouter();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { hasPermission, isReady } = usePagePermissions('/AccreditationConsultant');
  const { success, danger } = useToast();
  const tableRef = React.useRef<CommonTableHandle<ConsultantRow>>(null);
  const [name, setName] = useState('');
  const [certificationMode, setCertificationMode] = useState('');
  const [accreditationFilter, setAccreditationFilter] = useState('');
  const [reservingId, setReservingId] = useState<string | null>(null);

  const canAccess = hasPermission('Consultant:ReserveAccreditation');

  React.useEffect(() => {
    if (isReady && !canAccess) router.replace('/');
  }, [canAccess, isReady, router]);

  const search = () => {
    tableRef.current?.search({
      Name: name.trim() || undefined,
      CertificationMode: certificationMode.trim() || undefined,
      IsAccredited: accreditationFilter === '' ? undefined : accreditationFilter === 'true',
    });
  };

  const clear = () => {
    setName('');
    setCertificationMode('');
    setAccreditationFilter('');
    tableRef.current?.search({});
  };

  const reserveAccreditation = async (id: string) => {
    if (reservingId) return;

    setReservingId(id);
    try {
      const result = await formPost(API_MAP.CONSULTANT_RESERVE_ACCREDITATION, { id });
      if (result.success) {
        success({ message: <span>{translate(LANGUAGE_KEYS.consultant.reserved)}</span> });
        tableRef.current?.reload();
      } else {
        danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.consultant.reserveFailed)}</span> });
      }
    } catch {
      danger({ message: <span>{translate(LANGUAGE_KEYS.consultant.reserveFailed)}</span> });
    } finally {
      setReservingId(null);
    }
  };

  const columns: Column<ConsultantRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
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
      header: translate(LANGUAGE_KEYS.consultant.isAccredited),
      className: 'text-center',
      render: (row) => isAccreditedConsultant(row.isAccredited)
        ? translate(LANGUAGE_KEYS.common.yes)
        : translate(LANGUAGE_KEYS.common.no),
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions),
      className: 'text-center',
      style: { width: '150px' },
      render: (row) => (
        <Btn
          type="button"
          size="sm"
          color="primary"
          disabled={isAccreditedConsultant(row.isAccredited) || reservingId === row.id}
          onClick={() => void reserveAccreditation(row.id)}
        >
          {translate(LANGUAGE_KEYS.consultant.reserveAccreditation)}
        </Btn>
      ),
    },
  ];

  if (isReady && !canAccess) return null;

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.consultant.title)} />
      <WrapContent className="p-3">
        <SearchBlock title="" icon="" className="mb-3">
          <Grid.Row align="center" gutter={3}>
            <Grid.Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.consultant.name)}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col md={4}>
              <Input
                label={translate(LANGUAGE_KEYS.consultant.certificationMode)}
                value={certificationMode}
                onChange={(event) => setCertificationMode(event.target.value)}
              />
            </Grid.Col>
            <Grid.Col md={4}>
              <Select
                label={translate(LANGUAGE_KEYS.consultant.accreditationFilter)}
                value={accreditationFilter}
                onChange={(event) => setAccreditationFilter(event.target.value)}
                options={[
                  { value: '', label: translate(LANGUAGE_KEYS.common.noOption) },
                  { value: 'true', label: translate(LANGUAGE_KEYS.common.yes) },
                  { value: 'false', label: translate(LANGUAGE_KEYS.common.no) },
                ]}
              />
            </Grid.Col>
            <Grid.Col md={12} className="d-flex justify-content-end gap-2">
              <Btn color="success" outline icon="search" onClick={search}>
                {translate(LANGUAGE_KEYS.common.search)}
              </Btn>
              <Btn color="light" className="text-primary border" onClick={clear}>
                {translate(LANGUAGE_KEYS.common.clear)}
              </Btn>
            </Grid.Col>
          </Grid.Row>
        </SearchBlock>

        <CommonTable
          ref={tableRef}
          columns={columns}
          apiUrl={API_MAP.CONSULTANT_GET_LIST}
          pageSize={10}
        />
      </WrapContent>
    </>
  );
}
