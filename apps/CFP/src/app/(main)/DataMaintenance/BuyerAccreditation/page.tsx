'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FontAwesome from '@packages/components/FontAwsome';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Container from '@packages/components/bootstrap5/Container';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { CommonTable, Column, CommonTableHandle } from '@/components/common/CommonTable';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { API_MAP } from '@/lib/apiRoutes';
import { BuyerAccreditationLevelRow } from '@/types/buyerAccreditationLevel';

function isEnabled(value: BuyerAccreditationLevelRow['thirdPartyCertification']) {
  return value === true || value === 1 || String(value).toLowerCase() === 'true';
}

function BuyerAccreditationLevelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get('materialId')?.trim() || '';
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const tableRef = React.useRef<CommonTableHandle<BuyerAccreditationLevelRow>>(null);

  React.useEffect(() => {
    if (!materialId) router.replace('/DataMaintenance');
  }, [materialId, router]);

  const buyerAccreditationPath = '/DataMaintenance/BuyerAccreditation';

  const handleDelete = async (id: string | number) => {
    if (!await confirm(translate(
      LANGUAGE_KEYS.buyerAccreditation.deleteConfirm,
      '確定要刪除此買方認可依據嗎？',
    ))) return;

    const result = await formPost(`${API_MAP.BUYER_ACCREDITATION_LEVEL_MST}/Delete`, { id, materialId });
    if (result.success) {
      success({ message: <span>{translate(LANGUAGE_KEYS.buyerAccreditation.deleted, '買方認可依據刪除成功。')}</span> });
      tableRef.current?.reload();
      return;
    }

    danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.deleteFailed, '刪除失敗。')}</span> });
  };

  const columns: Column<BuyerAccreditationLevelRow>[] = [
    {
      header: translate(LANGUAGE_KEYS.common.rowNumber, '項次'),
      className: 'text-center',
      style: { width: '70px' },
      render: (_, index) => index + 1,
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.level, '供應來源等級'),
      key: 'name',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.thirdPartyCertification, '第三方認證'),
      className: 'text-center',
      render: (row) => isEnabled(row.thirdPartyCertification)
        ? translate(LANGUAGE_KEYS.common.yes, '有')
        : translate(LANGUAGE_KEYS.common.no, '無'),
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.consultantApprovalCount, '顧問認可數'),
      className: 'text-end',
      key: 'consultantApprovalCount',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.buyerApprovalCount, '買方認可數'),
      className: 'text-end',
      key: 'buyerApprovalCount',
    },
    {
      header: translate(LANGUAGE_KEYS.buyerAccreditation.totalScore, '總分'),
      className: 'text-end',
      key: 'totalScore',
    },
    {
      header: translate(LANGUAGE_KEYS.common.actions, '操作'),
      className: 'text-center',
      style: { width: '110px' },
      render: (row) => (
        <div className="d-flex justify-content-center gap-3">
          <FontAwesome
            icon="fa-regular fa-pen-to-square"
            className="text-warning cursor-pointer"
            onClick={() => router.push(`${buyerAccreditationPath}/Edit/?id=${encodeURIComponent(String(row.id))}&materialId=${encodeURIComponent(materialId)}`)}
          />
          <FontAwesome
            icon="fa-regular fa-trash-can"
            className="text-danger cursor-pointer"
            onClick={() => void handleDelete(row.id)}
          />
        </div>
      ),
    },
  ];

  if (!materialId) return null;

  return (
    <>
      <ActionBar title={translate(LANGUAGE_KEYS.buyerAccreditation.title, '買方認可依據')}>
        <div className="ms-auto">
          <Btn type="button" color="secondary" outline icon="cancel" onClick={() => router.push('/DataMaintenance')}>
            {translate(LANGUAGE_KEYS.common.backToList, '返回列表')}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid className="mb-3">
          <div className="d-flex justify-content-end gap-2">
            <Btn color="success" icon="add" onClick={() => router.push(`${buyerAccreditationPath}/Create/?materialId=${encodeURIComponent(materialId)}`)}>
              {translate(LANGUAGE_KEYS.common.add, '新增')}
            </Btn>
          </div>
        </Container>

        <Container fluid>
          <CommonTable
            ref={tableRef}
            key={materialId}
            columns={columns}
            apiUrl={API_MAP.BUYER_ACCREDITATION_LEVEL_GET_LIST}
            searchParams={{ materialId }}
            pageSize={10}
          />
        </Container>
      </WrapContent>
    </>
  );
}

export default function BuyerAccreditationLevelPage() {
  return (
    <React.Suspense fallback={null}>
      <BuyerAccreditationLevelPageContent />
    </React.Suspense>
  );
}
