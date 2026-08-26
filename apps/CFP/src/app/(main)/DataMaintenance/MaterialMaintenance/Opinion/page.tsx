'use client';

import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ActionBar from '@/components/layouts/ActionBar';
import WrapContent from '@/components/layouts/WrapContent';
import { useAppApi } from '@/hooks/useAppApi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@packages/contexts/ToastContext';
import { Btn } from '@packages/components/bootstrap5/Btn';
import Card from '@packages/components/bootstrap5/Card';
import Container from '@packages/components/bootstrap5/Container';
import Grid from '@packages/components/bootstrap5/Grid';
import { Textarea } from '@packages/components/bootstrap5/Input';
import { LANGUAGE_KEYS } from '@/config/languageKeys';
import {
  createMaterialMaintenanceOpinionService,
  MaterialMaintenanceSourceOpinionPageModel,
} from '../materialMaintenanceOpinionService';
import { usePagePermissions } from '@/hooks/usePagePermissions';

export default function MaterialMaintenanceOpinionPage() {
  return (
    <Suspense fallback={<MaterialMaintenanceOpinionLoading />}>
      <MaterialMaintenanceOpinionPageContent />
    </Suspense>
  );
}

function MaterialMaintenanceOpinionLoading() {
  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.materialMaintenanceOpinion.title} />
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

function MaterialMaintenanceOpinionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formPost } = useAppApi();
  const { languageCode, translate } = useLanguage();
  const { success } = useToast();
  const { hasPermission, isReady } = usePagePermissions('/DataMaintenance');
  const canAccess = hasPermission('MaterialMaintenance:GetModel');
  const sourceId = searchParams.get('sourceId') || '';
  const service = useMemo(() => createMaterialMaintenanceOpinionService(formPost), [formPost]);
  const [model, setModel] = useState<MaterialMaintenanceSourceOpinionPageModel | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && !canAccess) router.replace('/DataMaintenance');
  }, [canAccess, isReady, router]);

  const loadModel = useCallback(async (showLoading = true) => {
    if (!sourceId) {
      setModel(null);
      setError(translate(LANGUAGE_KEYS.materialMaintenanceOpinion.loadFailed));
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);
    const result = await service.getModel(sourceId);
    if (result.success && result.data) {
      setModel(result.data);
    } else {
      setModel(null);
      setError(result.message || translate(LANGUAGE_KEYS.materialMaintenanceOpinion.loadFailed));
    }
    if (showLoading) setLoading(false);
  }, [service, sourceId, translate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (!cancelled) await loadModel();
    };
    void load();
    return () => { cancelled = true; };
  }, [loadModel]);

  const backToMaterial = () => {
    if (model?.materialId) {
      router.push(`/DataMaintenance/MaterialMaintenance/?id=${encodeURIComponent(model.materialId)}`);
    } else {
      router.push('/DataMaintenance');
    }
  };

  const addOpinion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) {
      setContentError(translate(LANGUAGE_KEYS.materialMaintenanceOpinion.required));
      return;
    }

    setSubmitting(true);
    setContentError(null);
    const result = await service.addOpinion({ sourceId, content });
    if (!result.success) {
      setContentError(result.message || translate(LANGUAGE_KEYS.materialMaintenanceOpinion.loadFailed));
      setSubmitting(false);
      return;
    }

    setContent('');
    success({ message: <span>{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.added)}</span> });
    await loadModel(false);
    setSubmitting(false);
  };

  return (
    <>
      <ActionBar title={LANGUAGE_KEYS.materialMaintenanceOpinion.title}>
        <div className="ms-auto">
          <Btn type="button" color="secondary" outline icon="cancel" onClick={backToMaterial} disabled={submitting}>
            {translate(LANGUAGE_KEYS.common.backToList)}
          </Btn>
        </div>
      </ActionBar>

      <WrapContent className="p-3">
        <Container fluid>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <span className="spinner-border text-primary" role="status" aria-label={translate(LANGUAGE_KEYS.common.loading)} />
            </div>
          ) : error || !model ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center text-danger py-5">{error || translate(LANGUAGE_KEYS.materialMaintenanceOpinion.loadFailed)}</Card.Body>
            </Card>
          ) : (
            <>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <Grid.Row className="g-3">
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.supplier)}</div>
                      <div className="fw-semibold">{model.supplierName || '-'}</div>
                    </Grid.Col>
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.productName)}</div>
                      <div className="fw-semibold">{model.productName || '-'}</div>
                    </Grid.Col>
                    <Grid.Col md={4}>
                      <div className="small text-muted">{translate(LANGUAGE_KEYS.rawMaterialMaintenance.year)}</div>
                      <div className="fw-semibold">{model.year}</div>
                    </Grid.Col>
                  </Grid.Row>
                </Card.Body>
              </Card>

              {model.canAddOpinion && (
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Header>{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.add)}</Card.Header>
                  <Card.Body>
                    <form id="material-maintenance-opinion-form" onSubmit={addOpinion}>
                      <Textarea
                        name="content"
                        label={translate(LANGUAGE_KEYS.materialMaintenanceOpinion.content)}
                        labelMark
                        placeholder={translate(LANGUAGE_KEYS.materialMaintenanceOpinion.contentPlaceholder)}
                        rows={6}
                        value={content}
                        error={contentError ? [contentError] : []}
                        onChange={(event) => {
                          setContent(event.target.value);
                          if (contentError) setContentError(null);
                        }}
                        disabled={submitting}
                      />
                      <div className="d-flex justify-content-end mt-3">
                        <Btn type="submit" color="primary" icon="save" loading={submitting}>
                          {translate(LANGUAGE_KEYS.materialMaintenanceOpinion.add)}
                        </Btn>
                      </div>
                    </form>
                  </Card.Body>
                </Card>
              )}

              <Card className="border-0 shadow-sm">
                <Card.Header>{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.title)}</Card.Header>
                <Card.Body>
                  {model.opinions.length === 0 ? (
                    <div className="text-center text-muted py-4">{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.noOpinions)}</div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {model.opinions.map((opinion) => (
                        <div key={opinion.id} className="border rounded p-3">
                          <div className="d-flex flex-wrap justify-content-between gap-2 mb-2 small text-muted">
                            <span>{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.createdBy)}：{opinion.createUserName || '-'}</span>
                            <span>{translate(LANGUAGE_KEYS.materialMaintenanceOpinion.createdAt)}：{formatDate(opinion.createDate, languageCode)}</span>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{opinion.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Container>
      </WrapContent>
    </>
  );
}

function formatDate(value: string | null, languageCode: string): string {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(languageCode);
}
