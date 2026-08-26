import { useCallback, useEffect, useRef, useState } from 'react';
import { useConfirm } from '@packages/hooks/useConfirm';
import { MaterialMaintenanceModel, MaterialMaintenanceSource, MaterialMaintenanceYear } from '@/types/materialMaintenance';
import { AddSourceRequest, MaterialMaintenanceService, ServiceResponse, SourceSelectListItem } from './materialMaintenanceService';
import { emptySourceForm, parseMaintenanceYear, SourceFormState, validateSourceForm } from './materialMaintenanceValidation';

export interface MaterialMaintenanceMessages {
  loadFailed: string;
  operationFailed: string;
  invalidYear: string;
  supplierRequired: string;
  allocationInvalid: string;
  accreditationInvalid: string;
  sourceLoadFailed: string;
  secondaryDataApplied: string;
  accreditationLevelUpdated: string;
  notifySupplierConfirm: string;
  supplierNotified: string;
  yearAdded: string;
  sourceAdded: string;
  yearDeleted: string;
  sourceDeleted: string;
  deleteYearConfirm: string;
  deleteSourceConfirm: string;
  accreditConfirm: string;
  accredited: string;
  unaccredited: string;
}

export interface MaterialMaintenanceNotifier {
  success(message: string): void;
  danger(message: string): void;
}

export interface UseMaterialMaintenanceOptions {
  materialId: string;
  service: MaterialMaintenanceService;
  messages: MaterialMaintenanceMessages;
  notifier: MaterialMaintenanceNotifier;
  confirm: ReturnType<typeof useConfirm>['confirm'];
}

export interface MaterialMaintenanceController {
  model: MaterialMaintenanceModel | null;
  loading: boolean;
  refreshing: boolean;
  submitting: boolean;
  sourceForm: SourceFormState;
  showSourceModal: boolean;
  sourceError: string | null;
  secondaryDataSource: MaterialMaintenanceSource | null;
  showSecondaryDataModal: boolean;
  accreditationLevelSource: MaterialMaintenanceSource | null;
  showAccreditationLevelModal: boolean;
  fetchSourceOptions(keyword: string): Promise<SourceSelectListItem[]>;
  dismissSourceError(): void;
  openSecondaryDataModal(source: MaterialMaintenanceSource): void;
  closeSecondaryDataModal(): void;
  applySecondaryData(secondaryDataSettingId: string): Promise<boolean>;
  openAccreditationLevelModal(source: MaterialMaintenanceSource): void;
  closeAccreditationLevelModal(): void;
  setAccreditationLevel(accreditationLevelId: string): Promise<boolean>;
  notifySupplier(sourceId: string): Promise<void>;
  addYear(pcrPatternId: string, yearInput: string): Promise<boolean>;
  openSourceModal(year: MaterialMaintenanceYear): Promise<void>;
  closeSourceModal(): void;
  updateSourceForm(changes: Partial<SourceFormState>): void;
  addSource(): Promise<void>;
  deleteYear(year: MaterialMaintenanceYear): Promise<void>;
  deleteSource(sourceId: string): Promise<void>;
  setAccredited(sourceId: string, isAccredited: boolean): Promise<void>;
}

interface LoadOptions {
  initial: boolean;
}

export function useMaterialMaintenance({
  materialId,
  service,
  messages,
  notifier,
  confirm,
}: UseMaterialMaintenanceOptions): MaterialMaintenanceController {
  const [model, setModel] = useState<MaterialMaintenanceModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sourceForm, setSourceForm] = useState<SourceFormState>(emptySourceForm);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [secondaryDataSource, setSecondaryDataSource] = useState<MaterialMaintenanceSource | null>(null);
  const [showSecondaryDataModal, setShowSecondaryDataModal] = useState(false);
  const [accreditationLevelSource, setAccreditationLevelSource] = useState<MaterialMaintenanceSource | null>(null);
  const [showAccreditationLevelModal, setShowAccreditationLevelModal] = useState(false);
  const requestIdRef = useRef(0);
  const initialLoadMaterialIdRef = useRef<string | null>(null);

  const reportFailure = useCallback((message: string | null, fallback: string) => {
    notifier.danger(message || fallback);
  }, [notifier]);

  const loadModel = useCallback(async ({ initial }: LoadOptions): Promise<boolean> => {
    const requestId = ++requestIdRef.current;
    if (!materialId) {
      setModel(null);
      setLoading(false);
      setRefreshing(false);
      return false;
    }

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const result = await service.getModel(materialId);
      if (requestId !== requestIdRef.current) return false;

      if (result.success && result.data) {
        setModel(result.data);
        return true;
      }

      if (initial) setModel(null);
      reportFailure(result.message, messages.loadFailed);
      return false;
    } catch (error) {
      if (requestId !== requestIdRef.current) return false;
      if (initial) setModel(null);
      reportFailure(error instanceof Error ? error.message : null, messages.loadFailed);
      return false;
    } finally {
      if (requestId === requestIdRef.current) {
        if (initial) setLoading(false);
        else setRefreshing(false);
      }
    }
  }, [materialId, messages.loadFailed, reportFailure, service]);

  useEffect(() => {
    // React Strict Mode replays effects during development. The initial load is
    // a real API request, so it must be idempotent for the current material.
    if (initialLoadMaterialIdRef.current === materialId) return;

    initialLoadMaterialIdRef.current = materialId;
    void loadModel({ initial: true });
  }, [loadModel, materialId]);

  const submitOperation = useCallback(async (
    operation: () => Promise<ServiceResponse<unknown>>,
    successMessage: string,
    onFailure?: (message: string | null) => void,
  ): Promise<boolean> => {
    if (submitting) return false;

    setSubmitting(true);
    try {
      const result = await operation();
      if (!result.success) {
        if (onFailure) onFailure(result.message);
        else reportFailure(result.message, messages.operationFailed);
        return false;
      }

      notifier.success(successMessage);
      await loadModel({ initial: false });
      return true;
    } finally {
      setSubmitting(false);
    }
  }, [loadModel, messages.operationFailed, notifier, reportFailure, submitting]);

  const addYear = useCallback(async (pcrPatternId: string, yearInput: string): Promise<boolean> => {
    const year = parseMaintenanceYear(yearInput);
    if (year === null) {
      notifier.danger(messages.invalidYear);
      return false;
    }

    return submitOperation(
      () => service.addYear({ materialId, pcrPatternId, year }),
      messages.yearAdded,
    );
  }, [materialId, messages.invalidYear, messages.yearAdded, notifier, service, submitOperation]);

  const openSourceModal = useCallback(async (year: MaterialMaintenanceYear) => {
    setSourceForm({ ...emptySourceForm, yearId: year.id, year: year.year });
    setSourceError(null);
    setShowSourceModal(true);
  }, []);

  const fetchSourceOptions = useCallback(async (keyword: string): Promise<SourceSelectListItem[]> => {
    try {
      const result = await service.getSourceOptions(keyword);
      if (result.success && result.data) return result.data;

      setSourceError(result.message || messages.sourceLoadFailed);
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : messages.sourceLoadFailed);
    }

    return [];
  }, [messages.sourceLoadFailed, service]);

  const closeSourceModal = useCallback(() => {
    if (submitting) return;
    setShowSourceModal(false);
    setSourceForm(emptySourceForm);
    setSourceError(null);
  }, [submitting]);

  const updateSourceForm = useCallback((changes: Partial<SourceFormState>) => {
    setSourceError(null);
    setSourceForm((current) => ({ ...current, ...changes }));
  }, []);

  const dismissSourceError = useCallback(() => {
    setSourceError(null);
  }, []);

  const openSecondaryDataModal = useCallback((source: MaterialMaintenanceSource) => {
    setSecondaryDataSource(source);
    setShowSecondaryDataModal(true);
  }, []);

  const closeSecondaryDataModal = useCallback(() => {
    if (submitting) return;
    setShowSecondaryDataModal(false);
    setSecondaryDataSource(null);
  }, [submitting]);

  const applySecondaryData = useCallback(async (secondaryDataSettingId: string): Promise<boolean> => {
    if (!secondaryDataSource) return false;

    const applied = await submitOperation(
      () => service.applySecondaryData(secondaryDataSource.id, secondaryDataSettingId),
      messages.secondaryDataApplied,
    );
    if (applied) closeSecondaryDataModal();
    return applied;
  }, [closeSecondaryDataModal, messages.secondaryDataApplied, secondaryDataSource, service, submitOperation]);

  const notifySupplier = useCallback(async (sourceId: string) => {
    if (!await confirm(messages.notifySupplierConfirm)) return;
    await submitOperation(
      () => service.notifySupplier(sourceId),
      messages.supplierNotified,
    );
  }, [confirm, messages.notifySupplierConfirm, messages.supplierNotified, service, submitOperation]);

  const openAccreditationLevelModal = useCallback((source: MaterialMaintenanceSource) => {
    setAccreditationLevelSource(source);
    setShowAccreditationLevelModal(true);
  }, []);

  const closeAccreditationLevelModal = useCallback(() => {
    if (submitting) return;
    setShowAccreditationLevelModal(false);
    setAccreditationLevelSource(null);
  }, [submitting]);

  const setAccreditationLevel = useCallback(async (accreditationLevelId: string): Promise<boolean> => {
    if (!accreditationLevelSource) return false;

    const updated = await submitOperation(
      () => service.setAccreditationLevel(accreditationLevelSource.id, accreditationLevelId),
      messages.accreditationLevelUpdated,
    );
    if (updated) closeAccreditationLevelModal();
    return updated;
  }, [accreditationLevelSource, closeAccreditationLevelModal, messages.accreditationLevelUpdated, service, submitOperation]);

  const addSource = useCallback(async () => {
    const validationError = validateSourceForm(sourceForm);
    if (validationError === 'required') {
      setSourceError(messages.supplierRequired);
      return;
    }
    if (validationError === 'allocation') {
      setSourceError(messages.allocationInvalid);
      return;
    }
    if (validationError === 'accreditation') {
      setSourceError(messages.accreditationInvalid);
      return;
    }

    const request: AddSourceRequest = {
      materialMaintenanceYearId: sourceForm.yearId,
      materialId: sourceForm.materialId,
      allocationPercentage: Number(sourceForm.allocationPercentage),
      thirdPartyCertification: sourceForm.thirdPartyCertification,
      consultantApprovalCount: Number(sourceForm.consultantApprovalCount),
      buyerApprovalCount: Number(sourceForm.buyerApprovalCount),
      totalScore: Number(sourceForm.totalScore),
    };
    setSourceError(null);
    const added = await submitOperation(
      () => service.addSource(request),
      messages.sourceAdded,
      (message) => setSourceError(message || messages.operationFailed),
    );
    if (added) closeSourceModal();
  }, [closeSourceModal, messages.accreditationInvalid, messages.allocationInvalid, messages.operationFailed, messages.sourceAdded, messages.supplierRequired, service, sourceForm, submitOperation]);

  const deleteYear = useCallback(async (year: MaterialMaintenanceYear) => {
    if (!await confirm(messages.deleteYearConfirm)) return;
    await submitOperation(() => service.deleteYear(year.id), messages.yearDeleted);
  }, [confirm, messages.deleteYearConfirm, messages.yearDeleted, service, submitOperation]);

  const deleteSource = useCallback(async (sourceId: string) => {
    if (!await confirm(messages.deleteSourceConfirm)) return;
    await submitOperation(() => service.deleteSource(sourceId), messages.sourceDeleted);
  }, [confirm, messages.deleteSourceConfirm, messages.sourceDeleted, service, submitOperation]);

  const setAccredited = useCallback(async (sourceId: string, isAccredited: boolean) => {
    if (!await confirm(messages.accreditConfirm.replace('{action}', isAccredited ? messages.accredited : messages.unaccredited))) return;
    await submitOperation(
      () => service.setAccredited(sourceId, isAccredited),
      isAccredited ? messages.accredited : messages.unaccredited,
    );
  }, [confirm, messages.accreditConfirm, messages.accredited, messages.unaccredited, service, submitOperation]);

  return {
    model,
    loading,
    refreshing,
    submitting,
    sourceForm,
    showSourceModal,
    sourceError,
    secondaryDataSource,
    showSecondaryDataModal,
    accreditationLevelSource,
    showAccreditationLevelModal,
    fetchSourceOptions,
    dismissSourceError,
    openSecondaryDataModal,
    closeSecondaryDataModal,
    applySecondaryData,
    openAccreditationLevelModal,
    closeAccreditationLevelModal,
    setAccreditationLevel,
    notifySupplier,
    addYear,
    openSourceModal,
    closeSourceModal,
    updateSourceForm,
    addSource,
    deleteYear,
    deleteSource,
    setAccredited,
  };
}
