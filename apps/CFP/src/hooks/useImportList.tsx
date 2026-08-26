'use client';

import React, { useCallback, useState } from 'react';
import { useToast } from '@packages/contexts/ToastContext';
import { downloadFile } from '@packages/lib/downloadFlie';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import { CommonTableHandle } from '@/components/common/CommonTable';
import { TableSearchParams } from '@/components/common/tableUtils';

export interface ImportSummary {
  totalCount: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface ImportListConfig<TSearch extends TableSearchParams> {
  importUrl: string;
  templateUrl: string;
  templateFileName: string;
  initialSearch: TSearch;
}

function isImportSummary(value: unknown): value is ImportSummary {
  if (typeof value !== 'object' || value === null) return false;
  const summary = value as Record<string, unknown>;
  return typeof summary.totalCount === 'number'
    && typeof summary.successCount === 'number'
    && typeof summary.failureCount === 'number'
    && Array.isArray(summary.errors);
}

export function useImportList<TRow extends object, TSearch extends TableSearchParams>(
  tableRef: React.RefObject<CommonTableHandle<TRow> | null>,
  config: ImportListConfig<TSearch>
) {
  const { get, post } = useAppApi();
  const { success, danger, warning } = useToast();
  const { translate } = useLanguage();
  const [searchValues, setSearchValues] = useState<TSearch>(config.initialSearch);
  const [importing, setImporting] = useState(false);

  const updateSearchValue = useCallback(<K extends keyof TSearch>(field: K, value: TSearch[K]) => {
    setSearchValues((current) => ({ ...current, [field]: value }));
  }, []);

  const search = useCallback(() => {
    tableRef.current?.search(searchValues);
  }, [searchValues, tableRef]);

  const clearSearch = useCallback(() => {
    setSearchValues(config.initialSearch);
    tableRef.current?.search({});
  }, [config.initialSearch, tableRef]);

  const downloadTemplate = useCallback(async () => {
    const response = await get<Blob>(config.templateUrl, { responseType: 'blob' });
    if (response.success && response.data instanceof Blob) {
      downloadFile({ blob: response.data, defaultFileName: config.templateFileName });
      return;
    }

    danger({ message: <span>{translate(LANGUAGE_KEYS.common.operationFailed)}</span> });
  }, [config.templateFileName, config.templateUrl, danger, get, translate]);

  const importFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ignoreErrors', 'true');

      const result = await post<ImportSummary, FormData>(config.importUrl, { body: formData });
      const summary = isImportSummary(result.data) ? result.data : null;
      if (result.success && summary) {
        if (summary.successCount > 0) {
          success({ message: <span>{translate(LANGUAGE_KEYS.common.importCompleted).replace('{count}', String(summary.successCount))}</span> });
          tableRef.current?.reload();
        }

        if (summary.failureCount > 0) {
          const errorText = summary.errors.slice(0, 3).join('；') || translate(LANGUAGE_KEYS.common.partialImportFailed);
          const message = summary.successCount > 0
            ? translate(LANGUAGE_KEYS.common.partialImportFailed)
            : translate(LANGUAGE_KEYS.common.importFailed);
          const toastMessage = message.replace('{count}', String(summary.failureCount)).replace('{errors}', errorText);
          (summary.successCount > 0 ? warning : danger)({ message: <span>{toastMessage}</span> });
        }

        if (summary.totalCount === 0) {
          danger({ message: <span>{translate(LANGUAGE_KEYS.common.noImportData)}</span> });
        }
        return;
      }

      danger({ message: <span>{result.message || translate(LANGUAGE_KEYS.common.importFailed)}</span> });
    } catch (error) {
      console.error('Import failed', error);
      danger({ message: <span>{translate(LANGUAGE_KEYS.common.importFailed)}</span> });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  }, [config.importUrl, danger, post, success, tableRef, translate, warning]);

  return {
    importing,
    searchValues,
    updateSearchValue,
    search,
    clearSearch,
    downloadTemplate,
    importFile,
  };
}
