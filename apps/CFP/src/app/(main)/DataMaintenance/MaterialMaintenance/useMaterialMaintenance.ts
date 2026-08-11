import { useCallback, useEffect, useRef, useState } from 'react';
import { useConfirm } from '@packages/hooks/useConfirm';
import { MaterialMaintenanceModel, MaterialMaintenanceYear } from '@/types/materialMaintenance';
import { AddSourceRequest, MaterialMaintenanceService, ServiceResponse, SourceSelectListItem } from './materialMaintenanceService';
import { emptySourceForm, parseMaintenanceYear, SourceFormState, validateSourceForm } from './materialMaintenanceValidation';

export interface MaterialMaintenanceMessages {
  loadFailed: string;
  operationFailed: string;
  invalidYear: string;
  allocationInvalid: string;
  accreditationInvalid: string;
  sourceLoadFailed: string;
  yearAdded: string;
  sourceAdded: string;
  yearDeleted: string;
  sourceDeleted: string;
  deleteYearConfirm: string;
  deleteSourceConfirm: string;
  accreditationLevelFailed: string;
  accreditationLevelUnavailable: string;
  accreditationLevelFound: string;
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
  fetchSourceOptions(keyword: string): Promise<SourceSelectListItem[]>;
  dismissSourceError(): void;
  addYear(pcrPatternId: string, yearInput: string): Promise<boolean>;
  openSourceModal(year: MaterialMaintenanceYear): Promise<void>;
  closeSourceModal(): void;
  updateSourceForm(changes: Partial<SourceFormState>): void;
  addSource(): Promise<void>;
  deleteYear(year: MaterialMaintenanceYear): Promise<void>;
  deleteSource(sourceId: string): Promise<void>;
  checkAccreditationLevel(sourceId: string): Promise<void>;
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

  const addSource = useCallback(async () => {
    const validationError = validateSourceForm(sourceForm);
    if (validationError === 'required') {
      setSourceError(messages.operationFailed);
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
      sourceMaterialId: sourceForm.sourceMaterialId,
      allocationPercentage: Number(sourceForm.allocationPercentage),
      carbonFactor: sourceForm.carbonFactor.trim() === '' ? null : Number(sourceForm.carbonFactor),
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
  }, [closeSourceModal, messages.accreditationInvalid, messages.allocationInvalid, messages.operationFailed, messages.sourceAdded, service, sourceForm, submitOperation]);

  const deleteYear = useCallback(async (year: MaterialMaintenanceYear) => {
    if (!await confirm(messages.deleteYearConfirm)) return;
    await submitOperation(() => service.deleteYear(year.id), messages.yearDeleted);
  }, [confirm, messages.deleteYearConfirm, messages.yearDeleted, service, submitOperation]);

  const deleteSource = useCallback(async (sourceId: string) => {
    if (!await confirm(messages.deleteSourceConfirm)) return;
    await submitOperation(() => service.deleteSource(sourceId), messages.sourceDeleted);
  }, [confirm, messages.deleteSourceConfirm, messages.sourceDeleted, service, submitOperation]);

  const checkAccreditationLevel = useCallback(async (sourceId: string) => {
    try {
      const result = await service.getAccreditationLevel(sourceId);
      if (!result.success) {
        reportFailure(result.message, messages.accreditationLevelFailed);
        return;
      }

      if (result.data?.levelName) {
        notifier.success(messages.accreditationLevelFound.replace('{level}', result.data.levelName));
      } else {
        notifier.danger(messages.accreditationLevelUnavailable);
      }
    } catch (error) {
      reportFailure(error instanceof Error ? error.message : null, messages.accreditationLevelFailed);
    }
  }, [messages.accreditationLevelFailed, messages.accreditationLevelFound, messages.accreditationLevelUnavailable, notifier, reportFailure, service]);

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
    fetchSourceOptions,
    dismissSourceError,
    addYear,
    openSourceModal,
    closeSourceModal,
    updateSourceForm,
    addSource,
    deleteYear,
    deleteSource,
    checkAccreditationLevel,
    setAccredited,
  };
}
