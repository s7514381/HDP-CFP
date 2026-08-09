import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useConfirm } from '@packages/hooks/useConfirm';
import { MaterialMaintenanceModel, MaterialMaintenanceYear, SupplierOption } from '@/types/materialMaintenance';
import { AddSourceRequest, MaterialMaintenanceService, ServiceResponse } from './materialMaintenanceService';
import { emptySourceForm, parseMaintenanceYear, SourceFormState, validateSourceForm } from './materialMaintenanceValidation';

export interface MaterialMaintenanceMessages {
  loadFailed: string;
  operationFailed: string;
  invalidYear: string;
  allocationInvalid: string;
  supplierLoadFailed: string;
  yearAdded: string;
  sourceAdded: string;
  yearDeleted: string;
  sourceDeleted: string;
  deleteYearConfirm: string;
  deleteSourceConfirm: string;
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
  yearDrafts: Record<string, string>;
  sourceForm: SourceFormState;
  showSourceModal: boolean;
  supplierOptions: { value: string; label: string }[];
  setYearDraft(itemId: string, value: string): void;
  addYear(pcrPatternId: string): Promise<void>;
  openSourceModal(year: MaterialMaintenanceYear): Promise<void>;
  closeSourceModal(): void;
  updateSourceForm(changes: Partial<SourceFormState>): void;
  addSource(): Promise<void>;
  deleteYear(year: MaterialMaintenanceYear): Promise<void>;
  deleteSource(sourceId: string): Promise<void>;
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
  const [yearDrafts, setYearDrafts] = useState<Record<string, string>>({});
  const [sourceForm, setSourceForm] = useState<SourceFormState>(emptySourceForm);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const requestIdRef = useRef(0);
  const initialLoadMaterialIdRef = useRef<string | null>(null);
  const supplierRequestInFlightRef = useRef(false);

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
  ): Promise<boolean> => {
    if (submitting) return false;

    setSubmitting(true);
    try {
      const result = await operation();
      if (!result.success) {
        reportFailure(result.message, messages.operationFailed);
        return false;
      }

      notifier.success(successMessage);
      await loadModel({ initial: false });
      return true;
    } finally {
      setSubmitting(false);
    }
  }, [loadModel, messages.operationFailed, notifier, reportFailure, submitting]);

  const setYearDraft = useCallback((itemId: string, value: string) => {
    setYearDrafts((current) => ({ ...current, [itemId]: value }));
  }, []);

  const addYear = useCallback(async (pcrPatternId: string) => {
    const year = parseMaintenanceYear(yearDrafts[pcrPatternId] || '');
    if (year === null) {
      notifier.danger(messages.invalidYear);
      return;
    }

    const added = await submitOperation(
      () => service.addYear({ materialId, pcrPatternId, year }),
      messages.yearAdded,
    );
    if (added) setYearDrafts((current) => ({ ...current, [pcrPatternId]: '' }));
  }, [materialId, messages.invalidYear, messages.yearAdded, notifier, service, submitOperation, yearDrafts]);

  const supplierOptions = useMemo(() => suppliers.map((supplier) => ({
    value: String(supplier.value),
    label: supplier.text || supplier.name || String(supplier.value),
  })), [suppliers]);

  const openSourceModal = useCallback(async (year: MaterialMaintenanceYear) => {
    setSourceForm({ ...emptySourceForm, yearId: year.id, year: year.year });
    setShowSourceModal(true);

    if (suppliers.length > 0 || supplierRequestInFlightRef.current) return;

    supplierRequestInFlightRef.current = true;
    try {
      const result = await service.getSuppliers();
      if (result.success && result.data) setSuppliers(result.data);
      else reportFailure(result.message, messages.supplierLoadFailed);
    } finally {
      supplierRequestInFlightRef.current = false;
    }
  }, [messages.supplierLoadFailed, reportFailure, service, suppliers.length]);

  const closeSourceModal = useCallback(() => {
    if (submitting) return;
    setShowSourceModal(false);
    setSourceForm(emptySourceForm);
  }, [submitting]);

  const updateSourceForm = useCallback((changes: Partial<SourceFormState>) => {
    setSourceForm((current) => ({ ...current, ...changes }));
  }, []);

  const addSource = useCallback(async () => {
    const validationError = validateSourceForm(sourceForm);
    if (validationError === 'required') {
      notifier.danger(messages.operationFailed);
      return;
    }
    if (validationError === 'allocation') {
      notifier.danger(messages.allocationInvalid);
      return;
    }

    const request: AddSourceRequest = {
      materialMaintenanceYearId: sourceForm.yearId,
      supplierId: sourceForm.supplierId,
      productName: sourceForm.productName.trim(),
      allocationPercentage: Number(sourceForm.allocationPercentage),
    };
    const added = await submitOperation(() => service.addSource(request), messages.sourceAdded);
    if (added) closeSourceModal();
  }, [closeSourceModal, messages.allocationInvalid, messages.operationFailed, messages.sourceAdded, notifier, service, sourceForm, submitOperation]);

  const deleteYear = useCallback(async (year: MaterialMaintenanceYear) => {
    if (!await confirm(messages.deleteYearConfirm)) return;
    await submitOperation(() => service.deleteYear(year.id), messages.yearDeleted);
  }, [confirm, messages.deleteYearConfirm, messages.yearDeleted, service, submitOperation]);

  const deleteSource = useCallback(async (sourceId: string) => {
    if (!await confirm(messages.deleteSourceConfirm)) return;
    await submitOperation(() => service.deleteSource(sourceId), messages.sourceDeleted);
  }, [confirm, messages.deleteSourceConfirm, messages.sourceDeleted, service, submitOperation]);

  return {
    model,
    loading,
    refreshing,
    submitting,
    yearDrafts,
    sourceForm,
    showSourceModal,
    supplierOptions,
    setYearDraft,
    addYear,
    openSourceModal,
    closeSourceModal,
    updateSourceForm,
    addSource,
    deleteYear,
    deleteSource,
  };
}
