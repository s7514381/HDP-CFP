'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { useConfirm } from '@packages/hooks/useConfirm';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { MaterialMaintenanceSourceModal } from './MaterialMaintenanceSourceModal';
import { MaterialMaintenanceSecondaryDataModal } from './MaterialMaintenanceSecondaryDataModal';
import { MaterialMaintenanceAccreditationLevelModal } from './MaterialMaintenanceAccreditationLevelModal';
import { MaterialMaintenanceView } from './MaterialMaintenanceView';
import { createMaterialMaintenanceService } from './materialMaintenanceService';
import { MaterialMaintenanceMessages, MaterialMaintenanceNotifier, useMaterialMaintenance } from './useMaterialMaintenance';
import { usePagePermissions } from '@/hooks/usePagePermissions';

export default function MaterialMaintenancePage() {
  return (
    <Suspense fallback={<MaterialMaintenanceLoading />}>
      <MaterialMaintenancePageContent />
    </Suspense>
  );
}

function MaterialMaintenanceLoading() {
  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.rawMaterialMaintenance.title} />
      <WrapContent className="p-3">
        <Container fluid>
          <div className="d-flex justify-content-center py-5">
            <span className="spinner-border text-primary" role="status" aria-label="Loading" />
          </div>
        </Container>
      </WrapContent>
    </>
  );
}

function MaterialMaintenancePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formPost } = useAppApi();
  const { translate } = useLanguage();
  const { success, danger } = useToast();
  const { confirm } = useConfirm();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('MaterialMaintenance:GetModel');
  const materialId = searchParams.get('id') || '';
  const service = useMemo(() => createMaterialMaintenanceService(formPost), [formPost]);
  const messages = useMemo<MaterialMaintenanceMessages>(() => ({
    loadFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.loadFailed),
    operationFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.operationFailed),
    invalidYear: translate(LANGUAGE_KEYS.rawMaterialMaintenance.invalidYear),
    supplierRequired: translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplierRequired),
    allocationInvalid: translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocationInvalid),
    accreditationInvalid: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationInvalid),
    sourceLoadFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplierLoadFailed),
    secondaryDataApplied: translate(LANGUAGE_KEYS.rawMaterialMaintenance.secondaryDataApplied),
    accreditationLevelUpdated: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelUpdated),
    notifySupplierConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.notifySupplierConfirm),
    supplierNotified: translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplierNotified),
    yearAdded: translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearAdded),
    sourceAdded: translate(LANGUAGE_KEYS.rawMaterialMaintenance.sourceAdded),
    yearDeleted: translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearDeleted),
    sourceDeleted: translate(LANGUAGE_KEYS.rawMaterialMaintenance.sourceDeleted),
    deleteYearConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.deleteYearConfirm),
    deleteSourceConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.deleteSourceConfirm),
    accreditConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditConfirm),
    accredited: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accredited),
    unaccredited: translate(LANGUAGE_KEYS.rawMaterialMaintenance.unaccredited),
  }), [translate]);
  const notifier = useMemo<MaterialMaintenanceNotifier>(() => ({
    success: (message) => success({ message: <span>{message}</span> }),
    danger: (message) => danger({ message: <span>{message}</span> }),
  }), [danger, success]);
  const controller = useMaterialMaintenance({ materialId, service, messages, notifier, confirm });

  if (isReady && !canAccess) {
    router.replace('/DataMaintenance');
    return null;
  }

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.rawMaterialMaintenance.title}>
        <div className="ms-auto">
          <Btn type="button" color="secondary" outline icon="cancel" onClick={() => router.push('/DataMaintenance')}>
            {translate(LANGUAGE_KEYS.common.backToList)}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
          {controller.loading ? (
            <div className="d-flex justify-content-center py-5">
              <span className="spinner-border text-primary" role="status" aria-label={translate(LANGUAGE_KEYS.common.loading)} />
            </div>
          ) : controller.model === null ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center text-muted py-5">{messages.loadFailed}</Card.Body>
            </Card>
          ) : (
            <div aria-busy={controller.refreshing}>
              <MaterialMaintenanceView
                model={controller.model}
                submitting={controller.submitting}
                onAddYear={(itemId, year) => controller.addYear(itemId, year)}
                onOpenSourceModal={(year) => void controller.openSourceModal(year)}
                onDeleteYear={(year) => void controller.deleteYear(year)}
                onDeleteSource={(sourceId) => void controller.deleteSource(sourceId)}
                onSetAccredited={(sourceId, isAccredited) => void controller.setAccredited(sourceId, isAccredited)}
                onOpenSourceOpinion={(sourceId) => router.push(`/DataMaintenance/MaterialMaintenance/Opinion/?sourceId=${encodeURIComponent(sourceId)}`)}
                onOpenSecondaryData={(source) => controller.openSecondaryDataModal(source)}
                onOpenAccreditationLevel={(source) => controller.openAccreditationLevelModal(source)}
                onNotifySupplier={(sourceId) => void controller.notifySupplier(sourceId)}
              />
            </div>
          )}
        </Container>
      </WrapContent>

      <MaterialMaintenanceSourceModal
        show={controller.showSourceModal}
        submitting={controller.submitting}
        sourceForm={controller.sourceForm}
        sourceError={controller.sourceError}
        fetchSourceOptions={controller.fetchSourceOptions}
        onClose={controller.closeSourceModal}
        onDismissError={controller.dismissSourceError}
        onChange={controller.updateSourceForm}
        onSave={() => void controller.addSource()}
      />
      <MaterialMaintenanceSecondaryDataModal
        key={`secondary-${controller.showSecondaryDataModal ? 'open' : 'closed'}-${controller.secondaryDataSource?.id || 'none'}`}
        show={controller.showSecondaryDataModal}
        source={controller.secondaryDataSource}
        submitting={controller.submitting}
        onClose={controller.closeSecondaryDataModal}
        onApply={(secondaryDataSettingId) => void controller.applySecondaryData(secondaryDataSettingId)}
      />
      <MaterialMaintenanceAccreditationLevelModal
        key={`accreditation-${controller.showAccreditationLevelModal ? 'open' : 'closed'}-${controller.accreditationLevelSource?.id || 'none'}`}
        show={controller.showAccreditationLevelModal}
        materialId={materialId}
        source={controller.accreditationLevelSource}
        submitting={controller.submitting}
        onClose={controller.closeAccreditationLevelModal}
        onApply={(accreditationLevelId) => void controller.setAccreditationLevel(accreditationLevelId)}
      />
    </>
  );
}
