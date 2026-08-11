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
import { MaterialMaintenanceView } from './MaterialMaintenanceView';
import { createMaterialMaintenanceService } from './materialMaintenanceService';
import { MaterialMaintenanceMessages, MaterialMaintenanceNotifier, useMaterialMaintenance } from './useMaterialMaintenance';

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
  const materialId = searchParams.get('id') || '';
  const service = useMemo(() => createMaterialMaintenanceService(formPost), [formPost]);
  const messages = useMemo<MaterialMaintenanceMessages>(() => ({
    loadFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.loadFailed, 'Unable to load material maintenance.'),
    operationFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.operationFailed, 'The operation failed.'),
    invalidYear: translate(LANGUAGE_KEYS.rawMaterialMaintenance.invalidYear, 'Enter a year between 1900 and 2100.'),
    allocationInvalid: translate(LANGUAGE_KEYS.rawMaterialMaintenance.allocationInvalid, 'Enter an allocation between 0 and 100 percent.'),
    accreditationInvalid: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationInvalid, 'Enter a valid carbon factor and non-negative whole-number accreditation values.'),
    sourceLoadFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplierLoadFailed, 'Unable to load supplier sources.'),
    yearAdded: translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearAdded, 'Year added successfully.'),
    sourceAdded: translate(LANGUAGE_KEYS.rawMaterialMaintenance.sourceAdded, 'Supplier source added successfully.'),
    yearDeleted: translate(LANGUAGE_KEYS.rawMaterialMaintenance.yearDeleted, 'Year deleted successfully.'),
    sourceDeleted: translate(LANGUAGE_KEYS.rawMaterialMaintenance.sourceDeleted, 'Supplier source deleted successfully.'),
    deleteYearConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.deleteYearConfirm, 'Delete this year and its supplier sources?'),
    deleteSourceConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.deleteSourceConfirm, 'Delete this supplier source?'),
    accreditationLevelFailed: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelFailed, 'Unable to determine the buyer accreditation level.'),
    accreditationLevelUnavailable: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelUnavailable, 'No buyer accreditation level matches this source.'),
    accreditationLevelFound: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditationLevelFound, 'Buyer accreditation level: {level}.'),
    accreditConfirm: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accreditConfirm, 'Do you want to {action} this source?'),
    accredited: translate(LANGUAGE_KEYS.rawMaterialMaintenance.accredited, 'approve'),
    unaccredited: translate(LANGUAGE_KEYS.rawMaterialMaintenance.unaccredited, 'remove approval from'),
  }), [translate]);
  const notifier = useMemo<MaterialMaintenanceNotifier>(() => ({
    success: (message) => success({ message: <span>{message}</span> }),
    danger: (message) => danger({ message: <span>{message}</span> }),
  }), [danger, success]);
  const controller = useMaterialMaintenance({ materialId, service, messages, notifier, confirm });

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.rawMaterialMaintenance.title}>
        <div className="ms-auto">
          <Btn type="button" color="secondary" outline icon="cancel" onClick={() => router.push('/DataMaintenance')}>
            {translate(LANGUAGE_KEYS.common.backToList, 'Back to list')}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
          {controller.loading ? (
            <div className="d-flex justify-content-center py-5">
              <span className="spinner-border text-primary" role="status" aria-label={translate(LANGUAGE_KEYS.common.loading, 'Loading')} />
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
                onCheckAccreditationLevel={(sourceId) => void controller.checkAccreditationLevel(sourceId)}
                onSetAccredited={(sourceId, isAccredited) => void controller.setAccredited(sourceId, isAccredited)}
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
    </>
  );
}
